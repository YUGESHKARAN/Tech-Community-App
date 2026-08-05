
const express = require("express");
const router = express.Router();


const {limiter, readLimiter} = require("../middleware/rateLimitter");
const authenticateToken = require('../middleware/authMiddleware');
const {
  getCommunityLandingPage,
  getCommunityById,
  getCommunityMembersById,
} = require("../controllers/techCommunity.Controller");


router.get("/", readLimiter, authenticateToken, getCommunityLandingPage);
router.get("/:communityId", readLimiter, authenticateToken, getCommunityById);
router.get("/:communityId/members", readLimiter, authenticateToken, getCommunityMembersById);


module.exports = router