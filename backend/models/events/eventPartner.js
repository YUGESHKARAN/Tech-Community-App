const mongoose = require('mongoose');

/**
 * EventPartner
 *
 * Join between Event and Partner. Carries the per-event tier and display
 * order, so the same partner can be a title sponsor at one event and a
 * community partner at another.
 */

const TIERS = ['title', 'gold', 'silver', 'community'];

const eventPartnerSchema = new mongoose.Schema(
  {
    tenantId:  { type: String, required: true, lowercase: true, trim: true },
    eventId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
    tier:      { type: String, enum: TIERS, default: 'community' },
    order:     { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

eventPartnerSchema.index({ eventId: 1, partnerId: 1 }, { unique: true });
eventPartnerSchema.index({ tenantId: 1, eventId: 1, order: 1 });

module.exports = mongoose.model('EventPartner', eventPartnerSchema);
module.exports.TIERS = TIERS;