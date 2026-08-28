const express = require('express'); 
const router = express.Router();
const {readLimiter} = require("../middleware/rateLimitter");

const authenticateToken = require('../middleware/authMiddleware');  


const {
  getContributions,
  getStreakData,
  getDailyEvents,
} = require('../controllers/performanceTracker.Controller');

// const { authencateToken, attachTenant } = require('../middleware/tenantMiddleware');

// router.use(authencateToken, attachTenant);

router.use(authenticateToken);

// heatmap data — public (any logged-in user can view any author's heatmap)
router.get('/contributions/:authorId', readLimiter, getContributions);

// streak — own profile gets numbers, others get joinedYear only
router.get('/streak', readLimiter, getStreakData);

// daily event drawer — any authenticated user can view
router.get('/events/:authorId', readLimiter, getDailyEvents);

module.exports = router;
