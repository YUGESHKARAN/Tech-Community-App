const TutorPlaylistCardSkeleton = () => {
  return (
    <div className="relative w-full mt-7 max-w-sm animate-pulse">
      {/* STACK LAYER 3 */}
      <div className="absolute bottom-2 left-3 w-[95%] h-full bg-zinc-700 rounded-xl z-0" />

      {/* STACK LAYER 2 */}
      <div className="absolute bottom-1 left-1.5 w-[97%] h-full bg-zinc-800 rounded-xl z-10" />

      {/* MAIN CARD */}
      <div className="relative z-20 bg-gray-900 rounded-xl overflow-hidden ">
        
        {/* Thumbnail */}
        <div className=" h-48 md:h-44 rounded-xl bg-zinc-700" />

        {/* Content */}
        <div className="md:p-4 md:px-2 p-2 space-y-3">
          
          {/* Title */}
          <div className="h-4 w-3/4 bg-zinc-700 rounded" />

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            
            <div className="flex -space-x-2">
               <div className="h-6 w-6 bg-zinc-700 rounded-full" />
               <div className="h-6 w-6 bg-zinc-700 rounded-full" />
               <div className="h-6 w-6 bg-zinc-700 rounded-full" />

            </div>
              <div className="h-5 w-16 bg-zinc-700 rounded" />

           
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

const TutorPlaylistGridSkeleton = () => {
  return (
    <div
      // className="
      //   flex gap-6 overflow-x-auto pb-4
      //   sm:grid sm:grid-cols-2
      //   lg:grid-cols-3
      //   xl:grid-cols-5
      //   sm:overflow-visible
      // "
        className="
        pb-4 gap-5 md:gap-6
    grid grid-cols-1
    md:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-4
    3xl:grid-cols-5
    overflow-visible
    space-y-5
    md:space-y-0
    mt-0
    
  "
    >
      {[...Array(4)].map((_, index) => (
        <div key={index} className="min-w-[150px] sm:min-w-0">
          <TutorPlaylistCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default TutorPlaylistGridSkeleton
