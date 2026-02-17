const StudentGridSkeleton = () => {
  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mt-8 animate-pulse">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 flex flex-col items-center text-center"
        >
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gray-700" />

          {/* Name */}
          <div className="mt-4 h-4 w-3/4 bg-gray-700 rounded" />

          {/* Email */}
          <div className="mt-2 h-3 w-2/3 bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
};


export default StudentGridSkeleton