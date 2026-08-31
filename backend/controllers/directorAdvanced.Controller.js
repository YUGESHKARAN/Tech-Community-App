/**
 * directorAdvanced.Controller.js
 *
 * Five production-grade director features:
 *   1. GET  /director/tenants/:tenantId/health          — lazy health stats per tenant
 *   2. GET  /director/tenants/:tenantId/usage           — usage vs limit + alert flag
 *   3. POST /director/tenants/bulk-action               — activate / deactivate many at once
 *   4. GET  /director/audit-log                         — paginated audit log (director only)
 *   5. POST /director/tenants/:tenantId/impersonate     — short-lived scoped token
 *   6. POST /director/impersonation/revoke              — invalidate an impersonation token
 *
 * Audit log is written automatically by:
 *   - updateTenant, addTenant, deleteTenant (existing controller — wire via auditLog helper)
 *   - bulkAction
 *   - impersonate
 *
 * Redis key pattern for impersonation blacklist:
 *   impersonate:blacklist:<jti>  → "1"   TTL = token expiry
 */

const mongoose  = require('mongoose');
const jwt       = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { Tenant }     = require('../models/tenantSchema');
const { Author, Post }     = require('../models/blogAuthorSchema');
const Community      = require('../models/communitySchema');
const Discussion = require("../models/communityDiscussions/discussionsSchema");
const TutorPlayList  = require('../models/tutorPlaylistSchema'); // adjust path
const redisClient    = require('../middleware/redis'); // your existing Redis client

const {AuditLog} = require("../models/director/auditLogSchema");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const ensureDirector = (req, res) => {
  if (!req.user)                       { res.status(401).json({ message: 'Unauthorized' });    return false; }
  if (req.user.role !== 'director')    { res.status(403).json({ message: 'Access denied' });   return false; }
  return true;
};

/**
 * writeAuditLog — fire-and-forget helper.
 * Call from any controller that mutates tenant data.
 * Never throws — a logging failure must not break the primary response.
 */
const writeAuditLog = async ({
  action, targetTenantId = null, targetTenantIds = [],
  performedBy, before = null, after = null, meta = null,
}) => {
  try {
    await AuditLog.create({
      action, targetTenantId, targetTenantIds,
      performedBy, changes: { before, after }, meta,
    });
  } catch (err) {
    console.error('writeAuditLog error:', err.message);
  }
};

// Usage alert thresholds
const ALERT_WARNING  = 0.80; // 80 % → warning
const ALERT_CRITICAL = 0.95; // 95 % → critical

const usageAlert = (current, max) => {
  if (!max || max <= 0) return 'none';
  const pct = current / max;
  if (pct >= ALERT_CRITICAL) return 'critical'; // ≥ 95 %
  if (pct >= ALERT_WARNING)  return 'warning';  // ≥ 80 %
  return 'none';
};

// ─────────────────────────────────────────────────────────────────────────────
//  1. TENANT HEALTH
//  GET /director/tenants/:tenantId/health
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns live stats for a single tenant.
 * Called lazily per card — the director list page renders all cards first,
 * then each card fires this request independently so the page loads fast.
 *
 * "Active users" = users who have created at least one Post, Discussion,
 * or DiscussionReply in the last 30 days (deduplicated).
 */
const getTenantHealth = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const { tenantId } = req.params;

  try {
    const tenant = await Tenant.findOne({ tenantId }, '_id tenantId name').lean();
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalPosts,
      totalCommunities,
      totalDiscussions,
      totalPlaylists,
      recentPostAuthors,
      recentDiscussionAuthors,
      recentReplyAuthors,
    ] = await Promise.all([
      Author.countDocuments({ tenantId }),
      Post.countDocuments({ tenantId }),
      Community.countDocuments({ tenantId }),
      Discussion.countDocuments({ tenantId }),
      TutorPlayList.countDocuments({ tenantId }),

      // active in last 30 days — distinct author sets per content type
      Post.distinct('authorId', {
        tenantId,
        timestamp: { $gte: thirtyDaysAgo },
      }),
      Discussion.distinct('authorId', {
        tenantId,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      // DiscussionReply — adjust import if path differs
      mongoose.model('DiscussionReply').distinct('authorId', {
        tenantId,
        createdAt: { $gte: thirtyDaysAgo },
      }),
    ]);

    // deduplicate across all three content types
    const activeUserSet = new Set([
      ...recentPostAuthors.map(String),
      ...recentDiscussionAuthors.map(String),
      ...recentReplyAuthors.map(String),
    ]);

    return res.status(200).json({
      tenantId,
      health: {
        totalUsers,
        totalPosts,
        totalCommunities,
        totalDiscussions,
        totalPlaylists,
        activeUsersLast30Days: activeUserSet.size,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('getTenantHealth error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  2. USAGE LIMITS
//  GET /director/tenants/:tenantId/usage
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns current user count vs maxUsersAllowed, with an alert level.
 * alert: 'none' | 'warning' (≥80%) | 'critical' (≥95%) | 'exceeded' (>100%)
 */
const getTenantUsage = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const { tenantId } = req.params;

  try {
    const tenant = await Tenant.findOne(
      { tenantId },
      'tenantId name config active'
    ).lean();

    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const max     = tenant.config?.maxUsersAllowed || 10000;
    const current = await Author.countDocuments({ tenantId });
    const pct     = Math.round((current / max) * 1000) / 10; // one decimal

    let alert = usageAlert(current, max);
    if (current > max) alert = 'exceeded';

    return res.status(200).json({
      tenantId,
      usage: {
        current,
        max,
        percentage: pct,
        alert,
        // human readable message for the UI
        message:
          alert === 'exceeded'  ? `Tenant has exceeded its user limit by ${current - max} users.` :
          alert === 'critical'  ? `Tenant is at ${pct}% capacity — approaching limit.` :
          alert === 'warning'   ? `Tenant is at ${pct}% capacity.` :
          `${current} of ${max} users (${pct}%)`,
      },
    });
  } catch (err) {
    console.error('getTenantUsage error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /director/tenants/:tenantId/usage
 * Update maxUsersAllowed for a tenant.
 * body: { maxUsersAllowed: number }
 */
const updateUsageLimit = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const { tenantId } = req.params;
  const { maxUsersAllowed } = req.body;

  if (!maxUsersAllowed || maxUsersAllowed < 1) {
    return res.status(400).json({ message: 'maxUsersAllowed must be at least 1' });
  }

  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const before = { maxUsersAllowed: tenant.config.maxUsersAllowed };
    tenant.config.maxUsersAllowed = maxUsersAllowed;
    await tenant.save();
    const after = { maxUsersAllowed };

    writeAuditLog({
      action:          'tenant.update_usage_limit',
      targetTenantId:  tenantId,
      performedBy:     { authorId: req.user.authorId, email: req.user.email, role: req.user.role },
      before,
      after,
    });

    return res.status(200).json({
      message: `Usage limit updated to ${maxUsersAllowed}`,
      config:  tenant.config,
    });
  } catch (err) {
    console.error('updateUsageLimit error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  3. BULK ACTIONS
//  POST /director/tenants/bulk-action
// ─────────────────────────────────────────────────────────────────────────────
/**
 * body: { action: 'activate' | 'deactivate', tenantIds: string[] }
 *
 * Returns a result summary: how many succeeded, which failed and why.
 * Uses updateMany for atomicity — all-or-nothing per tenant is not guaranteed
 * across tenants, but each individual tenant update is atomic.
 */
const bulkAction = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const { action, tenantIds } = req.body;

  if (!['activate', 'deactivate'].includes(action)) {
    return res.status(400).json({ message: "action must be 'activate' or 'deactivate'" });
  }
  if (!Array.isArray(tenantIds) || tenantIds.length === 0) {
    return res.status(400).json({ message: 'tenantIds must be a non-empty array' });
  }
  if (tenantIds.length > 100) {
    return res.status(400).json({ message: 'Maximum 100 tenants per bulk action' });
  }

  const targetActive = action === 'activate';

  try {
    // fetch current state for the audit diff
    const before = await Tenant.find(
      { tenantId: { $in: tenantIds } },
      'tenantId name active'
    ).lean();

    const result = await Tenant.updateMany(
      { tenantId: { $in: tenantIds } },
      { $set: { active: targetActive } }
    );

    const after = await Tenant.find(
      { tenantId: { $in: tenantIds } },
      'tenantId name active'
    ).lean();

    // identify which IDs weren't found in the DB
    const foundIds  = new Set(before.map((t) => t.tenantId));
    const notFound  = tenantIds.filter((id) => !foundIds.has(id));

    writeAuditLog({
      action:         `tenant.bulk_${action}`,
      targetTenantIds: tenantIds,
      performedBy:    { authorId: req.user.authorId, email: req.user.email, role: req.user.role },
      before:         before,
      after:          after,
      meta:           { notFound },
    });

    return res.status(200).json({
      message:  `Bulk ${action} completed`,
      modified: result.modifiedCount,
      matched:  result.matchedCount,
      notFound,
    });
  } catch (err) {
    console.error('bulkAction error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  4. AUDIT LOG
//  GET /director/audit-log
// ─────────────────────────────────────────────────────────────────────────────
/**
 * query params:
 *   tenantId  — filter by target tenant
 *   action    — filter by action type
 *   page      — default 1
 *   limit     — default 20, max 100
 *   startDate — ISO date string
 *   endDate   — ISO date string
 */
const getAuditLog = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const {
    tenantId,
    action,
    page     = 1,
    limit    = 20,
    startDate,
    endDate,
  } = req.query;

  const limitNum = Math.min(Number(limit), 100);
  const skip     = (Number(page) - 1) * limitNum;

  try {
    const filter = {};
    if (tenantId)  filter.targetTenantId = tenantId;
    if (action)    filter.action         = action;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      logs,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limitNum),
      hasMore:    skip + logs.length < total,
    });
  } catch (err) {
    console.error('getAuditLog error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  5. TENANT IMPERSONATION
//  POST /director/tenants/:tenantId/impersonate
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Issues a short-lived JWT (15 min) scoped to the target tenant.
 * The token carries:
 *   - role: 'admin' (so the director sees the tenant as a platform admin)
 *   - tenantId: target tenant's tenantId
 *   - impersonatedBy: director's email
 *   - impersonation: true  ← checked by any sensitive endpoint to add extra caution
 *   - jti: unique token ID  ← used for Redis blacklist revocation
 *
 * The impersonation token is stored in Redis for its lifetime so it can be
 * revoked before expiry. Key: impersonate:active:<jti>
 *
 * All write operations under impersonation should check req.user.impersonation
 * and log accordingly — this is a convention, not enforced here.
 */
const IMPERSONATION_TTL_SECONDS = 15 * 60; // 15 minutes

const impersonateTenant = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const { tenantId } = req.params;

  try {
    const tenant = await Tenant.findOne(
      { tenantId },
      'tenantId name active'
    ).lean();

    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    if (!tenant.active) {
      return res.status(403).json({
        message: 'Cannot impersonate an inactive tenant',
      });
    }

    const jti       = uuidv4(); // unique token ID for blacklisting
    const issuedAt  = new Date();
    const expiresAt = new Date(issuedAt.getTime() + IMPERSONATION_TTL_SECONDS * 1000);

    const payload = {
      // scoped identity
      tenantId,
      role:          'admin',
      email:         req.user.email, // director's own email
      authorId:      req.user.authorId,

      // impersonation markers
      impersonation:  true,
      impersonatedBy: req.user.email,
      targetTenant:   tenantId,
      jti,            // JWT ID — must be unique per token
    };

    const token = jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, {
      expiresIn: `${IMPERSONATION_TTL_SECONDS}s`,
    });

    // store active token in Redis so it can be revoked
    // key: impersonate:active:<jti>  value: director email  TTL: 15 min
    await redisClient.set(
      `impersonate:active:${jti}`,
      req.user.email,
      { EX: IMPERSONATION_TTL_SECONDS }
    );

    // audit log — always
    writeAuditLog({
      action:         'tenant.impersonate',
      targetTenantId: tenantId,
      performedBy:    { authorId: req.user.authorId, email: req.user.email, role: req.user.role },
      before:         null,
      after:          null,
      meta: {
        jti,
        issuedAt:  issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        tenantName: tenant.name,
      },
    });

    return res.status(200).json({
      message:    `Impersonation token issued for ${tenant.name}`,
      token,
      expiresAt:  expiresAt.toISOString(),
      tenantId,
      tenantName: tenant.name,
    });
  } catch (err) {
    console.error('impersonateTenant error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  6. REVOKE IMPERSONATION TOKEN
//  POST /director/impersonation/revoke
// ─────────────────────────────────────────────────────────────────────────────
/**
 * body: { jti: string }
 *
 * Adds the jti to a Redis blacklist and removes it from the active set.
 * The middleware that validates tokens must check this blacklist.
 *
 * Middleware check to add to authMiddleware.js:
 *   if (decoded.impersonation) {
 *     const blacklisted = await redisClient.get(`impersonate:blacklist:${decoded.jti}`);
 *     if (blacklisted) return res.status(401).json({ message: 'Token has been revoked' });
 *   }
 */
const revokeImpersonation = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const { jti } = req.body;

  if (!jti) {
    return res.status(400).json({ message: 'jti is required' });
  }

  try {
    // check the token is actually active (prevent revoking arbitrary JTIs)
    const owner = await redisClient.get(`impersonate:active:${jti}`);
    if (!owner) {
      return res.status(404).json({
        message: 'Token not found or already expired/revoked',
      });
    }

    // only the director who issued the token can revoke it
    if (owner !== req.user.email) {
      return res.status(403).json({
        message: 'You did not issue this token',
      });
    }

    // get remaining TTL so the blacklist entry lives exactly as long as the token would
    const ttl = await redisClient.ttl(`impersonate:active:${jti}`);

    await Promise.all([
      // remove from active set
      redisClient.del(`impersonate:active:${jti}`),
      // add to blacklist for the remaining token lifetime
      ttl > 0
        ? redisClient.set(`impersonate:blacklist:${jti}`, '1', { EX: ttl })
        : Promise.resolve(),
    ]);

    writeAuditLog({
      action:      'tenant.impersonation_revoked',
      performedBy: { authorId: req.user.authorId, email: req.user.email, role: req.user.role },
      meta:        { jti, revokedAt: new Date().toISOString() },
    });

    return res.status(200).json({ message: 'Impersonation token revoked' });
  } catch (err) {
    console.error('revokeImpersonation error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // health + usage
  getTenantHealth,
  getTenantUsage,
  updateUsageLimit,
  // bulk
  bulkAction,
  // audit
  getAuditLog,
  AuditLog,       // export model so existing controllers can import writeAuditLog
  writeAuditLog,  // export helper so director.Controller.js can call it on CRUD
  // impersonation
  impersonateTenant,
  revokeImpersonation,
};