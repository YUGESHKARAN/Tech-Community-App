import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useEventsBrowse from "../../hooks/event/useEventsBrowse";
import EventCard from "../../components/event/EventCard";
import EventsHero from "../../components/event/EventsHero";
import EventsToolbar from "../../components/event/EventsToolbar";
import EventsShell from "../../components/event/EventsShell";
import { useNow } from "../../utils/event/eventUtils";
import {
  DEFAULT_FILTERS,
  SORTS,
  TABS,
  activeFilterCount,
  matchesBrowse,
  sortBrowse,
} from "../../utils/event/browse";
import { fadeUpProps, staggerContainer, staggerItem } from "../../utils/event/motion";

export default function EventsBrowsePage() {
  const { events, loading, error } = useEventsBrowse();
  const now = useNow();
  const navigate = useNavigate();

  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [sortIndex, setSortIndex] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);

  const featured = useMemo(() => events.filter((e) => e.featured).slice(0, 5), [events]);

  // Tab counts reflect the search and filters, so each number is what you'd see on that tab.
  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map((t) => [t.key, events.filter((e) => matchesBrowse(e, { tab: t.key, query, filters, now })).length])
      ),
    [events, query, filters, now]
  );

  const visible = useMemo(
    () =>
      sortBrowse(
        events.filter((e) => matchesBrowse(e, { tab, query, filters, now })),
        SORTS[sortIndex].key
      ),
    [events, tab, query, filters, now, sortIndex]
  );

  const submitSearch = (ev) => {
    ev.preventDefault();
    setQuery(draft.trim());
  };
  const clearSearch = () => {
    setDraft("");
    setQuery("");
  };
  const clearAll = () => {
    clearSearch();
    setTab("all");
    setFilters(DEFAULT_FILTERS);
  };
  const cycleSort = () => setSortIndex((i) => (i + 1) % SORTS.length);
  const openEvent = (e) => navigate(`/events/${e._id}`);

  return (
    <EventsShell>
      <div className="mx-auto w-full  min-w-0 px-3 md:px-4 py-2  text-zinc-100">
        {/* header */}
        <header>
          <p className="text-[11px] hidden md:block mb-2 font-semibold uppercase tracking-widest text-zinc-500">
            University hub / <span className="text-zinc-300">Events</span>
          </p>
          {/* <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Events</h1>
              <p className="mt-2 text-zinc-400">
                University hackathons, technical workshops, and weekly coding clashes.
              </p>
            </div>
          </div> */}
        </header>

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <motion.div {...fadeUpProps}>
          <EventsHero
            featured={featured}
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={submitSearch}
            onClear={clearSearch}
            query={query}
          />
        </motion.div>

        {loading ? (
          <div className=" space-y-6" aria-busy="true">
            <div className="h-10 animate-pulse rounded-xl bg-white/5" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg md:rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-2">
              <EventsToolbar
                tabs={TABS}
                counts={counts}
                tab={tab}
                onTab={setTab}
                sorts={SORTS}
                sortIndex={sortIndex}
                onCycleSort={cycleSort}
                shown={visible.length}
                filters={filters}
                onFiltersChange={setFilters}
                filterCount={activeFilterCount(filters)}
                panelOpen={panelOpen}
                onTogglePanel={() => setPanelOpen((o) => !o)}
                onResetFilters={() => setFilters(DEFAULT_FILTERS)}
              />
            </div>

            {visible.length > 0 ? (
              <motion.div
                key={`${tab}|${query}|${sortIndex}|${JSON.stringify(filters)}`}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4"
              >
                {visible.map((e) => (
                  <motion.div key={e._id} variants={staggerItem}>
                    <EventCard event={e} now={now} onOpen={openEvent} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <p className="text-sm text-zinc-400">No programs match your search and filters.</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5"
                >
                  Clear search and filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </EventsShell>
  );
}