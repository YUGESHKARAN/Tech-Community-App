
const mongoose = require('mongoose');

/**
 * DiscussionReply
 *
 * One document per reply on a Discussion thread.
 * Supports exactly one level of nesting:
 *   - Top-level replies: parentReplyId = null
 *   - Nested replies:    parentReplyId = ObjectId of the parent reply
 *
 * The controller enforces the one-level rule — it rejects any attempt
 * to set parentReplyId on a document whose parent already has a
 * parentReplyId. This is intentionally not enforced at schema level
 * to keep the schema simple and avoid a DB lookup on every insert.
 *
 * isAnswer: set to true by the thread OP or a coordinator when this
 * reply resolves the discussion. Setting this also triggers:
 *   - Discussion.isSolved = true
 *   - Discussion.solvedReplyId = this._id
 * Both updates happen atomically in the markAnswer controller.
 */
const discussionReplySchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion',
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true,
    },

    body: { type: String, required: true },

    // null for top-level replies; ObjectId for one-level nested replies
    parentReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionReply',
      default: null,
    },

    isAnswer: { type: Boolean, default: false },

    // cached upvote count — source of truth is the Upvote collection
    upvoteCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Fetch all replies for a thread, oldest first (chronological thread view)
discussionReplySchema.index({ tenantId: 1, discussionId: 1, createdAt: 1 });

// Fast lookup of the accepted answer for a thread
discussionReplySchema.index({ tenantId: 1, discussionId: 1, isAnswer: 1 });

// Fetch nested replies under a specific parent reply
discussionReplySchema.index({ tenantId: 1, parentReplyId: 1, createdAt: 1 });

// Author's replies (for profile/leaderboard aggregation)
discussionReplySchema.index({ tenantId: 1, authorId: 1 });

module.exports = mongoose.model('DiscussionReply', discussionReplySchema);