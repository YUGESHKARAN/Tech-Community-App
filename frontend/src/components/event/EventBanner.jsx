import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TbCalendarEvent } from "react-icons/tb";
import { CATEGORY_LABEL, fmtDay, getBadge, getCta, seatsLeft } from "../../utils/event/eventUtils";
import { posterUrl } from "../../utils/event/poster";
import { EASE } from "../../utils/event/motion";

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 40;

// Left-side text fades and slides as the event changes.
const SLIDE_TEXT = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: EASE },
};

const CTA_STYLES = {
  primary: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
  ghost: "border border-white/15 text-zinc-100 hover:bg-white/5",
  disabled: "bg-white/5 text-zinc-500 cursor-not-allowed",
};

// Faint tech grid behind the banner, faded toward the edges.
const gridStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
  backgroundSize: "36px 36px",
  maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
};

/**
 * Featured carousel. Event details and the primary action sit on the left.
 * On the right, a 16:9 box cycles through the events, one slide at a time, each
 * with a status chip, title and date over a dark gradient. Dots sit at the
 * bottom right. It advances every 6 seconds, pauses while hovered, and swipes on touch.
 */
export default function EventBanner({ events, onOpen }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = events.length;

  // Hooks stay above the early return so their order never changes.
  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (!count) return null;

  const current = events[Math.min(index, count - 1)];
  const cta = getCta(current);
  const seats = seatsLeft(current);
  const ctaLabel = cta.label === "Register" ? "Register now" : cta.label;
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
    <section
      aria-roledescription="carousel"
      aria-label="Featured events"
      className="relative mx-auto max-w-[1800px] overflow-hidden rounded-lg border-white/[0.07] bg-[#0e1017] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:bg-[#13161f] md:rounded-xl md:border"
    >
      <div className="pointer-events-none absolute inset-0" style={gridStyle} />

      <div className="relative grid items-center gap-6 p-4 md:p-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* left: event details and primary action */}
        <div className="flex min-h-[22rem] min-w-0 max-w-xl flex-col justify-center">
          <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current._id} {...SLIDE_TEXT} className="flex flex-col gap-4">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-400">
              Featured
            </span>
            <span className="min-w-0 truncate text-slate-400">
              Organized by {current.organizer} • {CATEGORY_LABEL[current.category]}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 line-clamp-1">
              {current.tagline}
            </p>
            <h2 className="mt-2 break-words text-2xl font-semibold leading-[1.1] tracking-tight text-slate-100 line-clamp-3 md:text-4xl">
              {current.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-2 md:text-[15px]">
              {current.overview}
            </p>
          </div>

          <div className="space-y-1 text-xs text-slate-400 md:text-sm">
            <p className="line-clamp-2">
              {fmtDay(current.schedule.eventStartsAt)} – {fmtDay(current.schedule.eventEndsAt)}
              {" • "}
              {current.venue}
              {" • "}
              <span className="text-emerald-400">+{current.xpReward} XP</span>
            </p>
            {seats !== null && (
              <p>
                {seats} / {current.capacity.maxParticipants} seats remaining
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              disabled={cta.variant === "disabled"}
              onClick={() => onOpen(current)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition md:py-3 ${CTA_STYLES[cta.variant]}`}
            >
              {ctaLabel}
            </button>
          </div>
          </motion.div>
          </AnimatePresence>
        </div>

        {/* right: carousel box, matching the reference */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1017]"
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

                {/* scrim for text legibility */}
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
            <div className="absolute bottom-4 right-3 flex items-center gap-1.5">
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
          )}
        </div>
      </div>
    </section>
  );
}