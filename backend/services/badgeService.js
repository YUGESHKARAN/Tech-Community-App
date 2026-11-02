
// badgeService.js
const { Author, Post } = require("../models/blogAuthorSchema");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const DiscussionReply = require("../models/communityDiscussions/discussionsReplySchema");
const { BADGE_DEFINITIONS, TIER_ORDER } = require('../utils/badgeDefinitions');
const mongoose = require("mongoose");
const { NOTIFICATION_TYPES, buildNotificationUrl } = require("../models/services/notificationSchema")
const dotenv = require("dotenv");
dotenv.config();

/**
 * Check and award badges for a given author.
 * Call this after any action that could trigger a badge:
 *   - addPosts        → strong_publisher, pro_contributor
 *   - postLikes       → impact_creator
 *   - postView        → pro_contributor
 *   - updateFollowers → community_builder
 *   - addTutorPlayList (as collaborator) → collaborator
 *
 * @param {string} authorEmail
 * @param {string[]} badgeIds — which badge types to check
 * @param {object} eventContext — { eventId, eventTitle } for the history entry
 */

const notificationUrl = process.env.NOTIFICATION_URL || 'http://localhost:5173';
const sentEmail = process.env.EMAIL_PROVIDER || "";
const url = `${notificationUrl}/profile`;

const getMilestoneTitle = (badgeId, tier, milestone) => {
  const titles = {
    impact_creator: {
      bronze: `Reached ${milestone}+ likes across posts`,
      silver: `Reached ${milestone}+ likes across posts`,
      gold:   `Reached ${milestone}+ likes across posts`,
    },
    strong_publisher: {
      bronze: `Successfully published ${milestone}+ posts`,
      silver: `Successfully published ${milestone}+ posts`,
      gold:   `Successfully published ${milestone}+ posts`,
    },
    pro_contributor: {
      bronze: `Reached ${milestone}+ views across posts`,
      silver: `Reached ${milestone}+ views across posts`,
      gold:   `Reached ${milestone}+ views across posts`,
    },
    community_builder: {
      bronze: `Gained ${milestone}+ followers`,
      silver: `Gained ${milestone}+ followers`,
      gold:   `Gained ${milestone}+ followers`,
    },
    collaborator: {
      bronze: `Collaborated on ${milestone}+ playlists`,
      silver: `Collaborated on ${milestone}+ playlists`,
      gold:   `Collaborated on ${milestone}+ playlists`,
    },
    bytes_brain: {
      bronze: `Had ${milestone}+ accepted answers`,
      silver: `Had ${milestone}+ accepted answers`,
      gold:   `Had ${milestone}+ accepted answers`,
    },
  };

  return titles[badgeId]?.[tier] || `Reached ${milestone}+ milestone`;
};

const recalculateCollaboratorBadge = async (authorEmail, tenantId, session) => {
  const author = await Author.findOne({ email: { $eq: authorEmail }, tenantId })
    .select("badges email")
    .session(session)
    .lean();

  if (!author) return;

  const playlists = await TutorPlayList.find({
    tenantId,
    "collaborators.email": author.email,
  })
    .select("_id")
    .sort({ _id: 1 })
    .session(session)
    .lean();

  const existingBadges = author.badges || [];
  const existingBadge = existingBadges.find((badge) => badge.badgeId === "collaborator");
  const existingHistory = new Map(
    (existingBadge?.history || []).map((entry) => [entry.tier, entry]),
  );
  const thresholds = BADGE_DEFINITIONS.collaborator.thresholds;
  const history = TIER_ORDER
    .filter((tier) => playlists.length >= thresholds[tier].value)
    .map((tier) => {
      const threshold = thresholds[tier];
      return {
        tier,
        awardedAt: existingHistory.get(tier)?.awardedAt || new Date(),
        eventType: threshold.eventType,
        eventId: playlists[threshold.value - 1]._id,
        eventTitle: getMilestoneTitle("collaborator", tier, threshold.value),
        milestone: threshold.value,
      };
    });

  const badges = existingBadges.filter((badge) => badge.badgeId !== "collaborator");
  if (history.length > 0) {
    badges.push({
      badgeId: "collaborator",
      currentTier: history[history.length - 1].tier,
      history,
      count: history.length,
    });
  }

  if (JSON.stringify(existingBadges) !== JSON.stringify(badges)) {
    await Author.updateOne(
      { _id: author._id, tenantId },
      { $set: { badges } },
      { session },
    );
  }
};

const deletePlaylistsAndSyncCollaboratorBadges = async (filter) => {
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const playlists = await TutorPlayList.find(filter)
        .select("tenantId collaborators")
        .session(session)
        .lean();
      result = await TutorPlayList.deleteMany(filter, { session });

      if (!result.deletedCount) return;

      const affectedAuthors = new Map();
      for (const playlist of playlists) {
        for (const collaborator of playlist.collaborators || []) {
          const email = String(collaborator.email || "").trim();
          if (!email || !playlist.tenantId) continue;

          const key = JSON.stringify([playlist.tenantId, email.toLowerCase()]);
          affectedAuthors.set(key, { email, tenantId: playlist.tenantId });
        }
      }

      for (const { email, tenantId } of affectedAuthors.values()) {
        await recalculateCollaboratorBadge(email, tenantId, session);
      }
    });
  } finally {
    await session.endSession();
  }

  return result;
};


const checkAndAwardBadges = async (authorEmail, badgeIds, eventContext = {}) => {
  console.log(badgeIds, "called");

  try {
    const authorFilter = { email: { $eq: authorEmail } };
    if (eventContext.tenantId) authorFilter.tenantId = eventContext.tenantId;

    const author = await Author.findOne(authorFilter)
      .select('badges posts followers email notification tenantId');

    if (!author) return;

    const [
      [topLikedPost],
      [topViewedPost],
      postCount,
      collaboratorCount,
      acceptedAnswerCount,
    ] = await Promise.all([
      // fix: single post with highest likes — badge per-post not cumulative
      Post.aggregate([
        { $match: { authorId: author._id } },
        { $project: { _id: 1, title: 1, likeCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort:  { likeCount: -1 } },
        { $limit: 1 },
      ]),
      // fix: single post with highest views — badge per-post not cumulative
      Post.aggregate([
        { $match: { authorId: author._id } },
        { $project: { _id: 1, title: 1, viewCount: { $size: { $ifNull: ["$views", []] } } } },
        { $sort:  { viewCount: -1 } },
        { $limit: 1 },
      ]),
      Post.countDocuments({ authorId: author._id }),
      TutorPlayList.countDocuments({
        tenantId: author.tenantId,
        "collaborators.email": author.email,
      }),
      DiscussionReply.countDocuments({
        tenantId: author.tenantId,
        authorId: author._id,
        isAnswer: true,
      }),
    ]);

    const stats = {
      impact_creator:    topLikedPost?.likeCount || 0,
      pro_contributor:   topViewedPost?.viewCount || 0,
      strong_publisher:  postCount,
      community_builder: author.followers?.length  || 0,
      collaborator:      collaboratorCount,
      bytes_brain:       acceptedAnswerCount,
    };

    // auto-resolve eventContext for like/view badges from the top post
    const badgeEventContext = {
      impact_creator:  { eventId: topLikedPost?._id,  eventTitle: topLikedPost?.title  },
      pro_contributor: { eventId: topViewedPost?._id, eventTitle: topViewedPost?.title },
    };

    let updated = false;

    for (const badgeId of badgeIds) {
      const def = BADGE_DEFINITIONS[badgeId];
      if (!def) continue;

      const currentVal  = stats[badgeId];
      let existing      = author.badges.find(b => b.badgeId === badgeId);

      if (badgeId === "bytes_brain" && existing) {
        const eligibleTiers = TIER_ORDER.filter(
          (tier) => currentVal >= def.thresholds[tier].value,
        );
        const retainedHistory = existing.history.filter((entry) =>
          eligibleTiers.includes(entry.tier),
        );

        if (retainedHistory.length === 0) {
          author.badges = author.badges.filter((badge) => badge.badgeId !== badgeId);
          existing = null;
          updated = true;
        } else {
          const currentTier = retainedHistory[retainedHistory.length - 1].tier;
          if (
            retainedHistory.length !== existing.history.length ||
            currentTier !== existing.currentTier ||
            retainedHistory.length !== existing.count
          ) {
            existing.history = retainedHistory;
            existing.currentTier = currentTier;
            existing.count = retainedHistory.length;
            updated = true;
          }
        }
      }

      const earnedTiers = existing?.history.map(h => h.tier) || [];

      const nextTier = TIER_ORDER.find(tier => {
        if (earnedTiers.includes(tier)) return false;
        const threshold = def.thresholds[tier];
        return threshold && currentVal >= threshold.value;
      });

      if (!nextTier) continue;

      const threshold       = def.thresholds[nextTier];
      const resolvedContext = badgeEventContext[badgeId] || eventContext;

      const newHistoryEntry = {
        tier:       nextTier,
        awardedAt:  new Date(),
        eventType:  threshold.eventType,
        eventId:    resolvedContext.eventId || eventContext.eventId || null,
        eventTitle: getMilestoneTitle(badgeId, nextTier, threshold.value),
        milestone:  threshold.value,
      };

      if (existing) {
        existing.history.push(newHistoryEntry);
        existing.currentTier = nextTier;
        existing.count = existing.history.length;
      } else {
        author.badges.push({
          badgeId,
          currentTier: nextTier,
          history:     [newHistoryEntry],
          count:       1,
        });
      }

      const badgeLabel = def.label || badgeId;
      // const notificationMessage = `Congrats! You unlocked the ${nextTier} ${badgeLabel} badge for ${newHistoryEntry.eventTitle}.`;
      const notificationMessage = `Congrats! You unlocked the ${nextTier} ${badgeLabel} badge 🏆.`;
      const newNotification = {
        user:        'Achievements 🎊🎉',
        authorEmail: authorEmail,
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        message:     notificationMessage,
        url: buildNotificationUrl.profile(),
        timestamp:   new Date(),
      };

      author.notification = Array.isArray(author.notification) ? author.notification : [];
      author.notification.push(newNotification);

      updated = true;
      console.log(`🏅 Badge awarded: ${badgeId} ${nextTier} → ${authorEmail} (${currentVal} ${threshold.eventType})`);
    }

    if (updated) {
      await Author.updateOne(
        { _id: author._id, tenantId: author.tenantId },
        { $set: { badges: author.badges, notification: author.notification } }
      );
    }
  } catch (err) {
    console.error("checkAndAwardBadges error:", err.message);
  }
};




module.exports = {
  checkAndAwardBadges,
  deletePlaylistsAndSyncCollaboratorBadges,
};