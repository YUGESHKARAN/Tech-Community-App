const { Event } = require('../../models/events/Event');
const EventJudge = require('../../models/events/eventJudge');
const Judgement = require('../../models/events/judgement');
const Submission = require('../../models/events/submission');
const Team = require('../../models/events/team');
const EventRegistration = require('../../models/events/eventRegistration');
const TeamInvite = require('../../models/events/teamInvite');
const {
  httpError,
  sendError,
  resolveAuthor,
  loadEvent,
  assertOrganizer,
} = require('../../utils/events/eventHelpers');

const isOrganizerOf = (event, authorId) =>
  event.organizers.some((o) => String(o.authorId) === String(authorId));

// ── GET /events/:eventId/judges  (organizers) ────────────────────────────────
const listJudges = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const judges = await EventJudge.find({ eventId: event._id })
      .populate('authorId', 'authorname email')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ judges });
  } catch (err) {
    return sendError(res, err, 'listJudges');
  }
};

// ── DELETE /events/:eventId/judges/:judgeId  (organizers) ────────────────────
// Revoking takes effect on the next request. Both judge types are checked
// against status on every call, so an open judge session stops working too.
const revokeJudge = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const judge = await EventJudge.findOneAndUpdate(
      { _id: req.params.judgeId, eventId: event._id, status: { $ne: 'revoked' } },
      { $set: { status: 'revoked' } },
      { new: true }
    ).lean();
    if (!judge) throw httpError(404, 'Judge not found or already revoked');

    return res.status(200).json({ message: 'Judge revoked', judge });
  } catch (err) {
    return sendError(res, err, 'revokeJudge');
  }
};

// ── GET /events/:eventId/submissions  (organizers) ───────────────────────────
// Each row shows how many judges have submitted scores, the average score so
// far, and the active judge count. Organizers use this to track progress.
const listSubmissions = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const [subs, activeJudges, agg] = await Promise.all([
      Submission.find({ eventId: event._id })
        .populate('teamId', 'name memberCount')
        .populate('postId', 'title')
        .sort({ submittedAt: 1 })
        .lean(),
      EventJudge.countDocuments({ eventId: event._id, status: 'active' }),
      Judgement.aggregate([
        { $match: { eventId: event._id, status: 'submitted' } },
        {
          $group: {
            _id: '$submissionId',
            judgesSubmitted: { $sum: 1 },
            avgScore: { $avg: '$weightedTotal' },
          },
        },
      ]),
    ]);

    const progress = new Map(agg.map((a) => [String(a._id), a]));

    return res.status(200).json({
      activeJudges,
      submissions: subs.map((s) => {
        const p = progress.get(String(s._id));
        return {
          _id: s._id,
          team: s.teamId?.name || null,
          teamSize: s.teamId?.memberCount || null,
          title: s.postId?.title || null,
          repoUrl: s.repoUrl,
          demoUrl: s.demoUrl,
          presentationKey: s.presentationKey,
          revision: s.revision,
          submittedAt: s.submittedAt,
          lastEditedAt: s.lastEditedAt,
          judgesSubmitted: p?.judgesSubmitted || 0,
          avgScore: p ? Math.round(p.avgScore * 100) / 100 : null,
        };
      }),
    });
  } catch (err) {
    return sendError(res, err, 'listSubmissions');
  }
};

// ── GET /events/:eventId/me  (any tenant user) ───────────────────────────────
// One call that drives the event detail page: registration, team, roles,
// and pending invites for this event.
const getMyEventStatus = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);

    const reg = await EventRegistration.findOne({ eventId: event._id, authorId: me._id }).lean();

    const team = reg?.teamId
      ? await Team.findById(reg.teamId).select('name status memberCount leadId').lean()
      : null;

    const judge = await EventJudge.findOne({
      eventId: event._id,
      authorId: me._id,
      judgeType: 'platform',
      status: 'active',
    })
      .select('_id')
      .lean();

    const invites =
      reg && !reg.teamId && event.participation.type === 'team'
        ? await TeamInvite.find({
            eventId: event._id,
            invitedAuthorId: me._id,
            status: 'pending',
            expiresAt: { $gt: new Date() },
          })
            .populate('teamId', 'name')
            .populate('invitedBy', 'authorname')
            .lean()
        : [];

    return res.status(200).json({
      status: Event.computeStatus(event),
      registration: reg
        ? { status: reg.status, role: reg.role, teamId: reg.teamId }
        : null,
      team: team ? { ...team, isLead: String(team.leadId) === String(me._id) } : null,
      isOrganizer: isOrganizerOf(event, me._id),
      isJudge: Boolean(judge),
      pendingInvites: invites,
    });
  } catch (err) {
    return sendError(res, err, 'getMyEventStatus');
  }
};

// ── GET /events/teams/:teamId  (any tenant user) ─────────────────────────────
// Members are visible to anyone in the tenant. Pending invites are visible to
// the lead only.
const getTeam = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const team = await Team.findOne({ _id: req.params.teamId, tenantId: req.user.tenantId }).lean();
    if (!team) throw httpError(404, 'Team not found');

    const members = await EventRegistration.find({ teamId: team._id })
      .populate('authorId', 'authorname email profile')
      .lean();

    const isLead = String(team.leadId) === String(me._id);
    const invites = isLead
      ? await TeamInvite.find({ teamId: team._id, status: 'pending' })
          .populate('invitedAuthorId', 'authorname email')
          .lean()
      : undefined;

    return res.status(200).json({
      team: { ...team, isLead },
      members: members.map((m) => ({
        authorId: m.authorId?._id,
        authorname: m.authorId?.authorname,
        email: m.authorId?.email,
        profile: m.authorId?.profile,
        role: m.role,
      })),
      ...(invites ? { pendingInvites: invites } : {}),
    });
  } catch (err) {
    return sendError(res, err, 'getTeam');
  }
};

// ── GET /events/me/invites  (any tenant user) ────────────────────────────────
// The invite inbox across all events. Only live pending invites are returned.
const listMyInvites = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const invites = await TeamInvite.find({
      tenantId: req.user.tenantId,
      invitedAuthorId: me._id,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
      .populate('teamId', 'name status')
      .populate('eventId', 'title slug schedule')
      .populate('invitedBy', 'authorname')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ invites });
  } catch (err) {
    return sendError(res, err, 'listMyInvites');
  }
};

module.exports = {
  listJudges,
  revokeJudge,
  listSubmissions,
  getMyEventStatus,
  getTeam,
  listMyInvites,
};