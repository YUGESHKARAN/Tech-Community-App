
const ContributorsTableSkeleton = () => {
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full flex flex-col overflow-hidden relative animate-pulse">

     {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <div className="h-4 w-32 bg-gray-700/50 rounded" />
        <div className="h-4 w-20 bg-gray-700/40 rounded" />
      </div>

      {/* Table Head */}
      <table className="w-full table-fixed">
        <thead>
          <tr className="bg-white/[0.02]">
            <th className="w-[38%] px-5 py-2">
              <div className="h-3 w-24 bg-gray-700/40 rounded" />
            </th>
            <th className="w-[16%] px-5 py-2 text-center">
              <div className="h-3 w-12 bg-gray-700/40 rounded mx-auto" />
            </th>
            <th className="hidden md:table-cell w-[12%] px-5 py-2 text-center">
              <div className="h-3 w-10 bg-gray-700/40 rounded mx-auto" />
            </th>
            <th className="hidden md:table-cell w-[12%] px-5 py-2 text-center">
              <div className="h-3 w-12 bg-gray-700/40 rounded mx-auto" />
            </th>
            <th className="hidden md:table-cell w-[11%] px-5 py-2 text-center">
              <div className="h-3 w-14 bg-gray-700/40 rounded mx-auto" />
            </th>
            <th className="hidden md:table-cell w-[11%] px-5 py-2 text-center">
              <div className="h-3 w-14 bg-gray-700/40 rounded mx-auto" />
            </th>
          </tr>
        </thead>
      </table>

      {/* Scrollable Body */}
      <div
        className="overflow-y-auto scrollbar-hide"
        style={{ height: "305px" }}
      >
        <table className="w-full table-fixed">
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-white/[0.04]"
              >
                {/* Name */}
                <td className="py-3 px-5 w-[38%]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700/50" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-24 bg-gray-700/50 rounded" />
                      <div className="h-2 w-32 bg-gray-700/40 rounded" />
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="py-3 px-5 w-[16%] text-center">
                  <div className="h-5 w-14 bg-gray-700/50 rounded-full mx-auto" />
                </td>

                {/* Posts */}
                <td className="py-3 px-5 w-[12%] text-center hidden md:table-cell">
                  <div className="h-3 w-6 bg-gray-700/50 rounded mx-auto" />
                </td>

                {/* Playlists */}
                <td className="py-3 px-5 w-[12%] text-center hidden md:table-cell">
                  <div className="h-3 w-6 bg-gray-700/50 rounded mx-auto" />
                </td>

                {/* Followers */}
                <td className="py-3 px-5 w-[11%] text-center hidden md:table-cell">
                  <div className="h-3 w-6 bg-gray-700/50 rounded mx-auto" />
                </td>

                {/* Following */}
                <td className="py-3 px-5 w-[11%] text-center hidden md:table-cell">
                  <div className="h-3 w-6 bg-gray-700/50 rounded mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContributorsTableSkeleton;