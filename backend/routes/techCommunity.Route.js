
const express = require("express");
const router = express.Router();


const {limiter, readLimiter} = require("../middleware/rateLimitter");
const authenticateToken = require('../middleware/authMiddleware');
const {getCommunityLandingPage} = require("../controllers/techCommunity.Controller")


router.get("/", readLimiter, authenticateToken, getCommunityLandingPage);


module.exports = router