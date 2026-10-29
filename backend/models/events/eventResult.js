
const mongoose = require('mongoose');

/**
 * EventResult
 *
 * Written once, when results are published. One row per ranked team.
 *
 * pointsAwarded is copied from Event.pointsPolicy at publish time. Later
 * changes to the policy do not rewrite past results. The performance tracker
 * reads pointsAwarded when it grants 'event-win' points.
 *
 * rank is not unique. Ties may share a rank. Tie-breaking rules are still
 * open (see the event design notes), so this schema does not decide them.
 */
const eventResultSchema = new mongoose.Schema(
  {
    tenantId:     { type: String, required: true, lowercase: true, trim: true },
    eventId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    teamId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },

    rank:         { type: Number, required: true, min: 1 },
    finalScore:   { type: Number, required: true, min: 0, max: 100 },

    prizeTitle:   { type: String, trim: true, maxlength: 120, default: null },
    pointsAwarded:{ type: Number, required: true, min: 0, default: 0 },

    publishedAt:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// one result per team per event
eventResultSchema.index({ eventId: 1, teamId: 1 }, { unique: true });

// leaderboard page, ordered by rank
eventResultSchema.index({ eventId: 1, rank: 1 });

// "my wins" lookups across events
eventResultSchema.index({ tenantId: 1, teamId: 1 });

module.exports = mongoose.model('EventResult', eventResultSchema);