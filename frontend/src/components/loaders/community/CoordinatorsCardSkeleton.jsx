export const CoordinatorsCardSkeleton = () => {
  return (
    <div className="theme border border-[#1e293b] rounded-xl md:rounded-2xl overflow-hidden animate-pulse">
      {/* Header / Banner */}
      <div className="pt-5 pb-10 md:pb-9 px-4 relative bg-white/[0.03] border-b border-emerald-500/20">
        {/* Coordinator badge */}
        <div className="absolute top-3 right-3 h-4 md:h-5 w-20 md:w-24 rounded-full bg-slate-700/70" />
      </div>

      {/* Content */}
      <div className="block px-4">
        {/* Avatar */}
        <div className="relative -mt-8 mb-2 flex justify-center">
          <div className="md:w-16 w-14 h-14 md:h-16 rounded-full border-[3px] border-[#0f172a] bg-slate-700" />
        </div>

        {/* Name + Email */}
        <div className="text-center mb-2 flex flex-col items-center gap-1.5">
          <div className="h-3.5 w-28 rounded bg-slate-700" />
          <div className="h-2.5 w-36 rounded bg-slate-700/70" />
        </div>

        {/* Badges */}
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full bg-slate-700"
              />
            ))}
          </div>
        </div>

        {/* Stats + Joined */}
        <div className="flex flex-col gap-1 mb-3 items-center">
          {/* Stats */}
          <div className="flex justify-center gap-4 text-[10px] pt-1 border-t border-white/5 w-full">
            {/* Posts */}
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-5 rounded bg-slate-700" />
              <div className="h-2.5 w-7 rounded bg-slate-700/70" />
            </div>

            {/* Followers */}
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-6 rounded bg-slate-700" />
              <div className="h-2.5 w-10 rounded bg-slate-700/70" />
            </div>
          </div>

          {/* Joined */}
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2.5 h-2.5 rounded bg-slate-700" />
            <div className="h-2.5 w-24 rounded bg-slate-700/70" />
          </div>
        </div>
      </div>
    </div>
  );
};