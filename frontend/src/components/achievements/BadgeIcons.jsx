import React from "react";
import impactCreatorBronze from "../../assets/achievements/impact_creator_bronze.png";
import impactCreatorSilver from "../../assets/achievements/impact_creator_silver.png";
import impactCreatorGold from "../../assets/achievements/impact_creator_gold.png";

import strongPublisherBronze from "../../assets/achievements/strong_publisher_bronze.png";
import strongPublisherSilver from "../../assets/achievements/strong_publisher_silver.png";
import strongPublisherGold from "../../assets/achievements/strong_publisher_gold.png";

import communityBuilderBronze from "../../assets/achievements/community_builder_bronze.png";
import communityBuilderSilver from "../../assets/achievements/community_builder_silver.png";
import communityBuilderGold from "../../assets/achievements/community_builder_gold.png";

import proContributorBronze from "../../assets/achievements/pro_contributor_bronze.png";
import proContributorSilver from "../../assets/achievements/pro_contributor_silver.png";
import proContributorGold from "../../assets/achievements/pro_contributor_gold.png";

import collaboratorBronze from "../../assets/achievements/collaborator_bronze.png";
import collaboratorSilver from "../../assets/achievements/collaborator_silver.png";

import { twMerge } from "tailwind-merge";
import clsx from "clsx";

const impactCreatorImages = {
  bronze: impactCreatorBronze,
  silver: impactCreatorSilver,
  gold: impactCreatorGold,
};

const strongPublisherImages = {
  bronze: strongPublisherBronze,
  silver: strongPublisherSilver,
  gold: strongPublisherGold,
};

const communityBuilderImages = {
  bronze: communityBuilderBronze,
  silver: communityBuilderSilver,
  gold: communityBuilderGold,
};

const proContributorImages = {
  bronze: proContributorBronze,
  silver: proContributorSilver,
  gold: proContributorGold,
};

const collaboratorImages = {
  bronze: collaboratorSilver,
  silver: collaboratorSilver,
  gold: proContributorBronze,
};

// ── Badge metadata ────────────────────────────────────────────


function BadgeIcons({ badges = [], parentClass="", shieldClassName="" }) {

    const TIER_CONFIG = {
  bronze: {
    label: "Bronze",
    ring: "ring-amber-700/60",
    bg: "bg-amber-950/40",
    glow: "shadow-[0_0_18px_2px_rgba(180,83,9,0.35)]",
    dot: "bg-amber-600",
    text: "text-amber-400",
    border: "border-amber-800/50",
    shimmer: "from-amber-900/0 via-amber-700/20 to-amber-900/0",
  },
  silver: {
    label: "Silver",
    ring: "ring-slate-400/60",
    bg: "bg-slate-800/40",
    glow: "shadow-[0_0_18px_2px_rgba(148,163,184,0.3)]",
    dot: "bg-slate-400",
    text: "text-slate-300",
    border: "border-slate-600/50",
    shimmer: "from-slate-800/0 via-slate-500/20 to-slate-800/0",
  },
  gold: {
    label: "Gold",
    ring: "ring-yellow-400/70",
    bg: "bg-yellow-950/40",
    glow: "shadow-[0_0_22px_4px_rgba(234,179,8,0.4)]",
    dot: "bg-yellow-400",
    text: "text-yellow-300",
    border: "border-yellow-700/50",
    shimmer: "from-yellow-900/0 via-yellow-400/25 to-yellow-900/0",
  },
};

const BADGE_META = {
  impact_creator: {
    label: "Impact Creator",
    desc: "Your posts resonated with the community.",
    icon: (tier) => (
     
      <img
        src={impactCreatorImages[tier]}
        alt="Impact Creator Badge"
        className="w-full h-full object-cover rounded-full"
        draggable={false}
      />
    ),
  },
  strong_publisher: {
    label: "Strong Publisher",
    desc: "Consistent contributor to the platform.",
    icon: (tier) => (
     
      <img
        src={strongPublisherImages[tier]}
        alt="Impact Creator Badge"
        className="w-full h-full object-cover rounded-full"
        draggable={false}
      />
    ),
  },
  collaborator: {
    label: "Collaborator",
    desc: "Active collaborator on community playlists.",
    icon: (tier) => (
  
      <img
        src={collaboratorImages[tier]}
        alt="Impact Creator Badge"
        className="w-full h-full object-cover rounded-full"
        draggable={false}
      />
    ),
  },
  pro_contributor: {
    label: "Pro Contributor",
    desc: "Your content reaches a wide audience.",
    icon: (tier) => (
      
      <img
        src={proContributorImages[tier]}
        alt="Impact Creator Badge"
        className="w-full h-full object-cover rounded-full"
        draggable={false}
      />
    ),
  },
  community_builder: {
    label: "Community Builder",
    desc: "Building a strong following on the platform.",
    icon: (tier) => (
      
      <img
        src={communityBuilderImages[tier]}
        alt="Impact Creator Badge"
        className="w-full h-full object-cover rounded-full"
        draggable={false}
      />
    ),
  },
};



  return (
   
      <div
        onClick={() => {
        //   setSelected(null);
        //   if (badges.length > 1) {
        //     setSelected(null);
        //     setShowAll(!showAll);
        //   }
        }}
        // className="flex absolute right-2 top-4 cursor-pointer max-w-40 md:max-w-xl flex-wrap -space-x-2.5"
                 className={twMerge(
        clsx(
          `
       flex absolute right-2 top-4 cursor-pointer max-w-40 md:max-w-xl flex-wrap -space-x-2.5
          `,
          parentClass
        )
      )}
      >
        {badges.slice(0, 4).map((b, i) => {
          const t = TIER_CONFIG[b.currentTier];
          return (
            <div
              key={i}
              // className={`w-6 h-6 rounded-full flex items-center justify-center`}
                className={twMerge(
        clsx(
          `
       w-6 h-6 rounded-full flex items-center justify-center
          `,
          shieldClassName
        )
      )}
              style={{ zIndex: 10 - i }}
            >
              <div className="w-full h-full">
                {BADGE_META[b.badgeId]?.icon(b.currentTier)}
              </div>
            </div>
          );
        })}

        {badges.length > 4 && (
          <div className="w-6 h-6 rounded-full ring-2 ring-gray-900 bg-gray-700 flex items-center justify-center text-[9px] text-gray-300 font-bold">
            +{badges.length - 4}
          </div>
        )}
      </div>
  );
}

export default BadgeIcons;
