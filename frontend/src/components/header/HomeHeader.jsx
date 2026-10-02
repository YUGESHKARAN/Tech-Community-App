import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { TbSun, TbTrophy, TbCode, TbCalendarEvent } from "react-icons/tb";

import event1 from "../../assets/events/event-bytes-16x9.png"
import event2 from "../../assets/events/event-slug-16x9.png"

/* Demo data: replace with your events API.
   `image` is the admin-uploaded cover URL; leave empty to show the grid fallback. */
const UPCOMING = [
   {
    id: 1,
    type: "contest",
    name: "Bytes Contest",
    date: "Dec 22",
    status: "Coming Soon",
    title: "Bytes Base Innovate 2.0 - 2026",
    // meta: "Oct 22 · Main Auditorium · +200 XP",
    meta: "Coming Soon...",
    image: event1,
    href: "/home",
  },
  {
    id: 2,
    type: "challenge",
    name: "Summer Challenge",
    date: "May 18",
    status: "Coming Soon",
    title: "Summer Challenge 2027",
    // meta: "Oct 18 – Nov 15 · Online · +500 XP",
    meta: "Coming Soon...",
    image: event2,
    href: "/home",
  },
 
//   {
//     id: 3,
//     type: "hackathon",
//     name: "HackSprint 2.0",
//     date: "Nov 02",
//     status: "Coming soon",
//     title: "HackSprint 2.0",
//     // meta: "Nov 02 – Nov 03 · 24-hour buildathon · +500 XP",
//     meta: "Coming Soon...",
//     image: "",
//     href: "/events",
//   },
];

const TYPE_ICON = {
  challenge: TbSun,
  contest: TbTrophy,
  hackathon: TbCode,
};

const gridStyle = {
  backgroundImage: [
    "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
    "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
  ].join(","),
  backgroundSize: "96px 96px, 96px 96px, 24px 24px, 24px 24px",
  WebkitMaskImage:
    "radial-gradient(ellipse 80% 120% at 25% 40%, black 0%, transparent 80%)",
  maskImage:
    "radial-gradient(ellipse 80% 120% at 25% 40%, black 0%, transparent 80%)",
};

function HomeHeader({ events = UPCOMING }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = events?.length || 0;

  // Autoplay (pauses on hover)
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [paused, count]);

  if (!count) return null;

  const go = (dir) => setIndex((i) => (i + dir + count) % count);

  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };
//   #12151c

  return (
    <section className="relative overflow-hidden rounded-lg md:rounded-xl md:border border-white/[0.07] bg-[#13161f] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* Tech grid */}
      <div className="pointer-events-none absolute inset-0" style={gridStyle} />

      <div className="relative grid items-center gap-6 p-4 md:p-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* ---------- Left: coming soon content ---------- */}
        <div className="min-w-0 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Coming soon
          </span>

          {/* <h1 className="mt-4 text-2xl font-semibold leading-[1.1] tracking-tight bg-gradient-to-r from-slate-100 to-emerald-300 bg-clip-text text-transparent  md:text-4xl"> */}
          <h1 className="mt-4 text-2xl font-semibold leading-[1.1] tracking-tight text-slate-100  md:text-4xl">
            Build something this summer.
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 md:text-[15px]">
            Seasonal challenges, contests and hackathons open soon. Xplore platfrom
            to earn bonus XP and climb the leaderboard from day one.
          </p>

          <p className="mt-6 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Upcoming programs
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {events.map((ev, i) => {
              const Icon = TYPE_ICON[ev.type] || TbCalendarEvent;
              const active = i === index;
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left transition-colors ${
                    active
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon
                    className={`text-[15px] ${active ? "text-emerald-400" : "text-slate-400"}`}
                  />
                  <span
                    className={`text-xs font-medium ${active ? "text-emerald-300" : "text-slate-200"}`}
                  >
                    {ev.name}
                  </span>
                  <span className="text-xs tabular-nums text-slate-500">
                    {ev.date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Right: carousel banner ---------- */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1017]"
        >
          {events.map((ev, i) => {
            const visible = i === index;
            return (
              <Link
                key={ev.id}
                to={ev.href || "/events"}
                tabIndex={visible ? 0 : -1}
                aria-hidden={!visible}
                className={`absolute inset-0 block transition-opacity duration-500 ${
                  visible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {ev.image ? (
                  <img
                    src={ev.image}
                    alt={ev.title}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{ ...gridStyle, WebkitMaskImage: "none", maskImage: "none" }}
                    />
                    <p className="absolute left-4 top-1/2 -translate-y-1/2 text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white/[0.07]">
                      {ev.name}
                    </p>
                  </>
                )}

                {/* Scrim for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b14]/90 via-[#080b14]/25 to-transparent" />

                {/* Status chip */}
                <span className="absolute left-3 top-3 rounded-md border border-white/15 bg-black/30 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-200 backdrop-blur-sm">
                  {ev.status}
                </span>

                {/* Title + meta */}
                <div className="absolute inset-x-0 bottom-0 p-4 pr-16">
                  <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-slate-300 md:text-lg">
                    {ev.title}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5  text-slate-300">
                    <TbCalendarEvent className="shrink-0 text-xs md:text-[14px] text-slate-400" />
                    <span className="truncate text-[10px] md:text-base">{ev.meta}</span>
                  </p>
                </div>
              </Link>
            );
          })}

          {/* Dots */}
          {count > 1 && (
            <div className="absolute bottom-4 right-3 flex items-center gap-1.5">
              {events.map((ev, i) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${ev.title}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-4 bg-emerald-400"
                      : "w-1.5 bg-white/30 hover:bg-white/50"
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

export default HomeHeader;