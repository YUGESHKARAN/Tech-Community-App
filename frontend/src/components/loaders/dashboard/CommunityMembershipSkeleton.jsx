const CommunityMembershipSkeleton = () => {
  return (
    <div className="bg-[#0f172a] flex flex-col justify-between  overflow-hidden relative items-start border border-[#1e293b] rounded-xl p-4 animate-pulse">
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />

      {/* Header */}
      <div className="w-full">
        <div className="h-4 w-40 bg-gray-700/50 rounded mb-2" />

        {/* Legend */}
        <div className="flex gap-4 mt-1 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600/60" />
            <div className="h-3 w-20 bg-gray-700/40 rounded" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600/60" />
            <div className="h-3 w-16 bg-gray-700/40 rounded" />
          </div>
        </div>
      </div>

      {/* Bars */}
      <div className="flex flex-col w-full h-52 pr-4 overflow-y-auto gap-3">
        {Array.from({ length: 6 }).map((_, i) => {
          const leftWidth = Math.random() * 60 + 20; // realistic split
          const rightWidth = 100 - leftWidth;

          return (
            <div key={i} className="flex items-center gap-2">
              {/* Category label */}
              <div className="h-3 w-24 bg-gray-700/40 rounded" />

              {/* Progress bar */}
              <div className="flex-1 h-4 bg-[#1e293b] rounded-full overflow-hidden flex">
                {/* Coordinators */}
                <div
                  className="h-full bg-gray-600/50"
                  style={{ width: `${leftWidth}%` }}
                />

                {/* Students */}
                <div
                  className="h-full bg-gray-700/40"
                  style={{ width: `${rightWidth}%` }}
                />
              </div>

              {/* Total count */}
              <div className="h-3 w-6 bg-gray-700/40 rounded" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityMembershipSkeleton;
