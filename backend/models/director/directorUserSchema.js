const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");

// ── Permission constants ───────────────────────────────────────────────────────
// Import these wherever you need to reference a permission string —
// avoids magic strings scattered across controllers.
const PERMISSIONS = {
  // tenant CRUD
  VIEW_TENANTS:        "view_tenants",
  CREATE_TENANT:       "create_tenant",
  UPDATE_TENANT:       "update_tenant",
  DELETE_TENANT:       "delete_tenant",
  TOGGLE_TENANT:       "toggle_tenant",
  BULK_ACTION:         "bulk_action",

  // health / usage
  VIEW_HEALTH:         "view_health",
  UPDATE_USAGE_LIMIT:  "update_usage_limit",

  // impersonation
  IMPERSONATE:         "impersonate",

  // audit log
  VIEW_AUDIT_LOG:      "view_audit_log",
  VIEW_ALL_AUDIT_LOGS: "view_all_audit_logs", // own vs all

  // director management (super only)
  VIEW_DIRECTORS:      "view_directors",
  CREATE_DIRECTOR:     "create_director",
  UPDATE_DIRECTOR:     "update_director",
  DELETE_DIRECTOR:     "delete_director",
};

// ── Role → permission sets ────────────────────────────────────────────────────
const ROLE_PERMISSIONS = {
  super_director: Object.values(PERMISSIONS), // all permissions

  director: [
    PERMISSIONS.VIEW_TENANTS,
    PERMISSIONS.CREATE_TENANT,
    PERMISSIONS.UPDATE_TENANT,
    PERMISSIONS.TOGGLE_TENANT,
    PERMISSIONS.BULK_ACTION,
    PERMISSIONS.VIEW_HEALTH,
    PERMISSIONS.UPDATE_USAGE_LIMIT,
    PERMISSIONS.IMPERSONATE,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],

  readonly_director: [
    PERMISSIONS.VIEW_TENANTS,
    PERMISSIONS.VIEW_HEALTH,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],
};

// ── Schema ────────────────────────────────────────────────────────────────────
const directorUserSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
      validate: {
        validator: (v) => v.endsWith("@bytesbase.tech"),
        message:   "Director email must be @bytesbase.tech domain",
      },
    },
    password: { type: String, required: true, select: false },

    role: {
      type:    String,
      enum:    ["super_director", "director", "readonly_director"],
      default: "director",
    },

    // permissions array — seeded from ROLE_PERMISSIONS[role] on creation
    // but can be customised per-director by a super_director
    permissions: {
      type:    [String],
      enum:    Object.values(PERMISSIONS),
      default: [],
    },

    active:   { type: Boolean, default: true },
    profile:  { type: String,  default: null }, // S3 key for avatar

    // track last login for security visibility in the team page
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },

    // who created this director account — always a super_director
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "DirectorUser",
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
directorUserSchema.index({ email: 1 });
directorUserSchema.index({ role: 1 });
directorUserSchema.index({ active: 1 });

// ── Password hashing ──────────────────────────────────────────────────────────
directorUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12); // higher cost for platform admins
  next();
});

directorUserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Auto-seed permissions from role on create ─────────────────────────────────
directorUserSchema.pre("save", function (next) {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = ROLE_PERMISSIONS[this.role] || [];
  }
  next();
});

// ── Helper: check a single permission ────────────────────────────────────────
directorUserSchema.methods.can = function (permission) {
  return this.permissions.includes(permission);
};

const DirectorUser = mongoose.model("DirectorUser", directorUserSchema);

module.exports = { DirectorUser, PERMISSIONS, ROLE_PERMISSIONS };