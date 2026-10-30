
const { Event } = require('../../models/events/event');
const Team = require('../../models/events/team');
const EventRegistration = require('../../models/events/eventRegistration');
const TeamInvite = require('../../models/events/teamInvite');
const {Author} = require('../../models/blogAuthorSchema');
const { buildNotificationUrl } = require('../../models/services/notificationSchema');
const {
  httpError,
  sendError,
  runTransaction,
  resolveAuthor,
  loadEvent,
  isFormationOpen,
  teamFormationDeadline,
  notifyAuthors,
  bumpEventsCache,
} = require('../../utils/events/eventHelpers');

const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

const sender = (me) => ({ name: me.authorname, email: me.email });

// ── POST /bytes/events/:eventId/register ─────────────────────────────────────
// Individual events confirm immediately. Team events start as pending_team.
// The capacity check and the registration insert run in one transaction, so
// the counter cannot drift past the cap.
const registerForEvent = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    if (Event.computeStatus(event) !== 'registration_open') {
      throw httpError(409, 'Registration is not open');
    }

    const isTeam = event.participation.type === 'team';
    const cap = event.capacity?.maxParticipants;

    await runTransaction(async (session) => {
      const inc = await Event.updateOne(
        { _id: event._id, ...(cap ? { 'counters.registrationCount': { $lt: cap } } : {}) },
        { $inc: { 'counters.registrationCount': 1 } },
        { session }
      );
      if (inc.modifiedCount === 0) throw httpError(409, 'Event is full');

      await EventRegistration.create(
        [{
          tenantId: event.tenantId,
          eventId: event._id,
          authorId: me._id,
          role: 'participant',
          status: isTeam ? 'pending_team' : 'confirmed',
        }],
        { session }
      );
    });

    return res.status(201).json({ message: 'Registered', status: isTeam ? 'pending_team' : 'confirmed' });
  } catch (err) {
    return sendError(res, err, 'registerForEvent', 'Already registered for this event');
  }
};

// ── DELETE /bytes/events/:eventId/register ───────────────────────────────────
// Withdrawal deletes the row, so the same person can register again later.
const withdrawRegistration = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    if (new Date() >= new Date(event.schedule.eventStartsAt)) {
      throw httpError(409, 'Withdrawal is closed once the event starts');
    }

    const reg = await EventRegistration.findOne({ eventId: event._id, authorId: me._id });
    if (!reg) throw httpError(404, 'Not registered');
    if (reg.teamId) throw httpError(409, 'Leave your team before withdrawing');

    await runTransaction(async (session) => {
      await EventRegistration.deleteOne({ _id: reg._id }, { session });
      await Event.updateOne(
        { _id: event._id },
        { $inc: { 'counters.registrationCount': -1 } },
        { session }
      );
    });

    return res.status(200).json({ message: 'Registration withdrawn' });
  } catch (err) {
    return sendError(res, err, 'withdrawRegistration');
  }
};

// ── POST /bytes/events/:eventId/teams  (team events) ─────────────────────────
// The creator becomes the lead. Their registration is linked to the team in
// the same transaction.
const createTeam = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    if (event.participation.type !== 'team') throw httpError(400, 'This is an individual event');
    if (!isFormationOpen(event)) throw httpError(409, 'Team formation is closed');

    const name = (req.body?.name || '').trim();
    if (!name) throw httpError(400, 'Team name is required');

    const team = await runTransaction(async (session) => {
      const [created] = await Team.create(
        [{
          tenantId: event.tenantId,
          eventId: event._id,
          name,
          leadId: me._id,
          memberCount: 1,
          status: 'forming',
        }],
        { session }
      );

      const link = await EventRegistration.updateOne(
        { eventId: event._id, authorId: me._id, teamId: null, status: 'pending_team' },
        { $set: { teamId: created._id, role: 'lead' } },
        { session }
      );
      if (link.modifiedCount === 0) {
        throw httpError(409, 'Register for this event first, and leave any current team');
      }

      await Event.updateOne(
        { _id: event._id },
        { $inc: { 'counters.teamCount': 1 } },
        { session }
      );
      return created;
    });

    return res.status(201).json({ team });
  } catch (err) {
    return sendError(res, err, 'createTeam', 'A team with that name already exists in this event');
  }
};

// ── POST /bytes/events/teams/:teamId/invites  (lead only) ────────────────────
// Expiry is the earlier of 72 hours or the team formation deadline.
const inviteToTeam = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const team = await Team.findOne({ _id: req.params.teamId, tenantId: req.user.tenantId });
    if (!team) throw httpError(404, 'Team not found');
    if (String(team.leadId) !== String(me._id)) throw httpError(403, 'Only the lead can invite');
    if (team.status !== 'forming') throw httpError(409, 'Team is locked');

    const event = await Event.findById(team.eventId);
    if (!event || !isFormationOpen(event)) throw httpError(409, 'Team formation is closed');
    if (team.memberCount >= event.participation.teamSize.max) throw httpError(409, 'Team is full');

    const email = (req.body?.email || '').trim().toLowerCase();
    if (!email) throw httpError(400, 'email is required');

    const invitee = await Author.findOne({ email, tenantId: team.tenantId })
      .select('_id authorname email')
      .lean();
    if (!invitee) throw httpError(404, 'No user with that email in your institution');

    const eligible = await EventRegistration.findOne({
      eventId: event._id,
      authorId: invitee._id,
      status: 'pending_team',
      teamId: null,
    });
    if (!eligible) {
      throw httpError(400, 'That person must be registered for this event and not already in a team');
    }

    const expiresAt = new Date(
      Math.min(Date.now() + INVITE_TTL_MS, new Date(teamFormationDeadline(event)).getTime())
    );

    let invite;
    try {
      invite = await TeamInvite.create({
        tenantId: team.tenantId,
        eventId: event._id,
        teamId: team._id,
        invitedAuthorId: invitee._id,
        invitedBy: me._id,
        status: 'pending',
        expiresAt,
      });
    } catch (err) {
      if (err.code === 11000) throw httpError(409, 'An invite is already pending for this person');
      throw err;
    }

    await notifyAuthors({
      authorIds: [invitee._id],
      type: 'collab',
      message: `${me.authorname} invited you to join ${team.name}.`,
      url: buildNotificationUrl.eventTeam(event._id),
      eventId: event._id,
      sender: sender(me),
    });

    return res.status(201).json({ invite });
  } catch (err) {
    return sendError(res, err, 'inviteToTeam');
  }
};

// ── POST /bytes/events/invites/:inviteId/respond  body: { accept: bool } ─────
// Accepting moves the invitee into the team, and revokes their other pending
// invites for the same event. The seat check is a conditional update, so two
// accepts racing for the last seat cannot both succeed.
const respondToInvite = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const accept = req.body?.accept === true;

    const invite = await TeamInvite.findOne({
      _id: req.params.inviteId,
      invitedAuthorId: me._id,
      tenantId: req.user.tenantId,
    });
    if (!invite) throw httpError(404, 'Invite not found');
    if (invite.status !== 'pending') throw httpError(409, `Invite is ${invite.status}`);

    if (invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      throw httpError(410, 'Invite has expired');
    }

    if (!accept) {
      invite.status = 'declined';
      invite.respondedAt = new Date();
      await invite.save();
      return res.status(200).json({ message: 'Invite declined' });
    }

    const event = await Event.findById(invite.eventId);
    if (!event || !isFormationOpen(event)) throw httpError(409, 'Team formation is closed');
    const maxSize = event.participation.teamSize.max;

    await runTransaction(async (session) => {
      const seat = await Team.updateOne(
        { _id: invite.teamId, status: 'forming', memberCount: { $lt: maxSize } },
        { $inc: { memberCount: 1 } },
        { session }
      );
      if (seat.modifiedCount === 0) throw httpError(409, 'Team is full or locked');

      const join = await EventRegistration.updateOne(
        { eventId: event._id, authorId: me._id, teamId: null, status: 'pending_team' },
        { $set: { teamId: invite.teamId } },
        { session }
      );
      if (join.modifiedCount === 0) throw httpError(409, 'You are already in a team for this event');

      const now = new Date();
      await TeamInvite.updateOne(
        { _id: invite._id },
        { $set: { status: 'accepted', respondedAt: now } },
        { session }
      );
      await TeamInvite.updateMany(
        { eventId: event._id, invitedAuthorId: me._id, status: 'pending', _id: { $ne: invite._id } },
        { $set: { status: 'revoked', respondedAt: now } },
        { session }
      );
    });

    const team = await Team.findById(invite.teamId).select('leadId name').lean();
    await notifyAuthors({
      authorIds: [team.leadId],
      type: 'collab',
      message: `${me.authorname} joined ${team.name}.`,
      url: buildNotificationUrl.eventTeam(event._id),
      eventId: event._id,
      sender: sender(me),
    });

    return res.status(200).json({ message: 'Joined team' });
  } catch (err) {
    return sendError(res, err, 'respondToInvite');
  }
};

// ── DELETE /bytes/events/invites/:inviteId  (lead revokes a pending invite) ──
const revokeInvite = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const invite = await TeamInvite.findOne({ _id: req.params.inviteId, tenantId: req.user.tenantId });
    if (!invite) throw httpError(404, 'Invite not found');

    const team = await Team.findById(invite.teamId).select('leadId').lean();
    if (!team || String(team.leadId) !== String(me._id)) throw httpError(403, 'Only the lead can revoke');
    if (invite.status !== 'pending') throw httpError(409, `Invite is ${invite.status}`);

    invite.status = 'revoked';
    invite.respondedAt = new Date();
    await invite.save();

    return res.status(200).json({ message: 'Invite revoked' });
  } catch (err) {
    return sendError(res, err, 'revokeInvite');
  }
};

// ── POST /bytes/events/teams/:teamId/leave  (members, not the lead) ──────────
const leaveTeam = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const team = await Team.findOne({ _id: req.params.teamId, tenantId: req.user.tenantId });
    if (!team) throw httpError(404, 'Team not found');
    if (String(team.leadId) === String(me._id)) {
      throw httpError(409, 'The lead must disband the team instead');
    }
    if (team.status !== 'forming') throw httpError(409, 'Team is locked');

    const reg = await EventRegistration.findOne({ authorId: me._id, teamId: team._id });
    if (!reg) throw httpError(404, 'You are not a member of this team');

    await runTransaction(async (session) => {
      const left = await Team.updateOne(
        { _id: team._id, status: 'forming' },
        { $inc: { memberCount: -1 } },
        { session }
      );
      if (left.modifiedCount === 0) throw httpError(409, 'Team is locked');

      await EventRegistration.updateOne(
        { _id: reg._id },
        { $set: { teamId: null, role: 'participant' } },
        { session }
      );
    });

    return res.status(200).json({ message: 'Left team' });
  } catch (err) {
    return sendError(res, err, 'leaveTeam');
  }
};

// ── POST /bytes/events/teams/:teamId/lock  (lead only) ───────────────────────
// Locking needs the minimum team size. Pending members become confirmed.
// Open invites are revoked.
const lockTeam = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const team = await Team.findOne({ _id: req.params.teamId, tenantId: req.user.tenantId });
    if (!team) throw httpError(404, 'Team not found');
    if (String(team.leadId) !== String(me._id)) throw httpError(403, 'Only the lead can lock the team');
    if (team.status !== 'forming') throw httpError(409, 'Team is already locked');

    const event = await Event.findById(team.eventId);
    if (!event || !isFormationOpen(event)) throw httpError(409, 'Team formation is closed');

    const min = event.participation.teamSize.min;
    if (team.memberCount < min) throw httpError(409, `Team needs at least ${min} members`);

    await runTransaction(async (session) => {
      const locked = await Team.updateOne(
        { _id: team._id, status: 'forming', memberCount: { $gte: min } },
        { $set: { status: 'locked', lockedAt: new Date() } },
        { session }
      );
      if (locked.modifiedCount === 0) throw httpError(409, 'Team changed while locking. Try again.');

      await EventRegistration.updateMany(
        { teamId: team._id, status: 'pending_team' },
        { $set: { status: 'confirmed' } },
        { session }
      );
      await TeamInvite.updateMany(
        { teamId: team._id, status: 'pending' },
        { $set: { status: 'revoked', respondedAt: new Date() } },
        { session }
      );
    });

    const members = await EventRegistration.find({ teamId: team._id }).select('authorId').lean();
    await notifyAuthors({
      authorIds: members.map((m) => m.authorId),
      type: 'collab',
      message: `${team.name} is locked for ${event.title}.`,
      url: buildNotificationUrl.eventTeam(event._id),
      eventId: event._id,
      sender: sender(me),
    });

    return res.status(200).json({ message: 'Team locked' });
  } catch (err) {
    return sendError(res, err, 'lockTeam');
  }
};

// ── DELETE /bytes/events/teams/:teamId  (lead, while forming) ────────────────
// Members return to pending_team. Pending invites are revoked.
const disbandTeam = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const team = await Team.findOne({ _id: req.params.teamId, tenantId: req.user.tenantId });
    if (!team) throw httpError(404, 'Team not found');
    if (String(team.leadId) !== String(me._id)) throw httpError(403, 'Only the lead can disband');
    if (team.status !== 'forming') throw httpError(409, 'Locked teams cannot be disbanded');

    await runTransaction(async (session) => {
      const removed = await Team.deleteOne({ _id: team._id, status: 'forming' }, { session });
      if (removed.deletedCount === 0) throw httpError(409, 'Team changed while disbanding. Try again.');

      await EventRegistration.updateMany(
        { teamId: team._id },
        { $set: { teamId: null, role: 'participant' } },
        { session }
      );
      await TeamInvite.updateMany(
        { teamId: team._id, status: 'pending' },
        { $set: { status: 'revoked', respondedAt: new Date() } },
        { session }
      );
      await Event.updateOne(
        { _id: team.eventId },
        { $inc: { 'counters.teamCount': -1 } },
        { session }
      );
    });

    await bumpEventsCache(team.tenantId);
    return res.status(200).json({ message: 'Team disbanded' });
  } catch (err) {
    return sendError(res, err, 'disbandTeam');
  }
};

module.exports = {
  registerForEvent,
  withdrawRegistration,
  createTeam,
  inviteToTeam,
  respondToInvite,
  revokeInvite,
  leaveTeam,
  lockTeam,
  disbandTeam,
};