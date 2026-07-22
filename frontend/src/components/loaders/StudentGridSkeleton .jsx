const StudentGridSkeleton = () => {
  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6  gap-2 md:gap-4 md:mt-6 mt-4 animate-pulse">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="theme border border-[#1e293b] rounded-2xl p-5 flex flex-col items-center text-center gap-2 animate-pulse"
        >
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gray-700" />

          {/* Name */}
          <div className="mt-2 h-3 md:h-4 w-28 rounded bg-gray-700" />

          {/* Email */}
          <div className="h-3 w-32 md:w-36 rounded bg-gray-800" />

          {/* Role */}
          <div className="h-3 w-14 rounded bg-gray-700 mt-1" />

          {/* Domain */}
          <div className="md:h-5 h-4 w-24 rounded-md bg-gray-700 md:mt-1" />

          {/* Followers */}
          {/* <div className="h-3 w-20 rounded bg-gray-800 mt-2" /> */}

          {/* View Profile */}
          <div className="flex items-center gap-1 mt-2">
            <div className="h-3 w-16 rounded bg-gray-800" />
            <div className="w-3 h-3 rounded-full bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentGridSkeleton;
