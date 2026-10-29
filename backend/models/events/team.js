
const mongoose = require('mongoose');

/**
 * Team
 *
 * A group of participants competing together in one team event. Exists only
 * for events with participation.type === 'team'. The lead is also a member,
 * recorded through EventRegistration.teamId with role 'lead'.
 *
 * memberCount is a cached counter, changed with $inc in the same transaction
 * as the EventRegistration write that adds or removes a member.
 */
const TEAM_STATUSES = ['forming', 'locked', 'disqualified', 'withdrawn'];

const teamSchema = new mongoose.Schema(
  {
    tenantId:    { type: String, required: true, lowercase: true, trim: true },
    eventId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name:        { type: String, required: true, trim: true, maxlength: 80 },
    leadId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    memberCount: { type: Number, default: 1, min: 0 },
    status:      { type: String, enum: TEAM_STATUSES, default: 'forming' },
    lockedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

// team names are unique within an event, case-insensitively
teamSchema.index(
  { eventId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

// roster and admin lists
teamSchema.index({ eventId: 1, status: 1 });
teamSchema.index({ tenantId: 1, leadId: 1 });

module.exports = mongoose.model('Team', teamSchema);
module.exports.TEAM_STATUSES = TEAM_STATUSES;