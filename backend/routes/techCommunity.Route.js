
const express = require("express");
const router = express.Router();


const {limiter, readLimiter} = require("../middleware/rateLimitter");
const authenticateToken = require('../middleware/authMiddleware');
const {
  getCommunityLandingPage,
  getCommunityById,
  getCommunityMembersById,
  editTechCommunity,
} = require("../controllers/techCommunity.Controller");


router.get("/", readLimiter, authenticateToken, getCommunityLandingPage);
router.put("/:communityId", limiter, authenticateToken, editTechCommunity);
router.get("/:communityId", readLimiter, authenticateToken, getCommunityById);
router.get("/:communityId/members", readLimiter, authenticateToken, getCommunityMembersById);


module.exports = router