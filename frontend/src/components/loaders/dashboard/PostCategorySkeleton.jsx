
const PostCategorySkeleton = () => {
    return (
        <div className="bg-[#0f172a] flex flex-col justify-between items-start border border-[#1e293b] rounded-xl p-4 overflow-hidden relative">

  {/* Shimmer */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />

  {/* Header */}
  <div className="mb-4 w-full">
    <div className="h-4 w-40 bg-white/10 rounded mb-2 animate-pulse" />
    <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
  </div>

  {/* Chart Skeleton */}
  <div className="flex gap-3 w-full">

    {/* Y-axis */}
    <div className="flex flex-col-reverse justify-between pb-5 shrink-0">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-2 w-6 bg-white/10 rounded animate-pulse" />
      ))}
    </div>

    {/* Bars */}
    <div className="flex-1 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        
        {/* Bars Area */}
        <div className="flex items-end justify-between h-36">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 flex justify-center items-end">
              <div
                className="w-6 rounded-t-md bg-white/10 animate-pulse"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-2 w-10 bg-white/10 rounded animate-pulse" />
          ))}
        </div>

      </div>
    </div>
  </div>
</div>
    )
}

export default PostCategorySkeleton;