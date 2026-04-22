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
} = require("../controllers/deletionLog.controller");

const {limiter, readLimiter} = require("../middleware/rateLimitter");
const authenticateToken = require('../middleware/authMiddleware');

// admin routes
router.get("/deletionLogs/:adminEmail", getDeletionLogs);
router.get("/deletionLogs/:adminEmail/:logId", getDeletionLogById);
router.post("/deletionLogs/:adminEmail/:logId/expire", expireDeletionLog);

// restore route — admin or self
router.post("/rollback/:logId", rollbackDeletion);

// user self-service
router.get("/myDeletionLog/:email", getMyDeletionLog);

// replace existing delete routes
router.delete("/delete/:email", deleteAuthor);
router.delete("/adminDelete/:authorEmail", deleteAuthorByAdmin);

module.exports = router;
