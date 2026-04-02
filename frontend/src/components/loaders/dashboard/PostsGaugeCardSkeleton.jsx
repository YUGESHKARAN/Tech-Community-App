const PostsGaugeCardSkeleton = () => {
  return (
    <div className="bg-[#0f172a]  overflow-hidden relative border border-[#1e293b] rounded-xl p-4 flex flex-col animate-pulse">
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-4 w-32 bg-gray-700/50 rounded mb-2" />
          <div className="h-3 w-40 bg-gray-700/40 rounded" />
        </div>

        <div className="h-7 w-16 bg-gray-700/50 rounded" />
      </div>

      {/* Gauge Skeleton */}
      <div className="flex justify-center">
        <div className="relative w-[180px] h-[100px] overflow-hidden">
          {/* Outer fake gauge */}
          <div className="absolute w-[180px] h-[180px] rounded-full bg-gray-700/30" />

          {/* Inner cut */}
          <div className="absolute top-[20px] left-[20px] w-[140px] h-[140px] bg-[#0f172a] rounded-full" />

          {/* Center text skeleton */}
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-6 md:mt-4 gap-2">
            <div className="h-5 w-16 bg-gray-600/50 rounded" />
            <div className="h-3 w-10 bg-gray-600/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-3 w-48 bg-gray-700/40 rounded mx-auto mt-3" />

      {/* Sparkline Skeleton */}
      <div className="flex items-end justify-between gap-2 mt-4 pt-3 border-t border-[#1e293b] h-16">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-end gap-1 flex-1"
          >
            {/* Value */}
            {/* <div className="h-2 w-5 bg-gray-600/40 rounded" /> */}

            {/* Bar */}
            <div
              className="w-2 rounded-full bg-gray-700/50"
              style={{
                height: `${Math.random() * 30 + 10}px`,
              }}
            />

            {/* Label */}
            <div className="h-2 w-6 bg-gray-700/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsGaugeCardSkeleton;
