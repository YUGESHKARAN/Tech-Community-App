
const crypto = require('crypto');
const { Event } = require('../../models/events/event');
const EventJudge = require('../../models/events/eventJudge');
const Judgement = require('../../models/events/judgement');
const EventResult = require('../../models/events/eventResult');
const EventRegistration = require('../../models/events/eventRegistration');
const Submission = require('../../models/events/submission');
const {Author} = require('../../models/blogAuthorSchema');
const { buildNotificationUrl } = require('../../models/services/notificationSchema');
const { redisClient } = require('../../middleware/redis'); // adjust to your redis module
const { sendJudgeInviteEmail } = require('../../utils/events/judgeInviteEmail'); // to be written
const {
  httpError,
  sendError,
  runTransaction,
  resolveAuthor,
  loadEvent,
  assertOrganizer,
  notifyAuthors,
  bumpEventsCache,
  awardEventPoints,
} = require('../../utils/events/eventHelpers');

const JUDGE_SESSION_TTL = 2 * 60 * 60; // seconds
const judgeSessionKey = (sid) => `judge:session:${sid}`;

const sender = (me) => ({ name: me.authorname, email: me.email });

/**
 * Locks the rubric once judging has started. Idempotent.
 */
async function lockRubricIfDue(event, now = new Date()) {
  if (event.rubricLockedAt || now < new Date(event.schedule.judgingStartsAt)) return event;
  await Event.updateOne({ _id: event._id, rubricLockedAt: null }, { $set: { rubricLockedAt: now } });
  event.rubricLockedAt = now;
  return event;
}

/**
 * Works out who is calling. Either an external judge with a session header,
 * or a logged-in user who is an organizer or an active platform judge.
 */
async function resolveJudgeOrOrganizer(req, event) {
  const sid = req.headers['x-judge-session'];

  if (sid) {
    const raw = await redisClient.get(judgeSessionKey(sid));
    if (!raw) throw httpError(401, 'Judge session has expired');
    const { judgeId, eventId } = JSON.parse(raw);
    if (String(eventId) !== String(event._id)) throw httpError(403, 'This session is for another event');

    const judge = await EventJudge.findOne({ _id: judgeId, eventId: event._id, status: 'active' });
    if (!judge) throw httpError(403, 'Judge access has been revoked');
    return { judge, isOrganizer: false };
  }

  const me = await resolveAuthor(req);
  const isOrganizer = event.organizers.some((o) => String(o.authorId) === String(me._id));
  if (isOrganizer) return { judge: null, isOrganizer: true, me };

  const judge = await EventJudge.findOne({
    eventId: event._id,
    authorId: me._id,
    judgeType: 'platform',
    status: 'active',
  });
  if (judge) return { judge, isOrganizer: false, me };

  throw httpError(403, 'You are not a judge or organizer for this event');
}

// ── POST /bytes/events/:eventId/judges  (organizers) ─────────────────────────
// Platform judges: { type: 'platform', email }, active immediately.
// External judges: { type: 'external', email, displayName }, get a single-use
// link by email. The link is /events/judge#<token>, so the token never reaches
// the server logs through the URL.
const addJudge = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const { type } = req.body || {};
    const email = (req.body?.email || '').trim().toLowerCase();
    const displayName = (req.body?.displayName || '').trim() || null;
    if (!email) throw httpError(400, 'email is required');

    if (type === 'platform') {
      const target = await Author.findOne({ email, tenantId: event.tenantId }).select('_id').lean();
      if (!target) throw httpError(404, 'No user with that email in your institution');

      const judge = await EventJudge.create({
        tenantId: event.tenantId,
        eventId: event._id,
        judgeType: 'platform',
        authorId: target._id,
        status: 'active',
        invitedBy: me._id,
      });
      return res.status(201).json({ judge });
    }

    if (type === 'external') {
      const judge = await EventJudge.create({
        tenantId: event.tenantId,
        eventId: event._id,
        judgeType: 'external',
        judgeEmail: email,
        displayName,
        status: 'invited',
        invitedBy: me._id,
      });

      const token = await EventJudge.issueToken(judge._id);
      const fresh = await EventJudge.findById(judge._id).select('tokenExpiresAt').lean();

      let emailSent = true;
      try {
        await sendJudgeInviteEmail({
          to: email,
          displayName,
          eventTitle: event.title,
          link: `${process.env.FRONTEND_URL}/events/judge#${token}`,
          expiresAt: fresh.tokenExpiresAt,
        });
      } catch (err) {
        emailSent = false;
        console.error('sendJudgeInviteEmail error:', err.message);
      }

      return res.status(201).json({ judge, emailSent });
    }

    throw httpError(400, 'type must be "platform" or "external"');
  } catch (err) {
    return sendError(res, err, 'addJudge', 'This person is already a judge for this event');
  }
};

// ── POST /bytes/events/judge/redeem  body: { token }  (public) ───────────────
// Single-use. The link is marked used, and a 2-hour judge session is issued
// in Redis. The session id is what the judge sends in the x-judge-session header.
const redeemJudgeToken = async (req, res) => {
  try {
    const raw = (req.body?.token || '').toString();
    if (!raw) throw httpError(400, 'token is required');

    const judge = await EventJudge.findByToken(raw);
    if (!judge) throw httpError(401, 'This link is invalid or has expired');

    const marked = await EventJudge.updateOne(
      { _id: judge._id, tokenUsedAt: null },
      { $set: { tokenUsedAt: new Date(), status: 'active' } }
    );
    if (marked.modifiedCount === 0) throw httpError(401, 'This link has already been used');

    const sessionId = crypto.randomBytes(32).toString('hex');
    await redisClient.setEx(
      judgeSessionKey(sessionId),
      JUDGE_SESSION_TTL,
      JSON.stringify({ judgeId: judge._id, eventId: judge.eventId })
    );

    return res.status(200).json({
      sessionId,
      eventId: judge.eventId,
      expiresInSeconds: JUDGE_SESSION_TTL,
    });
  } catch (err) {
    return sendError(res, err, 'redeemJudgeToken');
  }
};

// ── GET /bytes/events/:eventId/judging/queue  (judges or organizers) ─────────
const judgingQueue = async (req, res) => {
  try {
    const event = await loadEvent(req.params.eventId, req.user?.tenantId || (await lookupTenantForSession(req)));
    if (event.cancelledAt) throw httpError(409, 'Event is cancelled');

    const now = new Date();
    if (now < new Date(event.schedule.judgingStartsAt)) throw httpError(409, 'Judging has not started');

    const { judge } = await resolveJudgeOrOrganizer(req, event);
    await lockRubricIfDue(event, now);

    const subs = await Submission.find({ eventId: event._id })
      .populate('teamId', 'name')
      .populate('postId', 'title description')
      .lean();

    const mine = judge
      ? await Judgement.find({ eventId: event._id, judgeId: judge._id }).lean()
      : [];
    const bySubmission = new Map(mine.map((j) => [String(j.submissionId), j]));

    return res.status(200).json({
      scoringOpen: now < new Date(event.schedule.judgingEndsAt),
      rubric: event.rubric,
      submissions: subs.map((s) => ({
        _id: s._id,
        team: s.teamId?.name || null,
        title: s.postId?.title || null,
        description: s.postId?.description || null,
        repoUrl: s.repoUrl,
        demoUrl: s.demoUrl,
        presentationKey: s.presentationKey,
        revision: s.revision,
        myJudgement: bySubmission.get(String(s._id)) || null,
      })),
    });
  } catch (err) {
    return sendError(res, err, 'judgingQueue');
  }
};

// The queue route also runs for judge-session callers, who have no req.user.
// The judge session stores the eventId, so the tenant is taken from the event
// the session belongs to.
async function lookupTenantForSession(req) {
  const sid = req.headers['x-judge-session'];
  if (!sid) throw httpError(401, 'Not signed in');
  const raw = await redisClient.get(judgeSessionKey(sid));
  if (!raw) throw httpError(401, 'Judge session has expired');
  const { eventId } = JSON.parse(raw);
  const event = await Event.findById(eventId).select('tenantId').lean();
  if (!event) throw httpError(404, 'Event not found');
  return event.tenantId;
}

// ── POST /bytes/events/:eventId/judging/submissions/:submissionId/score ──────
// scores: [{ criterionKey, score }], one per rubric criterion, each 0..100.
// weightedTotal = sum(score * weight / 100), on a 0..100 scale.
// Only assigned judges score. Organizers cannot.
const submitJudgement = async (req, res) => {
  try {
    const event = await loadEvent(req.params.eventId, req.user?.tenantId || (await lookupTenantForSession(req)));
    const { judge } = await resolveJudgeOrOrganizer(req, event);
    if (!judge) throw httpError(403, 'Only assigned judges can score');

    const now = new Date();
    if (now < new Date(event.schedule.judgingStartsAt) || now >= new Date(event.schedule.judgingEndsAt)) {
      throw httpError(409, 'Scoring window is closed');
    }

    const submission = await Submission.findOne({ _id: req.params.submissionId, eventId: event._id });
    if (!submission) throw httpError(404, 'Submission not found');

    const scores = Array.isArray(req.body?.scores) ? req.body.scores : null;
    if (!scores) throw httpError(400, 'scores is required');

    const weightByKey = new Map(event.rubric.map((c) => [c.key, c.weight]));
    const given = scores.map((s) => ({
      criterionKey: String(s.criterionKey || '').toLowerCase(),
      score: Number(s.score),
    }));

    const givenKeys = given.map((g) => g.criterionKey);
    const rubricKeys = [...weightByKey.keys()];
    if (
      givenKeys.length !== rubricKeys.length ||
      new Set(givenKeys).size !== givenKeys.length ||
      rubricKeys.some((k) => !givenKeys.includes(k))
    ) {
      throw httpError(400, 'Score every rubric criterion exactly once');
    }
    if (given.some((g) => !Number.isFinite(g.score) || g.score < 0 || g.score > 100)) {
      throw httpError(400, 'Scores must be between 0 and 100');
    }

    const weightedTotal =
      Math.round(
        given.reduce((sum, g) => sum + (g.score * weightByKey.get(g.criterionKey)) / 100, 0) * 100
      ) / 100;

    await lockRubricIfDue(event, now);

    const judgement = await Judgement.findOneAndUpdate(
      { submissionId: submission._id, judgeId: judge._id },
      {
        $set: {
          tenantId: event.tenantId,
          eventId: event._id,
          scores: given,
          weightedTotal,
          status: 'submitted',
          submittedAt: now,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      judgement: { _id: judgement._id, weightedTotal: judgement.weightedTotal, status: judgement.status },
    });
  } catch (err) {
    return sendError(res, err, 'submitJudgement');
  }
};

// ── POST /bytes/events/:eventId/results/publish  (organizers) ────────────────
// Only after resultsPublishAt, and only once.
//
// Scoring: each submission's finalScore is the average weightedTotal across
// its submitted judgements. Unscored submissions are left out and counted in
// the response.
//
// Ranking: shared ranks (competition ranking). Equal scores share a rank, and
// the next rank is skipped (90, 80, 80, 70 gives 1, 2, 2, 4).
//
// Winners: ranks at or below the highest prize rank. Place points come from
// placeAwards, and other winners get defaultWinPoints. Everyone else gets 0.
// Points are copied into each row at publish time.
//
// Points are awarded to every confirmed member of each winning team.
const publishResults = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    if (event.cancelledAt) throw httpError(409, 'Event is cancelled');
    const now = new Date();
    if (now < new Date(event.schedule.resultsPublishAt)) throw httpError(409, 'Results are not due yet');
    if (event.resultsPublishedAt) throw httpError(409, 'Results are already published');

    const subs = await Submission.find({ eventId: event._id }).select('teamId').lean();
    const agg = await Judgement.aggregate([
      { $match: { eventId: event._id, status: 'submitted' } },
      { $group: { _id: '$submissionId', finalScore: { $avg: '$weightedTotal' } } },
    ]);
    const scoreBySubmission = new Map(agg.map((a) => [String(a._id), a.finalScore]));

    const scored = subs
      .filter((s) => scoreBySubmission.has(String(s._id)))
      .map((s) => ({
        submissionId: s._id,
        teamId: s.teamId,
        finalScore: Math.round(scoreBySubmission.get(String(s._id)) * 100) / 100,
      }));
    const unscored = subs.length - scored.length;

    const maxPrizeRank = Math.max(0, ...event.prizes.map((p) => p.rank));
    const pointsFor = (rank) => {
      if (rank > maxPrizeRank) return 0;
      const award = event.pointsPolicy.placeAwards.find((a) => a.rank === rank);
      return award ? award.points : event.pointsPolicy.defaultWinPoints;
    };

    const rows = scored.map((s) => {
      const rank = 1 + scored.filter((o) => o.finalScore > s.finalScore).length;
      return {
        tenantId: event.tenantId,
        eventId: event._id,
        teamId: s.teamId,
        submissionId: s.submissionId,
        rank,
        finalScore: s.finalScore,
        prizeTitle: event.prizes.find((p) => p.rank === rank)?.title || null,
        pointsAwarded: pointsFor(rank),
        publishedAt: now,
      };
    });

    const inserted = await runTransaction(async (session) => {
      const flip = await Event.updateOne(
        { _id: event._id, resultsPublishedAt: null },
        { $set: { resultsPublishedAt: now } },
        { session }
      );
      if (flip.modifiedCount === 0) throw httpError(409, 'Results are already published');
      return EventResult.insertMany(rows, { session });
    });

    // ── side effects, after commit ──────────────────────────────────────────
    for (const result of inserted.filter((r) => r.pointsAwarded > 0)) {
      const members = await EventRegistration.find({ teamId: result.teamId, status: 'confirmed' })
        .select('authorId')
        .lean();

      for (const m of members) {
        await awardEventPoints({
          authorId: m.authorId,
          tenantId: event.tenantId,
          type: 'event-win',
          targetId: result._id,
          eventId: event._id,
          title: `${event.title}: rank ${result.rank}`,
          pts: result.pointsAwarded,
        });
      }

      await notifyAuthors({
        authorIds: members.map((m) => m.authorId),
        type: 'achievement',
        message: `Your team placed #${result.rank} in ${event.title}.`,
        url: buildNotificationUrl.eventResults(event._id),
        eventId: event._id,
        sender: sender(me),
      });
    }

    const everyone = await EventRegistration.find({ eventId: event._id, status: 'confirmed' })
      .select('authorId')
      .lean();
    await notifyAuthors({
      authorIds: everyone.map((r) => r.authorId),
      type: 'announcement',
      message: `Results are in for ${event.title}.`,
      url: buildNotificationUrl.eventResults(event._id),
      eventId: event._id,
      sender: sender(me),
    });

    await bumpEventsCache(event.tenantId);
    return res.status(200).json({ published: inserted.length, unscoredSubmissions: unscored });
  } catch (err) {
    return sendError(res, err, 'publishResults');
  }
};

// ── GET /bytes/events/:eventId/results ───────────────────────────────────────
const getResults = async (req, res) => {
  try {
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    if (!event.resultsPublishedAt) throw httpError(404, 'Results are not published yet');

    const rows = await EventResult.find({ eventId: event._id })
      .sort({ rank: 1 })
      .populate('teamId', 'name')
      .lean();

    return res.status(200).json({
      results: rows.map((r) => ({
        rank: r.rank,
        team: r.teamId?.name || null,
        finalScore: r.finalScore,
        prizeTitle: r.prizeTitle,
        pointsAwarded: r.pointsAwarded,
      })),
    });
  } catch (err) {
    return sendError(res, err, 'getResults');
  }
};

module.exports = {
  addJudge,
  redeemJudgeToken,
  judgingQueue,
  submitJudgement,
  publishResults,
  getResults,
};