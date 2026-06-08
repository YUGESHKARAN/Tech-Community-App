
//  badgeSchema.js — embedded into Author

const mongoose = require('mongoose');

// one entry per tier earned — e.g. Impact Creator has bronze + silver entries
const badgeHistorySchema = new mongoose.Schema({
  tier:       { type: String, enum: ['bronze', 'silver', 'gold'], required: true },
  awardedAt:  { type: Date,   default: Date.now },

  // the event that triggered this tier unlock
  eventType:  {
    type: String,
    enum: ['like_milestone', 'post_milestone', 'view_milestone',
           'follower_milestone', 'collab_milestone', 'general'],
    required: true,
  },
  eventId:    { type: mongoose.Schema.Types.ObjectId }, // postId, playlistId etc.
  eventTitle: { type: String }, // "Evaluating LLMs using LangSmith"
  milestone:  { type: Number }, // exact number that triggered it e.g. 100, 500
}, { _id: false });

const badgeSchema = new mongoose.Schema({
  badgeId: {
    type:     String,
    enum:     ['impact_creator', 'strong_publisher', 'collaborator',
               'pro_contributor', 'community_builder'],
    required: true,
  },

  // highest tier currently held
  currentTier: {
    type:    String,
    enum:    ['bronze', 'silver', 'gold'],
    required: true,
  },

  // full history — one entry per tier unlock (max 3)
  history: {
    type:    [badgeHistorySchema],
    default: [],
    validate: {
      validator: (v) => v.length <= 3,
      message:   "Badge history cannot exceed 3 tiers",
    },
  },

  // display count — shown on badge like GitHub's "x2"
  // for badges that can accumulate (e.g. 16 PRs merged)
  count: { type: Number, default: 1 },

}, { _id: false });

module.exports = { badgeSchema, badgeHistorySchema };