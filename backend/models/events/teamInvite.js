const mongoose = require('mongoose');

/**
 * TeamInvite
 *
 * An invitation from a team lead (or a member, if the controller allows it)
 * to a registered participant who is still 'pending_team'.
 *
 * At most one pending invite per (team, invitee). This is a partial unique
 * index, so accepted, declined, expired and revoked invites can accumulate
 * as history.
 *
 * expiresAt is checked on accept. A sweep job flips stale rows to 'expired';
 * no TTL index, so the history is kept.
 */
const INVITE_STATUSES = ['pending', 'accepted', 'declined', 'expired', 'revoked'];

const teamInviteSchema = new mongoose.Schema(
  {
    tenantId:        { type: String, required: true, lowercase: true, trim: true },
    eventId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    teamId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    invitedAuthorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    invitedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    status:          { type: String, enum: INVITE_STATUSES, default: 'pending' },
    expiresAt:       { type: Date, required: true },
    respondedAt:     { type: Date, default: null },
  },
  { timestamps: true }
);

// only one pending invite per team and invitee
teamInviteSchema.index(
  { teamId: 1, invitedAuthorId: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

// "my invites" inbox
teamInviteSchema.index({ invitedAuthorId: 1, status: 1, expiresAt: 1 });

// expiry sweep
teamInviteSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('TeamInvite', teamInviteSchema);
module.exports.INVITE_STATUSES = INVITE_STATUSES;