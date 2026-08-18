export const PostCardSkeleton = () => {
  return (
    <div className="theme border border-[#1e293b] rounded-xl overflow-hidden animate-pulse">
      {/* Image */}
      <div className="w-full h-36 bg-slate-700/60" />

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-[90%] rounded bg-slate-700" />
          <div className="h-3.5 w-[65%] rounded bg-slate-700" />
        </div>

        {/* Description */}
        <div className="space-y-1.5 mt-0.5">
          <div className="h-2.5 w-full rounded bg-slate-700/80" />
          <div className="h-2.5 w-[80%] rounded bg-slate-700/80" />
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
          {/* Avatar */}
          <div className="w-5 h-5 rounded-full bg-slate-700 flex-shrink-0" />

          {/* Author name */}
          <div className="h-2.5 w-24 rounded bg-slate-700" />

          {/* Time */}
          <div className="h-2.5 w-10 rounded bg-slate-700 ml-auto" />
        </div>

        {/* Engagement */}
        <div className="flex items-center gap-3 pt-0.5">
          {/* Likes */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-700" />
            <div className="w-5 h-2.5 rounded bg-slate-700" />
          </div>

          {/* Share */}
          <div className="w-3 h-3 rounded bg-slate-700" />

          {/* Comments */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-700" />
            <div className="w-5 h-2.5 rounded bg-slate-700" />
          </div>

          {/* Views */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-700" />
            <div className="w-5 h-2.5 rounded bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
};