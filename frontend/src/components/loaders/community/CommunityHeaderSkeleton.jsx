const CommunityHeaderSkeleton = () => {
  return (
    <div className="relative px-5 p-3.5 md:pt-4 md:pb-5 animate-pulse">
      {/* Top badges */}
      <div className="absolute top-4 right-12 h-6 w-20 rounded-full bg-white/15" />

      <div className="absolute top-4 right-2 h-6 w-12 rounded-full bg-white/10" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/15 shrink-0" />

        <div className="flex-1">
          <div className="h-6 md:h-7 w-48 rounded bg-white/15 mb-2" />

          <div className="h-3 w-36 rounded bg-white/10" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mt-3 mb-4">
        <div className="h-3 rounded bg-white/10 w-full" />
        <div className="h-3 rounded bg-white/10 w-11/12" />
        <div className="h-3 rounded bg-white/10 w-8/12" />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded-full bg-white/10" />
            <div className="h-3 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityHeaderSkeleton;