const ProfilePageSkeleton = () => {
  return (
    <div className="bg-gray-900 text-white animate-pulse">
      {/* Header */}
      <div className="w-full px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-3 w-20 bg-gray-700 rounded mb-2" />
            <div className="h-6 w-40 bg-gray-700 rounded" />
          </div>
          <div className="h-8 w-28 bg-gray-800 rounded-lg" />
        </div>

        {/* Layout */}
        <div className="grid md:grid-cols-[300px_1fr] gap-4">

          {/* LEFT PROFILE CARD */}
          <div className="bg-gray-800/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            
            {/* Avatar */}
            <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full bg-gray-700 mb-5" />

            {/* Name */}
            <div className="h-4 w-32 bg-gray-700 rounded mx-auto mb-2" />

            {/* Role */}
            <div className="h-3 w-20 bg-gray-800 rounded-full mx-auto mb-5" />

            {/* Stats */}
            <div className="flex gap-1 border border-white/[0.06] rounded-xl overflow-hidden mb-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex-1 py-3 bg-gray-800/40">
                  <div className="h-4 w-10 bg-gray-700 mx-auto rounded mb-1" />
                  <div className="h-3 w-14 bg-gray-800 mx-auto rounded" />
                </div>
              ))}
            </div>

            {/* Communities */}
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="h-5 w-16 bg-gray-800 rounded-full" />
              ))}
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-gray-800/40 border grid md:grid-cols-2 gap-4 border-white/[0.06] rounded-2xl p-6 md:p-8 space-y-4 md:space-y-6">
            <div>
            {/* Input fields */}
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="mt-4">
                <div className="h-3 w-24 bg-gray-700 rounded mb-2" />
                <div className="h-10 w-full bg-gray-800 rounded-lg" />
              </div>
            ))}
            </div>

            {/* Bio Links */}
            <div className="space-y-3">
              <div className="h-3 w-20 bg-gray-700 rounded" />
              {[1, 2].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between  items-center p-3 bg-gray-800/40 rounded-xl border border-white/[0.06]"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg" />
                    <div>
                      <div className="h-3 w-24 bg-gray-700 rounded mb-1" />
                      <div className="h-2 w-32 bg-gray-800 rounded" />
                    </div>
                  </div> 
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded" />
                    <div className="w-6 h-6 bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className=" col-span-full">
              <div className="h-7 w-32 bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;