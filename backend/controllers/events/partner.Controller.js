
const Partner = require('../../models/events/partner');
const EventPartner = require('../../models/events/eventPartner');
const {
  httpError,
  sendError,
  resolveAuthor,
  loadEvent,
  assertOrganizer,
} = require('../../utils/events/eventHelpers');

const TIERS = EventPartner.TIERS;

// ── Tenant partner library ───────────────────────────────────────────────────

// GET /partners  (any tenant user, used when attaching to an event)
const listPartners = async (req, res) => {
  try {
    const partners = await Partner.find({ tenantId: req.user.tenantId, active: true })
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ partners });
  } catch (err) {
    return sendError(res, err, 'listPartners');
  }
};

// POST /partners  (admin)
const createPartner = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const { name, logoKey, website, description, contact } = req.body || {};
    if (!name?.trim()) throw httpError(400, 'Partner name is required');

    const partner = await Partner.create({
      tenantId: req.user.tenantId,
      name: name.trim(),
      logoKey: logoKey || null,
      website: website?.trim() || null,
      description: description?.trim() || '',
      contact: contact || {},
      createdBy: me._id,
    });
    return res.status(201).json({ partner });
  } catch (err) {
    return sendError(res, err, 'createPartner', 'A partner with that name already exists');
  }
};

// PATCH /partners/:partnerId  (admin)
const updatePartner = async (req, res) => {
  try {
    const EDITABLE = ['name', 'logoKey', 'website', 'description', 'contact'];
    const partner = await Partner.findOne({ _id: req.params.partnerId, tenantId: req.user.tenantId });
    if (!partner) throw httpError(404, 'Partner not found');

    for (const key of EDITABLE) {
      if (req.body?.[key] !== undefined) partner.set(key, req.body[key]);
    }
    await partner.save();
    return res.status(200).json({ partner });
  } catch (err) {
    return sendError(res, err, 'updatePartner', 'A partner with that name already exists');
  }
};

// DELETE /partners/:partnerId  (admin)
// Soft delete. Partners already attached to events keep their history.
const deactivatePartner = async (req, res) => {
  try {
    const partner = await Partner.findOneAndUpdate(
      { _id: req.params.partnerId, tenantId: req.user.tenantId },
      { $set: { active: false } },
      { new: true }
    ).lean();
    if (!partner) throw httpError(404, 'Partner not found');
    return res.status(200).json({ message: 'Partner deactivated', partner });
  } catch (err) {
    return sendError(res, err, 'deactivatePartner');
  }
};

// ── Attaching partners to an event (organizers) ──────────────────────────────

// POST /events/:eventId/partners  body: { partnerId, tier, order }
const attachPartner = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const { partnerId, tier = 'community', order = 0 } = req.body || {};
    if (!TIERS.includes(tier)) throw httpError(400, 'Invalid tier');

    const partner = await Partner.findOne({ _id: partnerId, tenantId: event.tenantId, active: true })
      .select('_id')
      .lean();
    if (!partner) throw httpError(404, 'Partner not found or inactive');

    const link = await EventPartner.create({
      tenantId: event.tenantId,
      eventId: event._id,
      partnerId: partner._id,
      tier,
      order,
    });
    const populated = await EventPartner.findById(link._id)
      .populate('partnerId', 'name logoKey website')
      .lean();
    return res.status(201).json({ eventPartner: populated });
  } catch (err) {
    return sendError(res, err, 'attachPartner', 'This partner is already attached to the event');
  }
};

// PATCH /events/:eventId/partners/:partnerId  body: { tier, order }
const updateEventPartner = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const { tier, order } = req.body || {};
    if (tier !== undefined && !TIERS.includes(tier)) throw httpError(400, 'Invalid tier');

    const link = await EventPartner.findOneAndUpdate(
      { eventId: event._id, partnerId: req.params.partnerId },
      { $set: { ...(tier !== undefined && { tier }), ...(order !== undefined && { order }) } },
      { new: true }
    ).lean();
    if (!link) throw httpError(404, 'Partner is not attached to this event');
    return res.status(200).json({ eventPartner: link });
  } catch (err) {
    return sendError(res, err, 'updateEventPartner');
  }
};

// DELETE /events/:eventId/partners/:partnerId
const detachPartner = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const removed = await EventPartner.deleteOne({ eventId: event._id, partnerId: req.params.partnerId });
    if (removed.deletedCount === 0) throw httpError(404, 'Partner is not attached to this event');
    return res.status(200).json({ message: 'Partner removed from event' });
  } catch (err) {
    return sendError(res, err, 'detachPartner');
  }
};

module.exports = {
  listPartners,
  createPartner,
  updatePartner,
  deactivatePartner,
  attachPartner,
  updateEventPartner,
  detachPartner,
};