import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TbCalendarEvent, TbChevronLeft, TbChevronRight, TbSearch, TbX } from "react-icons/tb";
import { fmtDay, getBadge } from "../../utils/event/eventUtils";
import { posterUrl } from "../../utils/event/poster";

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 40;

// Faint grid behind the hero, faded toward the edges.
const gridStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
  backgroundSize: "36px 36px",
  maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
};

// Arrows: always visible on mobile. On desktop they appear while the carousel is hovered.
const ARROW =
  "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-zinc-100 transition hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 opacity-100 md:opacity-0 md:group-hover:opacity-100";

/**
 * Top of the events page. Static intro and the search form on the left, and a
 * featured carousel on the right when there are featured events.
 */
export default function EventsHero({ featured, draft, onDraftChange, onSubmit, onClear, query }) {
  return (
    <section className="relative overflow-hidden rounded-xl  border-white/[0.07] bg-[#0e1017] md:rounded-2xl">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={gridStyle} />

      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-5xl">
            Discover your next opportunity
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Explore curated innovation programs, hackathons, startup challenges and more. Find your next
            right opportunity to build.
          </p>

          <form role="search" onSubmit={onSubmit} className="mt-6 flex max-w-xl gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search programs</span>
              <TbSearch
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                autoComplete="off"
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                placeholder="Search innovation programs"
                className="w-full rounded-lg md:rounded-xl border border-white/10 bg-[#0f1216] py-2 md:py-3 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
              />
              {draft && (
                <button
                  type="button"
                  onClick={onClear}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-100"
                >
                  <TbX />
                </button>
              )}
            </label>
            <button
              type="submit"
              className="shrink-0 rounded-md md:rounded-lg bg-emerald-500 px-5 py-1 text-xs md:text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              Search
            </button>
          </form>

          {query && (
            <p className="mt-2 text-xs text-zinc-400">
              Showing results for “{query}”
            </p>
          )}
        </div>

        {featured.length > 0 && <FeaturedCarousel events={featured} />}
      </div>
    </section>
  );
}

function FeaturedCarousel({ events }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = events.length;

  // Hooks stay above any early return so their order never changes.
  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  const step = (d) => setIndex((i) => (i + d + count) % count);

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured events"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="group relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1017]"
    >
      {events.map((ev, i) => {
        const visible = i === index;
        const poster = posterUrl(ev);
        const badge = getBadge(ev);
        return (
          <Link
            key={ev._id}
            to={`/events/${ev._id}`}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
            className={`absolute inset-0 block transition-opacity duration-500 ${
              visible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {poster ? (
              <img
                src={poster}
                alt={ev.title}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_60%)]"
              />
            )}

            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#080b14]/90 via-[#080b14]/25 to-transparent"
            />

            <span className="absolute left-3 top-3 rounded-md border border-white/15 bg-black/30 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-200 backdrop-blur-sm">
              {badge.label}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-4 pr-16">
              <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-slate-100 md:text-lg">
                {ev.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-slate-300">
                <TbCalendarEvent className="shrink-0 text-xs text-slate-400 md:text-[14px]" />
                <span className="truncate text-[10px] md:text-base">
                  {fmtDay(ev.schedule.eventStartsAt)} • {ev.venue}
                </span>
              </p>
            </div>
          </Link>
        );
      })}

      {count > 1 && (
        <>
          <button type="button" onClick={() => step(-1)} aria-label="Previous event" className={`${ARROW} left-2`}>
            <TbChevronLeft />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next event" className={`${ARROW} right-2`}>
            <TbChevronRight />
          </button>

          <div className="absolute bottom-4 right-3 z-10 flex items-center gap-1.5">
            {events.map((ev, i) => (
              <button
                key={ev._id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${ev.title}`}
                aria-current={i === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-emerald-400" : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}