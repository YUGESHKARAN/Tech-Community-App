
import React, { useEffect, useState } from "react";
import { HiOutlineSearch, HiOutlineAdjustments } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import {
  RANGE_OPTIONS,
  AUDIENCE_OPTIONS,
} from "../../hooks/announcement/useAnnouncementFilters"

const EASE = [0.22, 1, 0.36, 1];

const QUICK_RANGES = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

const chip = (active) =>
  `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl border px-3 py-1 text-[10px] md:text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 ${
    active
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
      : "border-slate-700 bg-white/[0.02] text-slate-300 hover:border-slate-600 hover:text-white"
  }`;

const dateInput =
  "w-full rounded-md border border-slate-700 theme px-3 py-2 text-xs text-slate-200 [color-scheme:dark] focus:border-emerald-500/40 focus:outline-none";

const fmtDate = (s) => {
  if (!s) return "…";
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

function Section({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function Removable({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Remove filter ${label}`}
      className="inline-flex max-w-[200px] items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 py-1 pl-2.5 pr-1.5 text-[11px] text-emerald-300 transition-colors hover:bg-emerald-500/20"
    >
      <span className="truncate">{label}</span>
      <IoClose className="shrink-0 text-sm" />
    </button>
  );
}

function AnnouncementFilterBar({
  filters,
  setFilters,
  clearAll,
  activeCount,
  publishers,
  total,
  shown,
  queryInput,
  setQueryInput,
}) {
  const [open, setOpen] = useState(false);

  /* Scroll lock + Escape while the panel is open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const panelCount = activeCount - (filters.q.trim() ? 1 : 0);
  const customActive =
    filters.range === "custom" && (filters.from || filters.to);
  const audienceLabel = AUDIENCE_OPTIONS.find(
    (a) => a.value === filters.audience,
  )?.label;

  const togglePublisher = (key) =>
    setFilters({
      publishers: filters.publishers.includes(key)
        ? filters.publishers.filter((k) => k !== key)
        : [...filters.publishers, key],
    });

  return (
    <div className="space-y-3">
      {/* Search + filters button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-500" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search announcements"
            aria-label="Search announcements"
            className="theme w-full rounded-lg border border-slate-700 py-2 pl-9 pr-9 text-xs text-slate-100 placeholder:text-slate-500 transition-colors focus:border-emerald-500/40 focus:outline-none md:text-sm"
          />
          {queryInput && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQueryInput("")}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <IoClose className="text-sm" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="theme relative inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 md:text-sm"
        >
          <HiOutlineAdjustments className="text-base text-emerald-400" />
          Filters
          {panelCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold tabular-nums text-slate-950">
              {panelCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick date range + sort */}
      <div className="flex items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Date range"
          className="scrollbar-hide -mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1"
        >
          {QUICK_RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              aria-pressed={filters.range === r.value}
              onClick={() => setFilters({ range: r.value })}
              className={chip(filters.range === r.value)}
            >
              {r.label}
            </button>
          ))}
          {filters.range === "custom" && (
            <button
              type="button"
              aria-pressed="true"
              onClick={() => setOpen(true)}
              className={chip(true)}
            >
              {customActive
                ? `${fmtDate(filters.from)} – ${fmtDate(filters.to)}`
                : "Custom"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setFilters({ sort: filters.sort === "newest" ? "oldest" : "newest" })
          }
          className="hidden shrink-0 items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-200 sm:inline-flex"
        >
          {filters.sort === "newest" ? "Newest first" : "Oldest first"}
          <span aria-hidden="true">{filters.sort === "newest" ? "↓" : "↑"}</span>
        </button>
      </div>

      {/* Applied filters */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {customActive && (
            <Removable
              label={`${fmtDate(filters.from)} – ${fmtDate(filters.to)}`}
              onClick={() => setFilters({ range: "all" })}
            />
          )}
          {filters.audience && (
            <Removable
              label={audienceLabel}
              onClick={() => setFilters({ audience: "" })}
            />
          )}
          {filters.publishers.map((key) => (
            <Removable
              key={key}
              label={publishers.find((p) => p.key === key)?.name || key}
              onClick={() => togglePublisher(key)}
            />
          ))}
          {filters.poster && (
            <Removable
              label="Has poster"
              onClick={() => setFilters({ poster: false })}
            />
          )}
          {filters.links && (
            <Removable
              label="Has links"
              onClick={() => setFilters({ links: false })}
            />
          )}

          <span className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
            <span className="tabular-nums">
              Showing {shown} of {total}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Clear all
            </button>
          </span>
        </div>
      )}

      {/* Filter panel: bottom sheet on mobile, dialog on desktop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="filter-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-4"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filter announcements"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="theme flex max-h-[85vh] w-full flex-col rounded-t-xl border border-emerald-500/20 md:max-w-md "
            >
              <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-white/15 md:hidden" />

              <div className="flex items-center justify-between px-5 pb-2 pt-3 md:pt-4">
                <h2 className="text-sm font-semibold text-slate-100">
                  Filter announcements
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <IoClose className="text-lg" />
                </button>
              </div>

              <div className="scrollbar-hide flex-1 space-y-5 overflow-y-auto px-5 pb-4 pt-2">
                <Section label="Sort by">
                  <div className="flex gap-2">
                    {[
                      { v: "newest", l: "Newest first" },
                      { v: "oldest", l: "Oldest first" },
                    ].map((o) => (
                      <button
                        key={o.v}
                        type="button"
                        aria-pressed={filters.sort === o.v}
                        onClick={() => setFilters({ sort: o.v })}
                        className={chip(filters.sort === o.v)}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section label="Date">
                  <div className="flex flex-wrap gap-2">
                    {RANGE_OPTIONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        aria-pressed={filters.range === r.value}
                        onClick={() => setFilters({ range: r.value })}
                        className={chip(filters.range === r.value)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  {filters.range === "custom" && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <label className="space-y-1">
                        <span className="text-[11px] text-slate-500">From</span>
                        <input
                          type="date"
                          value={filters.from}
                          max={filters.to || undefined}
                          onChange={(e) => setFilters({ from: e.target.value })}
                          className={dateInput}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[11px] text-slate-500">To</span>
                        <input
                          type="date"
                          value={filters.to}
                          min={filters.from || undefined}
                          onChange={(e) => setFilters({ to: e.target.value })}
                          className={dateInput}
                        />
                      </label>
                    </div>
                  )}
                </Section>

                <Section label="Audience">
                  <div className="flex flex-wrap gap-2">
                    {AUDIENCE_OPTIONS.map((a) => (
                      <button
                        key={a.value || "any"}
                        type="button"
                        aria-pressed={filters.audience === a.value}
                        onClick={() => setFilters({ audience: a.value })}
                        className={chip(filters.audience === a.value)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </Section>

                {publishers.length > 1 && (
                  <Section label="Published by">
                    <div className="scrollbar-hide flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                      {publishers.map((p) => {
                        const active = filters.publishers.includes(p.key);
                        return (
                          <button
                            key={p.key}
                            type="button"
                            aria-pressed={active}
                            onClick={() => togglePublisher(p.key)}
                            className={chip(active)}
                          >
                            <span className="max-w-[140px] truncate">
                              {p.name}
                            </span>
                            <span className="text-[10px] tabular-nums opacity-60">
                              {p.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                <Section label="Contains">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-pressed={filters.poster}
                      onClick={() => setFilters({ poster: !filters.poster })}
                      className={chip(filters.poster)}
                    >
                      Has poster
                    </button>
                    <button
                      type="button"
                      aria-pressed={filters.links}
                      onClick={() => setFilters({ links: !filters.links })}
                      className={chip(filters.links)}
                    >
                      Has links
                    </button>
                  </div>
                </Section>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-3">
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={activeCount === 0}
                  className="text-xs font-medium text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-slate-400"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-emerald-600/20 px-4 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                >
                  Show {shown} {shown === 1 ? "result" : "results"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnnouncementFilterBar;