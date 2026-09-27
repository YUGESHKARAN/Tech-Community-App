// badgeLeagueDefinitions.js
// Source of truth for league thresholds + the math that turns a raw counter
// (likes, posts, views, followers, collabs, accepted answers) into a
// tier / progress-to-next-tier / repeat-count, the way Clash of Clans turns
// trophies into a league + stars-to-next-league.

export const TIER_ORDER = ["bronze", "silver", "gold"];

export const BADGE_DEFINITIONS = {
  impact_creator: {
    label: "Impact Creator",
    description: "Your posts resonated with the community.",
    unit: "likes",
    thresholds: {
      bronze: { value: 100, eventType: "like_milestone" },
      silver: { value: 500, eventType: "like_milestone" },
      gold: { value: 1000, eventType: "like_milestone" },
    },
  },

  strong_publisher: {
    label: "Strong Publisher",
    description: "Consistent contributor to the platform.",
    unit: "posts",
    thresholds: {
      bronze: { value: 5, eventType: "post_milestone" },
      silver: { value: 20, eventType: "post_milestone" },
      gold: { value: 50, eventType: "post_milestone" },
    },
  },

  collaborator: {
    label: "Collaborator",
    description: "Active collaborator on community playlists.",
    unit: "collabs",
    thresholds: {
      bronze: { value: 1, eventType: "collab_milestone" },
      silver: { value: 10, eventType: "collab_milestone" },
      gold: { value: 25, eventType: "collab_milestone" },
    },
  },

  pro_contributor: {
    label: "Pro Contributor",
    description: "Your content reaches a wide audience.",
    unit: "views",
    thresholds: {
      bronze: { value: 500, eventType: "view_milestone" },
      silver: { value: 2000, eventType: "view_milestone" },
      gold: { value: 5000, eventType: "view_milestone" },
    },
  },

  community_builder: {
    label: "Community Builder",
    description: "Building a strong following on the platform.",
    unit: "followers",
    thresholds: {
      bronze: { value: 10, eventType: "follower_milestone" },
      silver: { value: 50, eventType: "follower_milestone" },
      gold: { value: 100, eventType: "follower_milestone" },
    },
  },

  bytes_brain: {
    label: "Bytes Brain",
    description:
      "Celebrating contributors whose accepted answers bring valuable solutions to the community.",
    unit: "accepted answers",
    thresholds: {
      bronze: { value: 1, eventType: "answer_milestone" },
      silver: { value: 10, eventType: "answer_milestone" },
      gold: { value: 50, eventType: "answer_milestone" },
    },
  },
};

/**
 * Turn a raw running total into league standing.
 *
 * @param {string} badgeId  key into BADGE_DEFINITIONS
 * @param {number} value    the user's current raw counter (e.g. total likes)
 * @returns {{
 *   badgeId: string,
 *   value: number,
 *   currentTier: 'bronze' | 'silver' | 'gold' | null,
 *   count: number,          // how many times gold has been "re-earned" (CoC-style star count)
 *   nextTier: 'bronze' | 'silver' | 'gold' | null,
 *   nextThreshold: number | null,
 *   remaining: number | null,
 *   floor: number,          // value the current segment started counting from
 *   ceiling: number | null, // value the current segment finishes at (null once maxed)
 *   progressPercent: number // 0-100 within the current segment
 * } | null}
 */
export function getBadgeProgress(badgeId, value = 0) {
  const def = BADGE_DEFINITIONS[badgeId];
  if (!def) return null;

  const { thresholds } = def;
  const safeValue = Math.max(0, Number(value) || 0);

  let currentTier = null;
  for (const tier of TIER_ORDER) {
    if (safeValue >= thresholds[tier].value) currentTier = tier;
  }

  const currentIndex = currentTier ? TIER_ORDER.indexOf(currentTier) : -1;
  const nextTier = TIER_ORDER[currentIndex + 1] ?? null;
  const nextThreshold = nextTier ? thresholds[nextTier].value : null;
  const floor = currentTier ? thresholds[currentTier].value : 0;

  // Once gold is hit, track repeats the way CoC shows "League x3" after
  // looping the same league bar multiple times.
  let count = 0;
  let progressPercent = 0;
  let ceiling = nextThreshold;
  let remaining = nextThreshold != null ? Math.max(0, nextThreshold - safeValue) : null;

  if (currentTier === "gold") {
    const goldValue = thresholds.gold.value;
    count = Math.floor(safeValue / goldValue);
    const remainder = safeValue - count * goldValue;
    ceiling = (count + 1) * goldValue;
    remaining = ceiling - safeValue;
    progressPercent = (remainder / goldValue) * 100;
  } else {
    progressPercent = nextThreshold
      ? Math.min(100, ((safeValue - floor) / (nextThreshold - floor)) * 100)
      : 0;
  }

  return {
    badgeId,
    value: safeValue,
    currentTier,
    count,
    nextTier,
    nextThreshold,
    remaining,
    floor,
    ceiling,
    progressPercent,
  };
}

/**
 * Convenience for building the whole league board from a flat stats object,
 * e.g. { impact_creator: 320, strong_publisher: 12, ... }
 */
export function getAllBadgeProgress(stats = {}) {
  return Object.keys(BADGE_DEFINITIONS).map((badgeId) =>
    getBadgeProgress(badgeId, stats[badgeId] ?? 0)
  );
}