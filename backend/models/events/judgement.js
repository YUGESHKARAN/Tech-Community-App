

const mongoose = require('mongoose');

/**
 * Judgement
 *
 * One judge's scores for one submission. Unique per (submissionId, judgeId),
 * so each judge scores each submission once, and can revise while status is
 * 'draft'.
 *
 * scores[].criterionKey must match a key in Event.rubric. The controller
 * enforces that set and the weight math. weightedTotal is computed there as
 *   sum(score / 100 * weight)   with score in 0..100
 * so it lands on a 0..100 scale.
 *
 * Judging is offline and organizer-led. Judgements are only visible to
 * organizers until results are published.
 */
const JUDGEMENT_STATUSES = ['draft', 'submitted'];

const judgementSchema = new mongoose.Schema(
  {
    tenantId:     { type: String, required: true, lowercase: true, trim: true },
    eventId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    judgeId:      { type: mongoose.Schema.Types.ObjectId, ref: 'EventJudge', required: true },

    scores: {
      type: [
        new mongoose.Schema(
          {
            criterionKey: { type: String, required: true, lowercase: true, trim: true },
            score:        { type: Number, required: true, min: 0, max: 100 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    weightedTotal: { type: Number, min: 0, max: 100, default: null },
    status:        { type: String, enum: JUDGEMENT_STATUSES, default: 'draft' },
    submittedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

judgementSchema.pre('validate', function () {
  const keys = this.scores.map((s) => s.criterionKey);
  if (new Set(keys).size !== keys.length) {
    this.invalidate('scores', 'each criterionKey may appear only once');
  }
  if (this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
});

judgementSchema.index({ submissionId: 1, judgeId: 1 }, { unique: true });

// "all judgements for this event" when computing results
judgementSchema.index({ eventId: 1, submissionId: 1, status: 1 });

module.exports = mongoose.model('Judgement', judgementSchema);
module.exports.JUDGEMENT_STATUSES = JUDGEMENT_STATUSES;