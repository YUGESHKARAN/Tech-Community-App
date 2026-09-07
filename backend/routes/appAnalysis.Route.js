
const express = require('express'); 
const router = express.Router();
const {limiter, readLimiter} = require("../middleware/rateLimitter");

const authenticateToken = require('../middleware/authMiddleware');  
const requireAdmin = require("../middleware/requireAdmin")

const { getCategoryAnalytics, getAppSummary, getMonthlyPostCounts, getTopContributors, getContributors, getStudents, getCoordinators, getAdmins } = require("../controllers/appAnalysis.Controller");

router.get("/view/techDomain", readLimiter, authenticateToken, requireAdmin, getCategoryAnalytics);
router.get("/view/summary/:email", readLimiter, authenticateToken, requireAdmin, getAppSummary);
// year is optional; controller can also read ?year=2026
router.get("/view/monthly-posts/:email", readLimiter, authenticateToken, requireAdmin, getMonthlyPostCounts);
router.get("/view/top-contributors/:email", readLimiter, authenticateToken, getTopContributors);
router.get("/view/contributors/:email", readLimiter, authenticateToken, requireAdmin, getContributors);
router.get("/view/users/:email", readLimiter, authenticateToken, requireAdmin, getStudents);
router.get("/view/coordinators/:email", readLimiter, authenticateToken, requireAdmin, getCoordinators);
router.get("/view/admins/:email", readLimiter, authenticateToken, requireAdmin, getAdmins);

module.exports = router;