const CoordinatorGridSkeleton = () => {
  return (
    <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-2 md:gap-4 animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div 
        key={index}
        className="theme border border-[#1e293b] rounded-xl md:rounded-2xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="pt-5 pb-10 md:pb-9 px-4 relative bg-white/[0.03] border-b border-emerald-500/20">
        <div className="absolute top-3 right-3 md:w-16 w-12 h-3 md:h-5 rounded-full bg-gray-700/60" />
      </div>

      {/* Avatar */}
      <div className="px-4">
        <div className="relative -mt-8 mb-2 flex justify-center">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-700 border-[3px] border-[#0f172a]" />
        </div>

        {/* Name */}
        <div className="text-center mb-3">
          <div className="h-4 w-32 mx-auto rounded bg-gray-700 mb-2" />
          <div className="h-3 36 md:w-40 mx-auto rounded bg-gray-800" />
        </div>

        {/* Badges */}
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-gray-700"
            />
          ))}
        </div>

        {/* Domain Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-2 md:mb-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="md:h-5 h-3 w-20 rounded-full bg-gray-700"
            />
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 pt-2 border-t border-white/5 mb-3 md:mb-4">
          <div className="h-3 w-16 rounded bg-gray-700" />
          <div className="h-3 w-16 rounded bg-gray-700" />
        </div>
      </div>

      {/* Follow Button */}
      <div className="px-4 pb-4">
        <div className="h-7 w-full rounded-xl bg-gray-700" />
      </div>
    </div>
      ))}
    </div>
  );
};

export default CoordinatorGridSkeleton
