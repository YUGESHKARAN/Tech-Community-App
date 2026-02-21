import PlaylistPostSkeleton from "./PlaylistPostSkeleton";

const PlaylistDetailSkeleton = () => {
  return (
    <div className="grid w-full md:w-11/12 mx-auto md:h-screen grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* LEFT PANEL */}
      <div className="lg:col-span-1 p-2 md:p-0 space-y-4 animate-pulse">
        
        {/* Banner */}
        <div className="w-full h-72 md:h-96 bg-gray-800 rounded-xl border border-gray-700" />

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
      <div className="lg:col-span-1 space-y-4 mt-4 md:mt-0">
        {[...Array(4)].map((_, index) => (
          <PlaylistPostSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export default PlaylistDetailSkeleton;