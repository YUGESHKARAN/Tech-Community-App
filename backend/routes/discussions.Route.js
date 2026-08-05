const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  // settings
  getSettings,
  updateWhoCanPost,
  // tags
  createTag,
  getTags,
  updateTag,
  deleteTag,
  // discussion crud
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  // discussion actions
  pinDiscussion,
  markSolved,
  upvoteDiscussion,
  removeUpvoteDiscussion,
  // replies
  createReply,
  getReplies,
  updateReply,
  deleteReply,
  upvoteReply,
  removeUpvoteReply,
  markAnswer,
  // sidebar
  getTrendingTags,
  getCommunityLeaderboard,
} = require("../controllers/discussions.Controller");

// const { authencateToken, attachTenant } = require('../middleware/tenantMiddleware');
const { limiter, readLimiter } = require("../middleware/rateLimitter");

const authenticateToken = require("../middleware/authMiddleware");
// all routes require auth + tenant resolution
router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────────────────────
//  SETTINGS
//  Base: /api/communities/:communityId/settings
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/settings", getSettings);
router.patch("/:communityId/settings/whoCanPost", updateWhoCanPost);

// ─────────────────────────────────────────────────────────────────────────────
//  TAGS
//  Base: /api/communities/:communityId/tags
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/tags", getTags);
router.post("/:communityId/tags", createTag);
router.patch("/:communityId/tags/:tagId", updateTag);
router.delete("/:communityId/tags/:tagId", deleteTag);

// ─────────────────────────────────────────────────────────────────────────────
//  DISCUSSIONS
//  Base: /api/communities/:communityId/discussions
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/discussions", getDiscussions);
router.post("/:communityId/discussions", createDiscussion);
router.get("/:communityId/discussions/:discussionId", getDiscussionById);
router.patch("/:communityId/discussions/:discussionId", updateDiscussion);
router.delete("/:communityId/discussions/:discussionId", deleteDiscussion);

// ─────────────────────────────────────────────────────────────────────────────
//  DISCUSSION ACTIONS
//  Base: /api/communities/:communityId/discussions/:discussionId/...
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/:communityId/discussions/:discussionId/pin", pinDiscussion);
router.patch("/:communityId/discussions/:discussionId/solve", markSolved);
router.post("/:communityId/discussions/:discussionId/upvote", upvoteDiscussion);
router.delete(
  "/:communityId/discussions/:discussionId/upvote",
  removeUpvoteDiscussion,
);

// ─────────────────────────────────────────────────────────────────────────────
//  REPLIES
//  Base: /api/communities/:communityId/discussions/:discussionId/replies
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/discussions/:discussionId/replies", getReplies);
router.post("/:communityId/discussions/:discussionId/replies", createReply);
router.patch(
  "/:communityId/discussions/:discussionId/replies/:replyId",
  updateReply,
);
router.delete(
  "/:communityId/discussions/:discussionId/replies/:replyId",
  deleteReply,
);

// ─────────────────────────────────────────────────────────────────────────────
//  REPLY ACTIONS
//  Base: /api/communities/:communityId/discussions/:discussionId/replies/:replyId/...
// ─────────────────────────────────────────────────────────────────────────────

router.post(
  "/:communityId/discussions/:discussionId/replies/:replyId/upvote",
  upvoteReply,
);
router.delete(
  "/:communityId/discussions/:discussionId/replies/:replyId/upvote",
  removeUpvoteReply,
);
router.patch(
  "/:communityId/discussions/:discussionId/replies/:replyId/answer",
  markAnswer,
);

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR
//  Base: /api/communities/:communityId/...
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/trending-tags", getTrendingTags);
router.get("/:communityId/leaderboard", getCommunityLeaderboard);

module.exports = router;
