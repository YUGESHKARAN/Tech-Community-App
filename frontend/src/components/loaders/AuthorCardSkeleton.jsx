import React from 'react'

function AuthorCardSkeleton() {
  return (
       <div className="relative flex items-center mx-2 md:max-w-xl md:mx-auto gap-5 md:gap-10 py-7 p-5 md:p-7 rounded-2xl border border-slate-700/50 bg-gradient-to-r from-theme to-slate-800 overflow-hidden">
      {/* Shimmer */}
      <div className="absolute inset-0 shimmer opacity-40" />

      {/* Avatar */}
      <div className="relative z-10 flex-shrink-0">
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-slate-700 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1">
        {/* Name */}
        <div className="h-4 md:h-7 w-40 rounded-md bg-slate-700 animate-pulse" />

        {/* Username */}
        <div className="mt-3 h-4 w-32 rounded bg-slate-700 animate-pulse" />

        {/* Meta */}
        <div className="flex items-center gap-3 mt-5">
          <div className="h-6 w-16 rounded-md bg-slate-700 animate-pulse" />
          <div className="h-3 w-24 rounded bg-slate-700 animate-pulse" />
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-4 right-4 flex -space-x-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-5 h-5 md:w-10 md:h-10 rounded-full border border-slate-600 bg-slate-700 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}

export default AuthorCardSkeleton

