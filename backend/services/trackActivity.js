/**
 * trackActivity.js
 *
 * Single utility called from the three qualifying write-path controllers:
 *   - createPost          (pts: 5)
 *   - createDiscussion    (pts: 3)
 *   - createReply         (pts: 1)
 *
 * Does two atomic writes in parallel:
 *   1. DailyEventLog  — upserts the day doc, pushes the event, increments totalPts
 *   2. UserContributions — upserts the year doc, increments days[MM-DD] + totalCount
 *
 * Both use $inc / $push with upsert so they're safe under concurrent requests
 * and safe to call multiple times without duplicating data (idempotent at the
 * day+author granularity via the unique index).
 *
 * The caller (controller) is responsible for building the event object and
 * passing the correct date string — always derive this from the server clock
 * in Asia/Kolkata, never from client-supplied data.
 *
 * Usage:
 *   await trackActivity({
 *     authorId,
 *     tenantId,
 *     date,      // "YYYY-MM-DD" in Asia/Kolkata — use getTodayIST()
 *     event: {
 *       type:          'post' | 'discussion' | 'reply',
 *       targetId:      ObjectId,
 *       communityId:   ObjectId | null,
 *       discussionId:  ObjectId | null,   // reply only
 *       title:         String,
 *       communityName: String | null,
 *       pts:           Number,
 *     },
 *   });
 */

const mongoose = require('mongoose');
const { DailyEventLog, UserContributions } = require('../models/performanceTracker/performanceTrackerSchema');
const { checkAndUpdateStreak } = require('./checkAndUpdateStreak');

/**
 * Returns today's date string in "YYYY-MM-DD" format using Asia/Kolkata timezone.
 * Always use this — never use new Date().toISOString().slice(0,10) which is UTC.
 */
const getTodayIST = () => {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  }); // en-CA gives YYYY-MM-DD format
};

/**
 * Returns "MM-DD" from a "YYYY-MM-DD" string.
 * Used as the key in UserContributions.days map.
 */
const toMonthDay = (dateStr) => dateStr.slice(5); // "2026-08-19" → "08-19"

const removeTrackedActivity = async ({ tenantId, type, targetIds, session }) => {
  const ids = [...new Set((Array.isArray(targetIds) ? targetIds : [targetIds])
    .filter(Boolean)
    .map((id) => String(id)))];
  if (!tenantId || !type || !ids.length) {
    throw new Error('tenantId, activity type, and at least one target ID are required');
  }

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const matchingEvent = (event) => ({
    $and: [
      { $eq: [`${event}.type`, type] },
      { $in: [`${event}.targetId`, objectIds] },
    ],
  });
  const eventFilter = {
    tenantId,
    events: { $elemMatch: { type, targetId: { $in: objectIds } } },
  };
  let logQuery = DailyEventLog.find(eventFilter, '_id authorId date');
  if (session) logQuery = logQuery.session(session);
  const matchingLogs = await logQuery.lean();

  for (const log of matchingLogs) {
    const filter = {
      _id: log._id,
      tenantId,
      events: { $elemMatch: { type, targetId: { $in: objectIds } } },
    };
    const matchingEventsExpression = {
      $filter: {
        input: { $ifNull: ['$events', []] },
        as: 'activity',
        cond: matchingEvent('$$activity'),
      },
    };
    const updatePipeline = [{
      $set: {
        events: {
          $filter: {
            input: { $ifNull: ['$events', []] },
            as: 'activity',
            cond: { $not: [matchingEvent('$$activity')] },
          },
        },
        totalPts: {
          $subtract: [
            { $ifNull: ['$totalPts', 0] },
            {
              $sum: {
                $map: {
                  input: matchingEventsExpression,
                  as: 'activity',
                  in: { $ifNull: ['$$activity.pts', 0] },
                },
              },
            },
          ],
        },
      },
    }];

    const updateQuery = DailyEventLog.findOneAndUpdate(filter, updatePipeline, {
      new: false,
      session,
    });
    const previousLog = await updateQuery.lean();
    if (!previousLog) continue;

    const removedEvents = previousLog.events.filter(
      (event) => event.type === type && objectIds.some((id) => id.equals(event.targetId)),
    );
    if (!removedEvents.length) continue;

    const monthDay = log.date.slice(5);
    const year = Number(log.date.slice(0, 4));
    let remainingLogQuery = DailyEventLog.findOne(
      { authorId: log.authorId, tenantId, date: log.date },
      'totalPts',
    );
    if (session) remainingLogQuery = remainingLogQuery.session(session);
    const remainingLog = await remainingLogQuery.lean();
    const contributionUpdate = {
      $inc: { totalCount: -removedEvents.length },
    };
    if (remainingLog?.totalPts > 0) {
      contributionUpdate.$set = {
        [`days.${monthDay}`]: remainingLog.totalPts,
      };
    } else {
      contributionUpdate.$unset = { [`days.${monthDay}`]: 1 };
    }

    const contributionResult = await UserContributions.updateOne(
      { authorId: log.authorId, tenantId, year },
      contributionUpdate,
      session ? { session } : {},
    );
    if (!contributionResult.matchedCount) {
      throw new Error(
        `UserContributions record not found for author ${log.authorId} in ${year}`,
      );
    }
  }
};

/**
 * Main activity tracking function.
 * Fire-and-forget safe — wrap in .catch() at the call site so a tracking
 * failure never breaks the primary controller response.
 */
const trackActivity = async ({ authorId, tenantId, date, event }) => {
  if (!authorId || !tenantId || !date || !event) return;


  const year     = Number(date.slice(0, 4));
  const monthDay = toMonthDay(date);

  await Promise.all([
    // ── 1. DailyEventLog ────────────────────────────────────────────────────
    DailyEventLog.findOneAndUpdate(
      { authorId, tenantId, date },
      {
        $inc:  { totalPts: event.pts },
        $push: {
          events: {
            $each:     [event],
            $position: 0,         // newest first
            $slice:    500,       // hard cap per day — safety net
          },
        },
        $setOnInsert: { authorId, tenantId, date },
      },
      { upsert: true, new: false, runValidators: false }
    ),

    // ── 2. UserContributions ─────────────────────────────────────────────────
    UserContributions.findOneAndUpdate(
      { authorId, tenantId, year },
      {
        $inc: {
          [`days.${monthDay}`]: event.pts,
          totalCount:           1,
        },
        $setOnInsert: { authorId, tenantId, year },
      },
      { upsert: true, new: false, runValidators: false }
    ),
  ]);

  checkAndUpdateStreak(authorId, tenantId)
    .catch((err) => console.error('checkAndUpdateStreak error:', err.message));
};

module.exports = { trackActivity, getTodayIST, removeTrackedActivity };