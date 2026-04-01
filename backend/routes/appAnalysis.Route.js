
const express = require('express'); 
const router = express.Router();
const {limiter, readLimiter} = require("../middleware/rateLimitter");

const authenticateToken = require('../middleware/authMiddleware');  

const { getCategoryAnalytics, getAppSummary } = require("../controllers/appAnalysis.Controller");

router.get("/view/techDomain", readLimiter, authenticateToken, getCategoryAnalytics);
router.get("/view/summary/:email", readLimiter, authenticateToken, getAppSummary);

module.exports = router;