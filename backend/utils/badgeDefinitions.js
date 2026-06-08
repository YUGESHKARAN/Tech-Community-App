
// badgeDefinitions.js
const BADGE_DEFINITIONS = {
  impact_creator: {
    label:       "Impact Creator",
    description: "Your posts resonated with the community.",
    thresholds: {
      bronze: { value: 100,  eventType: 'like_milestone' },
      silver: { value: 500,  eventType: 'like_milestone' },
      gold:   { value: 1000, eventType: 'like_milestone' },
    },
  },

  strong_publisher: {
    label:       "Strong Publisher",
    description: "Consistent contributor to the platform.",
    thresholds: {
      bronze: { value: 5,  eventType: 'post_milestone' },
      silver: { value: 20, eventType: 'post_milestone' },
      gold:   { value: 50, eventType: 'post_milestone' },
    },
  },

  collaborator: {
    label:       "Collaborator",
    description: "Active collaborator on community playlists.",
    thresholds: {
      bronze: { value: 1,  eventType: 'collab_milestone' },
      silver: { value: 10, eventType: 'collab_milestone' },
      gold:   { value: 25, eventType: 'collab_milestone' },
    },
  },

  pro_contributor: {
    label:       "Pro Contributor",
    description: "Your content reaches a wide audience.",
    thresholds: {
      bronze: { value: 500,  eventType: 'view_milestone' },
      silver: { value: 2000, eventType: 'view_milestone' },
      gold:   { value: 5000, eventType: 'view_milestone' },
    },
  },

  community_builder: {
    label:       "Community Builder",
    description: "Building a strong following on the platform.",
    thresholds: {
      bronze: { value: 10,  eventType: 'follower_milestone' },
      silver: { value: 50,  eventType: 'follower_milestone' },
      gold:   { value: 100, eventType: 'follower_milestone' },
    },
  },
};

const TIER_ORDER = ['bronze', 'silver', 'gold'];

module.exports = { BADGE_DEFINITIONS, TIER_ORDER };