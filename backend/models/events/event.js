const mongoose = require('mongoose');

/**
 * Event
 *
 * A time-boxed competition inside one tenant: hackathon, innovation challenge,
 * or startup challenge. Created by an admin; coordinators are added as
 * organizers and cannot create events.
 *
 * Status is never stored. It is computed from the schedule (see
 * statics.computeStatus). The only persisted override is cancelledAt, set by
 * an organizer and checked by statics.cancellationBlocker.
 *
 * Counters are cached and changed only with atomic $inc inside the same
 * transaction as the write they mirror. Transactions need a replica set.
 *
 * Rubric weights must sum to 100. Once rubricLockedAt is set (judging has
 * started) the rubric cannot change, so scores are never compared against a
 * moving scale.
 */

const EVENT_CATEGORIES = ['hackathon', 'innovation_challenge', 'startup_challenge'];
const PARTICIPATION_TYPES = ['individual', 'team'];
const EVENT_STATUSES = [
  'cancelled',
  'upcoming',
  'registration_open',
  'registration_closed',
  'live',
  'judging',
  'ended',
];
const ORGANIZER_ROLES = ['owner', 'co_organizer'];

// Paths that computeStatus reads. Use as a projection so list queries stay light.
const EVENT_STATUS_FIELDS = [
  'cancelledAt',
  'resultsPublishedAt',
  'schedule.registrationOpensAt',
  'schedule.registrationClosesAt',
  'schedule.eventStartsAt',
  'schedule.judgingStartsAt',
  'schedule.judgingEndsAt',
];

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const scheduleSchema = new mongoose.Schema(
  {
    registrationOpensAt:  { type: Date, required: true },
    registrationClosesAt: { type: Date, required: true },
    // team events only; must be on or before eventStartsAt
    teamFormationClosesAt: { type: Date, default: null },
    eventStartsAt:        { type: Date, required: true },
    eventEndsAt:          { type: Date, required: true },
    // submissions are editable until this time
    submissionDeadlineAt: { type: Date, required: true },
    judgingStartsAt:      { type: Date, required: true },
    judgingEndsAt:        { type: Date, required: true },
    resultsPublishAt:     { type: Date, required: true },
  },
  { _id: false }
);

const participationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: PARTICIPATION_TYPES, required: true },
    teamSize: {
      min: { type: Number, min: 1, default: 1 },
      max: { type: Number, min: 1, default: 1 },
    },
  },
  { _id: false }
);

const capacitySchema = new mongoose.Schema(
  {
    // null = unlimited
    maxParticipants: { type: Number, min: 1, default: null },
    maxTeams:        { type: Number, min: 1, default: null },
  },
  { _id: false }
);

const prizeSchema = new mongoose.Schema(
  {
    rank:        { type: Number, min: 1, required: true },
    title:       { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer:   { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

const rubricCriterionSchema = new mongoose.Schema(
  {
    key:    { type: String, required: true, trim: true, lowercase: true, maxlength: 40 },
    label:  { type: String, required: true, trim: true, maxlength: 120 },
    weight: { type: Number, required: true, min: 1, max: 100 },
  },
  { _id: false }
);

const organizerSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    role:     { type: String, enum: ORGANIZER_ROLES, required: true },
    addedAt:  { type: Date, default: Date.now },
  },
  { _id: false }
);

const pointsPolicySchema = new mongoose.Schema(
  {
    // awarded to each registered participant
    participation:     { type: Number, min: 0, default: 10 },
    // awarded to the team lead on first valid submission
    submission:        { type: Number, min: 0, default: 20 },
    // place awards: [{ rank: 1, points: 100 }, ...]
    placeAwards: {
      type: [
        new mongoose.Schema(
          {
            rank:   { type: Number, min: 1, required: true },
            points: { type: Number, min: 0, required: true },
          },
          { _id: false }
        ),
      ],
      default: [
        { rank: 1, points: 100 },
        { rank: 2, points: 70 },
        { rank: 3, points: 50 },
      ],
    },
    // winners ranked below the place awards
    defaultWinPoints: { type: Number, min: 0, default: 20 },
  },
  { _id: false }
);

const supportSchema = new mongoose.Schema(
  {
    contactEmail: { type: String, trim: true, lowercase: true, default: null },
    chatUrl:      { type: String, trim: true, default: null },
  },
  { _id: false }
);

// ── Event ────────────────────────────────────────────────────────────────────

const eventSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, lowercase: true, trim: true },

    slug:     { type: String, required: true, lowercase: true, trim: true, maxlength: 120 },
    title:    { type: String, required: true, trim: true, maxlength: 200 },
    overview: { type: String, required: true, trim: true, maxlength: 5000 },

    category: { type: String, enum: EVENT_CATEGORIES, required: true },

    schedule:     { type: scheduleSchema, required: true },
    participation:{ type: participationSchema, required: true },
    capacity:     { type: capacitySchema, default: () => ({}) },

    themes:       { type: [String], default: [], validate: [(v) => v.length <= 10, 'max 10 themes'] },
    prizes:       { type: [prizeSchema], default: [] },
    eligibility:  { type: String, trim: true, maxlength: 3000, default: '' },
    rules:        { type: String, trim: true, maxlength: 10000, default: '' },
    faqs:         { type: [faqSchema], default: [], validate: [(v) => v.length <= 20, 'max 20 faqs'] },
    support:      { type: supportSchema, default: () => ({}) },
    coverKey:     { type: String, default: null }, // S3 key

    // scoring
    rubric:       { type: [rubricCriterionSchema], default: [] },
    rubricLockedAt: { type: Date, default: null },
    pointsPolicy: { type: pointsPolicySchema, default: () => ({}) },

    // cached counters — only changed with $inc inside transactions
    counters: {
      registrationCount: { type: Number, default: 0, min: 0 },
      teamCount:         { type: Number, default: 0, min: 0 },
      submissionCount:   { type: Number, default: 0, min: 0 },
    },

    organizers: { type: [organizerSchema], default: [] },

    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },

    // manual override — the only persisted status-related field
    cancelledAt:  { type: Date, default: null },
    cancelledBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Author', default: null },
    cancelReason: { type: String, trim: true, maxlength: 500, default: null },

    resultsPublishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Validation ───────────────────────────────────────────────────────────────

eventSchema.pre('validate', function () {
  const s = this.schedule;

  // schedule must be in chronological order
  if (s) {
    const ordered = (a, b) => a && b && new Date(a) <= new Date(b);

    if (!(new Date(s.registrationOpensAt) < new Date(s.registrationClosesAt))) {
      this.invalidate('schedule.registrationClosesAt', 'must be after registrationOpensAt');
    }
    if (!ordered(s.registrationClosesAt, s.eventStartsAt)) {
      this.invalidate('schedule.eventStartsAt', 'must be on or after registrationClosesAt');
    }
    if (s.teamFormationClosesAt && !ordered(s.teamFormationClosesAt, s.eventStartsAt)) {
      this.invalidate('schedule.teamFormationClosesAt', 'must be on or before eventStartsAt');
    }
    if (!(new Date(s.eventStartsAt) < new Date(s.eventEndsAt))) {
      this.invalidate('schedule.eventEndsAt', 'must be after eventStartsAt');
    }
    if (!ordered(s.eventStartsAt, s.submissionDeadlineAt)) {
      this.invalidate('schedule.submissionDeadlineAt', 'must be on or after eventStartsAt');
    }
    if (!ordered(s.submissionDeadlineAt, s.judgingStartsAt)) {
      this.invalidate('schedule.judgingStartsAt', 'must be on or after submissionDeadlineAt');
    }
    if (!(new Date(s.judgingStartsAt) < new Date(s.judgingEndsAt))) {
      this.invalidate('schedule.judgingEndsAt', 'must be after judgingStartsAt');
    }
    if (!ordered(s.judgingEndsAt, s.resultsPublishAt)) {
      this.invalidate('schedule.resultsPublishAt', 'must be on or after judgingEndsAt');
    }
  }

  // team size range only applies to team events
  if (this.participation?.type === 'team') {
    const { min, max } = this.participation.teamSize || {};
    if (min == null || max == null || max < min) {
      this.invalidate('participation.teamSize', 'max must be greater than or equal to min');
    }
  }

  // rubric: unique keys, weights sum to 100 once defined
  if (this.rubric?.length) {
    const keys = this.rubric.map((c) => c.key);
    if (new Set(keys).size !== keys.length) {
      this.invalidate('rubric', 'criterion keys must be unique');
    }
    const total = this.rubric.reduce((sum, c) => sum + c.weight, 0);
    if (total !== 100) {
      this.invalidate('rubric', `weights must sum to 100 (got ${total})`);
    }
  }

  // rubric is frozen after judging starts
  if (this.rubricLockedAt && this.isModified('rubric')) {
    this.invalidate('rubric', 'rubric is locked once judging has started');
  }

  // place awards: unique integer ranks
  const placeRanks = (this.pointsPolicy?.placeAwards || []).map((p) => p.rank);
  if (new Set(placeRanks).size !== placeRanks.length) {
    this.invalidate('pointsPolicy.placeAwards', 'ranks must be unique');
  }

  // at least one owner
  if (this.organizers?.length && !this.organizers.some((o) => o.role === 'owner')) {
    this.invalidate('organizers', 'an event needs exactly one owner');
  }
  if (this.organizers?.filter((o) => o.role === 'owner').length > 1) {
    this.invalidate('organizers', 'an event can have only one owner');
  }
});

// ── Statics ──────────────────────────────────────────────────────────────────

/**
 * Derives the lifecycle status from dates. Never persisted.
 *
 *   cancelled           cancelledAt is set (overrides everything)
 *   upcoming            before registrationOpensAt
 *   registration_open   registrationOpensAt <= now < registrationClosesAt
 *   registration_closed registrationClosesAt <= now < eventStartsAt
 *   live                eventStartsAt <= now < judgingStartsAt
 *                       (covers the build window and the submission window)
 *   judging             judgingStartsAt <= now < judgingEndsAt
 *   ended               now >= judgingEndsAt
 */
eventSchema.statics.computeStatus = function (event, now = new Date()) {
  if (event.cancelledAt) return 'cancelled';

  const s = event.schedule || {};
  const t = new Date(now).getTime();
  const at = (d) => new Date(d).getTime();

  if (t < at(s.registrationOpensAt)) return 'upcoming';
  if (t < at(s.registrationClosesAt)) return 'registration_open';
  if (t < at(s.eventStartsAt)) return 'registration_closed';
  if (t < at(s.judgingStartsAt)) return 'live';
  if (t < at(s.judgingEndsAt)) return 'judging';
  return 'ended';
};

/**
 * Returns a reason string if the event cannot be cancelled, otherwise null.
 */
eventSchema.statics.cancellationBlocker = function (event, now = new Date()) {
  if (event.cancelledAt) return 'Event is already cancelled';
  if (event.resultsPublishedAt) return 'Results are already published';
  if (this.computeStatus(event, now) === 'ended') return 'Event has already ended';
  return null;
};

// ── Indexes ──────────────────────────────────────────────────────────────────

// slug is unique within a tenant, not globally
eventSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

// upcoming / browse feed — date-range queries on the schedule
eventSchema.index({ tenantId: 1, 'schedule.registrationOpensAt': -1 });
eventSchema.index({ tenantId: 1, category: 1, 'schedule.eventStartsAt': -1 });

// "events I organize" lookup
eventSchema.index({ tenantId: 1, 'organizers.authorId': 1 });

module.exports = {
  Event: mongoose.model('Event', eventSchema),
  EVENT_STATUS_FIELDS,
  EVENT_CATEGORIES,
  PARTICIPATION_TYPES,
  EVENT_STATUSES,
};