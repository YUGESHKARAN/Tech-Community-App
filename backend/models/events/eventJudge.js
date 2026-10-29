
const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * EventJudge
 *
 * A person assigned to score submissions for one event. Two kinds:
 *
 *   platform  a BytesBase Author. Signs in normally. authorId is required.
 *   external  someone outside the platform. Gets an emailed link. judgeEmail
 *             is required and access is granted by a single-use token.
 *
 * External tokens are random 32-byte values. Only the SHA-256 hash is stored
 * (accessTokenHash, select:false). The raw token exists only in the email.
 * Tokens expire 72 hours after issue (tokenExpiresAt) and are marked used
 * (tokenUsedAt) on first redemption. Redemption exchanges the link for a
 * short-lived judge session, so the link itself is not reusable.
 */
const JUDGE_TYPES = ['platform', 'external'];
const JUDGE_STATUSES = ['invited', 'active', 'revoked'];
const TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

const eventJudgeSchema = new mongoose.Schema(
  {
    tenantId:    { type: String, required: true, lowercase: true, trim: true },
    eventId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    judgeType:   { type: String, enum: JUDGE_TYPES, required: true },

    // platform judges
    authorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Author', default: null },

    // external judges
    judgeEmail:  { type: String, trim: true, lowercase: true, default: null },
    displayName: { type: String, trim: true, maxlength: 120, default: null },

    status:      { type: String, enum: JUDGE_STATUSES, default: 'invited' },
    invitedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },

    accessTokenHash: { type: String, default: null, select: false },
    tokenExpiresAt:  { type: Date, default: null },
    tokenUsedAt:     { type: Date, default: null },
  },
  { timestamps: true }
);

eventJudgeSchema.pre('validate', function () {
  if (this.judgeType === 'platform' && !this.authorId) {
    this.invalidate('authorId', 'required for platform judges');
  }
  if (this.judgeType === 'external' && !this.judgeEmail) {
    this.invalidate('judgeEmail', 'required for external judges');
  }
});

// a platform user judges an event at most once; an external email likewise
eventJudgeSchema.index(
  { eventId: 1, authorId: 1 },
  { unique: true, partialFilterExpression: { judgeType: 'platform' } }
);
eventJudgeSchema.index(
  { eventId: 1, judgeEmail: 1 },
  { unique: true, partialFilterExpression: { judgeType: 'external' } }
);

/**
 * Creates a new single-use token for an external judge.
 * Returns the raw token (send it by email, never store it). Saves the hash
 * and expiry on the document.
 */
eventJudgeSchema.statics.issueToken = async function (judgeId) {
  const raw = crypto.randomBytes(32).toString('hex');
  await this.updateOne(
    { _id: judgeId, judgeType: 'external' },
    {
      $set: {
        accessTokenHash: hashToken(raw),
        tokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        tokenUsedAt: null,
        status: 'invited',
      },
    }
  );
  return raw;
};

/**
 * Looks up a judge by raw token. Valid only if unexpired and unused.
 * The caller marks tokenUsedAt when it redeems the link.
 */
eventJudgeSchema.statics.findByToken = function (raw) {
  return this.findOne({
    accessTokenHash: hashToken(raw),
    tokenExpiresAt: { $gt: new Date() },
    tokenUsedAt: null,
    status: { $ne: 'revoked' },
  }).select('+accessTokenHash');
};

eventJudgeSchema.index({ tokenExpiresAt: 1 });

module.exports = mongoose.model('EventJudge', eventJudgeSchema);
module.exports.JUDGE_TYPES = JUDGE_TYPES;
module.exports.JUDGE_STATUSES = JUDGE_STATUSES;