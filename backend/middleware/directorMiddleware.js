/**
 * authMiddleware.js — updated version
 *
 * Adds two impersonation-aware checks on top of standard JWT verification:
 *   1. If the token is an impersonation token (decoded.impersonation === true),
 *      check the Redis blacklist before allowing the request through.
 *   2. Attaches req.isImpersonation = true so downstream controllers can
 *      log or restrict sensitive write operations accordingly.
 */

const jwt         = require('jsonwebtoken');
const redisClient = require('../middleware/redis');

const authenticateTokenDirector = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error:   'TOKEN_EXPIRED',
      message: 'Token expired',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_ACCESS_KEY);
    req.user  = decoded;
    req.token = token;

    // ── impersonation blacklist check ────────────────────────────────────────
    // Only runs for tokens that carry the impersonation marker.
    // Regular user tokens never have decoded.impersonation set so this
    // block is a no-op for 99.9% of requests — no Redis hit on normal traffic.
    if (decoded.impersonation === true) {
      if (!decoded.jti) {
        return res.status(401).json({ message: 'Invalid impersonation token' });
      }
      const blacklisted = await redisClient.get(
        `impersonate:blacklist:${decoded.jti}`
      );
      if (blacklisted) {
        return res.status(401).json({
          message: 'Impersonation token has been revoked',
        });
      }
      // flag the request so write controllers can add extra caution / logging
      req.isImpersonation   = true;
      req.impersonatedBy    = decoded.impersonatedBy;
      req.impersonationJti  = decoded.jti;
    }
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error:   'TOKEN_EXPIRED',
        message: 'Token expired',
      });
    }
    return res.status(401).json({
      error:   'INVALID_TOKEN',
      message: 'Invalid token',
    });
  }
};

module.exports = authenticateTokenDirector;