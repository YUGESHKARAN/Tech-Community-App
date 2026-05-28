const express = require("express");
const router = express.Router();


const {limiter, readLimiter} = require("../middleware/rateLimitter");
const authenticateToken = require('../middleware/authMiddleware');

const {getSearchSuggestions} = require("../controllers/search.Controller");


router.get('/suggestions',authenticateToken, readLimiter,  getSearchSuggestions);


module.exports = router