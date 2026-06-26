const express = require("express");
const router = express.Router();

const { limiter, readLimiter } = require("../middleware/rateLimitter");
const authenticateToken = require("../middleware/authMiddleware");
const {
  getAllTenants,
  getTenantById,
  addTenant,
  updateTenant,
  deleteTenant,
} = require("../controllers/director.Controller");

router.get("/tenants", readLimiter, authenticateToken, getAllTenants);
router.get("/tenants/:tenantId", readLimiter, authenticateToken, getTenantById);
router.post("/tenants", limiter, authenticateToken, addTenant);
router.put("/tenants/:tenantId", limiter, authenticateToken, updateTenant);
router.delete("/tenants/:tenantId", limiter, authenticateToken, deleteTenant);

module.exports = router;
