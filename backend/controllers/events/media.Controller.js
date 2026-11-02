const crypto = require('crypto');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const EventMedia = require('../../models/events/EventMedia');
const Team = require('../../models/events/team');
const Event = require('../../models/events/event').Event;
const {
  httpError,
  sendError,
  resolveAuthor,
  loadEvent,
  assertOrganizer,
} = require('../../utils/events/eventHelpers');

const BUCKET = process.env.S3_BUCKET || 'open-access-blog-image';
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const URL_TTL_SECONDS = 300;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };

// What each upload kind accepts, and who may upload it.
const KINDS = {
  cover:        { types: IMAGE_TYPES,           who: 'organizer' },
  media:        { types: IMAGE_TYPES,           who: 'organizer' },
  presentation: { types: ['application/pdf'],   who: 'lead' },
};

// POST /events/:eventId/uploads
// body: { kind: 'cover' | 'media' | 'presentation', contentType }
// Returns a presigned PUT URL. The browser must send the same Content-Type header.
// For kind 'media' a pending EventMedia row is also created, and the response includes mediaId.
const createUpload = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    if (event.cancelledAt) throw httpError(409, 'Event is cancelled');

    const { kind, contentType } = req.body || {};
    const rule = KINDS[kind];
    if (!rule) throw httpError(400, 'kind must be cover, media, or presentation');
    if (!rule.types.includes(contentType)) throw httpError(400, 'Unsupported file type for this upload');

    if (rule.who === 'organizer') {
      assertOrganizer(event, me._id);
    } else {
      // presentation: the lead of a locked team, while submissions are open
      const now = new Date();
      if (now < new Date(event.schedule.eventStartsAt) || now >= new Date(event.schedule.submissionDeadlineAt)) {
        throw httpError(409, 'Uploads for submissions are closed');
      }
      const team = await Team.findOne({ eventId: event._id, leadId: me._id, status: 'locked' }).select('_id').lean();
      if (!team) throw httpError(403, 'Only the lead of a locked team can upload a presentation');
    }

    const key = `events/${event._id}/${kind}/${crypto.randomUUID()}.${EXT[contentType]}`;
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: URL_TTL_SECONDS }
    );

    if (kind === 'media') {
      const count = await EventMedia.countDocuments({ eventId: event._id, status: { $ne: 'deleted' } });
      const row = await EventMedia.create({
        tenantId: event.tenantId,
        eventId: event._id,
        s3Key: key,
        sortOrder: count,
        status: 'pending',
        uploadedBy: me._id,
      });
      return res.status(201).json({ uploadUrl, key, mediaId: row._id });
    }

    return res.status(201).json({ uploadUrl, key });
  } catch (err) {
    return sendError(res, err, 'createUpload');
  }
};

// POST /events/:eventId/media/:mediaId/confirm  (organizers)
// Checks the object exists in S3 before marking the row ready.
const confirmMedia = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const row = await EventMedia.findOne({ _id: req.params.mediaId, eventId: event._id, status: 'pending' });
    if (!row) throw httpError(404, 'Upload not found or already confirmed');

    try {
      await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: row.s3Key }));
    } catch {
      throw httpError(409, 'The file has not finished uploading');
    }

    row.status = 'ready';
    await row.save();
    return res.status(200).json({ media: row });
  } catch (err) {
    return sendError(res, err, 'confirmMedia');
  }
};

// GET /events/:eventId/media  (any tenant user)
// Returns keys only. The bucket is public-read, so the client builds the URL the
// same way as other images on the platform.
const listMedia = async (req, res) => {
  try {
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    const media = await EventMedia.find({ eventId: event._id, status: 'ready' })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('s3Key caption sortOrder')
      .lean();
    return res.status(200).json({ media });
  } catch (err) {
    return sendError(res, err, 'listMedia');
  }
};

// PATCH /events/:eventId/media/:mediaId  body: { caption, sortOrder }  (organizers)
const updateMedia = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const { caption, sortOrder } = req.body || {};
    const row = await EventMedia.findOneAndUpdate(
      { _id: req.params.mediaId, eventId: event._id, status: { $ne: 'deleted' } },
      { $set: {
          ...(caption !== undefined && { caption: String(caption).slice(0, 300) }),
          ...(sortOrder !== undefined && { sortOrder: Math.max(0, Number(sortOrder) || 0) }),
      } },
      { new: true }
    ).lean();
    if (!row) throw httpError(404, 'Media not found');
    return res.status(200).json({ media: row });
  } catch (err) {
    return sendError(res, err, 'updateMedia');
  }
};

// DELETE /events/:eventId/media/:mediaId  (organizers)
// Soft delete. A background job removes the S3 object later.
const deleteMedia = async (req, res) => {
  try {
    const me = await resolveAuthor(req);
    const event = await loadEvent(req.params.eventId, req.user.tenantId);
    assertOrganizer(event, me._id);

    const row = await EventMedia.findOneAndUpdate(
      { _id: req.params.mediaId, eventId: event._id, status: { $ne: 'deleted' } },
      { $set: { status: 'deleted' } },
      { new: true }
    ).lean();
    if (!row) throw httpError(404, 'Media not found');
    return res.status(200).json({ message: 'Media removed' });
  } catch (err) {
    return sendError(res, err, 'deleteMedia');
  }
};

module.exports = { createUpload, confirmMedia, listMedia, updateMedia, deleteMedia };