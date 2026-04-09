
const AnnouncementSkeleton = () => {
  return (
    <>
    {Array.from({ length: 4 }).map((_, index) => (
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 md:p-7 space-y-6 animate-pulse">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-3/4">
          <div className="h-4 md:h-5 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-800 rounded w-1/3"></div>
        </div>
        <div className="w-4 h-4 bg-slate-700 rounded"></div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-800 rounded w-11/12"></div>
        <div className="h-3 bg-slate-800 rounded w-10/12"></div>
      </div>

      {/* Image */}
      <div className="rounded-md overflow-hidden border border-slate-800">
        <div className="w-full h-48 md:h-[400px] bg-slate-800"></div>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            className="h-6 w-20 bg-slate-800 rounded-2xl"
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 md:border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-700 rounded-full"></div>
          <div className="space-y-1">
            <div className="h-2.5 bg-slate-800 rounded w-20"></div>
            <div className="h-3 bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      </div>

    </div>


  ))}
  </>
      );
};

export default AnnouncementSkeleton;