const RecommendedAuthorsSkeleton = () => {
  return (
    <div className="flex w-11/12 mx-auto gap-5 overflow-x-auto scrollbar-hide mt-5 pb-2 animate-pulse">
     
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="min-w-[260px] bg-gray-900/70 border border-gray-700 rounded-xl p-4 shadow"
        >
          {/* Top Section */}
          <div className="flex items-center gap-3">
            {/* Profile Image */}
            <div className="w-12 h-12 rounded-full bg-gray-700" />

            <div className="flex-1 space-y-2">
              {/* Name */}
              <div className="h-3 w-3/4 bg-gray-700 rounded" />
              {/* Email */}
              <div className="h-2 w-1/2 bg-gray-700 rounded" />
            </div>
          </div>

          {/* Followers + Posts */}
          <div className="flex justify-between mt-4">
            <div className="h-3 w-16 bg-gray-700 rounded" />
            <div className="h-3 w-14 bg-gray-700 rounded" />
          </div>

          {/* Button */}
          <div className="mt-4">
            <div className="h-8 w-full rounded-lg bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
};


export default RecommendedAuthorsSkeleton