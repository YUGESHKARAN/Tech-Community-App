
const ProfileViewSkeleton = ({role}) => {
  return (
    <div className="bg-gray-900 text-white animate-pulse">
      {/* Page */}
      <div className="w-full min-h-screen px-4 md:px-6 py-8 pb-24">

        {/* Header */}
        <div className="mb-8 px-1">
          <div className="h-3 w-20 bg-gray-700 rounded mb-2" />
          <div className="h-7 w-48 bg-gray-700 rounded" />
        </div>

        {/* Layout */}
        <div className="grid md:grid-cols-[300px_1fr] gap-4">

          {/* LEFT CARD */}
          <div className="bg-gray-800/40 border border-white/[0.06] rounded-2xl p-4 text-center">

            {/* Avatar */}
            <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full bg-gray-700 mb-5" />

            {/* Name */}
            <div className="h-4 w-32 bg-gray-700 rounded mx-auto mb-2" />

            {/* Role */}
            <div className="h-3 w-20 bg-gray-800 rounded-full mx-auto mb-5" />

            {/* Stats */}
            <div className="flex gap-1 border border-white/[0.06] rounded-xl overflow-hidden mb-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex-1 py-3 bg-gray-800/40">
                  <div className="h-4 w-10 bg-gray-700 mx-auto rounded mb-1" />
                  <div className="h-3 w-14 bg-gray-800 mx-auto rounded" />
                </div>
              ))}
            </div>

            {/* Button */}
            {role !=='student' && <div className="h-9 w-28 bg-gray-700 rounded-lg mx-auto mt-3" />}
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-gray-800/40 border border-white/[0.06] rounded-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">

              {/* LEFT COLUMN */}
              <div className="space-y-5">
                {[1, 2, 3].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 w-24 bg-gray-700 rounded mb-2" />
                    <div className="h-10 w-full bg-gray-800 rounded-lg" />
                  </div>
                ))}

                {/* Communities */}
                <div>
                  <div className="h-3 w-32 bg-gray-700 rounded mb-2" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div key={i} className="h-5 w-16 bg-gray-800 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (Bio Links) */}
              <div>
                <div className="h-3 w-20 bg-gray-700 rounded mb-3" />

                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3.5 py-3 bg-gray-800/40 border border-white/[0.06] rounded-xl mb-2"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-gray-700 rounded mb-1" />
                      <div className="h-2 w-32 bg-gray-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileViewSkeleton;