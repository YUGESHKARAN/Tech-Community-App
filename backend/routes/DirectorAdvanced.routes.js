const express = require('express');
const router  = express.Router();

const { limiter, readLimiter } = require('../middleware/rateLimitter');
const authenticateToken        = require('../middleware/authMiddleware');

const {
  getTenantHealth,
  getTenantUsage,
  updateUsageLimit,
  bulkAction,
  getAuditLog,
  impersonateTenant,
  revokeImpersonation,
} = require('../controllers/directorAdvanced.Controller');

// ── health ────────────────────────────────────────────────────────────────────
// Lazy-loaded per card — readLimiter (no mutation)
router.get('/tenants/:tenantId/health', readLimiter, authenticateToken, getTenantHealth);

// ── usage ─────────────────────────────────────────────────────────────────────
router.get  ('/tenants/:tenantId/usage', readLimiter, authenticateToken, getTenantUsage);
router.patch('/tenants/:tenantId/usage', limiter,     authenticateToken, updateUsageLimit);

// ── bulk actions ──────────────────────────────────────────────────────────────
// Stricter rate limit — write operation affecting many tenants
router.post('/tenants/bulk-action', limiter, authenticateToken, bulkAction);

// ── audit log ─────────────────────────────────────────────────────────────────
router.get('/audit-log', readLimiter, authenticateToken, getAuditLog);

// ── impersonation ─────────────────────────────────────────────────────────────
// limiter — token issuance is a sensitive write operation
router.post('/tenants/:tenantId/impersonate', limiter, authenticateToken, impersonateTenant);
router.post('/impersonation/revoke',          limiter, authenticateToken, revokeImpersonation);

module.exports = router;

// Mount in app.js alongside your existing director router:
//   const directorAdvancedRoutes = require('./routes/directorAdvanced.routes');
//   app.use('/director', directorAdvancedRoutes);