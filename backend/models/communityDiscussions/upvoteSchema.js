const mongoose = require('mongoose');

/**
 * Upvote
 *
 * Source of truth for WHO voted on a Discussion or DiscussionReply.
 * The HOW MANY is stored as a cached upvoteCount on the target document
 * itself (Discussion.upvoteCount / DiscussionReply.upvoteCount), kept
 * in sync via $inc in the vote/unvote controllers.
 *
 * This separation means:
 *   - Feed load: read upvoteCount from the Discussion doc (no extra query)
 *   - "Did I vote?": one batched Upvote.find({ targetId: { $in: ids }, authorId })
 *     per page load — O(1) per thread regardless of total vote count
 *   - No document bloat: upvotes on a thread never affect Discussion doc size
 *   - Scales to millions of votes without schema changes
 *
 * The unique index on { targetId, authorId } is the double-vote prevention
 * mechanism — no application-level check needed, the DB rejects it.
 */
const upvoteSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },

    // the Discussion or DiscussionReply being upvoted
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['discussion', 'reply'],
      required: true,
    },

    // the author casting the vote
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Primary: prevents double-vote and serves "did I vote?" lookup.
// Unique constraint is the double-vote prevention — no app-level check needed.
upvoteSchema.index({ targetId: 1, authorId: 1 }, { unique: true });

// Tenant-scoped batch "did I vote?" query on feed load
upvoteSchema.index({ tenantId: 1, targetId: 1, authorId: 1 });

// All upvotes by an author — used for leaderboard/profile aggregations
upvoteSchema.index({ tenantId: 1, authorId: 1 });

module.exports = mongoose.model('Upvote', upvoteSchema);