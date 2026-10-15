const skeletonBlock = (className = "") => (
  <div className={`animate-pulse bg-gray-800 ${className}`} />
);

const CommentSkeleton = () => (
  <div className="flex gap-3">
    {skeletonBlock("h-8 w-8 shrink-0 rounded-full")}
    <div className="flex-1 space-y-2">
      {skeletonBlock("h-3 w-1/3 rounded")}
      {skeletonBlock("h-3 w-3/4 rounded")}
    </div>
  </div>
);

const PostDetailSkeleton = () => {
  return (
    <div className="w-full xl:w-11/12 max-w-[1800px] mx-auto px-3 md:px-8 pt-3 md:pt-4 pb-28 lg:pb-12">
      <header className="shrink-0">
        {skeletonBlock("hidden lg:block h-4 w-14 mb-2 rounded")}

        <div className="-mx-3 -mt-3 md:-mx-8 md:-mt-4 lg:mx-0 lg:mt-0 flex flex-col lg:flex-row gap-3 lg:gap-5 rounded-none lg:rounded-2xl border-0 border-b border-white/10 lg:border lg:border-neutral-800 bg-[#0d1117] p-3 md:p-4">
          {skeletonBlock("lg:hidden h-4 w-14 rounded")}

          {skeletonBlock("w-full lg:w-[220px] shrink-0 aspect-video rounded-xl border border-emerald-900/60")}

          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {skeletonBlock("h-5 w-20 rounded-full")}
                {skeletonBlock("h-3 w-12 rounded")}
              </div>
              <div className="space-y-2 py-1">
                {skeletonBlock("h-5 md:h-6 lg:h-7 w-4/5 rounded")}
                {skeletonBlock("h-5 md:h-6 lg:h-7 w-3/5 rounded lg:hidden")}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                {skeletonBlock("h-7 w-7 shrink-0 rounded-full")}
                {skeletonBlock("h-3 w-24 rounded")}
                {skeletonBlock("h-3 w-20 rounded")}
              </div>
              <div className="flex items-center gap-1.5">
                {skeletonBlock("h-8 w-8 rounded-full")}
                {skeletonBlock("h-8 w-8 rounded-full")}
                {skeletonBlock("h-8 w-8 rounded-full")}
                {skeletonBlock("h-8 w-8 rounded-full")}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:hidden mt-4">
        <section className="rounded-lg md:border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          <div className="flex items-center gap-1 md:border-b border-neutral-800 md:px-3">
            {skeletonBlock("h-7 w-20 rounded")}
            {skeletonBlock("h-7 w-20 rounded")}
            {skeletonBlock(" h-7 w-24 rounded lg:hidden")}
          </div>
          <div className="p-2 md:p-6 space-y-3">
            {skeletonBlock("h-4 w-full rounded")}
            {skeletonBlock("h-4 w-full rounded")}
            {skeletonBlock("h-4 w-full rounded")}
            {skeletonBlock("h-4 w-5/6 rounded")}
            {skeletonBlock("h-4 w-2/3 rounded")}
          </div>
        </section>

        <div className="mt-4 rounded-2xl px-4">
          {skeletonBlock("h-3 w-24 rounded")}
          <div className="mt-3 flex gap-1">
            {skeletonBlock("h-4 w-4 rounded-full")}
            {skeletonBlock("h-4 w-4 rounded-full")}
            {skeletonBlock("h-4 w-4 rounded-full")}
          </div>
        </div>
      </div>

      <div className="hidden lg:grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] gap-4 mt-6 items-start">
        <main className="min-w-0">
          <section className="rounded-lg md:border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            <div className="flex items-center gap-2 md:border-b border-neutral-800 md:px-3">
              {skeletonBlock("h-7 my-1 w-24 rounded")}
              {skeletonBlock("h-7 my-1 w-24 rounded")}
            </div>
            <div className="p-2 md:p-6 lg:p-7 space-y-3">
              {skeletonBlock("h-4 w-full rounded")}
              {skeletonBlock("h-4 w-full rounded")}
              {skeletonBlock("h-4 w-full rounded")}
              {skeletonBlock("h-4 w-full rounded")}
              {skeletonBlock("h-4 w-full rounded")}
              {skeletonBlock("h-4 w-full rounded")}
              {skeletonBlock("h-4 w-full rounded")}
              {skeletonBlock("h-4 w-5/6 rounded")}
              {skeletonBlock("h-4 w-full rounded")}
              {skeletonBlock("h-4 w-5/6 rounded")}
              {skeletonBlock("h-4 w-2/3 rounded")}
            </div>
          </section>
        </main>

        <aside className="min-w-0 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide space-y-5">
          <section className="flex flex-col theme-fields-dark border border-[#30363d] rounded-lg max-h-[60vh] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262d]">
              {skeletonBlock("h-4 w-4 rounded")}
              {skeletonBlock("h-4 w-24 rounded")}
              {skeletonBlock("h-4 w-7 rounded-full")}
            </div>
            <div className="flex-1 space-y-5 overflow-hidden px-4 py-3">
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </div>
            <div className="px-4 pb-4 pt-3 border-t border-[#21262d]">
              <div className="flex h-9 items-center justify-between rounded-lg border border-[#30363d] px-3">
                {skeletonBlock("h-3 w-2/3 rounded")}
                {skeletonBlock("h-6 w-16 rounded-md")}
              </div>
            </div>
          </section>

          <div className="rounded-2xl px-4">
            {skeletonBlock("h-3 w-24 rounded")}
            <div className="mt-3 flex gap-1">
              {skeletonBlock("h-7 w-7 rounded-full")}
              {skeletonBlock("h-7 w-7 rounded-full")}
              {skeletonBlock("h-7 w-7 rounded-full")}
              {skeletonBlock("h-7 w-10 rounded-full")}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostDetailSkeleton;
