
// badgeService.js
const { Author, Post } = require("../models/blogAuthorSchema");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const { BADGE_DEFINITIONS, TIER_ORDER } = require('../utils/badgeDefinitions');

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


// const checkAndAwardBadges = async (authorEmail, badgeIds, eventContext = {}) => {
//   try {
//     const author = await Author.findOne({ email: { $eq: authorEmail } })
//       .select('badges posts followers');

//     if (!author) return;

//     // compute current stats
//   const [aggregateResult, postCount, collaboratorCount] = await Promise.all([
//   // single aggregate for both likes and views — already correct, just destructured wrong before
//   Post.aggregate([
//     { $match: { authorId: author._id } },
//     { $group: {
//         _id:        null,
//         totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
//         totalViews: { $sum: { $size: { $ifNull: ["$views", []] } } },
//     }},
//   ]),

//   Post.countDocuments({ authorId: author._id }),

//   // fix: compute collaborator count from TutorPlayList
//   TutorPlayList.countDocuments({
//     "collaborators.email": author.email,
//   }),
// ]);

// const stats = {
//   impact_creator:    aggregateResult[0]?.totalLikes || 0,
//   pro_contributor:   aggregateResult[0]?.totalViews || 0, // fix: was reading from wrong variable
//   strong_publisher:  postCount,
//   community_builder: author.followers?.length        || 0,
//   collaborator:      collaboratorCount,              // fix: was hardcoded 0
// };

//     let updated = false;

//     for (const badgeId of badgeIds) {
//       const def        = BADGE_DEFINITIONS[badgeId];
//       if (!def) continue;

//       const currentVal = stats[badgeId];
//       const existing   = author.badges.find(b => b.badgeId === badgeId);
//       const earnedTiers = existing?.history.map(h => h.tier) || [];

//       for (const tier of TIER_ORDER) {
//         if (earnedTiers.includes(tier)) continue; // already earned

//         const threshold = def.thresholds[tier];
//         if (!threshold || currentVal < threshold.value) continue;

//         // award this tier
//         const newHistoryEntry = {
//           tier,
//           awardedAt:  new Date(),
//           eventType:  threshold.eventType,
//           eventId:    eventContext.eventId    || null,
//           eventTitle: eventContext.eventTitle || null,
//           milestone:  threshold.value,
//         };

//         if (existing) {
//           // update existing badge — add tier to history, update currentTier
//           existing.history.push(newHistoryEntry);
//           existing.currentTier = tier;
//           existing.count       = (existing.count || 1) + 1;
//         } else {
//           // first badge of this type
//           author.badges.push({
//             badgeId,
//             currentTier: tier,
//             history:     [newHistoryEntry],
//             count:       1,
//           });
//         }

//         updated = true;
//         console.log(`Badge awarded: ${badgeId} ${tier} → ${authorEmail}`);
//       }
//     }

//     if (updated) {
//       await Author.updateOne(
//         { email: { $eq: authorEmail } },
//         { $set: { badges: author.badges } }
//       );
//     }
//   } catch (err) {
//     // badge award failure must never crash the calling controller
//     console.error("checkAndAwardBadges error:", err.message);
//   }
// };


// ── milestone title generator — describes the achievement ────
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
 
  try {
    const author = await Author.findOne({ email: { $eq: authorEmail } })
      .select('badges posts followers email');

    if (!author) return;

    const [aggregateResult, postCount, collaboratorCount] = await Promise.all([
      Post.aggregate([
        { $match: { authorId: author._id } },
        { $group: {
            _id:        null,
            totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
            totalViews: { $sum: { $size: { $ifNull: ["$views", []] } } },
        }},
      ]),
      Post.countDocuments({ authorId: author._id }),
      TutorPlayList.countDocuments({ "collaborators.email": author.email }),
    ]);

    const stats = {
      impact_creator:    aggregateResult[0]?.totalLikes || 0,
      pro_contributor:   aggregateResult[0]?.totalViews || 0,
      strong_publisher:  postCount,
      community_builder: author.followers?.length        || 0,
      collaborator:      collaboratorCount,
    };

    let updated = false;

    for (const badgeId of badgeIds) {
      const def = BADGE_DEFINITIONS[badgeId];
      if (!def) continue;
      

      const currentVal  = stats[badgeId];
      const existing    = author.badges.find(b => b.badgeId === badgeId);
      const earnedTiers = existing?.history.map(h => h.tier) || [];

      // fix: find only the NEXT unearned tier — not all eligible tiers
      // prevents skipping bronze→silver→gold in a single call
      // a user must hit each milestone event separately to earn each tier
      const nextTier = TIER_ORDER.find(tier => {
        if (earnedTiers.includes(tier)) return false; // already earned
        const threshold = def.thresholds[tier];
        return threshold && currentVal >= threshold.value;
      });

      if (!nextTier) continue; // no new tier earned this time

      const threshold = def.thresholds[nextTier];

      // const newHistoryEntry = {
      //   tier:       nextTier,
      //   awardedAt:  new Date(),
      //   eventType:  threshold.eventType,
      //   eventId:    eventContext.eventId    || null,
      //   eventTitle: getMilestoneTitle(badgeId, nextTier, threshold.value),
      //   milestone:  threshold.value,
      // };

      const newHistoryEntry = {
        tier:       nextTier,
        awardedAt:  new Date(),
        eventType:  threshold.eventType,
        eventId:    eventContext.eventId || null,
        // fix: descriptive milestone title instead of raw eventContext.eventTitle
        eventTitle: getMilestoneTitle(badgeId, nextTier, threshold.value),
        milestone:  threshold.value,
      };

      if (existing) {
        existing.history.push(newHistoryEntry);
        existing.currentTier = nextTier;
        // fix: count = number of tiers earned, not incremented per check
        existing.count = existing.history.length;
      } else {
        author.badges.push({
          badgeId,
          currentTier: nextTier,
          history:     [newHistoryEntry],
          count:       1,
        });
      }

      updated = true;
      console.log(`🏅 Badge awarded: ${badgeId} ${nextTier} → ${authorEmail} (${currentVal} ${threshold.eventType})`);
    }

    if (updated) {
      await Author.updateOne(
        { email: { $eq: authorEmail } },
        { $set: { badges: author.badges } }
      );
    }
  } catch (err) {
    console.error("checkAndAwardBadges error:", err.message);
  }
};




module.exports = { checkAndAwardBadges };