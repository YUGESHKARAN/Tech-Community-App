const PostDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-3 md:px-8 py-6 pb-20 md:py-10 animate-pulse">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-700 rounded" />
            <div className="h-3 w-20 bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-8 w-16 bg-gray-700 rounded-md" />
      </div>

      {/* Title */}
      <div className="h-8 w-3/4 bg-gray-700 rounded mb-6" />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Banner */}
          <div className="h-72 md:h-96 bg-gray-800 rounded-2xl border border-gray-700" />

          {/* Description */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-3">
            <div className="h-4 w-full bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-700 rounded" />
            <div className="h-4 w-5/6 bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-700 rounded" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Assistant Box */}
          <div className="h-40 bg-gray-800 rounded-2xl border border-gray-700" />

          {/* Resources Box */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-4">
            <div className="h-5 w-32 bg-gray-700 rounded" />
            <div className="flex gap-3">
              <div className="h-10 w-28 bg-gray-700 rounded-xl" />
              <div className="h-10 w-28 bg-gray-700 rounded-xl" />
            </div>
          </div>

          {/* Comments */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-4">
            <div className="h-5 w-24 bg-gray-700 rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 bg-gray-700 rounded" />
                  <div className="h-3 w-3/4 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
            <div className="h-10 w-full bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailSkeleton;