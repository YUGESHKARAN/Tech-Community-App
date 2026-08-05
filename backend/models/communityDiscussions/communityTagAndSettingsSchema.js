const mongoose = require('mongoose');

// ── CommunityTag ──────────────────────────────────────────────────────────────
/**
 * CommunityTag
 *
 * Community-scoped labels for Discussion threads, modelled after GitHub labels.
 * Coordinators create/edit/delete tags for their community; any permitted
 * author can apply them when creating or editing a Discussion.
 *
 * color is a hex string (e.g. "#10b981") chosen by the coordinator at
 * creation time, displayed as a colored chip on discussion cards — same
 * visual language as the domain accent colors used elsewhere in the platform.
 */
const communityTagSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      match: [/^#[0-9A-Fa-f]{6}$/, 'color must be a valid hex string e.g. #10b981'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true,
    },
  },
  { timestamps: true }
);

// No duplicate tag names within the same community + tenant
communityTagSchema.index({ tenantId: 1, communityId: 1, name: 1 }, { unique: true });
communityTagSchema.index({ tenantId: 1, communityId: 1 });

const CommunityTag = mongoose.model('CommunityTag', communityTagSchema);

// ── CommunitySettings ─────────────────────────────────────────────────────────
/**
 * CommunitySettings
 *
 * One document per community. Stores coordinator/admin-configurable
 * toggles that affect community behaviour.
 *
 * whoCanPost controls who can create Discussion threads:
 *   'coordinator' (default) — only coordinators of this community
 *   'member'                — any community member
 *
 * This is the only setting for now. Additional toggles (e.g.
 * whoCanUpvote, requireApproval) can be added here as fields
 * without creating a new collection.
 *
 * Created automatically (upsert) when a Community is first created,
 * so it always exists by the time any discussion controller reads it.
 */
const communitySettingsSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    whoCanPost: {
      type: String,
      enum: ['coordinator', 'member'],
      default: 'coordinator',
    },
  },
  { timestamps: true }
);

// One settings doc per community per tenant
communitySettingsSchema.index(
  { tenantId: 1, communityId: 1 },
  { unique: true }
);

const CommunitySettings = mongoose.model('CommunitySettings', communitySettingsSchema);

module.exports = { CommunityTag, CommunitySettings };