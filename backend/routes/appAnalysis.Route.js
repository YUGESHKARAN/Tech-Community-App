
const express = require('express'); 
const router = express.Router();
const {limiter, readLimiter} = require("../middleware/rateLimitter");

const authenticateToken = require('../middleware/authMiddleware');  

const { getCategoryAnalytics, getAppSummary, getMonthlyPostCounts } = require("../controllers/appAnalysis.Controller");

router.get("/view/techDomain", readLimiter, authenticateToken, getCategoryAnalytics);
router.get("/view/summary/:email", readLimiter, authenticateToken, getAppSummary);
// year is optional; controller can also read ?year=2026
router.get("/view/monthly-posts/:email/:year?", readLimiter, authenticateToken, getMonthlyPostCounts);

module.exports = router;