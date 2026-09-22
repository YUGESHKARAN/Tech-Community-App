export const AnnounceSummarySkeleton = () => {
  return (
    <div
      className="
        rounded-3xl relative group overflow-hidden rounded-lg
        border border-emerald-500/20
        bg-gradient-to-br from-emerald-500/5 to-transparent
        p-4 md:p-5
        animate-pulse
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          {/* Overview */}
          <div className="h-2.5 w-20 rounded bg-emerald-500/20" />

          {/* Community Summary */}
          <div className="h-3.5 w-32 rounded bg-slate-700 mt-2" />
        </div>

        {/* Delete icon placeholder */}
        <div className="w-4 h-4 rounded bg-slate-700/60" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* User Role */}
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-20 rounded bg-slate-700" />

          <div className="h-6 w-20 rounded-full bg-slate-700/70" />
        </div>

        {/* Inbox */}
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-12 rounded bg-slate-700" />

          <div className="h-3.5 w-10 rounded bg-slate-700" />
        </div>
      </div>
    </div>
  );
};