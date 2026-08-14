export const TopContributorsSkeleton = () => {
  return (
    <div className="theme border border-[#1e293b] rounded-xl p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-3">
        {/* Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 rounded bg-slate-700 flex-shrink-0" />
          <div className="h-3 w-28 md:w-32 rounded bg-slate-700" />
        </div>

        {/* Period buttons */}
        <div className="flex gap-1 flex-shrink-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`
                h-4
                ${i === 0 ? "w-10" : i === 1 ? "w-12" : "w-9"}
                rounded-full
                bg-slate-700
              `}
            />
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex flex-col h-40 emerald-scrollbar overflow-hidden gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 min-w-0"
          >
            {/* Rank / trophy */}
            {i < 3 ? (
              <div className="w-5 h-5 rounded-full bg-slate-700 flex-shrink-0" />
            ) : (
              <div className="w-5 flex justify-center flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded bg-slate-700" />
              </div>
            )}

            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-slate-700 flex-shrink-0" />

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div
                className="h-2.5 rounded bg-slate-700"
                style={{
                  width: `${55 + ((i * 13) % 35)}%`,
                }}
              />
            </div>

            {/* Points */}
            <div className="w-12 h-2.5 rounded bg-slate-700 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};