import React from "react";

const ReplyCardSkeleton = () => {
  return (
    <div className="relative theme border border-[#1e293b] rounded-xl p-4 overflow-hidden">
      {/* Shimmer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute inset-y-0 -left-full w-full
            bg-gradient-to-r
            from-transparent
            via-white/[0.035]
            to-transparent
            animate-[replySkeletonShimmer_1.8s_infinite]
          "
        />
      </div>

      <div className="flex gap-3">
        {/* Upvote column */}
        <div className="flex-shrink-0 pt-1 flex flex-col items-center gap-1">
          {/* Chevron */}
          <div className="w-5 h-5 rounded bg-white/[0.07]" />

          {/* Count */}
          <div className="w-6 h-3 rounded bg-white/[0.07]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author + menu */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Avatar */}
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/[0.08] shrink-0" />

              {/* Author information */}
              <div className="space-y-1.5">
                <div className="h-3 w-24 rounded bg-white/[0.08]" />
                <div className="h-2.5 w-16 rounded bg-white/[0.05]" />
              </div>

              {/* Accepted answer placeholder */}
              <div className="h-4 w-16 rounded bg-emerald-500/[0.08]" />
            </div>

            {/* Overflow menu */}
            <div className="w-7 h-7 rounded-md bg-white/[0.06] shrink-0" />
          </div>

          {/* Reply body */}
          <div className="space-y-2.5">
            <div className="h-3.5 rounded bg-white/[0.08] w-full" />

            <div className="h-3.5 rounded bg-white/[0.08] w-[94%]" />

            <div className="h-3.5 rounded bg-white/[0.08] w-[82%]" />

            <div className="h-3.5 rounded bg-white/[0.08] w-[60%]" />
          </div>

          {/* Reply action */}
          <div className="flex items-center gap-1 mt-4">
            <div className="w-3 h-3 rounded bg-white/[0.06]" />
            <div className="h-3 w-8 rounded bg-white/[0.06]" />
          </div>

          {/* Optional nested replies preview */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="border-l border-white/[0.06] pl-3">
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-white/[0.06] shrink-0" />

                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-20 rounded bg-white/[0.06]" />
                  <div className="h-3 w-[85%] rounded bg-white/[0.06]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes replySkeletonShimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};

export default ReplyCardSkeleton;