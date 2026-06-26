const { Tenant } = require("../models/tenantSchema");

const ensureDirector = (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Access denied" });
    return false;
  }

  return true;
};

const getAllTenants = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  try {
    const tenants = await Tenant.find({}, { __v: 0 }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ tenants });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTenantById = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const tenantId = req.params.tenantId?.trim().toLowerCase();
  if (!tenantId) {
    return res.status(400).json({ message: "Tenant ID is required" });
  }

  try {
    const tenant = await Tenant.findOne({ tenantId }, { __v: 0 }).lean();
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    return res.status(200).json({ tenant });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addTenant = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const { tenantId, name, emailDomain, subdomain, active, config } = req.body;
  if (!tenantId || !name || !emailDomain) {
    return res.status(400).json({ message: "tenantId, name, and emailDomain are required" });
  }

  const normalizedTenantId = tenantId.trim().toLowerCase();
  const normalizedEmailDomain = emailDomain.trim().toLowerCase();
  const normalizedSubdomain = subdomain?.trim();

  try {
    const existing = await Tenant.findOne({
      $or: [
        { tenantId: normalizedTenantId },
        { emailDomain: normalizedEmailDomain },
        ...(normalizedSubdomain ? [{ subdomain: normalizedSubdomain }] : []),
      ],
    });

    if (existing) {
      let conflictField = "tenantId or emailDomain";
      if (existing.tenantId === normalizedTenantId) conflictField = "tenantId";
      else if (existing.emailDomain === normalizedEmailDomain) conflictField = "emailDomain";
      else if (normalizedSubdomain && existing.subdomain === normalizedSubdomain) conflictField = "subdomain";
      return res.status(409).json({ message: `Duplicate ${conflictField}` });
    }

    const tenant = new Tenant({
      tenantId: normalizedTenantId,
      name: name.trim(),
      emailDomain: normalizedEmailDomain,
      subdomain: normalizedSubdomain || undefined,
      active: active === undefined ? true : Boolean(active),
      config: {
        allowPublicProfiles: config?.allowPublicProfiles ?? false,
        maxUsersAllowed: config?.maxUsersAllowed ?? 10000,
        customBranding: config?.customBranding ?? false,
      },
    });

    await tenant.save();
    return res.status(201).json({ message: "Tenant created successfully", tenant });
  } catch (err) {
    if (err.code === 11000) {
      const duplicateKey = Object.keys(err.keyValue || {}).join(", ");
      return res.status(409).json({ message: `Duplicate field: ${duplicateKey}` });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateTenant = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const tenantId = req.params.tenantId?.trim().toLowerCase();
  if (!tenantId) {
    return res.status(400).json({ message: "Tenant ID is required" });
  }

  const { name, emailDomain, subdomain, active, config } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name.trim();
  if (emailDomain !== undefined) updates.emailDomain = emailDomain.trim().toLowerCase();
  if (subdomain !== undefined) updates.subdomain = subdomain?.trim() || undefined;
  if (active !== undefined) updates.active = Boolean(active);
  if (config !== undefined) {
    updates.config = {
      allowPublicProfiles: config.allowPublicProfiles ?? undefined,
      maxUsersAllowed: config.maxUsersAllowed ?? undefined,
      customBranding: config.customBranding ?? undefined,
    };
  }

  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (updates.emailDomain || updates.subdomain) {
      const conflictFilter = { _id: { $ne: tenant._id }, $or: [] };
      if (updates.emailDomain) conflictFilter.$or.push({ emailDomain: updates.emailDomain });
      if (updates.subdomain) conflictFilter.$or.push({ subdomain: updates.subdomain });
      if (conflictFilter.$or.length > 0) {
        const duplicate = await Tenant.findOne(conflictFilter);
        if (duplicate) {
          const field = duplicate.emailDomain === updates.emailDomain ? "emailDomain" : "subdomain";
          return res.status(409).json({ message: `Duplicate ${field}` });
        }
      }
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        if (key === "config") {
          tenant.config = { ...tenant.config.toObject?.(), ...updates.config };
        } else {
          tenant[key] = updates[key];
        }
      }
    });

    await tenant.save();

    return res.status(200).json({ message: "Tenant updated successfully", tenant });
  } catch (err) {
    if (err.code === 11000) {
      const duplicateKey = Object.keys(err.keyValue || {}).join(", ");
      return res.status(409).json({ message: `Duplicate field: ${duplicateKey}` });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteTenant = async (req, res) => {
  if (!ensureDirector(req, res)) return;

  const tenantId = req.params.tenantId?.trim().toLowerCase();
  if (!tenantId) {
    return res.status(400).json({ message: "Tenant ID is required" });
  }

  try {
    const tenant = await Tenant.findOneAndDelete({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    return res.status(200).json({ message: "Tenant deleted successfully", tenant });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllTenants,
  getTenantById,
  addTenant,
  updateTenant,
  deleteTenant,
};
