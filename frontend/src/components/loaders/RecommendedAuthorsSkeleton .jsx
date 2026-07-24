const RecommendedAuthorsSkeleton = () => {
  return (
    <div className="flex w-full px-4  max-w-[1800px] px-4 md:px-12 mx-auto gap-2 overflow-x-auto scrollbar-hide mt-2 md:mt-4 md:pb-1 animate-pulse">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="w-[270px] md:w-[300px]  relative  theme border border-gray-700 rounded-xl py-2 px-4 md:p-4 animate-pulse flex-shrink-0"
        >
          {/* Recommendation Badge */}
          <div className="flex  w-full  items-center justify-between">
            <div className="w-24 h-4   rounded-full bg-gray-700/60 mb-3" />
            {/* Badges */}
            <div className="flex w-fit flex-end  gap-1  mb-3">
              <div className="w-4 h-4 rounded-full bg-gray-700" />
              <div className="w-4 h-4 rounded-full bg-gray-700" />
              <div className="w-4 h-4 rounded-full bg-gray-700" />
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gray-700 flex-shrink-0" />

            <div className="flex-1">
              <div className="h-3.5 w-32 bg-gray-700 rounded mb-2" />
              <div className="h-2.5 w-24 bg-gray-800 rounded" />
            </div>

            {/* <div className="h-4 w-6 bg-gray-700 rounded" /> */}
          </div>

          {/* Domain Tags */}
          <div className="flex w-fit m-auto flex-wrap gap-2 mb-4">
            <div className="h-4 w-20 rounded-full bg-gray-700" />
            <div className="h-4 w-16 rounded-full bg-gray-700" />
          </div>

          {/* Follow Button */}
          <div className="h-7 w-full rounded-xl bg-gray-700" />
        </div>
      ))}
    </div>
  );
};

export default RecommendedAuthorsSkeleton;
