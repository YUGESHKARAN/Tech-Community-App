
import { useEffect, useState } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { CATEGORY_LABEL, fmtDay, getCta, seatsLeft } from "../../utils/event/eventUtils";

const AUTOPLAY_MS = 6000;

const CTA_STYLES = {
  primary: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
  ghost: "border border-white/15 text-zinc-100 hover:bg-white/5",
  disabled: "bg-white/5 text-zinc-500 cursor-not-allowed",
};

export default function EventBanner({ events, onOpen }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
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
  const step = (d) => setIndex((i) => (i + d + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured events"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[300px] overflow-hidden rounded-lg md:rounded-xl border border-white/[0.07] bg-[#0f1216] md:min-h-[380px]">
        {/* decorative grid and glow */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:36px_36px]"
        />
        <div
          aria-hidden
          className="absolute -right-24 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]"
        />

        <div className="relative flex min-h-[300px] flex-col justify-between gap-6 p-5 md:min-h-[380px] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-md border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Featured
            </span>
            <span className="text-xs text-zinc-400">
              Organized by {current.organizer} • {CATEGORY_LABEL[current.category]}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400 line-clamp-1">
              {current.tagline}
            </p>
            <h2 className="mt-2 break-words text-4xl font-black leading-[0.95] tracking-tight text-zinc-100 md:text-6xl">
              {current.title}
            </h2>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-base font-semibold text-zinc-100">{current.overview}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {fmtDay(current.schedule.eventStartsAt)} – {fmtDay(current.schedule.eventEndsAt)}
                {" • "}
                {current.venue}
                {" • "}
                <span className="text-emerald-400">+{current.xpReward} XP</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:shrink-0">
              {seats !== null && (
                <span className="text-xs text-zinc-400">
                  {seats} / {current.capacity.maxParticipants} seats remaining
                </span>
              )}
              <button
                type="button"
                disabled={cta.variant === "disabled"}
                onClick={() => onOpen(current)}
                className={`rounded-lg md:rounded-xl md:px-5 px-3 py-1.5 md:py-3 text-xs md:text-sm font-semibold transition ${CTA_STYLES[cta.variant]}`}
              >
                {cta.label === "Register" ? "Register now" : cta.label}
              </button>
            </div>
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous event"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-zinc-100 hover:bg-black/70"
            >
              <TbChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next event"
              className="absolute right-2 top-1/2 flex md:h-9 h-7 w-7 md:w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-zinc-100 hover:bg-black/70"
            >
              <TbChevronRight />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {events.map((e, i) => (
            <button
              key={e._id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${e.title}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-emerald-400" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}