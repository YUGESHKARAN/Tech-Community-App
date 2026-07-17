const PlaylistEditSkeleton = () => {
  return (
    <div className="w-full px-3 md:px-12 pb-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 animate-pulse">
      {/* ================= LEFT PANEL ================= */}
      <div className="md:border border-emerald-500/10 rounded-lg p-2 md:p-6">
        <div className="space-y-7">
          <div className="hidden lg:block h-6 w-40 bg-gray-800 rounded-md" />

          {/* Domain */}
          <div className="space-y-2">
            <div className="h-2 md:h-3 w-28 bg-gray-700 rounded" />
            <div className="h-8 md:h-11 w-full rounded-lg bg-gray-900 border border-gray-800" />
          </div>

          {/* Collaborator */}
          <div className="space-y-2">
            <div className="h-2 md:h-3 w-36 bg-gray-700 rounded" />
            <div className="h-8 md:h-11 w-full rounded-lg bg-gray-900 border border-gray-800" />

            <div className="flex gap-2 flex-wrap pt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 md:py-2 rounded-full bg-gray-900 border border-gray-800"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-700" />
                  <div className="h-2 md:h-3 w-16 bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-2 md:h-3 w-24 bg-gray-700 rounded" />
            <div className="h-8 md:h-11 w-full rounded-lg bg-gray-900 border border-gray-800" />
          </div>

          {/* Thumbnail */}
          <div className="space-y-3">
            <div className="h-2 md:h-3 w-36 bg-gray-700 rounded" />
            <div className="md:h-10 h-7 w-44 bg-gray-900 rounded-lg border border-gray-800" />
            <div className="w-full md:max-w-80 h-44 rounded-xl bg-gray-900 border border-gray-800" />
          </div>

          {/* Button */}
          <div className="hidden md:block">
            <div className="h-8 md:h-11 w-44 rounded-lg bg-gray-900 border border-gray-800" />
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center p-2 md:p-4">
          <div className="space-y-2">
            <div className="h-3 md:h-5 w-60 bg-gray-800 rounded" />
            <div className=" h-1.5 md:h-3 w-40 bg-gray-700 rounded" />
          </div>

          <div className="h-7 md:h-10 w-20 md:w-24 rounded-full bg-gray-900 border border-gray-800" />
        </div>

        {/* Posts Grid */}
        <div className="flex overflow-x-auto md:overflow-x-hidden  overflow-y-hidden scrollbar-hide items-center sm:grid  sm:grid-cols-2 xl:grid-cols-3  3xl:grid-cols-4 max-h-[700px] emerald-scrollbar md:overflow-y-auto gap-3 px-2 py-4 pb-0 md:p-4 gap-3 md:gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border min-w-[270px] sm:min-w-[150px] border-gray-800 bg-gray-900 p-4 space-y-3"
            >
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-800 rounded" />
              </div>

              <div className="h-36 rounded-xl bg-gray-800" />

              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-gray-700 rounded" />
                <div className="h-6 w-20 rounded-full bg-gray-800" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="md:hidden p-4">
          <div className="h-8 md:h-11 w-32 md:w-full rounded-lg bg-gray-900 border border-gray-800" />
        </div>
      </div>
    </div>
  );
};

export default PlaylistEditSkeleton;