const mongoose = require('mongoose');

/**
 * EventRegistration
 *
 * One row per participant per event. The unique (eventId, authorId) index is
 * what enforces "a user can belong to only one team per event": a user has at
 * most one registration, and that registration points to at most one teamId.
 *
 * Individual events: teamId stays null and status goes straight to 'confirmed'.
 * Team events: status is 'pending_team' until the user joins or creates a team
 * and the team is locked.
 *
 * Counters (Event.counters.registrationCount, Team.memberCount) are updated
 * with $inc in the same transaction as the insert or delete here.
 */
const REGISTRATION_STATUSES = ['pending_team', 'confirmed', 'withdrawn', 'disqualified'];
const REGISTRATION_ROLES = ['participant', 'lead'];

const eventRegistrationSchema = new mongoose.Schema(
  {
    tenantId:  { type: String, required: true, lowercase: true, trim: true },
    eventId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    authorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    teamId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    role:      { type: String, enum: REGISTRATION_ROLES, default: 'participant' },
    status:    { type: String, enum: REGISTRATION_STATUSES, default: 'confirmed' },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// one registration per user per event (enforces one team per event)
eventRegistrationSchema.index({ eventId: 1, authorId: 1 }, { unique: true });

// roster of a team
eventRegistrationSchema.index({ eventId: 1, teamId: 1 });

// "my events" page
eventRegistrationSchema.index({ tenantId: 1, authorId: 1, status: 1 });

// scoring and points jobs read confirmed participants per event
eventRegistrationSchema.index({ eventId: 1, status: 1 });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
module.exports.REGISTRATION_STATUSES = REGISTRATION_STATUSES;
module.exports.REGISTRATION_ROLES = REGISTRATION_ROLES;