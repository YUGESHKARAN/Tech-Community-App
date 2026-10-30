
const crypto = require('crypto');
const { Event, EVENT_CATEGORIES, EVENT_STATUS_FIELDS } = require('../../models/events/event');
const EventPartner = require('../../models/events/eventPartner');
const EventRegistration = require('../../models/events/eventRegistration');
const {Author} = require('../../models/blogAuthorSchema');
const { buildNotificationUrl } = require('../../models/services/notificationSchema');
const { redisClient } = require('../../middleware/redis'); // adjust to your redis module
const {
  httpError,
  sendError,
  resolveAuthor,
  loadEvent,
  assertOrganizer,
  notifyAuthors,
  eventsVersionKey,
  bumpEventsCache,
} = require('../../utils/events/eventHelpers');

const LIST_CACHE_TTL = 60; // seconds

// Fields an organizer may change through PATCH. Status, counters, cancel
// fields and organizers are never editable here.
const EDITABLE = [
  'title', 'overview', 'category', 'themes', 'prizes', 'eligibility', 'rules',
  'faqs', 'support', 'coverKey', 'capacity', 'rubric', 'pointsPolicy',
  'schedule', 'participation',
];

const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'event';

async function uniqueSlug(title, tenantId) {
  const base = slugify(title);
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}-${crypto.randomBytes(2).toString('hex')}`;
    const exists = await Event.exists({ tenantId, slug: candidate });
    if (!exists) return candidate;
  }
  throw httpError(409, 'Could not create a unique slug. Try a different title.');
}

// ── POST /bytes/events  (admin only) ─────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') throw httpError(403, 'Only admins can create events');
    const me = await resolveAuthor(req);
    const body = req.body || {};
    if (!EVENT_CATEGORIES.includes(body.category)) throw httpError(400, 'Invalid category');

    const event = await Event.create({
      tenantId: req.user.tenantId,
      slug: await uniqueSlug(body.title, req.user.tenantId),
      title: body.title,
      overview: body.overview,
      category: body.category,
      schedule: body.schedule,
      participation: body.participation,
      capacity: body.capacity,
      themes: body.themes,
      prizes: body.prizes,
      eligibility: body.eligibility,
      rules: body.rules,
      faqs: body.faqs,
      support: body.support,
      coverKey: body.coverKey,
      rubric: body.rubric || [],
      pointsPolicy: body.pointsPolicy,
      organizers: [{ authorId: me._id, role: 'owner' }],
      createdBy: me._id,
    });

    await bumpEventsCache(event.tenantId);
    return res.status(201).json({ event });
  } catch (err) {
    return sendError(res, err, 'createEvent');
  }
};

// ── GET /bytes/events?status=&category=&page=&limit= ─────────────────────────
// Status is computed, so the query loads the recent events for the tenant,
// computes status in memory, and filters and paginates there. The 60s cache
// holds the loaded set and is versioned by tenant.
const listEvents = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { status, category } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);

    const version = (await redisClient.get(eventsVersionKey(tenantId)).catch(() => null)) || '0';
    const cacheKey = `events:${tenantId}:v${version}:recent`;

    let events = null;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) events = JSON.parse(cached);
    } catch (e) {
      console.error('events cache read failed:', e.message);
    }

    if (!events) {
      events = await Event.find({ tenantId })
        .select([...EVENT_STATUS_FIELDS, 'title', 'slug', 'category', 'participation', 'counters', 'coverKey'].join(' '))
        .sort({ 'schedule.eventStartsAt': -1 })
        .limit(200)
        .lean();
      try {
        await redisClient.setEx(cacheKey, LIST_CACHE_TTL, JSON.stringify(events));
      } catch (e) {
        console.error('events cache write failed:', e.message);
      }
    }

    const withStatus = events.map((e) => ({ ...e, status: Event.computeStatus(e) }));
    const filtered = withStatus.filter(
      (e) => (!status || e.status === status) && (!category || e.category === category)
    );
    const start = (page - 1) * limit;

    return res.status(200).json({
      events: filtered.slice(start, start + limit),
      page,
      hasMore: start + limit < filtered.length,
    });
  } catch (err) {
    return sendError(res, err, 'listEvents');
  }
};

// ── GET /bytes/events/:eventId ───────────────────────────────────────────────
const getEvent = async (req, res) => {
  try {
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    const partners = await EventPartner.find({ eventId: event._id })
      .sort({ order: 1 })
      .populate('partnerId', 'name logoKey website')
      .lean();

    return res.status(200).json({
      event: { ...event.toObject(), status: Event.computeStatus(event) },
      partners,
    });
  } catch (err) {
    return sendError(res, err, 'getEvent');
  }
};

// ── PATCH /bytes/events/:eventId  (organizers) ───────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const status = Event.computeStatus(event);
    if (status === 'ended' || status === 'cancelled') throw httpError(409, `Event is ${status}`);

    const body = req.body || {};
    const keys = Object.keys(body).filter((k) => EDITABLE.includes(k));

    // schedule and participation are frozen once registration closes
    if ((body.schedule || body.participation) && !['upcoming', 'registration_open'].includes(status)) {
      throw httpError(409, 'Schedule can only change before registration closes');
    }
    if (body.participation && event.counters.registrationCount > 0) {
      throw httpError(409, 'Participation type cannot change after registrations start');
    }
    // rubric is frozen once judging starts
    if (body.rubric && event.rubricLockedAt) {
      throw httpError(409, 'Rubric is locked once judging has started');
    }

    for (const key of keys) event.set(key, body[key]);
    await event.save();
    await bumpEventsCache(event.tenantId);

    return res.status(200).json({ event });
  } catch (err) {
    return sendError(res, err, 'updateEvent');
  }
};

// ── POST /bytes/events/:eventId/cancel  (organizers) ─────────────────────────
const cancelEvent = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const blocker = Event.cancellationBlocker(event);
    if (blocker) throw httpError(409, blocker);

    const reason = (req.body?.reason || '').toString().trim().slice(0, 500) || null;
    event.cancelledAt = new Date();
    event.cancelledBy = me._id;
    event.cancelReason = reason;
    await event.save();

    const regs = await EventRegistration.find({
      eventId: event._id,
      status: { $in: ['pending_team', 'confirmed'] },
    })
      .select('authorId')
      .lean();

    await notifyAuthors({
      authorIds: regs.map((r) => r.authorId),
      type: 'announcement',
      message: `${event.title} has been cancelled.`,
      url: buildNotificationUrl.event(event._id),
      eventId: event._id,
      sender: { name: me.authorname, email: me.email },
    });

    await bumpEventsCache(event.tenantId);
    return res.status(200).json({ message: 'Event cancelled', event });
  } catch (err) {
    return sendError(res, err, 'cancelEvent');
  }
};

// ── POST /bytes/events/:eventId/organizers  (owner only) ─────────────────────
// Only coordinators and admins can be added as co-organizers.
const addOrganizer = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id, { ownerOnly: true });

    const email = (req.body?.email || '').trim().toLowerCase();
    if (!email) throw httpError(400, 'email is required');

    const target = await Author.findOne({ email, tenantId: event.tenantId })
      .select('_id authorname email role')
      .lean();
    if (!target) throw httpError(404, 'No user with that email in your institution');
    if (!['coordinator', 'admin'].includes(target.role)) {
      throw httpError(400, 'Only coordinators or admins can be organizers');
    }
    if (event.organizers.some((o) => String(o.authorId) === String(target._id))) {
      throw httpError(409, 'Already an organizer');
    }

    event.organizers.push({ authorId: target._id, role: 'co_organizer' });
    await event.save();

    await notifyAuthors({
      authorIds: [target._id],
      type: 'collab',
      message: `${me.authorname} added you as an organizer for ${event.title}.`,
      url: buildNotificationUrl.event(event._id),
      eventId: event._id,
      sender: { name: me.authorname, email: me.email },
    });

    return res.status(201).json({ organizers: event.organizers });
  } catch (err) {
    return sendError(res, err, 'addOrganizer');
  }
};

// ── DELETE /bytes/events/:eventId/organizers/:authorId  (owner only) ─────────
const removeOrganizer = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id, { ownerOnly: true });

    const target = event.organizers.find((o) => String(o.authorId) === req.params.authorId);
    if (!target) throw httpError(404, 'Not an organizer');
    if (target.role === 'owner') throw httpError(400, 'The owner cannot be removed');

    event.organizers = event.organizers.filter((o) => String(o.authorId) !== req.params.authorId);
    await event.save();

    return res.status(200).json({ organizers: event.organizers });
  } catch (err) {
    return sendError(res, err, 'removeOrganizer');
  }
};

module.exports = {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  cancelEvent,
  addOrganizer,
  removeOrganizer,
};