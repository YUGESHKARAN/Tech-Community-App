// tenantSchema.js
const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  tenantId:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  // e.g. "dsu"

  name:        { type: String, required: true },
  // e.g. "Dr. Sivanthi Aditanar University"

  emailDomain: { type: String, required: true, unique: true },
  // e.g. "dsuniversity.ac.in" — used to auto-resolve tenantId on registration/login

  subdomain:   { type: String, unique: true, sparse: true },
  // e.g. "dsu" → dsu.bytesbase.me

  active:      { type: Boolean, default: true },
  // flip to false to disable an institution without deleting data

  config: {
    allowPublicProfiles: { type: Boolean, default: false },
    maxUsersAllowed:     { type: Number,  default: 10000 },
    customBranding:      { type: Boolean, default: false },
  },

  createdAt: { type: Date, default: Date.now },
});

// tenantSchema.index({ tenantId:    1 });
// tenantSchema.index({ emailDomain: 1 }); // fast lookup on registration
// tenantSchema.index({ subdomain:   1 });

const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = { Tenant };