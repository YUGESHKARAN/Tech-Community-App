export const TrendingTagsSkeleton = () => {
  return (
    <div className="theme border border-[#1e293b] rounded-xl p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3">
        {/* Hash icon */}
        <div className="w-4 h-4 rounded bg-slate-700 flex-shrink-0" />

        {/* Title */}
        <div className="h-3 w-28 rounded bg-slate-700" />
      </div>

      {/* Tags */}
      <div className="flex flex-col h-28 scrollbar-hide overflow-hidden gap-2.5">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-2 min-w-0"
          >
            {/* Tag name */}
            <div
              className="h-2.5 rounded bg-slate-700 flex-shrink-0"
              style={{
                width: `${65 + ((index * 11) % 25)}px`,
              }}
            />

            {/* Progress bar */}
            <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-700"
                style={{
                  width: `${30 + ((index * 17) % 55)}%`,
                }}
              />
            </div>

            {/* Count */}
            <div className="w-4 h-2.5 rounded bg-slate-700 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};