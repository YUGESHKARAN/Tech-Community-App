import PlaylistPostSkeleton from "./PlaylistPostSkeleton";

const PlaylistDetailSkeleton = () => {
  return (
    <div className="grid w-full mx-4 mx-auto md:h-screen grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-2">
      
      {/* LEFT PANEL */}
      <div className="lg:col-span-1 p-2 md:p-0 space-y-4 animate-pulse">
        
        {/* Banner */}
        <div className="relative">
           <div
        className="absolute bottom-2 left-3 w-[95%] h-full 
        bg-zinc-600 rounded-xl border border-zinc-700 
         z-0"
      />

      {/* STACK LAYER 2 (MIDDLE) */}
      <div
        className="absolute bottom-1 left-1.5 w-[97%] h-full 
        bg-zinc-700 rounded-xl border border-zinc-800 
         z-10"
      />

      
        <div className="w-full relative md:w-[99%] h-48 z-20 md:h-80 bg-gray-800 md:rounded-2xl rounded-xl border border-gray-700" />
  </div>
        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-700 rounded" />

        {/* Contributors Row */}
        <div className="flex justify-between items-center mt-4">
          
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-gray-700" />
            <div className="h-6 w-6 rounded-full bg-gray-700" />
            <div className="h-6 w-6 rounded-full bg-gray-700" />
          </div>

          <div className="flex gap-3">
            <div className="h-5 w-12 bg-gray-700 rounded" />
            <div className="h-5 w-5 bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lg:col-span-1 space-y-4  md:mt-0">
        {[...Array(4)].map((_, index) => (
          <PlaylistPostSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export default PlaylistDetailSkeleton;