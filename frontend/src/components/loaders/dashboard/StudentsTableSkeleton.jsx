
const StudentsTableSkeleton = () => {
  return (
    <div className="bg-[#0f172a] border mt-4 md:mt-0 overflow-hidden relative border-[#1e293b] rounded-2xl flex flex-col overflow-hidden md:w-[600px] animate-pulse">
       {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
      
      {/* Header (TableHeader placeholder) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <div className="h-4 w-28 bg-gray-700/50 rounded" />
        <div className="h-4 w-16 bg-gray-700/40 rounded" />
      </div>

      {/* Table Head */}
      <table className="w-full table-fixed">
        <thead>
          <tr className="bg-white/[0.02]">
            <th className="w-[70%] px-5 py-2">
              <div className="h-3 w-24 bg-gray-700/40 rounded" />
            </th>
            <th className="w-[30%] px-5 py-2 text-center">
              <div className="h-3 w-16 bg-gray-700/40 rounded mx-auto" />
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
            {Array.from({ length: 7 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-white/[0.04]"
              >
                {/* Name */}
                <td className="py-3 px-5 w-[70%]">
                  <div className="flex items-center gap-3">
                    
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-700/50" />

                    {/* Name + Email */}
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-24 bg-gray-700/50 rounded" />
                      <div className="h-2 w-32 bg-gray-700/40 rounded" />
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="py-3 px-5 w-[30%] text-center">
                  <div className="h-5 w-16 bg-gray-700/50 rounded-full mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default StudentsTableSkeleton;   