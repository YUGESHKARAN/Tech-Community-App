

const express = require("express");
const router = express.Router();

const {limiter, readLimiter} = require("../middleware/rateLimitter");
const authenticateToken = require('../middleware/authMiddleware');

const {trackRecentView, getRecentHistory} = require("../controllers/recentHistory.Controller")

router.get("/visited/:email", readLimiter, authenticateToken, getRecentHistory);
router.put("/track", limiter, authenticateToken,trackRecentView);


module.exports = router