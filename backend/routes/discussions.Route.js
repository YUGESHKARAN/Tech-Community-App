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
  updateDiscussionUpvote,
  // upvoteDiscussion,
  // removeUpvoteDiscussion,
  // replies
  createReply,
  getReplies,
  updateReply,
  deleteReply,
  // upvoteReply,
  // removeUpvoteReply,
  markAnswer,
  // sidebar
  getTrendingTags,
  getCommunityLeaderboard,
  updateUpvoteReply,
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

router.get("/:communityId/settings", readLimiter, getSettings);
router.patch("/:communityId/settings/whoCanPost", limiter, updateWhoCanPost);

// ─────────────────────────────────────────────────────────────────────────────
//  TAGS
//  Base: /api/communities/:communityId/tags
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/tags", readLimiter, getTags);  // used
router.post("/:communityId/tags", limiter, createTag);  //used
router.patch("/:communityId/tags/:tagId", limiter, updateTag); 
router.delete("/:communityId/tags/:tagId", limiter, deleteTag);

// ─────────────────────────────────────────────────────────────────────────────
//  DISCUSSIONS
//  Base: /api/communities/:communityId/discussions
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/discussions", readLimiter, getDiscussions);  //used
router.post("/:communityId/discussions", limiter, createDiscussion);  //used
router.get("/:communityId/discussions/:discussionId",readLimiter,  getDiscussionById); //used
router.patch("/:communityId/discussions/:discussionId", limiter, updateDiscussion); //used
router.delete("/:communityId/discussions/:discussionId", limiter, deleteDiscussion); //used

// ─────────────────────────────────────────────────────────────────────────────
//  DISCUSSION ACTIONS
//  Base: /api/communities/:communityId/discussions/:discussionId/...
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/:communityId/discussions/:discussionId/pin", limiter, pinDiscussion); //used
router.patch("/:communityId/discussions/:discussionId/solve", limiter, markSolved);  //used
router.post("/:communityId/discussions/:discussionId/upvote", limiter, updateDiscussionUpvote); //used

// ─────────────────────────────────────────────────────────────────────────────
//  REPLIES
//  Base: /api/communities/:communityId/discussions/:discussionId/replies
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/discussions/:discussionId/replies", readLimiter, getReplies); //used
router.post("/:communityId/discussions/:discussionId/replies", limiter, createReply); //used
router.patch(
  "/:communityId/discussions/:discussionId/replies/:replyId", limiter,
  updateReply,
); //used
router.delete(
  "/:communityId/discussions/:discussionId/replies/:replyId", limiter,
  deleteReply,
); //used

// ─────────────────────────────────────────────────────────────────────────────
//  REPLY ACTIONS
//  Base: /api/communities/:communityId/discussions/:discussionId/replies/:replyId/...
// ─────────────────────────────────────────────────────────────────────────────

// router.post(
//   "/:communityId/discussions/:discussionId/replies/:replyId/upvote",
//   upvoteReply,
// );
router.post(
  "/:communityId/discussions/:discussionId/replies/:replyId/upvote", limiter,
  updateUpvoteReply,
); //used
// router.delete(
//   "/:communityId/discussions/:discussionId/replies/:replyId/upvote",
//   removeUpvoteReply,
// );
router.patch(
  "/:communityId/discussions/:discussionId/replies/:replyId/answer", limiter,
  markAnswer,
);  //used

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR
//  Base: /api/communities/:communityId/...
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:communityId/trending-tags", readLimiter, getTrendingTags); //used
router.get("/:communityId/leaderboard", readLimiter, getCommunityLeaderboard); //used

module.exports = router;
