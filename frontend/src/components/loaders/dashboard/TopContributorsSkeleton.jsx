
const TopContributorsSkeleton = () => {
  return (
    <div className="dashboard-theme-fields-dark overflow-hidden relative border border-[#1e293b] rounded-xl p-4 animate-pulse">
       {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-4 w-32 bg-gray-700/50 rounded mb-2" />
          <div className="h-3 w-40 bg-gray-700/40 rounded" />
        </div>

        <div className="md:h-7 h-5 w-20 bg-gray-700/50 rounded" />
      </div>

      {/* List */}
      <div className="flex overflow-y-auto scrollbar-hide h-52 flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 md:p-2 rounded-lg"
          >
            {/* Rank */}
            <div className="h-3 w-4 bg-gray-700/50 rounded" />

            {/* Avatar */}
            <div className="md:w-8 md:h-8 w-6 h-6 rounded-full bg-gray-700/50 shrink-0" />

            {/* Name + Email */}
            <div className="flex-1 space-y-1">
              <div className="h-3 w-24 bg-gray-700/50 rounded" />
              <div className="h-2 w-32 bg-gray-700/40 rounded hidden md:block" />
            </div>

            {/* Post Count */}
            <div className="h-3 w-12 bg-gray-700/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopContributorsSkeleton;