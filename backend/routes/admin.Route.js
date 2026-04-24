const express = require("express");
const router = express.Router();

const {
  deleteAuthor,
  deleteAuthorByAdmin,
  getDeletionLogs,
  getDeletionLogById,
  getMyDeletionLog,
  rollbackDeletion,
  expireDeletionLog,
  deleteDeletionLog
} = require("../controllers/deletionLog.controller");

const {limiter, readLimiter} = require("../middleware/rateLimitter");
const authenticateToken = require('../middleware/authMiddleware');
const { default: rateLimit } = require("express-rate-limit");

// admin routes
router.get("/deletionLogs/:adminEmail", readLimiter, authenticateToken, getDeletionLogs);
router.get("/deletionLogs/:adminEmail/:logId", readLimiter, authenticateToken,  getDeletionLogById);
router.post("/deletionLogs/:adminEmail/:logId/expire", limiter, authenticateToken, expireDeletionLog);

// restore route — admin or self
router.post("/rollback/:logId", limiter, authenticateToken, rollbackDeletion);

// user self-service (not in use)
router.get("/myDeletionLog/:email",  readLimiter, authenticateToken, getMyDeletionLog);

// replace existing delete routes
router.delete("/delete/:email", limiter, authenticateToken, deleteAuthor);
router.delete("/adminDelete/:authorEmail", limiter, authenticateToken, deleteAuthorByAdmin);
router.delete('/deletionLogs/:adminEmail/:logId', limiter, authenticateToken, deleteDeletionLog);

module.exports = router;
