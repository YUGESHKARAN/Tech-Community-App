
const mongoose = require('mongoose');
// const { redisClient } = require('../../config/redis'); // adjust to your redis module
const {redisClient} = require("../../middleware/redis")
const {Author} = require('../../models/blogAuthorSchema');
const { Event } = require('../../models/events/Event');
const { trackActivity } = require('../../services/trackActivity');

const EVENTS_POST_CATEGORY = 'Events';

// ── errors ───────────────────────────────────────────────────────────────────

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const httpError = (status, message) => new HttpError(status, message);

/**
 * Maps errors to HTTP responses. dupMessage is used for E11000 on this route
 * (e.g. "Already registered for this event").
 */
function sendError(res, err, label = 'events', dupMessage = 'Duplicate entry') {
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: dupMessage });
  console.error(`${label} error:`, err);
  return res.status(500).json({ message: 'Server error' });
}

// ── transactions ─────────────────────────────────────────────────────────────

/** Runs fn inside a transaction and returns its result. Needs a replica set. */
async function runTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

// ── actors and access ────────────────────────────────────────────────────────

/** Loads the calling Author once per request. Assumes req.user has email and tenantId. */
async function resolveAuthor(req) {
  if (req.authorDoc) return req.authorDoc;
  const author = await Author.findOne({ email: req.user.email, tenantId: req.user.tenantId })
    .select('_id authorname email role')
    .lean();
  if (!author) throw httpError(404, 'Author not found');
  req.authorDoc = author;
  return author;
}

/** Loads an event scoped to the tenant. Throws 404 if missing. */
async function loadEvent(eventId, tenantId) {
  if (!mongoose.isValidObjectId(eventId)) throw httpError(404, 'Event not found');
  const event = await Event.findOne({ _id: eventId, tenantId });
  if (!event) throw httpError(404, 'Event not found');
  return event;
}

/** Throws 403 unless the author is an organizer (owner only, when ownerOnly is set). */
function assertOrganizer(event, authorId, { ownerOnly = false } = {}) {
  const org = event.organizers.find((o) => String(o.authorId) === String(authorId));
  if (!org || (ownerOnly && org.role !== 'owner')) throw httpError(403, 'Not allowed');
}

// ── time windows ─────────────────────────────────────────────────────────────

/** Team formation closes at teamFormationClosesAt, or at registrationClosesAt if unset. */
const teamFormationDeadline = (event) =>
  event.schedule.teamFormationClosesAt || event.schedule.registrationClosesAt;

const isFormationOpen = (event, now = new Date()) =>
  !event.cancelledAt &&
  now >= new Date(event.schedule.registrationOpensAt) &&
  now < new Date(teamFormationDeadline(event));

// ── notifications ────────────────────────────────────────────────────────────

/**
 * Pushes a notification onto each Author's notification array.
 * Failures are logged, never thrown, so they cannot break the main write.
 */
async function notifyAuthors({ authorIds, type, message, url, eventId, sender }) {
  try {
    const ids = [...new Set((authorIds || []).map(String))];
    if (!ids.length) return;
    const note = {
      type,
      message,
      url,
      eventId,
      user: sender.name,
      authorEmail: sender.email,
      timestamp: new Date(),
    };
    await Author.updateMany({ _id: { $in: ids } }, { $push: { notification: note } });
  } catch (err) {
    console.error('notifyAuthors error:', err.message);
  }
}

// ── cache ────────────────────────────────────────────────────────────────────

// Versioned key: bumping the version invalidates every cached list for the tenant
// without scanning keys.
const eventsVersionKey = (tenantId) => `events:${tenantId}:version`;

async function bumpEventsCache(tenantId) {
  try {
    await redisClient.incr(eventsVersionKey(tenantId));
  } catch (err) {
    console.error('bumpEventsCache error:', err.message);
  }
}

// ── points ───────────────────────────────────────────────────────────────────

/** Logs an event point award through the performance tracker. Never throws. */
async function awardEventPoints({ authorId, tenantId, type, targetId, eventId, title, pts }) {
  try {
    await trackActivity({
      authorId,
      tenantId,
      event: {
        type,
        targetId,
        eventId,
        communityId: null,
        discussionId: null,
        title,
        communityName: null,
        pts,
      },
    });
  } catch (err) {
    console.error('awardEventPoints error:', err.message);
  }
}

module.exports = {
  EVENTS_POST_CATEGORY,
  HttpError,
  httpError,
  sendError,
  runTransaction,
  resolveAuthor,
  loadEvent,
  assertOrganizer,
  teamFormationDeadline,
  isFormationOpen,
  notifyAuthors,
  eventsVersionKey,
  bumpEventsCache,
  awardEventPoints,
};