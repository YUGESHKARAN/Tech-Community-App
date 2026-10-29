
const mongoose = require('mongoose');

/**
 * EventMedia
 *
 * Gallery items for an event (photos, recap images). Files live in S3 under
 * events/{eventId}/. The key prefix is validated here so a row can never
 * point at another event's or another tenant's objects.
 *
 * Flow: a row is created as 'pending' when the upload URL is issued, and
 * flipped to 'ready' once the upload is confirmed. Deleted rows are kept as
 * 'deleted' for audit and the S3 object is removed by a background job.
 */
const MEDIA_STATUSES = ['pending', 'ready', 'deleted'];

const eventMediaSchema = new mongoose.Schema(
  {
    tenantId:   { type: String, required: true, lowercase: true, trim: true },
    eventId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    s3Key:      { type: String, required: true, trim: true },
    caption:    { type: String, trim: true, maxlength: 300, default: '' },
    sortOrder:  { type: Number, default: 0, min: 0 },
    status:     { type: String, enum: MEDIA_STATUSES, default: 'pending' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
  },
  { timestamps: true }
);

eventMediaSchema.pre('validate', function () {
  if (this.s3Key && this.eventId && !this.s3Key.startsWith(`events/${this.eventId}/`)) {
    this.invalidate('s3Key', `must start with events/${this.eventId}/`);
  }
});

eventMediaSchema.index({ eventId: 1, sortOrder: 1 });
eventMediaSchema.index({ s3Key: 1 }, { unique: true });

module.exports = mongoose.model('EventMedia', eventMediaSchema);
module.exports.MEDIA_STATUSES = MEDIA_STATUSES;