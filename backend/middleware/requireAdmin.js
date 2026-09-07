// middleware/requireAdmin.js
// Drop this middleware on any route that needs an admin-level check.
// Works for both real admins (DB lookup) and impersonating directors (token check).

const { Author } = require("../models/blogAuthorSchema");

const requireAdmin = async (req, res, next) => {
  const { tenantId } = req.user;

  // ── impersonation fast path ───────────────────────────────────────────────
  // authMiddleware already verified the token and checked the Redis blacklist.
  // The token payload is the source of truth — no DB lookup needed.
  if (req.isImpersonation) {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    return next(); // ← skip DB lookup entirely
  }

  // ── real user path — DB lookup ────────────────────────────────────────────
  try {
    const admin = await Author.findOne(
      { email: { $eq: req.user.email }, tenantId },
      "role"
    ).lean();

    if (!admin) {
      return res.status(404).json({ message: "Author not found" });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  } catch (err) {
    console.error("requireAdmin error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = requireAdmin;