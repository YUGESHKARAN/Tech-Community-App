const TutorPlaylistCardSkeleton = () => {
  return (
    <div className="relative w-full mt-4 max-w-sm animate-pulse">
      {/* STACK LAYER 3 */}
      <div className="absolute bottom-2 left-3 w-[95%] h-full bg-zinc-700 rounded-xl z-0" />

      {/* STACK LAYER 2 */}
      <div className="absolute bottom-1 left-1.5 w-[97%] h-full bg-zinc-800 rounded-xl z-10" />

      {/* MAIN CARD */}
      <div className="relative z-20 bg-zinc-900 rounded-xl overflow-hidden shadow-xl">
        
        {/* Thumbnail */}
        <div className="h-24 md:h-28 bg-zinc-700" />

        {/* Content */}
        <div className="md:p-4 p-2 space-y-3">
          
          {/* Title */}
          <div className="h-4 w-3/4 bg-zinc-700 rounded" />

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 bg-zinc-700 rounded" />
            <div className="h-5 w-5 bg-zinc-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TutorPlaylistGridSkeleton = () => {
  return (
    <div
      className="
        flex gap-6 overflow-x-auto pb-4
        sm:grid sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-5
        sm:overflow-visible
      "
    >
      {[...Array(5)].map((_, index) => (
        <div key={index} className="min-w-[200px] sm:min-w-0">
          <TutorPlaylistCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default TutorPlaylistGridSkeleton
