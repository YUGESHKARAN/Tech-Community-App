
const express = require('express'); 
const router = express.Router();
const {limiter, readLimiter} = require("../middleware/rateLimitter");

const authenticateToken = require('../middleware/authMiddleware');  

const { getCategoryAnalytics, getAppSummary, getMonthlyPostCounts, getTopContributors, getContributors, getStudents } = require("../controllers/appAnalysis.Controller");

router.get("/view/techDomain", readLimiter, authenticateToken, getCategoryAnalytics);
router.get("/view/summary/:email", readLimiter, authenticateToken, getAppSummary);
// year is optional; controller can also read ?year=2026
router.get("/view/monthly-posts/:email", readLimiter, authenticateToken, getMonthlyPostCounts);
router.get("/view/top-contributors/:email", readLimiter, authenticateToken, getTopContributors);
router.get("/view/contributors/:email", readLimiter, authenticateToken, getContributors);
router.get("/view/users/:email", readLimiter, authenticateToken, getStudents);

module.exports = router;