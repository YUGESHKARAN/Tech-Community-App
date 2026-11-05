import { useEffect, useRef } from "react";
import { TbSearch } from "react-icons/tb";
import { SORT_OPTIONS, TABS } from "../../utils/event/eventUtils";

export default function EventFilters({ tab, onTab, counts, query, onQuery, sort, onSort }) {
  const inputRef = useRef(null);

  // Press "/" anywhere outside a field to focus search.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div
        role="tablist"
        aria-label="Filter events"
        className="flex w-full overflow-x-auto rounded-xl border border-white/10 bg-[#0f1216] p-1 lg:w-auto"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => onTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === t.key ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
            <span className="text-[10px] text-zinc-500">{counts[t.key] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1 sm:w-64 lg:w-72">
          <TbSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Filter by challenge or topic…"
            aria-label="Search events"
            className="w-full rounded-xl border border-white/10 bg-[#0f1216] py-2 pl-9 pr-9 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 text-[10px] text-zinc-500">
            /
          </kbd>
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f1216] px-3 py-2 text-sm text-zinc-400">
          <span className="shrink-0 text-xs">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key} className="bg-[#0f1216]">
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}