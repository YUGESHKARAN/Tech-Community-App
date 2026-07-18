
const mongoose = require('mongoose');

/**
 * Community
 *
 * One document per community/domain, scoped to a tenant. Uniqueness is
 * (tenantId, slug) — not slug alone — so two tenants can each have their
 * own "AI/ML" community without colliding.
 *
 * memberCount / postCount are cached counters, kept in sync by:
 *   - inline $inc on join/leave/post-create (fast path)
 *   - a nightly reconciliation job that recounts from source collections
 *     and corrects any drift (safety net, see reconcileCommunityCounts)
 */
const communitySchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    tagline: { type: String },
    description: { type: String },
    icon: { type: String },
    banner: {type: String},
    colorTheme: { type: String },
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

communitySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
communitySchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Community', communitySchema);