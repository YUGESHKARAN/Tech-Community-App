const ProfilePageSkeleton = () => {
  return (
    // <div className="bg-gray-900 text-white max-w-[1800px] mx-auto min-h-screen animate-pulse">
    //   {/* Header */}
    //   <div className="w-full px-4 md:px-6 pt-2 md:pt-6 md:pb-8">
    //     <div className="flex justify-between items-center md:mb-8">
    //       <div>
    //         <div className="h-3 w-20 bg-gray-700 rounded mb-2" />
    //         <div className="h-6 w-40 bg-gray-700 rounded" />
    //       </div>
    //       <div className="h-8 w-28 bg-gray-800 rounded-lg" />
    //     </div>

    //     {/* Layout */}
    //     <div className="grid md:grid-cols-[300px_1fr] mt-4 md:mt-0 md:gap-4">

    //       {/* LEFT PROFILE CARD */}
    //       <div className="bg-gray-800/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            
    //         {/* Avatar */}
    //         <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full bg-gray-700 mb-5" />

    //         {/* Name */}
    //         <div className="h-4 w-32 bg-gray-700 rounded mx-auto mb-2" />

    //         {/* Role */}
    //         <div className="h-3 w-20 bg-gray-800 rounded-full mx-auto mb-5" />

    //         {/* Stats */}
    //         <div className="flex gap-1 border border-white/[0.06] rounded-xl overflow-hidden mb-6">
    //           {[1, 2, 3].map((_, i) => (
    //             <div key={i} className="flex-1 py-3 bg-gray-800/40">
    //               <div className="h-4 w-10 bg-gray-700 mx-auto rounded mb-1" />
    //               <div className="h-3 w-14 bg-gray-800 mx-auto rounded" />
    //             </div>
    //           ))}
    //         </div>

    //         {/* Communities */}
    //         <div className="flex flex-wrap justify-center gap-2">
    //           {[1, 2, 3, 4].map((_, i) => (
    //             <div key={i} className="h-5 w-16 bg-gray-800 rounded-full" />
    //           ))}
    //         </div>
    //       </div>

    //       {/* RIGHT FORM */}
    //       <div className="bg-gray-800/40 border grid md:grid-cols-2 gap-4 border-white/[0.06] rounded-2xl p-6 mt-4 md:p-8 space-y-4 md:space-y-6">
    //         <div>
    //         {/* Input fields */}
    //         {[1, 2, 3, 4].map((_, i) => (
    //           <div key={i} className="mt-4">
    //             <div className="h-3 w-24 bg-gray-700 rounded mb-2" />
    //             <div className="h-10 w-full bg-gray-800 rounded-lg" />
    //           </div>
    //         ))}
    //         </div>

    //         {/* Bio Links */}
    //         <div className="space-y-3">
    //           <div className="h-3 w-20 bg-gray-700 rounded" />
    //           {[1, 2].map((_, i) => (
    //             <div
    //               key={i}
    //               className="flex justify-between  items-center p-3 bg-gray-800/40 rounded-xl border border-white/[0.06]"
    //             >
    //               <div className="flex gap-3 items-center">
    //                 <div className="w-8 h-8 bg-gray-700 rounded-lg" />
    //                 <div>
    //                   <div className="h-3 w-24 bg-gray-700 rounded mb-1" />
    //                   <div className="h-2 w-32 bg-gray-800 rounded" />
    //                 </div>
    //               </div> 
    //               <div className="flex gap-2">
    //                 <div className="w-6 h-6 bg-gray-700 rounded" />
    //                 <div className="w-6 h-6 bg-gray-700 rounded" />
    //               </div>
    //             </div>
    //           ))}
    //         </div>

    //         {/* Button */}
    //         <div className=" col-span-full">
    //           <div className="h-7 w-32 bg-gray-700 rounded-lg" />
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
     <div className="w-full min-h-screen max-w-7xl mx-auto px-4 md:px-6 pt-2 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-3 w-20 rounded bg-gray-800 animate-pulse mb-3" />
          <div className="h-8 w-44 rounded bg-gray-800 animate-pulse" />
        </div>

        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-gray-800 animate-pulse" />
          <div className="h-10 w-36 rounded-xl bg-gray-800 animate-pulse" />
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr]  gap-4">
        {/* LEFT */}
        <div className="rounded-2xl border h-fit border-white/10 bg-[#101827] p-6">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-800 animate-pulse" />

          <div className="mt-5 h-5 w-36 mx-auto rounded bg-gray-800 animate-pulse" />
          <div className="mt-2 h-3 w-48 mx-auto rounded bg-gray-800 animate-pulse" />

          <div className="mt-8">
            <div className="h-3 w-14 rounded bg-gray-800 animate-pulse mb-4" />

            <div className="space-y-2">
              <div className="h-3 rounded bg-gray-800 animate-pulse" />
              <div className="h-3 w-11/12 rounded bg-gray-800 animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-gray-800 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 p-4"
              >
                <div className="h-5 w-10 mx-auto rounded bg-gray-800 animate-pulse" />
                <div className="h-3 w-12 mx-auto mt-2 rounded bg-gray-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="rounded-2xl border border-white/10 bg-[#101827] p-6">
          <div className="h-3 w-24 rounded bg-gray-800 animate-pulse mb-5" />

          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border border-white/5 rounded-xl p-4 mb-3"
            >
              <div className="flex gap-3 items-center">
                <div className="h-10 w-10 rounded-lg bg-gray-800 animate-pulse" />

                <div>
                  <div className="h-3 w-28 rounded bg-gray-800 animate-pulse mb-2" />
                  <div className="h-3 w-40 rounded bg-gray-800 animate-pulse" />
                </div>
              </div>

              <div className="h-8 w-16 rounded-lg bg-gray-800 animate-pulse" />
            </div>
          ))}

          <div className="mt-8 h-12 rounded-xl bg-gray-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;


