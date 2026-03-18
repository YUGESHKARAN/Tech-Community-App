const BlogMiniSkeleton = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="
            rounded-2xl border border-neutral-800
            bg-gray-900 p-4
            animate-pulse
          "
        >
          {/* Title + time */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <div className="h-3 w-3/4 bg-gray-700 rounded mb-2"></div>
              <div className="h-2 w-1/3 bg-gray-800 rounded"></div>
            </div>
          </div>

          {/* Image */}
          <div className="w-full h-48 md:h-36 bg-gray-800 rounded-xl mb-3"></div>

          {/* Meta */}
          <div className="flex justify-between items-center">
            <div className="h-2 w-16 bg-gray-800 rounded"></div>
            <div className="h-5 w-20 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      ))}
    </>
  );
};
export default BlogMiniSkeleton