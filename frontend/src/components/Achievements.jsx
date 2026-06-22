import { useEffect, useState } from "react";
import { MdHistory } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";

import impactCreatorBronze from "../assets/achievements/impact_creator_bronze.png";
import impactCreatorSilver from "../assets/achievements/impact_creator_silver.png";
import impactCreatorGold from "../assets/achievements/impact_creator_gold.png";

import strongPublisherBronze from "../assets/achievements/strong_publisher_bronze.png";
import strongPublisherSilver from "../assets/achievements/strong_publisher_silver.png";
import strongPublisherGold from "../assets/achievements/strong_publisher_gold.png";

import communityBuilderBronze from "../assets/achievements/community_builder_bronze.png";
import communityBuilderSilver from "../assets/achievements/community_builder_silver.png";
import communityBuilderGold from "../assets/achievements/community_builder_gold.png";

import proContributorBronze from "../assets/achievements/pro_contributor_bronze.png";
import proContributorSilver from "../assets/achievements/pro_contributor_silver.png";
import proContributorGold from "../assets/achievements/pro_contributor_gold.png";

import collaboratorBronze from "../assets/achievements/collaborator_bronze.png";
import collaboratorSilver from "../assets/achievements/collaborator_silver.png";
import collaboratorGold from "../assets/achievements/collaborator_gold.png";
import { HiOutlineTrophy } from "react-icons/hi2";
import { ChevronRight } from "lucide-react";

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
  bronze: collaboratorBronze,
  silver: collaboratorSilver,
  gold: collaboratorGold,
};

// ── Badge metadata ────────────────────────────────────────────
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

// ── Single badge card ─────────────────────────────────────────
function BadgeCard({ badge, onSelect, isSelected }) {
  const meta = BADGE_META[badge.badgeId];
  const tier = TIER_CONFIG[badge.currentTier];
  const count = badge.count;

  if (!meta || !tier) return null;

  return (
    <div
      onClick={() => onSelect(isSelected ? null : badge)}
      className={`
        relative block md:w-20  cursor-pointer w-16 h-full rounded-full
        flex items-center justify-center 
        ${isSelected ? "animate-pulse-slow" : ""}
      `}
    >
      {meta.icon(badge.currentTier)}

      {isSelected && (
        <div
          className={`
          absolute inset-0 rounded-full ring-1 md:ring-4 ${tier.ring}
          opacity-50 scale-110 animate-ping-slow pointer-events-none
        `}
        />
      )}
      {count > 0 && (
        <span
          className={`
          absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5
          rounded-full ${tier.bg} ${tier.text} border ${tier.border}
        `}
        >
          ×{count}
        </span>
      )}
    </div>
  );
}

// ── History timeline drawer ───────────────────────────────────
function BadgeDrawer({ badge, onClose, showClose }) {
  if (!badge) return null;
  const meta = BADGE_META[badge.badgeId];

  return (
    <div className=" mt-2 md:mt-0 w-full md:max-w-sm rounded-2xl  overflow-hidden animate-in slide-in-from-top-2 duration-300">
      {/* header */}
      <div className="flex items-start gap-3 md:p-4 md:pb-2 p-1 border-b border-white/[0.06]">
        <div className="md:w-20 w-10 h-full shrink-0">
          {meta.icon(badge.currentTier)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{meta.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{meta.desc}</p>
        </div>
        {showClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* timeline */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">
          History
        </p>
        <div className="relative pl-4">
          {/* vertical line */}
          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-white/[0.08]" />

          <div className="space-y-6">
            {badge.history.map((entry, i) => {
              const t = TIER_CONFIG[entry.tier];
              const date = entry.awardedAt
                ? new Date(entry.awardedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <div key={i} className="relative flex gap-3 items-start">
                  {/* dot */}
                  {/* <div
                    className={`
                    absolute -left-[15px] top-1 w-3 h-3 rounded-full
                    ring-2 ring-gray-900 ${t.dot}
                    ${i === badge.history.length - 1 ? "animate-pulse" : ""}
                  `}
                  /> */}
                  <HiOutlineTrophy className={`absolute -left-[17px] top-1 w-4 h-4 
                     text-xl text-gray-500 bg-gray-900 ${i === badge.history.length - 1 ? "animate-pulse" : ""} `} />

                  <div className="flex-1 min-w-0 pl-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`
                        text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${t.bg} ${t.text} border ${t.border}
                      `}
                      >
                        {t.label}
                      </span>
                      <span className="text-[10px] text-gray-500">{date}</span>
                    </div>

                    {entry.eventTitle && (
                      <p className="text-xs text-gray-300 mt-1 leading-snug">
                        {entry.eventTitle}
                      </p>
                    )}

                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Milestone: {entry.milestone?.toLocaleString()}+
                    </p>
                  </div>
                </div>
              );
            })}

            {/* locked future tiers */}
            {["bronze", "silver", "gold"]
              .filter((t) => !badge.history.find((h) => h.tier === t))
              .map((t) => {
                const tc = TIER_CONFIG[t];
                return (
                  <div
                    key={t}
                    className="relative flex gap-3 items-start opacity-40"
                  >
                    <div className="absolute -left-[15px] top-1 w-3 h-3 rounded-full ring-2 ring-gray-900 bg-gray-700" />
                    <div className="flex-1 pl-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] flex items-center gap-1 md:text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 md:text-gray-100 text-gray-300 border border-gray-700">
                          <IoLockClosedOutline className="text-[10px] md:text-xs" />{" "}
                          {tc.label}
                        </span>
                        <span className="text-[10px] md:text-[11px] md:text-gray-100 text-gray-200">
                          locked
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyAchievements() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-gray-600">
          <path
            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-400 font-medium">No achievements yet</p>
      <p className="text-xs text-gray-600 mt-1 max-w-[200px] leading-relaxed">
        Start publishing posts and engaging with the community to earn badges.
      </p>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
// ── Main export ───────────────────────────────────────────────
export default function AchievementSection({ badges = [], achievementRef }) {
  const [selected, setSelected] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const selectedBadgeRef = useRef(null);

  const scrollToSelectedBadge = () => {
    if (!selectedBadgeRef.current) return;

    const y =
      selectedBadgeRef.current.getBoundingClientRect().top +
      window.pageYOffset -
      90;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!selected) return;

    const timer = setTimeout(() => {
      scrollToSelectedBadge();
    }, 150);

    return () => clearTimeout(timer);
  }, [selected]);

  const hasBadges = badges.length > 0;

  return (
    <div className="w-full block  shink-0 overflow-hidden">

      <div className="flex items-center justify-between px-2 md:px-5 py-4 md:border-b border-white/[0.06]">
        <div>
          <p className="text-[11px] font-medium tracking-widest uppercase text-gray-400">
            Achievements
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">
            {hasBadges
              ? `${badges.length} badge${badges.length > 1 ? "s" : ""} earned`
              : "No badges yet"}
          </p>
        </div>

        {hasBadges && badges?.length >1 && (
          <button
            onClick={() => {
              setSelected(null);
              const nextState = !showAll;

              setShowAll(nextState);

              if (nextState) {
                setTimeout(() => {
                  achievementRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 200);
              }
            }}
            className="
              group
              flex items-center gap-2
              md:px-3 md:py-2
              px-2 py-1.5
              rounded-xl
              bg-white/[0.03]
              border border-white/[0.08]
              hover:bg-white/[0.06]
              hover:border-emerald-500/20
              transition-all duration-300
              md:text-xs
              text-[10px]
            "
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              // onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Hide All" : "View All"}
            </motion.button>
            <motion.div
              animate={{
                rotate: showAll ? 90 : 0,
              }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ChevronRight size={14} />
            </motion.div>
          </button>
        )}
      </div>

      {/* content */}
      <div className=" transition-all duration-300 md:p-4">
        {!hasBadges ? (
          <EmptyAchievements />
        ) : (
          <>
            {/* badge grid */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2"> */}
            <div className="grid grid-cols-6 md:flex items-start md:w-fit flex-wrap md:gap-2 ">
              {badges.map((badge) => (
                // <BadgeCard
                //   key={badge.badgeId}
                //   badge={badge}
                //   onClick={() => {
                //     setShowAll(false);
                //   }}
                //   onSelect={setSelected}
                //   isSelected={selected?.badgeId === badge.badgeId}
                // />
                <BadgeCard
                  key={badge.badgeId}
                  badge={badge}
                  onClick={() => {
                    setShowAll(false);
                  }}
                  onSelect={(selectedBadge) => {
                    setShowAll(false);
                    setSelected(selectedBadge);

                    setTimeout(() => {
                      scrollToSelectedBadge();
                    }, 250);
                  }}
                  isSelected={selected?.badgeId === badge.badgeId}
                />
              ))}
            </div>

            {/* history drawer — slides open below grid */}
            {/* {selected && (
              <div className="flex transition-all duration-200 flex-col md:mt-4 mt-2 ">
                <p className="text-sm   md:text-sm text-gray-300 flex items-center gap-1 border-b border-neutral-700 pb-3 md:gap-2 font-semibold my-2">
                  Milestone Logs{" "}
                  <MdHistory className="text-lg text-gray-500 md:text-gray-400 font-medium" />
                </p>

                <BadgeDrawer
                  badge={selected}
                  onClose={() => {
                    setSelected(null);
                    setShowAll(false);
                  }}
                  showClose={true}
                />
              </div>
            )} */}

            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  ref={selectedBadgeRef}
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                    filter: "blur(6px)",
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                    filter: "blur(4px)",
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col md:mt-4 mt-2">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-gray-300 flex items-center gap-2 border-b border-neutral-700 pb-3 font-semibold my-2"
                    >
                      Milestone Logs
                      <MdHistory className="text-lg text-gray-500" />
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <BadgeDrawer
                        badge={selected}
                        onClose={() => {
                          setSelected(null);
                          setShowAll(false);
                        }}
                        showClose={true}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* {showAll && !selected && (
              <div className="flex flex-col transition-transform duration-800  md:mt-4 mt-2 ">
                <p className="text-sm   md:text-sm text-gray-300 flex items-center gap-1 border-b border-neutral-700 pb-3 md:gap-2 font-semibold my-2">
                 All Milestones Log{" "}
                  <MdHistory className="text-lg text-gray-500 md:text-gray-400 font-medium" />
                </p>
                <div className="xl:flex grid   items-center md:gap-4">
                  {badges.map((badge) => (
                    <BadgeDrawer
                      key={badge.badgeId}
                      badge={badge}
                      showClose={false}
                    />
                  ))}
                </div>
              </div>
            )} */}
            <AnimatePresence initial={false}>
              {showAll && !selected && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                    filter: "blur(6px)",
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                    filter: "blur(4px)",
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1], // premium easing
                  }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col md:mt-4 mt-2">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-gray-300 flex items-center gap-2 border-b border-neutral-700 pb-3 font-semibold my-2"
                    >
                      All Milestones Log
                      <MdHistory className="text-lg text-gray-500" />
                    </motion.p>

                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: {},
                        show: {
                          transition: {
                            staggerChildren: 0.05,
                          },
                        },
                      }}
                      className="xl:flex grid items-center md:gap-4"
                    >
                      {badges.map((badge) => (
                        <motion.div
                          key={badge.badgeId}
                          variants={{
                            hidden: {
                              opacity: 0,
                              y: 12,
                              scale: 0.96,
                            },
                            show: {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            },
                          }}
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <BadgeDrawer badge={badge} showClose={false} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* footer hint */}
      {hasBadges && !showAll && !selected && (
        <div className="px-5 py-3 border-t border-white/[0.04]">
          <p className="text-[10px] text-gray-600">
            Tap a badge to view history and milestone details
          </p>
        </div>
      )}

      {/* keyframe styles injected once */}
      <style>{`
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-ping-slow { animation: ping-slow 2.5s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
