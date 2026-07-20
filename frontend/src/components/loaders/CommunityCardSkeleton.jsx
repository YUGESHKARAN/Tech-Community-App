// const CommunityCardSkeleton = () => (
//     Array.from({ length: 8 }).map((_, index) => (
//          <div 
//          key={index}
//          className="group relative theme border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col animate-pulse">
  
//   {/* Content */}
//   <div className="flex-1 p-5 flex flex-col gap-4">
    
//     {/* Icon + Title */}
//     <div className="flex items-start justify-between gap-3">
//       <div className="space-y-2">
//         <div className="h-4 w-32 bg-gray-700 rounded" />
//         <div className="h-2 w-20 bg-gray-800 rounded" />
//       </div>

//       {/* Membership icon placeholder */}
//       <div className="w-5 h-5 bg-gray-700 rounded-full" />
//     </div>

//     {/* Divider */}
//     <div className="h-px bg-[#1e293b]" />

//     {/* Stats */}
//     <div className="grid grid-cols-3  py-3 gap-2">
//       {Array.from({ length: 3 }).map((_, i) => (
//         <div
//           key={i}
//           className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-lg py-2.5 px-1 space-y-2"
//         >
//           <div className="h-4 w-8 bg-gray-700 rounded" />
//           <div className="h-2 w-12 bg-gray-800 rounded" />
//         </div>
//       ))}
//     </div>
//   </div>

//   {/* Footer */}
//   <div className="px-5 pb-5">
//     <div className="w-full h-8 bg-gray-800 rounded-xl" />
//   </div>
// </div>
//       ))

 
// );




// export default CommunityCardSkeleton;

const CommunityCardSkeleton = () => {
  return (
    <div className="h-52 md:h-60 theme border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col animate-pulse">
      {/* Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-slate-600" />

          <div className="flex-1 min-w-0">
            <div className="h-4 w-32 rounded bg-slate-600 mb-2" />
            <div className="h-3 w-20 rounded bg-slate-700" />
          </div>

          <div className="h-6 w-20 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 md:pt-8 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex gap-5">
            <div className="h-4 w-24 rounded bg-slate-700" />
            <div className="h-4 w-20 rounded bg-slate-700" />
          </div>

          {/* Members */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-slate-600"
                />
              ))}
            </div>

            <div className="ml-3 h-3 w-16 rounded bg-slate-700" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 pb-4">
          <div className="h-7 w-28 rounded-full bg-slate-700" />
          <div className="h-8 w-20 rounded-full bg-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default CommunityCardSkeleton;