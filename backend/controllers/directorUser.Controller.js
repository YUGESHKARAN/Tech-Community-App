/**
 * directorUser.Controller.js
 *
 * Handles:
 *   1. Director branch of verifyUser (called from existing /blog/login)
 *   2. Director CRUD (create, list, update, delete) — super_director only
 */

const jwt = require("jsonwebtoken");
const { DirectorUser, PERMISSIONS, ROLE_PERMISSIONS } = require("../models/director/directorUserSchema");

// ── helpers ───────────────────────────────────────────────────────────────────
const DIRECTOR_DOMAIN = "@bytesbase.tech";

/** Returns true if the email belongs to the director domain */
const isDirectorEmail = (email) =>
  typeof email === "string" && email.toLowerCase().endsWith(DIRECTOR_DOMAIN);

/**
 * buildDirectorToken
 * Issues a 1-day JWT for a director. Carries isDirector: true so
 * requireDirector middleware distinguishes it from Author tokens.
 */
const buildDirectorToken = (director) => {
  const payload = {
    directorId:  director._id,
    email:       director.email,
    name:        director.name,
    role:        director.role,
    permissions: director.permissions,
    isDirector:  true,
    // no tenantId — directors are platform-level
  };
  return jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, { expiresIn: "1d" });
};

// ─────────────────────────────────────────────────────────────────────────────
//  1. DIRECTOR LOGIN BRANCH
//  Called from verifyUser when email ends with @bytesbase.tech
// ─────────────────────────────────────────────────────────────────────────────

/**
 * handleDirectorLogin
 *
 * Drop this into your existing verifyUser controller as the first check:
 *
 *   if (isDirectorEmail(email)) {
 *     return handleDirectorLogin(req, res);
 *   }
 *   // ... existing tenant-user logic continues below
 *
 * This keeps the single endpoint while cleanly separating the two auth paths.
 */
const handleDirectorLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // select: false on password field — must explicitly include it
    const director = await DirectorUser.findOne({ email: email.toLowerCase() })
      .select("+password");

    if (!director) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    if (!director.active) {
      return res.status(403).json({
        message: "Your director account has been deactivated. Contact a super director.",
      });
    }

    const isMatch = await director.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // update last login metadata — fire-and-forget
    DirectorUser.updateOne(
      { _id: director._id },
      {
        $set: {
          lastLoginAt: new Date(),
          lastLoginIp: req.ip || req.headers["x-forwarded-for"] || null,
        },
      }
    ).catch((err) => console.error("lastLogin update error:", err.message));

    const token = buildDirectorToken(director);

    return res.status(200).json({
      message: "Login Successful",
      token,
      author: {
        // match the shape your frontend expects from a normal login
        // so the same LoginPage logic stores everything correctly
        authorname:  director.name,
        authorId:    director._id,
        email:       director.email,
        role:        director.role,        // "super_director" | "director" | "readonly_director"
        profile:     director.profile,
        isDirector:  true,
        permissions: director.permissions,
        tenantId:    null,                 // platform-level — no tenant
      },
    });
  } catch (err) {
    console.error("handleDirectorLogin error:", err.message);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  2. DIRECTOR CRUD — super_director only
//  All routes protected by requireDirector + requirePermission(...)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /director/team
 * List all directors. Super directors see everyone, others see only themselves.
 */
const getAllDirectors = async (req, res) => {
  try {
    const isSuperDirector = req.director.role === "super_director";

    const filter = isSuperDirector
      ? {}                                    // super sees all
      : { _id: req.director._id };            // others see only themselves

    const directors = await DirectorUser.find(filter)
      .select("-password")
      .populate("createdBy", "name email")
      .lean();

    return res.status(200).json({ directors });
  } catch (err) {
    console.error("getAllDirectors error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /director/team/:directorId
 */
const getDirectorById = async (req, res) => {
  try {
    const director = await DirectorUser.findById(req.params.directorId)
      .select("-password")
      .populate("createdBy", "name email")
      .lean();

    if (!director) return res.status(404).json({ message: "Director not found" });

    return res.status(200).json({ director });
  } catch (err) {
    console.error("getDirectorById error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /director/team
 * Create a new director account. super_director only.
 * body: { name, email, password, role, permissions? }
 */
const createDirector = async (req, res) => {
  const { name, email, password, role, permissions } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password and role are required" });
  }

  if (!isDirectorEmail(email)) {
    return res.status(400).json({
      message: `Director email must end with ${DIRECTOR_DOMAIN}`,
    });
  }

  if (!["super_director", "director", "readonly_director"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const existing = await DirectorUser.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "A director with this email already exists" });
    }

    // validate custom permissions if provided — must be subset of role's defaults
    let resolvedPermissions = permissions || ROLE_PERMISSIONS[role];

    const validPerms = new Set(Object.values(PERMISSIONS));
    const invalidPerms = resolvedPermissions.filter((p) => !validPerms.has(p));
    if (invalidPerms.length > 0) {
      return res.status(400).json({
        message: `Invalid permissions: ${invalidPerms.join(", ")}`,
      });
    }

    const director = await DirectorUser.create({
      name:        name.trim(),
      email:       email.toLowerCase().trim(),
      password,
      role,
      permissions: resolvedPermissions,
      createdBy:   req.director._id,
      active:      true,
    });

    const safe = director.toObject();
    delete safe.password;

    return res.status(201).json({
      message: `Director account created for ${director.email}`,
      director: safe,
    });
  } catch (err) {
    console.error("createDirector error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /director/team/:directorId
 * Update name, role, permissions, active. super_director only.
 * Cannot demote or deactivate yourself.
 */
const updateDirector = async (req, res) => {
  const { directorId } = req.params;
  const { name, role, permissions, active } = req.body;

  // prevent self-demotion / self-deactivation
  if (directorId === req.director._id.toString()) {
    if (role && role !== req.director.role) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }
    if (active === false) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }
  }

  try {
    const director = await DirectorUser.findById(directorId);
    if (!director) return res.status(404).json({ message: "Director not found" });

    const before = {
      name:        director.name,
      role:        director.role,
      permissions: [...director.permissions],
      active:      director.active,
    };

    if (name        !== undefined) director.name   = name.trim();
    if (active      !== undefined) director.active = active;
    if (role        !== undefined) {
      director.role = role;
      // reset permissions to new role defaults unless explicitly provided
      if (!permissions) director.permissions = ROLE_PERMISSIONS[role] || [];
    }
    if (permissions !== undefined) {
      const validPerms = new Set(Object.values(PERMISSIONS));
      const invalid = permissions.filter((p) => !validPerms.has(p));
      if (invalid.length > 0) {
        return res.status(400).json({ message: `Invalid permissions: ${invalid.join(", ")}` });
      }
      director.permissions = permissions;
    }

    await director.save();

    const safe = director.toObject();
    delete safe.password;

    return res.status(200).json({
      message: "Director updated",
      director: safe,
      changes: { before, after: { name: director.name, role: director.role, permissions: director.permissions, active: director.active } },
    });
  } catch (err) {
    console.error("updateDirector error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /director/team/:directorId
 * Hard delete. super_director only.
 * Cannot delete yourself.
 */
const deleteDirector = async (req, res) => {
  const { directorId } = req.params;

  if (directorId === req.director._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  try {
    const director = await DirectorUser.findByIdAndDelete(directorId).lean();
    if (!director) return res.status(404).json({ message: "Director not found" });

    return res.status(200).json({
      message: `Director ${director.email} deleted`,
    });
  } catch (err) {
    console.error("deleteDirector error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /director/team/:directorId/permissions
 * Fine-grained permission update without changing role. super_director only.
 * body: { add?: string[], remove?: string[] }
 */
const updateDirectorPermissions = async (req, res) => {
  const { directorId } = req.params;
  const { add = [], remove = [] } = req.body;

  const validPerms = new Set(Object.values(PERMISSIONS));
  const invalidAdd    = add.filter((p) => !validPerms.has(p));
  const invalidRemove = remove.filter((p) => !validPerms.has(p));

  if (invalidAdd.length || invalidRemove.length) {
    return res.status(400).json({
      message: `Invalid permissions: ${[...invalidAdd, ...invalidRemove].join(", ")}`,
    });
  }

  try {
    const director = await DirectorUser.findById(directorId);
    if (!director) return res.status(404).json({ message: "Director not found" });

    const current = new Set(director.permissions);
    add.forEach((p) => current.add(p));
    remove.forEach((p) => current.delete(p));
    director.permissions = [...current];

    await director.save();

    return res.status(200).json({
      message:     "Permissions updated",
      permissions: director.permissions,
    });
  } catch (err) {
    console.error("updateDirectorPermissions error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  isDirectorEmail,
  handleDirectorLogin,
  getAllDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
  updateDirectorPermissions,
};