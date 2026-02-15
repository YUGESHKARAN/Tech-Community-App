const BlogSkeleton = () => {
  return (
    <div className="md:w-full col-span-full grid grid-cols-1 w-full mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 md:gap-16 mt-7 md:mt-10 h-auto">
        {
            [1,2].map((_,index)=>(
                <div
                key={index}
                 className="w-full mx-auto md:w-full bg-gray-800 md:pb-2 flex flex-col shadow-xl h-auto md:p-4 py-4 md:rounded-xl animate-pulse">
      
      {/* Author Section */}
      <div className="flex mb-2 gap-2 px-4 items-center">
        <div className="w-8 h-8 rounded-full bg-gray-700"></div>
        <div className="flex flex-col gap-2">
          <div className="h-3 w-20 bg-gray-700 rounded"></div>
          <div className="h-2 w-14 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full h-44 md:h-36 bg-gray-700"></div>

      {/* Content Section */}
      <div className="min-h-28 px-4 h-auto pt-4 space-y-3">
        <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
        <div className="h-3 w-full bg-gray-700 rounded"></div>
        <div className="h-3 w-2/3 bg-gray-700 rounded"></div>
      </div>

      {/* Actions Section */}
      <div className="flex px-4 justify-between items-center mb-2 mt-3">
        <div className="flex gap-4 items-center">
          <div className="h-3 w-6 bg-gray-700 rounded"></div>
          <div className="h-3 w-6 bg-gray-700 rounded"></div>
          <div className="h-3 w-6 bg-gray-700 rounded"></div>
          <div className="h-3 w-6 bg-gray-700 rounded"></div>
        </div>
        <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
      </div>
    </div>
            ))
        }
    </div>
  );
};


export default BlogSkeleton