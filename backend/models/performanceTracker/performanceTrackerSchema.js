
const mongoose = require('mongoose');

// ── DailyEventLog ─────────────────────────────────────────────────────────────
/**
 * One document per (authorId, date).
 * Stores up to N events per day alongside the cached point total.
 * Kept separate from UserContributions so the contributions heatmap
 * read (points only) is never blocked by a large events array,
 * and so paginated event reads are a simple indexed query.
 *
 * communityId  — populated for 'discussion' and 'reply' events only.
 *                null for 'post' events.
 * discussionId — populated for 'reply' events only (needed to build
 *                the navigation URL /community/:communityId?...#replyId).
 *                null for 'post' and 'discussion' events.
 */
const dailyEventSchema = new mongoose.Schema({
  type: {
    type:     String,
    enum:     ['post', 'discussion', 'reply'],
    required: true,
  },
  targetId: {
    // post._id | discussion._id | reply._id
    type:     mongoose.Schema.Types.ObjectId,
    required: true,
  },
  communityId: {
    // discussion + reply only — needed for navigation
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'Community',
    default: null,
  },
  discussionId: {
    // reply only — parent discussion, needed to build thread URL
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'Discussion',
    default: null,
  },
  title:        { type: String,  required: true },
  communityName:{ type: String,  default: null  },
  pts:          { type: Number,  required: true },
  createdAt:    { type: Date,    default: Date.now },
}, { _id: true });

const dailyEventLogSchema = new mongoose.Schema({
  authorId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Author',
    required: true,
  },
  tenantId: { type: String, required: true },
  date:     { type: String, required: true }, // "YYYY-MM-DD" Asia/Kolkata

  // cached total points for the day — mirrors UserContributions.days[date]
  // kept here too so a single read gives both count and events
  totalPts: { type: Number, default: 0 },

  events: [dailyEventSchema],
});

// primary: fetch events for a specific day
dailyEventLogSchema.index({ authorId: 1, date: 1 }, { unique: true });
// tenant-scoped queries (admin dashboards etc.)
dailyEventLogSchema.index({ tenantId: 1, authorId: 1, date: 1 });

const DailyEventLog = mongoose.model('DailyEventLog', dailyEventLogSchema);


// ── UserContributions ─────────────────────────────────────────────────────────
/**
 * One document per (authorId, year).
 * The `days` map is the source of truth for the heatmap —
 * keyed by "MM-DD" to avoid the year being part of every key.
 * totalCount is a running sum for quick "X contributions in YEAR" display.
 *
 * This collection is heatmap-read-only. Event detail reads go to
 * DailyEventLog.
 */
const userContributionsSchema = new mongoose.Schema({
  authorId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Author',
    required: true,
  },
  tenantId: { type: String,  required: true },
  year:     { type: Number,  required: true },
  // "MM-DD" → total weighted points for that day
  days:       { type: Map, of: Number, default: {} },
  totalCount: { type: Number, default: 0 },
}, { timestamps: true });

userContributionsSchema.index({ authorId: 1, year: 1 }, { unique: true });
userContributionsSchema.index({ tenantId: 1, authorId: 1, year: 1 });

const UserContributions = mongoose.model('UserContributions', userContributionsSchema);


module.exports = { DailyEventLog, UserContributions };