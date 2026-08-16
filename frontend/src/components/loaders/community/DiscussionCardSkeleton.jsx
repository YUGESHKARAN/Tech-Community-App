import React from "react";

const DiscussionCardSkeleton = () => {
  return (
    <div
    // key={key}
     className="relative theme border border-[#1e293b] rounded-xl px-4 py-3 overflow-hidden">
      {/* Shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-[discussionShimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.035] to-transparent pointer-events-none" />

      <div className="flex gap-3">
        {/* Upvote column */}
        <div className="flex flex-col items-center gap-1 pt-0.5 min-w-[28px]">
          <div className="w-4 h-4 rounded bg-white/[0.08]" />
          <div className="w-6 h-3 rounded bg-white/[0.08]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-start gap-2 mb-2 flex-wrap">
            <div className="h-4 rounded bg-white/[0.09] w-[65%] max-w-[420px]" />

            <div className="flex items-center gap-1">
              <div className="h-4 w-12 rounded-md bg-white/[0.07]" />
              <div className="h-4 w-14 rounded-md bg-white/[0.07]" />
            </div>
          </div>

          {/* Category / Author / Time */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="h-4 w-14 rounded-md bg-white/[0.08]" />

            <div className="h-3 w-20 rounded bg-white/[0.06]" />

            <div className="h-2 w-2 rounded-full bg-white/[0.06]" />

            <div className="h-3 w-16 rounded bg-white/[0.06]" />
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap mb-2">
            <div className="h-4 w-12 rounded-md bg-white/[0.07]" />
            <div className="h-4 w-16 rounded-md bg-white/[0.07]" />
            <div className="h-4 w-14 rounded-md bg-white/[0.07]" />
          </div>

          {/* Replies / Views */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-white/[0.06]" />
              <div className="h-3 w-16 rounded bg-white/[0.06]" />
            </div>

            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-white/[0.06]" />
              <div className="h-3 w-14 rounded bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes discussionShimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default DiscussionCardSkeleton;