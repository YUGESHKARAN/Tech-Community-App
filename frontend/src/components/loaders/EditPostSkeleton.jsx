import React from 'react'



const EditPostSkeleton = () => {
  return (
    <div className="w-full mx-auto px-3 md:px-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">

        {/* LEFT SIDEBAR */}
        <div className="hidden md:block rounded-xl border border-gray-800 bg-theme/70 p-4 sticky top-7 self-start">
          <div className="h-4 w-24 bg-gray-700 rounded mb-4" />

          <div className="w-full h-[30vh] rounded-xl bg-gray-800 border border-gray-700" />
        </div>

        {/* RIGHT */}
        <div className="bg-theme/80 border border-emerald-500/20 rounded-xl p-6 md:p-8 space-y-8">

          {/* TITLE */}
          <div>
            <div className="h-4 w-20 bg-gray-700 rounded mb-3" />
            <div className="h-11 w-full bg-gray-800 rounded-lg border border-gray-700" />
          </div>

          {/* DESCRIPTION */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="h-4 w-28 bg-gray-700 rounded" />

              <div className="flex gap-2">
                <div className="w-16 h-8 rounded-md bg-gray-800" />
                <div className="w-16 h-8 rounded-md bg-gray-800" />
              </div>
            </div>

            <div className="md:h-[300px] h-[200px] rounded-xl bg-gray-800 border border-gray-700" />

            <div className="flex justify-end mt-2">
              <div className="h-3 w-20 bg-gray-700 rounded" />
            </div>
          </div>

          {/* MOBILE IMAGE */}
          <div className="md:hidden">
            <div className="h-4 w-24 bg-gray-700 rounded mb-3" />
            <div className="md:h-52 h-40 rounded-xl bg-gray-800 border border-gray-700" />
          </div>

          {/* CURRENT LINKS */}
          <div>
            <div className="h-4 w-28 bg-gray-700 rounded mb-4" />

            <div className="grid md:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-700 bg-gray-800 p-4 space-y-2"
                >
                  <div className="h-5 w-14 rounded bg-gray-700" />
                  <div className="h-4 w-2/3 rounded bg-gray-700" />
                  <div className="h-3 w-full rounded bg-gray-700" />
                </div>
              ))}
            </div>
          </div>

          {/* LINK FORM */}
          <div>
            <div className="h-4 w-24 bg-gray-700 rounded mb-4" />

            <div className="space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 h-11 rounded-lg bg-gray-800 border border-gray-700" />
                <div className="flex-1 h-11 rounded-lg bg-gray-800 border border-gray-700" />
              </div>

              <div className="w-24 h-10 rounded-lg bg-gray-800 border border-gray-700" />
            </div>
          </div>

          {/* DOCUMENTS */}
          <div>
            <div className="h-4 w-36 bg-gray-700 rounded mb-4" />

            <div className="h-11 rounded-lg bg-gray-800 border border-gray-700" />

            <div className="mt-4 space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-gray-800 border border-gray-700"
                />
              ))}
            </div>
          </div>

          {/* CURRENT DOCUMENTS */}
          <div>
            <div className="h-4 w-36 bg-gray-700 rounded mb-4" />

            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center h-12 rounded-lg bg-gray-800 border border-gray-700 px-4"
                >
                  <div className="h-3 w-48 bg-gray-700 rounded" />
                  <div className="w-8 h-8 rounded-full bg-gray-700" />
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORY */}
          <div>
            <div className="h-4 w-24 bg-gray-700 rounded mb-3" />
            <div className="h-11 rounded-lg bg-gray-800 border border-gray-700" />
          </div>

          {/* BUTTON */}
          <div className="flex justify-start">
            <div className="h-7 md:h-11 w-28 md:w-40 rounded-lg bg-gray-800 border border-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostSkeleton;