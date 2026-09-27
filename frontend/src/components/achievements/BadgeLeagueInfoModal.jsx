import { useState } from "react";
import { X, Info, Trophy, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { BADGE_DEFINITIONS, TIER_ORDER } from "../../utils/Badgeleaguedefinitions";

// Reuse the same three-tier art as the achievements section / league board.
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
import collaboratorGold from "../../assets/achievements/collaborator_gold.png";

import bytesBrainBronze from "../../assets/achievements/bytes_brain_bronze.png";
import bytesBrainSilver from "../../assets/achievements/bytes_brain_silver.png";
import bytesBrainGold from "../../assets/achievements/bytes_brain_gold.png";
import { GrTrophy } from "react-icons/gr";

const BADGE_IMAGES = {
  impact_creator: { bronze: impactCreatorBronze, silver: impactCreatorSilver, gold: impactCreatorGold },
  strong_publisher: { bronze: strongPublisherBronze, silver: strongPublisherSilver, gold: strongPublisherGold },
  collaborator: { bronze: collaboratorBronze, silver: collaboratorSilver, gold: collaboratorGold },
  pro_contributor: { bronze: proContributorBronze, silver: proContributorSilver, gold: proContributorGold },
  community_builder: { bronze: communityBuilderBronze, silver: communityBuilderSilver, gold: communityBuilderGold },
  bytes_brain: { bronze: bytesBrainBronze, silver: bytesBrainSilver, gold: bytesBrainGold },
};

// ── Tier styling — kept, just scaled down for a compact card ────
const TIER_CONFIG = {
  bronze: {
    label: "Bronze",
    ring: "ring-1 ring-amber-600/50",
    glow: "shadow-[0_0_8px_0px_rgba(180,83,9,0.3)]",
    text: "text-amber-400",
    platform: "bg-gradient-to-b from-amber-600/45 to-amber-950/10 border-x border-t border-amber-500/25",
    size: "w-7 h-7",
    platformHeight: "h-1.5",
  },
  silver: {
    label: "Silver",
    ring: "ring-1 ring-slate-300/50",
    glow: "shadow-[0_0_8px_0px_rgba(148,163,184,0.25)]",
    text: "text-slate-200",
    platform: "bg-gradient-to-b from-slate-400/45 to-slate-900/10 border-x border-t border-slate-300/25",
    size: "w-9 h-9",
    platformHeight: "h-3",
  },
  gold: {
    label: "Gold",
    ring: "ring-1 ring-yellow-400/60",
    glow: "shadow-[0_0_10px_1px_rgba(234,179,8,0.35)]",
    text: "text-yellow-300",
    platform: "bg-gradient-to-b from-yellow-500/45 to-yellow-950/10 border-x border-t border-yellow-400/30",
    size: "w-11 h-11",
    platformHeight: "h-5",
  },
};

function formatNumber(n) {
  return Number(n ?? 0).toLocaleString();
}

// ── The button that opens the modal — drop this next to the
//    "Achievements" heading in AchievementSection.jsx ──────────
export function BadgeInfoTrigger({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="How badges work"
      className="
        w-6 h-6 shrink-0 rounded-full flex items-center justify-center
        text-gray-500 hover:text-emerald-400
        bg-white/[0.03] border border-white/[0.08]
        hover:bg-white/[0.06] hover:border-emerald-500/25
        transition-colors duration-200
      "
    >
      <Info size={13} />
    </button>
  );
}

// ── One badge's reference card: compact — name, one-line description,
//    and a small ascending podium with the raw count per tier ──────
function BadgeReferenceCard({ badgeId }) {
  const def = BADGE_DEFINITIONS[badgeId];
  const images = BADGE_IMAGES[badgeId];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.01] p-3">
      <p className="text-xs md:text-[13px] tracking-wide font-semibold text-white/95 uppercase truncate">{def.label}</p>
      
      <div className="flex items-start gap-1 mt-0.5">
       
        <p
          className={`text-[9px] md:text-[11px] text-gray-500 md:text-gray-400 flex-1 leading-snug ${
            expanded ? "" : "truncate"
          }`}
        >
          {def.description}
        </p>

        
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "Show less" : "Show full description"}
          aria-expanded={expanded}
          className="shrink-0 mt-0.5 text-gray-600 hover:text-gray-400 transition-colors"
        >
          <ChevronDown
            size={10}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
       


      <div className="flex items-end justify-center gap-3 mt-3">
        {TIER_ORDER.map((tier) => {
          const tc = TIER_CONFIG[tier];
          return (
            <div key={tier} className="flex flex-col items-center gap-1 w-10">
              <div className={`${tc.size} rounded-full ${tc.ring} ${tc.glow} shrink-0`}>
                <img
                  src={images[tier]}
                  alt={`${def.label} — ${tc.label} badge`}
                  draggable={false}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className={`text-[9px] font-bold ${tc.text}`}>
                {formatNumber(def.thresholds[tier].value)}+
              </span>
              <div className={`w-full ${tc.platformHeight} rounded-t-sm ${tc.platform}`} />
              
            </div>
          );
        })}
        
      </div>
      <p className="text-[9px] text-center font-semibold text-yellow-500 tracking-wide uppercase mt-1.5"><span className="">{def.unit}</span></p>
    </div>
  );
}

// ── Main export: the modal itself ───────────────────────────────
// Pure reference — takes no props about the current user. Every badge,
// every tier, and the fixed count needed to unlock it, same for everyone.
export default function BadgeLeagueInfoModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="
              relative w-full sm:max-w-xl lg:max-w-2xl max-h-[85vh] overflow-y-auto bblm-scroll
              rounded-xl border border-white/[0.09] bg-[#0a0d16]
              shadow-[0_24px_70px_-20px_rgba(0,0,0,0.65)]
            "
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 py-1   border-b border-white/[0.07] bg-[#0a0d16]/95 backdrop-blur-sm">
              <div className="flex justify-start items-center gap-2.5">
                <GrTrophy className="text-yellow-500 text-lg md:text-xl shrink-0" />
                <div className="flex flex-col pt-2.5 items-start">
                  <div className="text-white flex flex-col items-start">
                   <h1 className="md:text-2xl  text-xl tracking-wide uppercase font-bold text-emerald-500">Bytes Base</h1>
                   <span className="md:text-sm text-[14px] tracking-wide uppercase font-semibold ">League Levels</span>
                  </div>

                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="
                  w-7 h-7 shrink-0 rounded-full flex items-center justify-center
                  text-gray-500 hover:text-white hover:bg-white/[0.06]
                  transition-colors duration-200
                "
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.keys(BADGE_DEFINITIONS).map((badgeId) => (
                <BadgeReferenceCard key={badgeId} badgeId={badgeId} />
              ))}
            </div>
          </motion.div>

          <style>{`
            .bblm-scroll::-webkit-scrollbar { width: 6px; }
            .bblm-scroll::-webkit-scrollbar-track { background: transparent; }
            .bblm-scroll::-webkit-scrollbar-thumb {
              background: rgba(255,255,255,0.1);
              border-radius: 999px;
            }
            .bblm-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(255,255,255,0.18);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}