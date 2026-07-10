
// badgeService.js
const { Author, Post } = require("../models/blogAuthorSchema");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const { BADGE_DEFINITIONS, TIER_ORDER } = require('../utils/badgeDefinitions');

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
  };

  return titles[badgeId]?.[tier] || `Reached ${milestone}+ milestone`;
};


const checkAndAwardBadges = async (authorEmail, badgeIds, eventContext = {}) => {
  console.log(badgeIds, "called");

  try {
    const author = await Author.findOne({ email: { $eq: authorEmail } })
      .select('badges posts followers email notification');

    if (!author) return;

    const [
      [topLikedPost],
      [topViewedPost],
      postCount,
      collaboratorCount,
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
      TutorPlayList.countDocuments({ "collaborators.email": author.email }),
    ]);

    const stats = {
      impact_creator:    topLikedPost?.likeCount || 0,
      pro_contributor:   topViewedPost?.viewCount || 0,
      strong_publisher:  postCount,
      community_builder: author.followers?.length  || 0,
      collaborator:      collaboratorCount,
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
      const existing    = author.badges.find(b => b.badgeId === badgeId);
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
        message:     notificationMessage,
        url,
        postId:      resolvedContext.eventId || undefined,
        timestamp:   new Date(),
      };

      author.notification = Array.isArray(author.notification) ? author.notification : [];
      author.notification.push(newNotification);

      updated = true;
      console.log(`🏅 Badge awarded: ${badgeId} ${nextTier} → ${authorEmail} (${currentVal} ${threshold.eventType})`);
    }

    if (updated) {
      await Author.updateOne(
        { email: { $eq: authorEmail } },
        { $set: { badges: author.badges, notification: author.notification } }
      );
    }
  } catch (err) {
    console.error("checkAndAwardBadges error:", err.message);
  }
};




module.exports = { checkAndAwardBadges };