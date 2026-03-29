
const express = require('express'); 
const router = express.Router();
const {limiter, readLimiter} = require("../middleware/rateLimitter");

const authenticateToken = require('../middleware/authMiddleware');  

const { getCategoryAnalytics } = require("../controllers/appAnalysis.Controller");

router.get("/view/techDomain", readLimiter, authenticateToken, getCategoryAnalytics);

module.exports = router;