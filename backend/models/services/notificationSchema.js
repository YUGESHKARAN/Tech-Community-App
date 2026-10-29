// const mongoose = require("mongoose");

// // ── Notification type constants ───────────────────────────────────────────────
// // Import NOTIFICATION_TYPES wherever you create a notification so there
// // are no magic strings scattered across controllers.
// const NOTIFICATION_TYPES = {
//   DISCUSSION_CREATED:  "discussion-created",
//   POST_CREATED:        "post-created",
//   POST_ENGAGED:        "post-engaged",
//   DISCUSSION_ENGAGED:  "discussion-engaged",
//   ANNOUNCEMENT:        "announcement",
//   DISCUSSION_REPLY:    "discussion-reply",
//   DISCUSSION_ANSWER:   "discussion-answer",
//   ACHIEVEMENT:         "achievement",
//   COLLAB:              "collab",
//   SYSTEM:              "system",
// };

// const notificationSchema = new mongoose.Schema({
//   // ── type ────────────────────────────────────────────────────────────────────
//   type: {
//     type:    String,
//     enum:    Object.values(NOTIFICATION_TYPES),
//     default: NOTIFICATION_TYPES.SYSTEM, // legacy / unclassified notifications
//     required: false,
//   },

//   // ── references (all optional — set whichever apply to the type) ────────────
//   postId:       { type: mongoose.Schema.Types.ObjectId, ref: "Post",         default: null },
//   communityId:  { type: mongoose.Schema.Types.ObjectId, ref: "Community",    default: null },
//   discussionId: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion",   default: null },
//   playlistId:   { type: mongoose.Schema.Types.ObjectId, ref: "TutorPlayList",default: null },

//   // ── display fields ────────────────────────────────────────────────────────
//   user:        { type: String, required: true  }, // sender display name
//   message:     { type: String, required: true  }, // notification body
//   profile:     { type: String, default: null   }, // sender avatar S3 key
//   authorEmail: { type: String, required: true  }, // sender email
//   url:         { type: String, required: true  }, // navigation target

//   timestamp:   { type: Date, default: Date.now },
// });

// // ── URL builders ─────────────────────────────────────────────────────────────
// // Use these wherever you create a notification to keep URLs consistent.
// // Import alongside NOTIFICATION_TYPES.
// const buildNotificationUrl = {
//   discussionCreated:  (communityId)               => `/techCommunityDetails/${communityId}?tab=discussions`,
//   discussionThread:   (communityId, discussionId) => `/discussion/${communityId}/${discussionId}`,
//   post:               (authorEmail, postId)       => `/viewpage/${authorEmail}/${postId}`,
//   announcement:       ()                          => `/announcement`,
//   playlist:           (playlistId)                => `/viewplaylist/${playlistId}`,
//   profile:            ()                          => `/profile`,
// };

// const Notification = mongoose.model("Notification", notificationSchema);
// module.exports = { Notification, notificationSchema, NOTIFICATION_TYPES, buildNotificationUrl };



const mongoose = require("mongoose");

// ── Notification type constants ───────────────────────────────────────────────
// Import NOTIFICATION_TYPES wherever you create a notification so there
// are no magic strings scattered across controllers.
//
// Events reuse the existing types (no new types needed):
//   team invite received      → COLLAB
//   submission made           → POST_CREATED   (the submission is a Post)
//   event cancelled           → ANNOUNCEMENT
//   results published         → ANNOUNCEMENT
//   winning team (place)      → ACHIEVEMENT
const NOTIFICATION_TYPES = {
  DISCUSSION_CREATED:  "discussion-created",
  POST_CREATED:        "post-created",
  POST_ENGAGED:        "post-engaged",
  DISCUSSION_ENGAGED:  "discussion-engaged",
  ANNOUNCEMENT:        "announcement",
  DISCUSSION_REPLY:    "discussion-reply",
  DISCUSSION_ANSWER:   "discussion-answer",
  ACHIEVEMENT:         "achievement",
  COLLAB:              "collab",
  SYSTEM:              "system",
};

const notificationSchema = new mongoose.Schema({
  // ── type ────────────────────────────────────────────────────────────────────
  type: {
    type:    String,
    enum:    Object.values(NOTIFICATION_TYPES),
    default: NOTIFICATION_TYPES.SYSTEM, // legacy / unclassified notifications
    required: false,
  },

  // ── references (all optional — set whichever apply to the type) ────────────
  postId:       { type: mongoose.Schema.Types.ObjectId, ref: "Post",         default: null },
  communityId:  { type: mongoose.Schema.Types.ObjectId, ref: "Community",    default: null },
  discussionId: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion",   default: null },
  playlistId:   { type: mongoose.Schema.Types.ObjectId, ref: "TutorPlayList", default: null },
  eventId:      { type: mongoose.Schema.Types.ObjectId, ref: "Event",         default: null },

  // ── display fields ────────────────────────────────────────────────────────
  user:        { type: String, required: true  }, // sender display name
  message:     { type: String, required: true  }, // notification body
  profile:     { type: String, default: null   }, // sender avatar S3 key
  authorEmail: { type: String, required: true  }, // sender email
  url:         { type: String, required: true  }, // navigation target

  timestamp:   { type: Date, default: Date.now },
});

// Lets cancelling or deleting an event remove its notifications in one query.
notificationSchema.index({ eventId: 1 }, { sparse: true });

// ── URL builders ─────────────────────────────────────────────────────────────
// Use these wherever you create a notification to keep URLs consistent.
// Import alongside NOTIFICATION_TYPES.
const buildNotificationUrl = {
  discussionCreated:  (communityId)               => `/techCommunityDetails/${communityId}?tab=discussions`,
  discussionThread:   (communityId, discussionId) => `/discussion/${communityId}/${discussionId}`,
  post:               (authorEmail, postId)       => `/viewpage/${authorEmail}/${postId}`,
  announcement:       ()                          => `/announcement`,
  playlist:           (playlistId)                => `/viewplaylist/${playlistId}`,
  profile:            ()                          => `/profile`,
  event:              (eventId)                   => `/events/${eventId}`,
  eventTeam:          (eventId)                   => `/events/${eventId}/team`,
  eventResults:       (eventId)                   => `/events/${eventId}/results`,
};

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = { Notification, notificationSchema, NOTIFICATION_TYPES, buildNotificationUrl };