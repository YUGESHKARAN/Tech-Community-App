const mongoose = require('mongoose');

/**
 * Discussion
 *
 * One document per discussion thread within a community.
 * Deliberately separate from the existing Post collection —
 * Post serves the knowledge-sharing feed (images, PDFs, links),
 * Discussion serves threaded conversation (Q&A, ideas, showcases).
 *
 * upvoteCount is a cached counter kept in sync by the Upvote
 * collection via $inc — never computed live on feed load.
 *
 * replyCount is similarly cached — incremented/decremented by
 * the reply controllers, corrected nightly by a reconciliation
 * job once you move to EC2.
 */
const discussionSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true,
    },

    category: {
      type: String,
      enum: ['qa', 'idea', 'showcase', 'announcement'],
      required: true,
    },

    title: { type: String, required: true, maxlength: 300 },
    body:  { type: String, required: true },

    // optional — set when discussion originates from an existing Post.
    // null for standalone Q&A threads created by coordinators directly.
    linkedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },

    // community-scoped label ObjectIds → CommunityTag
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'CommunityTag',
      default: [],
    },

    // coordinator-only: pinned threads float above chronological order
    isPinned: { type: Boolean, default: false },

    // Q&A only: set to true when a reply is marked as the accepted answer
    isSolved:     { type: Boolean, default: false },
    solvedReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionReply',
      default: null,
    },

    // cached counters — never compute these live on feed load
    upvoteCount: { type: Number, default: 0 },
    replyCount:  { type: Number, default: 0 },

    // view tracking — same email-array pattern as Post.views.
    // Acceptable here since views are not displayed as a count
    // to external users and won't grow as large as upvotes would.
    views: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => new Set(v).size === v.length,
        message: 'views must be unique',
      },
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Main feed query — pinned threads first, then chronological.
// Compound with isPinned ensures pinned docs sort before unpinned
// without a separate query.
discussionSchema.index({ tenantId: 1, communityId: 1, isPinned: -1, createdAt: -1 });

// Category filter tab
discussionSchema.index({ tenantId: 1, communityId: 1, category: 1, createdAt: -1 });

// "Open questions" filter — unsolved Q&A threads
discussionSchema.index({ tenantId: 1, communityId: 1, isSolved: 1, createdAt: -1 });

// Author's discussions
discussionSchema.index({ tenantId: 1, authorId: 1 });

// Tag-based filtering (trending tags sidebar)
discussionSchema.index({ tenantId: 1, communityId: 1, tags: 1 });

// Full-text search across title and body
discussionSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model('Discussion', discussionSchema);