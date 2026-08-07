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
    <div className="animate-pulse group relative border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col bg-[#0b1220]">
      {/* Banner */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 bg-slate-700/60">
        <div className="w-10 h-10 rounded-xl bg-slate-600 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="h-4 w-36 rounded bg-slate-500 mb-2" />
          <div className="h-3 w-24 rounded bg-slate-600" />
        </div>

        <div className="h-6 w-16 rounded-full bg-slate-600" />
      </div>

      {/* Body */}
      <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 rounded bg-slate-700 w-full" />
          <div className="h-3 rounded bg-slate-700 w-4/5" />
        </div>

        {/* Stats + Members */}
        <div className="md:flex grid gap-2 items-center justify-between">
          <div className="flex gap-4">
            <div className="h-4 w-24 rounded bg-slate-700" />
            <div className="h-4 w-20 rounded bg-slate-700" />
          </div>

          <div className="flex items-center mt-1 md:mt-0">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#0b1220] bg-slate-600"
                />
              ))}
            </div>

            <div className="ml-2 h-3 w-14 rounded bg-slate-700" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4  flex items-center justify-between gap-2 mt-auto">
        <div className="h-6 w-32 rounded-full bg-slate-700" />

        <div className="h-6 w-20 rounded-full bg-slate-600" />
      </div>
    </div>
  );
};

// export default CommunityCardSkeleton;

export default CommunityCardSkeleton;