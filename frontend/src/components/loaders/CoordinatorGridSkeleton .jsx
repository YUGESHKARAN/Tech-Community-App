const CoordinatorGridSkeleton = () => {
  return (
    <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 animate-pulse">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 text-center"
        >
          {/* Profile Image */}
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-700" />

          {/* Name */}
          <div className="mt-3 h-4 w-3/4 mx-auto bg-gray-700 rounded" />

          {/* Email */}
          <div className="mt-2 h-3 w-2/3 mx-auto bg-gray-700 rounded" />

          {/* Followers + Posts */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="h-3 w-16 bg-gray-700 rounded" />
            <div className="h-3 w-12 bg-gray-700 rounded" />
          </div>

          {/* Button */}
          <div className="mt-5">
            <div className="h-9 w-full bg-gray-700 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoordinatorGridSkeleton