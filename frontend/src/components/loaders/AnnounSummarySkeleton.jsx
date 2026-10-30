// export const AnnounceSummarySkeleton = () => {
//   return (
//     <div
//       className="
//         rounded-3xl relative group overflow-hidden rounded-lg
//         border border-emerald-500/20
//         bg-gradient-to-br from-emerald-500/5 to-transparent
//         p-4 md:p-5
//         animate-pulse
//       "
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between mb-5">
//         <div>
//           {/* Overview */}
//           <div className="h-2.5 w-20 rounded bg-emerald-500/20" />

//           {/* Community Summary */}
//           <div className="h-3.5 w-32 rounded bg-slate-700 mt-2" />
//         </div>

//         {/* Delete icon placeholder */}
//         <div className="w-4 h-4 rounded bg-slate-700/60" />
//       </div>

//       {/* Content */}
//       <div className="space-y-4">
//         {/* User Role */}
//         <div className="flex items-center justify-between">
//           <div className="h-3.5 w-20 rounded bg-slate-700" />

//           <div className="h-6 w-20 rounded-full bg-slate-700/70" />
//         </div>

//         {/* Inbox */}
//         <div className="flex items-center justify-between">
//           <div className="h-3.5 w-12 rounded bg-slate-700" />

//           <div className="h-3.5 w-10 rounded bg-slate-700" />
//         </div>
//       </div>
//     </div>
//   );
// };

import React from "react";

/**
 * Loading placeholder for <AnnouncementHeader> + <AnnouncementFilterBar>.
 * Uses the same container, grid and ordering as the real header so nothing
 * shifts when the data arrives (desktop and mobile).
 */
export const AnnounceSummarySkeleton = () => (
  <section
    role="status"
    aria-label="Loading announcements overview"
    className="animate-pulse rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 md:px-5 md:py-4"
  >
    {/* Header row */}
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-2 md:grid-cols-[1fr_auto_auto] md:gap-x-6 md:gap-y-3">
      {/* Overview label + role tag */}
      <div className="order-1 flex min-w-0 items-center justify-between gap-2.5 md:justify-start">
        <div className="md:h-4 h-2 w-20 rounded bg-emerald-500/20" />
        <div className="h-[22px] w-20 shrink-0 rounded-md bg-slate-700/60" />
      </div>

      {/* Figures */}
      <div className="order-3 col-span-2 flex items-baseline gap-5 md:order-2 md:col-span-1">
        <div className="flex items-baseline gap-1.5">
          <div className="h-4 w-5 rounded bg-slate-700" />
          <div className="h-4 w-14 rounded bg-slate-700/60" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <div className="h-4 w-5 rounded bg-slate-700" />
          <div className="h-4 w-[72px] rounded bg-slate-700/60" />
        </div>
      </div>

      {/* Menu button */}
      <div className="order-2 flex items-center justify-end md:order-3">
        <div className="h-5 w-8 rounded-md bg-slate-700/40 md:h-7" />
      </div>
    </div>

    {/* Search + filters */}
    <div className="mt-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-7 flex-1 rounded-lg border border-slate-700/60 bg-slate-800/30 md:h-[32px]" />
        <div className="h-7 w-[92px] shrink-0 rounded-lg border border-slate-700/60 bg-slate-800/30 md:h-[32px] md:w-[104px]" />
      </div>

      {/* Quick date chips + sort */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-[23px] md:h-[25px] w-11 rounded-full bg-slate-700/50" />
          <div className="h-[23px] md:h-[25px] w-[60px] rounded-full bg-slate-700/50" />
          <div className="h-[23px] md:h-[25px] w-[66px] rounded-full bg-slate-700/50" />
          <div className="h-[23px] md:h-[25px] w-[74px] rounded-full bg-slate-700/50" />
        </div>
        <div className="hidden h-5 w-20 rounded bg-slate-700/60 sm:block" />
      </div>
    </div>
  </section>
);

export default AnnounceSummarySkeleton;