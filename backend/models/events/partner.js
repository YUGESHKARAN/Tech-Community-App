const mongoose = require('mongoose');

/**
 * Partner
 *
 * Sponsor or partner organisation, owned by the tenant and reusable across
 * events. Kept separate from Event so one partner can back many events
 * without duplicating its logo and contact data.
 */
const partnerSchema = new mongoose.Schema(
  {
    tenantId:    { type: String, required: true, lowercase: true, trim: true },
    name:        { type: String, required: true, trim: true, maxlength: 120 },
    logoKey:     { type: String, default: null }, // S3 key
    website:     { type: String, trim: true, default: null },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    contact: {
      name:  { type: String, trim: true, maxlength: 120, default: null },
      email: { type: String, trim: true, lowercase: true, default: null },
    },
    active:      { type: Boolean, default: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
  },
  { timestamps: true }
);

// name is unique per tenant, compared case-insensitively.
// Queries that look up by name must pass the same collation.
partnerSchema.index(
  { tenantId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model('Partner', partnerSchema);