
const mongoose = require('mongoose');

/**
 * Submission
 *
 * A team's entry for one event: repo, demo, deck, and a linked Post so the
 * project appears in the community feed like any other post.
 *
 * One submission per team per event (unique eventId + teamId). Edits are
 * allowed until Event.schedule.submissionDeadlineAt; the controller checks
 * the deadline, not this schema. Each edit increments revision.
 *
 * Event.counters.submissionCount is incremented once, on first create only.
 * The points award for the first submission (pointsPolicy.submission) is
 * granted once, on first create only, to the team lead through
 * trackActivity with type 'event-submission'.
 */
const httpsUrl = {
  validator: (v) => !v || /^https:\/\/[^\s]+$/i.test(v),
  message: 'must be an https:// URL',
};

const submissionSchema = new mongoose.Schema(
  {
    tenantId:     { type: String, required: true, lowercase: true, trim: true },
    eventId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    teamId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    postId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    submittedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },

    repoUrl:      { type: String, trim: true, default: null, validate: httpsUrl },
    demoUrl:      { type: String, trim: true, default: null, validate: httpsUrl },
    presentationKey: { type: String, default: null }, // S3 key

    revision:     { type: Number, default: 1, min: 1 },
    submittedAt:  { type: Date, default: Date.now },
    lastEditedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// one submission per team per event
submissionSchema.index({ eventId: 1, teamId: 1 }, { unique: true });

// one submission per post (sparse: postId is null until the post is created)
submissionSchema.index({ postId: 1 }, { unique: true, sparse: true });

// judging queue, ordered by submission time (tie-break candidate)
submissionSchema.index({ eventId: 1, submittedAt: 1 });

module.exports = mongoose.model('Submission', submissionSchema);