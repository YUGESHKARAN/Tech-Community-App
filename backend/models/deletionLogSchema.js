// ─────────────────────────────────────────────────────────────
//  deletionLogSchema.js
// ─────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// ── Inline sub-schemas (mirror of main schemas — snapshot only) ──

const snapshotMessageSchema = new mongoose.Schema({
  _id:       { type: mongoose.Schema.Types.ObjectId },
  user:      { type: String },
  message:   { type: String },
  profile:   { type: String },
  email:     { type: String },
  timestamp: { type: Date },
}, { _id: false });

const snapshotPostSchema = new mongoose.Schema({
  _id:         { type: mongoose.Schema.Types.ObjectId },  // preserve original ID
  authorId:    { type: mongoose.Schema.Types.ObjectId },
  title:       { type: String },
  description: { type: String },
  category:    { type: String },
  image:       { type: String },
  documents:   [String],
  links: [{
    _id:   { type: mongoose.Schema.Types.ObjectId },
    title: { type: String },
    url:   { type: String },
  }],
  likes:       [String],
  views:       [String],
  messages:    [snapshotMessageSchema],
  timestamp:   { type: Date },
}, { _id: false });

const snapshotAuthorSchema = new mongoose.Schema({
  _id:          { type: mongoose.Schema.Types.ObjectId }, // fix: was missing — caused id mismatch on restore
  authorname:   { type: String },
  email:        { type: String },
  password:     { type: String },
  role:         { type: String },
  profile:      { type: String },
  followers:    [String],
  following:    [String],
  community:    [String],
  posts:        [mongoose.Schema.Types.ObjectId],
  postBookmark: [mongoose.Schema.Types.ObjectId],
  personalLinks: [{
    _id:   mongoose.Schema.Types.ObjectId,
    title: String,
    url:   String,
  }],
  notification:  [mongoose.Schema.Types.Mixed],
  announcement:  [mongoose.Schema.Types.Mixed],
  otp:          { type: String },
  otpExpiresAt: { type: Date   },
});  // fix: removed { _id: false } — was stripping the author's original _id

// ── Main deletion log schema ──────────────────────────────────
const deletionLogSchema = new mongoose.Schema({

  // ── who / when / why ────────────────────────────────────────
  deletedAt: {
    type:    Date,
    default: Date.now,
    index:   true,
  },

  deletionType: {
    type:     String,
    enum:     ['self', 'admin_action'],
    required: true,
  },

  deletedBy: {
    email: { type: String, required: true },
    name:  { type: String, required: true },
    role:  { type: String, required: true },  // 'student'|'coordinator'|'admin'
  },

  // ── state machine ───────────────────────────────────────────
  // deleted → restored  (normal rollback)
  // deleted → expired   (TTL hit or admin manual expire)
  status: {
    type:    String,
    enum:    ['deleted', 'restored', 'expired'],
    default: 'deleted',
    index:   true,
  },

  restoredAt: {
    type:    Date,
    default: null,
  },

  restoredBy: {
    type:    String,   // email of restoring admin/user
    default: null,
  },

  // ── GDPR / retention ────────────────────────────────────────
  // set to Date.now + 90 days on creation
  // MongoDB TTL index auto-deletes the log document after this date
  // set to null to keep indefinitely
  expiresAt: {
    type:    Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    index:   true,   // TTL index added below
  },

  // ── complete snapshot ────────────────────────────────────────
  // self-contained at deletion time — never references live collections
  snapshot: {
    author: { type: snapshotAuthorSchema, required: true },
    posts:  { type: [snapshotPostSchema], default: [] },
  },

}, { timestamps: false });  // we manage deletedAt manually

// ── Indexes ───────────────────────────────────────────────────
deletionLogSchema.index({ 'snapshot.author.email': 1 });          // user self-lookup + collision check
deletionLogSchema.index({ status: 1, deletedAt: -1 });            // admin list view
deletionLogSchema.index({ 'deletedBy.email': 1, deletedAt: -1 }); // audit trail by admin
// deletionLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL auto-delete

const DeletionLog = mongoose.model('DeletionLog', deletionLogSchema);
module.exports = { DeletionLog };