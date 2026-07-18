const mongoose = require('mongoose');

/**
 * CommunityMembership
 *
 * Join collection: which author belongs to which community, with what
 * role, within which tenant.
 *
 * Rule: an Author with the global role 'coordinator' (or 'admin'/'director')
 * is a coordinator of every community they belong to — this is derived
 * directly from Author.role at write time, not an independent choice.
 * Any author not in one of those global roles defaults to 'member' on
 * join. This mirrors the platform's actual permission model, so
 * CommunityMembership.role should always stay in sync with Author.role —
 * if an author's global role changes, their memberships must be updated
 * too (see syncMembershipRoles in the controller layer).
 */
const communityMembershipSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
  role: { type: String, enum: ['member', 'coordinator'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

communityMembershipSchema.index({ tenantId: 1, communityId: 1, authorId: 1 }, { unique: true });
communityMembershipSchema.index({ tenantId: 1, authorId: 1 });

module.exports = mongoose.model('CommunityMembership', communityMembershipSchema);