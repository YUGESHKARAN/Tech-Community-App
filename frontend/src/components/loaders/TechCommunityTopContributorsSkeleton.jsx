import React from 'react'

const TechCommunityTopContributorsSkeleton = ()=> {
  return (
    <div className="theme border border-[#1e293b] rounded-2xl p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between md:mb-2">
        <div className="h-5 w-36 rounded bg-gray-700/60" />
        <div className="h-8 w-28 rounded-md bg-gray-700/60" />
      </div>

      {/* Contributors */}
      <div className="flex max-h-52 md:max-h-96 overflow-y-auto srollbar-hide flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-1 py-1.5 rounded-lg"
          >
            {/* Rank */}
            <div className="w-5 h-5 rounded-full bg-gray-700/60 flex-shrink-0" />

            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-gray-700/60 flex-shrink-0" />

            {/* Name */}
            <div className="flex-1">
              <div className="h-3 w-24 rounded bg-gray-700/60 mb-1" />
              {/* <div className="h-2 w-14 rounded bg-gray-800/70" /> */}
            </div>

            {/* Posts */}
            <div className="h-3 w-14 rounded bg-gray-700/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TechCommunityTopContributorsSkeleton

