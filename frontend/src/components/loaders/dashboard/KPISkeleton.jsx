
const KPISkeleton = () => {
    return (
   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
  {[...Array(5)].map((_, i) => (
    <div
      key={i}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 md:p-5 animate-pulse"
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />

      <div className="flex items-center justify-between gap-3">
        
        {/* Left: Icon + Text */}
        <div className="flex items-center gap-3 w-full">
          
          {/* Icon Skeleton */}
          <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10" />

          {/* Text Skeleton */}
          <div className="flex flex-col gap-1 w-full">
            <div className="h-3 w-16 md:w-24 bg-white/10 rounded" />
            <div className="h-2 w-8 md:w-16 bg-white/10 rounded" />
          </div>
        </div>

        {/* Right: Value Badge */}
        <div className="md:w-10 md:h-10 w-7 h-7 rounded-full bg-white/10 shrink-0" />
      </div>
    </div>
  ))}
</div>
    )
}

export default KPISkeleton