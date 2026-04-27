import React from "react";

function LogTableSkeleton({ rows = 6 }) {
  return (
    <div className="md:mt-4 mt-1 md:border border-white/10 rounded-2xl overflow-hidden pb-2 animate-pulse">
      {/* HEADER (desktop only) */}
      <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_2fr_1.2fr_1.2fr_1.2fr_1.5fr_1fr] px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 bg-white/[0.03] border-b border-white/10">
        <span>User</span>
        <span>Role</span>
        <span>Status</span>
        <span>Deleted By</span>
        <span>Deleted</span>
        <span>Expires</span>
        <span>Restored</span>
        <span>Restored By</span>
        <span className="text-right">Action</span>
      </div>

      {/* DESKTOP SKELETON */}
      <div className="hidden lg:block divide-y divide-white/5">
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_2fr_1.2fr_1.2fr_1.2fr_1.5fr_1fr] items-center px-4 py-3"
          >
            {/* USER */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div className="flex flex-col gap-1 w-full">
                <div className="h-3 w-24 bg-white/10 rounded" />
                <div className="h-2 w-32 bg-white/10 rounded" />
              </div>
            </div>

            {/* Role */}
            <div className="h-3 w-10 bg-white/10 rounded" />

            {/* STATUS */}
            <div className="h-5 w-14 bg-white/10 rounded-md" />

            {/* DELETED BY */}
            <div className="flex flex-col gap-1">
              <div className="h-3 w-28 bg-white/10 rounded" />
              <div className="h-2 w-36 bg-white/10 rounded" />
            </div>

            {/* DATES */}
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />

            {/* RESTORED BY */}
            <div className="h-3 w-28 bg-white/10 rounded" />

            {/* ACTION */}
            <div className="flex justify-end">
              <div className="h-7 w-20 bg-white/10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE SKELETON */}
      <div className="lg:hidden flex flex-col gap-4 ">
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3"
          >
            {/* TOP */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-24 bg-white/10 rounded" />
                  <div className="h-2 w-32 bg-white/10 rounded" />
                </div>
              </div>

              <div className="h-5 w-14 bg-white/10 rounded-md" />
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-2 gap-y-2">
              {[...Array(7)].map((_, j) => (
                <React.Fragment key={j}>
                  <div className="h-2 w-16 bg-white/10 rounded" />
                  <div className="h-2 w-20 bg-white/10 rounded justify-self-end" />
                </React.Fragment>
              ))}
            </div>

            {/* ACTION */}
            <div className="h-8 w-full bg-white/10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LogTableSkeleton;
