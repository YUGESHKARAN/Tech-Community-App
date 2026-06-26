
// utils/resolveTenant.js
const { Tenant } = require("../models/tenantSchema")

const resolveTenantFromEmail = async (email) => {
  const domain = email.split('@')[1];
  if (!domain) throw new Error("Invalid email format");

  const tenant = await Tenant.findOne({
    emailDomain: { $eq: domain },
    active: true,
  }).select('tenantId name emailDomain').lean();

  if (!tenant) {
    throw new Error(`Institution not registered: ${domain}`);
  }

  return tenant;
};

module.exports = { resolveTenantFromEmail };