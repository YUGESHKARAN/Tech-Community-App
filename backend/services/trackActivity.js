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

const { DailyEventLog, UserContributions } = require('../models/performanceTracker/performanceTrackerSchema');

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
};

module.exports = { trackActivity, getTodayIST };