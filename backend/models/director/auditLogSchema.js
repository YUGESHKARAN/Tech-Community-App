const mongoose = require("mongoose");

// ── AuditLog schema (define inline — move to models/ if preferred) ────────────
const auditLogSchema = new mongoose.Schema({
  action:       { type: String, required: true },
  // e.g. 'tenant.create' | 'tenant.update' | 'tenant.delete'
  //      'tenant.activate' | 'tenant.deactivate' | 'tenant.impersonate'
  //      'tenant.bulk_activate' | 'tenant.bulk_deactivate'
 
  targetTenantId: { type: String, default: null },
  // tenantId of the affected tenant (null for bulk actions targeting many)
 
  targetTenantIds: { type: [String], default: [] },
  // for bulk actions — all affected tenant IDs
 
  performedBy: {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    email:    { type: String },
    role:     { type: String },
  },
 
  // full before/after diff
  changes: {
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after:  { type: mongoose.Schema.Types.Mixed, default: null },
  },
 
  meta: { type: mongoose.Schema.Types.Mixed, default: null },
  // extra context e.g. { impersonationTokenJti, expiresAt } for impersonate
 
  createdAt: { type: Date, default: Date.now },
});
 
auditLogSchema.index({ targetTenantId: 1, createdAt: -1 });
auditLogSchema.index({ 'performedBy.email': 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
 
const AuditLog = mongoose.models.AuditLog ||
  mongoose.model('AuditLog', auditLogSchema);
 

module.exports = { AuditLog };