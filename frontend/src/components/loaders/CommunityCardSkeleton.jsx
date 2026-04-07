const CommunityCardSkeleton = () => (
    Array.from({ length: 6 }).map((_, index) => (
         <div 
         key={index}
         className="group relative bg-gray-900 border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col animate-pulse">
  
  {/* Content */}
  <div className="flex-1 p-5 flex flex-col gap-4">
    
    {/* Icon + Title */}
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-700 rounded" />
        <div className="h-2 w-20 bg-gray-800 rounded" />
      </div>

      {/* Membership icon placeholder */}
      <div className="w-5 h-5 bg-gray-700 rounded-full" />
    </div>

    {/* Divider */}
    <div className="h-px bg-[#1e293b]" />

    {/* Stats */}
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-lg py-2.5 px-1 space-y-2"
        >
          <div className="h-4 w-8 bg-gray-700 rounded" />
          <div className="h-2 w-12 bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  </div>

  {/* Footer */}
  <div className="px-5 pb-5">
    <div className="w-full h-8 bg-gray-800 rounded-xl" />
  </div>
</div>
      ))

 
);




export default CommunityCardSkeleton;