const express = require('express') ;
const router = express.Router() ;
const {loginLimiter} = require("../middleware/rateLimitter")

const {verifyUser} = require('../controllers/login.controller')

// router.post('/',loginLimiter, verifyUser) ;
router.post('/', verifyUser) ;

module.exports = router ;