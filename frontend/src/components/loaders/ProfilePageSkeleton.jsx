const ProfilePageSkeleton = () => {
  return (
   
     <div className="w-full min-h-screen max-w-7xl mx-auto px-4 md:px-6 pt-2 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-3 w-20 rounded bg-gray-800 animate-pulse mb-3" />
          <div className="h-8 w-44 rounded bg-gray-800 animate-pulse" />
        </div>

        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-gray-800 animate-pulse" />
          <div className="h-10 w-36 rounded-xl bg-gray-800 animate-pulse" />
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr]  gap-4">
        {/* LEFT */}
        <div className="rounded-2xl border h-fit border-white/10 bg-[#101827] p-6">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-800 animate-pulse" />

          <div className="mt-5 h-5 w-36 mx-auto rounded bg-gray-800 animate-pulse" />
          <div className="mt-2 h-3 w-48 mx-auto rounded bg-gray-800 animate-pulse" />

          <div className="mt-8">
            <div className="h-3 w-14 rounded bg-gray-800 animate-pulse mb-4" />

            <div className="space-y-2">
              <div className="h-3 rounded bg-gray-800 animate-pulse" />
              <div className="h-3 w-11/12 rounded bg-gray-800 animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-gray-800 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 p-4"
              >
                <div className="h-5 w-10 mx-auto rounded bg-gray-800 animate-pulse" />
                <div className="h-3 w-12 mx-auto mt-2 rounded bg-gray-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="rounded-2xl border border-white/10 bg-[#101827] p-6">
          <div className="h-3 w-24 rounded bg-gray-800 animate-pulse mb-5" />

          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border border-white/5 rounded-xl p-4 mb-3"
            >
              <div className="flex gap-3 items-center">
                <div className="h-10 w-10 rounded-lg bg-gray-800 animate-pulse" />

                <div>
                  <div className="h-3 w-28 rounded bg-gray-800 animate-pulse mb-2" />
                  <div className="h-3 w-40 rounded bg-gray-800 animate-pulse" />
                </div>
              </div>

              <div className="h-8 w-16 rounded-lg bg-gray-800 animate-pulse" />
            </div>
          ))}

          <div className="mt-8 h-12 rounded-xl bg-gray-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;


