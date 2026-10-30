
const { Event } = require('../../models/events/event');
const Team = require('../../models/events/team');
const EventRegistration = require('../../models/events/eventRegistration');
const Submission = require('../../models/events/submission');
const {Post} = require('../../models/blogAuthorSchema'); // adjust path if different
const { buildNotificationUrl } = require('../../models/services/notificationSchema');
const {
  EVENTS_POST_CATEGORY,
  httpError,
  sendError,
  runTransaction,
  resolveAuthor,
  loadEvent,
  notifyAuthors,
  awardEventPoints,
} = require('../../utils/events/eventHelpers');

const sender = (me) => ({ name: me.authorname, email: me.email });

// ── PUT /bytes/events/:eventId/submission  (team lead only) ──────────────────
// Window: eventStartsAt <= now < submissionDeadlineAt, and the team must be locked.
//
// First save: creates the feed Post, the Submission and the submissionCount
// increment in one transaction. The event-submission points are awarded once,
// after commit, and only on this path.
// Later saves: edits the Submission and Post, and bumps revision. No points.
const upsertSubmission = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    if (event.cancelledAt) throw httpError(409, 'Event is cancelled');

    const now = new Date();
    if (now < new Date(event.schedule.eventStartsAt)) {
      throw httpError(409, 'Submissions open when the event starts');
    }
    if (now >= new Date(event.schedule.submissionDeadlineAt)) {
      throw httpError(409, 'The submission deadline has passed');
    }

    const team = await Team.findOne({ eventId: event._id, leadId: me._id, status: 'locked' });
    if (!team) throw httpError(403, 'Only the lead of a locked team can submit');

    const body = req.body || {};
    const title = (body.title || '').trim();
    if (!title) throw httpError(400, 'Title is required');
    const description = (body.description || '').trim();

    const fields = {
      repoUrl: body.repoUrl?.trim() || null,
      demoUrl: body.demoUrl?.trim() || null,
      presentationKey: body.presentationKey || null,
    };

    const existing = await Submission.findOne({ eventId: event._id, teamId: team._id });

    if (!existing) {
      const submission = await runTransaction(async (session) => {
        const [post] = await Post.create(
          [{
            tenantId: event.tenantId,
            authorId: me._id,
            title,
            description,
            category: EVENTS_POST_CATEGORY,
            eventId: event._id,
          }],
          { session }
        );

        const [created] = await Submission.create(
          [{
            tenantId: event.tenantId,
            eventId: event._id,
            teamId: team._id,
            postId: post._id,
            submittedBy: me._id,
            ...fields,
            revision: 1,
            submittedAt: now,
            lastEditedAt: now,
          }],
          { session }
        );

        await Event.updateOne(
          { _id: event._id },
          { $inc: { 'counters.submissionCount': 1 } },
          { session }
        );

        return { ...created.toObject(), postId: post._id };
      });

      await awardEventPoints({
        authorId: me._id,
        tenantId: event.tenantId,
        type: 'event-submission',
        targetId: submission._id,
        eventId: event._id,
        title: `Submitted: ${title}`,
        pts: event.pointsPolicy.submission,
      });

      const members = await EventRegistration.find({ teamId: team._id, status: 'confirmed' })
        .select('authorId')
        .lean();
      await notifyAuthors({
        authorIds: members.map((m) => m.authorId).filter((id) => String(id) !== String(me._id)),
        type: 'post-created',
        message: `${me.authorname} submitted ${team.name} to ${event.title}.`,
        url: buildNotificationUrl.post(me.email, submission.postId),
        eventId: event._id,
        sender: sender(me),
      });

      return res.status(201).json({ submission, created: true });
    }

    await runTransaction(async (session) => {
      await Submission.updateOne(
        { _id: existing._id },
        { $set: { ...fields, lastEditedAt: now }, $inc: { revision: 1 } },
        { session }
      );
      await Post.updateOne(
        { _id: existing.postId },
        { $set: { title, description } },
        { session }
      );
    });

    const updated = await Submission.findById(existing._id).lean();
    return res.status(200).json({ submission: updated, created: false });
  } catch (err) {
    return sendError(res, err, 'upsertSubmission', 'This team has already submitted');
  }
};

// ── GET /bytes/events/:eventId/submission  (my team's submission) ────────────
const getMySubmission = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);

    const reg = await EventRegistration.findOne({
      eventId: event._id,
      authorId: me._id,
      teamId: { $ne: null },
    }).lean();
    if (!reg) return res.status(200).json({ submission: null, isLead: false });

    const submission = await Submission.findOne({ eventId: event._id, teamId: reg.teamId }).lean();
    return res.status(200).json({ submission, isLead: reg.role === 'lead' });
  } catch (err) {
    return sendError(res, err, 'getMySubmission');
  }
};

module.exports = { upsertSubmission, getMySubmission };