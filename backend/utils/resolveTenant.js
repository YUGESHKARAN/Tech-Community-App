
// utils/resolveTenant.js
const { Tenant } = require("../models/tenantSchema")

// const resolveTenantFromEmail = async (email) => {
//   const domain = email.split('@')[1];
//   if (!domain) throw new Error("Invalid email format");

//   console.log("email domain", domain)

//   const tenant = await Tenant.findOne({
//     emailDomain: { $eq: domain },
//     active: true,
//   }).select('tenantId name emailDomain').lean();

//   if (!tenant) {
//     throw new Error(`Institution not registered: ${domain}`);
//   }

//   return tenant;
// };
const resolveTenantFromEmail = async (email) => {
  const domain = email.split('@')[1];
  if (!domain) throw new Error("Invalid email format");

  // trim whitespace and lowercase — email clients sometimes send
  // padded or mixed-case domains that won't match the stored value
  const normalizedDomain = domain.trim().toLowerCase();

  console.log("resolving domain:", normalizedDomain);

  const tenant = await Tenant.findOne({
    emailDomain: { $eq: normalizedDomain },
    active: true,
  })
    .select('tenantId name emailDomain active')
    .lean();

  console.log("tenant found:", tenant);

  if (!tenant) {
    // check if the domain exists but is inactive — gives a better error message
    const inactiveTenant = await Tenant.findOne({
      emailDomain: { $eq: normalizedDomain },
    })
      .select('tenantId active')
      .lean();

    if (inactiveTenant) {
      throw new Error(`Institution is suspended: ${normalizedDomain}`);
    }

    throw new Error(`Institution not registered: ${normalizedDomain}`);
  }

  return tenant;
};

module.exports = { resolveTenantFromEmail };