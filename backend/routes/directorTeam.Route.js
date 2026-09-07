const express = require("express");
const router  = express.Router();

const { requireDirector, requirePermission } = require("../middleware/directorAuthMiddleware");
const { PERMISSIONS } = require("../models/director/directorUserSchema");
const {
  getAllDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
  updateDirectorPermissions,
} = require("../controllers/directorUser.Controller");

const { limiter, readLimiter } = require("../middleware/rateLimitter");

// all routes require a valid director token
router.use(requireDirector);

// ── list / get ─────────────────────────────────────────────────────────────────
router.get(
  "/",
  readLimiter,
  requirePermission(PERMISSIONS.VIEW_DIRECTORS),
  getAllDirectors
);

router.get(
  "/:directorId",
  readLimiter,
  requirePermission(PERMISSIONS.VIEW_DIRECTORS),
  getDirectorById
);

// ── create ─────────────────────────────────────────────────────────────────────
router.post(
  "/",
  limiter,
  requirePermission(PERMISSIONS.CREATE_DIRECTOR),
  createDirector
);

// ── update ─────────────────────────────────────────────────────────────────────
router.put(
  "/:directorId",
  limiter,
  requirePermission(PERMISSIONS.UPDATE_DIRECTOR),
  updateDirector
);

// ── fine-grained permission patch ──────────────────────────────────────────────
router.patch(
  "/:directorId/permissions",
  limiter,
  requirePermission(PERMISSIONS.UPDATE_DIRECTOR),
  updateDirectorPermissions
);

// ── delete ─────────────────────────────────────────────────────────────────────
router.delete(
  "/:directorId",
  limiter,
  requirePermission(PERMISSIONS.DELETE_DIRECTOR),
  deleteDirector
);

module.exports = router;

// Mount in app.js:
//   const directorTeamRoutes = require('./routes/directorTeam.routes');
//   app.use('/director/team', directorTeamRoutes);