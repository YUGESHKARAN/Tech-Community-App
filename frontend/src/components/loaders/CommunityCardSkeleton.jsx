const CommunityCardSkeleton = () => (
    Array.from({ length: 3 }).map((_, index) => (
         <div
         key={index}
         
         className="relative backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl animate-pulse">
    <div className="p-5 bg-white/5 rounded-2xl">
      <div className="h-8 w-3/4 bg-gray-700 rounded mb-4"></div>

      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
      </div>
    </div>

    <div className="mt-5 flex justify-end">
      <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
    </div>
  </div>
      ))

 
);




export default CommunityCardSkeleton;