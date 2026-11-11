import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useEventsBrowse from "../../hooks/event/useEventsBrowse";
import EventBanner from "../../components/event/EventBanner";
import EventCard from "../../components/event/EventCard";
import EventFilters from "../../components/event/EventFilters";
import EventsShell from "../../components/event/EventsShell";
import {
  TABS,
  matchesQuery,
  matchesTab,
  sortEvents,
  useNow,
} from "../../utils/event/eventUtils";
import { fadeUpProps, staggerContainer, staggerItem } from "../../utils/event/motion";

// Shown in the header. Replace with the active term from tenant config.
const TERM_LABEL = "Fall 2025 • Term 1";

export default function EventsBrowsePage() {
  const { events, loading, error } = useEventsBrowse();
  const now = useNow();
  const navigate = useNavigate();

  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date_asc");

  const featured = useMemo(() => events.filter((e) => e.featured).slice(0, 5), [events]);

  // Counts come from the loaded list. The real API should return them, because
  // a paginated list can't give accurate totals on its own.
  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, events.filter((e) => matchesTab(e, t.key)).length])),
    [events]
  );

  const visible = useMemo(
    () => sortEvents(events.filter((e) => matchesTab(e, tab) && matchesQuery(e, query)), sort),
    [events, tab, query, sort]
  );

  const openEvent = (e) => navigate(`/events/${e._id}`);
  const resetFilters = () => {
    setTab("all");
    setQuery("");
  };

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
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
              {TERM_LABEL}
            </span>
          </div> */}
        </header>

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className=" space-y-6" aria-busy="true">
            <div className="h-[300px] animate-pulse rounded-lg md:rounded-xl bg-white/5 md:h-[380px]" />
            <div className="h-10 animate-pulse rounded-xl bg-white/5" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg md:rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <motion.div {...fadeUpProps} className="">
                <EventBanner events={featured} onOpen={openEvent} />
              </motion.div>
            )}

            <div className="mt-2">
              <EventFilters
                tab={tab}
                onTab={setTab}
                counts={counts}
                query={query}
                onQuery={setQuery}
                sort={sort}
                onSort={setSort}
              />
            </div>

            {visible.length > 0 ? (
              <motion.div
                key={`${tab}|${query}|${sort}`}
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
                <p className="text-sm text-zinc-400">No events match these filters.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </EventsShell>
  );
}