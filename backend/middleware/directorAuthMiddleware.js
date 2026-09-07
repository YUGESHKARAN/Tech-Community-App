/**
 * directorAuth.js
 *
 * Two exports:
 *
 *   requireDirector
 *     — verifies the JWT carries isDirector: true
 *     — checks the director account is still active in DB
 *     — attaches req.director (full DB doc) and req.directorPermissions
 *     — rejects if the token is revoked (impersonation blacklist applies here too)
 *
 *   requirePermission(...perms)
 *     — factory that returns an Express middleware
 *     — checks req.directorPermissions includes ALL listed permissions
 *     — call after requireDirector in the middleware chain
 *
 * Usage in routes:
 *   const { requireDirector, requirePermission } = require('../middleware/directorAuth');
 *   const { PERMISSIONS } = require('../models/DirectorUser');
 *
 *   router.delete(
 *     '/tenants/:tenantId',
 *     requireDirector,
 *     requirePermission(PERMISSIONS.DELETE_TENANT),
 *     deleteTenant
 *   );
 */

const jwt           = require("jsonwebtoken");
const { DirectorUser } = require("../models/director/directorUserSchema");
const redisClient   = require("../middleware/redis");

// ── requireDirector ───────────────────────────────────────────────────────────
const requireDirector = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token      = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "TOKEN_EXPIRED", message: "Token required" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_TOKEN_ACCESS_KEY);
  } catch (err) {
    return res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid token" });
  }

  // must be a director token
  if (!decoded.isDirector) {
    return res.status(403).json({ message: "Director access required" });
  }

  // impersonation blacklist check (impersonation tokens must not access director routes)
  if (decoded.impersonation && decoded.jti) {
    try {
      const blacklisted = await redisClient.get(`impersonate:blacklist:${decoded.jti}`);
      if (blacklisted) {
        return res.status(401).json({ error: "TOKEN_REVOKED", message: "Token has been revoked" });
      }
    } catch (redisErr) {
      console.error("Redis blacklist check failed:", redisErr.message);
      // non-fatal — token is still cryptographically valid
    }
  }

  // fetch director from DB — ensures account is still active
  // and picks up any permission changes made since token was issued
  let director;
  try {
    director = await DirectorUser.findById(decoded.directorId).lean();
  } catch (err) {
    return res.status(500).json({ message: "Server error during auth" });
  }

  if (!director) {
    return res.status(401).json({ message: "Director account not found" });
  }

  if (!director.active) {
    return res.status(403).json({ message: "Director account is deactivated" });
  }

  // attach to req for downstream middleware and controllers
  req.user                = decoded;
  req.director            = director;
  req.directorPermissions = director.permissions; // always current from DB
  req.token               = token;

  next();
};

// ── requirePermission ─────────────────────────────────────────────────────────
/**
 * requirePermission(...perms)
 *
 * Call after requireDirector.
 * Accepts one or more permission strings — all must be present.
 *
 * Example:
 *   requirePermission(PERMISSIONS.DELETE_TENANT)
 *   requirePermission(PERMISSIONS.CREATE_DIRECTOR, PERMISSIONS.VIEW_DIRECTORS)
 */
const requirePermission = (...perms) => (req, res, next) => {
  if (!req.directorPermissions) {
    return res.status(403).json({ message: "No permissions found — run requireDirector first" });
  }

  const missing = perms.filter((p) => !req.directorPermissions.includes(p));

  if (missing.length > 0) {
    return res.status(403).json({
      message:  "Insufficient permissions",
      required: perms,
      missing,
    });
  }

  next();
};

module.exports = { requireDirector, requirePermission };