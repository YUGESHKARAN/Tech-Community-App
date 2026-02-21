const PlaylistPostSkeleton = () => {
  return (
    <div className="flex gap-4 p-2 rounded-lg animate-pulse">
      {/* Thumbnail */}
      <div className="w-32 h-20 md:h-24 bg-gray-700 rounded-sm" />

      {/* Content */}
      <div className="flex flex-col w-full justify-between">
        <div className="h-4 w-3/4 bg-gray-700 rounded" />
        <div className="h-3 w-full bg-gray-700 rounded mt-2" />
        <div className="h-3 w-1/2 bg-gray-700 rounded mt-2" />

        <div className="flex justify-between items-center mt-3">
          <div className="h-3 w-16 bg-gray-700 rounded" />
          <div className="flex gap-3">
            <div className="h-4 w-4 bg-gray-700 rounded-full" />
            <div className="h-4 w-4 bg-gray-700 rounded-full" />
            <div className="h-4 w-4 bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};


export default PlaylistPostSkeleton;