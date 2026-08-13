
import React from "react";

const DiscussionDetailSkeleton = () => {
  return (
    <div className="relative theme border border-[#1e293b] rounded-2xl overflow-hidden mb-4">
      {/* shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div
          className="
            absolute inset-y-0 -left-full w-full
            bg-gradient-to-r
            from-transparent
            via-white/[0.035]
            to-transparent
            animate-[discussionSkeletonShimmer_1.8s_infinite]
          "
        />
      </div>

      {/* Pinned banner */}
      <div className="flex items-center gap-2 px-5 py-2 bg-emerald-500/5 border-b border-emerald-500/10">
        <div className="w-3 h-3 rounded bg-emerald-500/10" />
        <div className="h-3 w-28 rounded bg-emerald-500/10" />
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Upvote */}
          <div className="flex-shrink-0 pt-1 flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded bg-white/[0.07]" />
            <div className="w-7 h-3 rounded bg-white/[0.07]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title + menu */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="space-y-2 flex-1">
                <div className="h-5 md:h-6 rounded bg-white/[0.09] w-[85%] max-w-[650px]" />

                {/* Mobile second line */}
                <div className="h-5 md:hidden rounded bg-white/[0.07] w-[55%]" />
              </div>

              {/* Overflow menu */}
              <div className="w-7 h-7 rounded-md bg-white/[0.06] shrink-0" />
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <div className="h-4 w-16 rounded bg-white/[0.08]" />

              <div className="h-4 w-14 rounded bg-green-500/[0.08]" />

              <div className="h-4 w-12 rounded bg-white/[0.06]" />

              <div className="h-4 w-16 rounded bg-white/[0.06]" />
            </div>

            {/* Author + linked post */}
            <div className="mb-4 flex items-center gap-2 justify-between">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/[0.08] shrink-0" />

                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-white/[0.08]" />
                  <div className="h-2.5 w-16 rounded bg-white/[0.05]" />
                </div>
              </div>

              {/* Linked post thumbnail */}
              <div className="w-12 h-9 rounded-lg bg-white/[0.07] border border-emerald-700/20 shrink-0" />
            </div>

            {/* Discussion body */}
            <div className="space-y-2.5">
              <div className="h-3.5 rounded bg-white/[0.08] w-full" />

              <div className="h-3.5 rounded bg-white/[0.08] w-[95%]" />

              <div className="h-3.5 rounded bg-white/[0.08] w-[88%]" />

              <div className="h-3.5 rounded bg-white/[0.08] w-[70%]" />
            </div>

            {/* Footer stats */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
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
      </div>

      <style>{`
        @keyframes discussionSkeletonShimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};

export default DiscussionDetailSkeleton;