import { useEffect, useState } from "react";

// ── time ─────────────────────────────────────────────────────────────────────

const DAY = 86400000;
const HOUR = 3600000;
const MIN = 60000;
const IST = { timeZone: "Asia/Kolkata" };

/** Re-renders on an interval so countdowns stay current. */
export const useNow = (intervalMs = 30000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

export const fmtDay = (d) =>
  new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric", ...IST });

export const fmtDuration = (ms) => {
  if (ms <= 0) return "0m";
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / MIN);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m`;
};

// ── theme reveal ─────────────────────────────────────────────────────────────

/**
 * Themes are visible once schedule.themeRevealAt has passed. A missing value
 * means the event was saved before the field existed, so its themes are shown.
 */
export const themesRevealedAt = (e, now = Date.now()) => {
  const at = e.schedule?.themeRevealAt;
  if (!at) return true;
  return now >= new Date(at).getTime();
};

/** Text for cards and banners while themes are still hidden. Null once revealed. */
export const themeRevealHint = (e, now) => {
  if (themesRevealedAt(e, now)) return null;
  const at = new Date(e.schedule.themeRevealAt).getTime();
  return `Themes reveal in ${fmtDuration(at - now)}`;
};

// ── labels and tabs ──────────────────────────────────────────────────────────

export const CATEGORY_LABEL = {
  hackathon: "Hackathon",
  innovation_challenge: "Innovation",
  startup_challenge: "Startup",
};

export const TABS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "registered", label: "Registered" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const UPCOMING_STATUSES = ["upcoming", "registration_open", "registration_closed"];
const PAST_STATUSES = ["judging", "ended"];

export const matchesTab = (e, tab) => {
  switch (tab) {
    case "live":
      return e.status === "live";
    case "registered":
      return Boolean(e.myRegistration);
    case "upcoming":
      return UPCOMING_STATUSES.includes(e.status);
    case "past":
      return PAST_STATUSES.includes(e.status);
    default:
      return true;
  }
};

// ── sort and search ──────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { key: "date_asc", label: "Date (Ascending)" },
  { key: "date_desc", label: "Date (Descending)" },
  { key: "xp_desc", label: "XP (Highest)" },
  { key: "popular", label: "Most participants" },
];

export const sortEvents = (list, sort) => {
  const arr = [...list];
  const start = (e) => new Date(e.schedule.eventStartsAt).getTime();
  switch (sort) {
    case "date_desc":
      return arr.sort((a, b) => start(b) - start(a));
    case "xp_desc":
      return arr.sort((a, b) => b.xpReward - a.xpReward);
    case "popular":
      return arr.sort((a, b) => b.counters.registrationCount - a.counters.registrationCount);
    default:
      return arr.sort((a, b) => start(a) - start(b));
  }
};

/**
 * Searches title, overview, and category always. Themes are searched only
 * after they're revealed, so hidden themes don't leak through search.
 */
export const matchesQuery = (e, q, now = Date.now()) => {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const searchable = [e.title, e.overview, CATEGORY_LABEL[e.category]];
  if (themesRevealedAt(e, now)) searchable.push(...(e.themes || []));
  return searchable.filter(Boolean).some((v) => v.toLowerCase().includes(s));
};

// ── seats and XP ─────────────────────────────────────────────────────────────

export const seatsLeft = (e) => {
  const max = e.capacity?.maxParticipants;
  return max ? Math.max(0, max - e.counters.registrationCount) : null;
};

export const xpLabel = (e) =>
  ["judging", "ended"].includes(e.status) ? `+${e.xpReward} XP earned` : `+${e.xpReward} XP`;

// ── badge, CTA, footer ───────────────────────────────────────────────────────

export const BADGE_TONES = {
  live: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40",
  amber: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  muted: "bg-white/5 text-zinc-400 ring-1 ring-white/10",
  emerald: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30",
  teal: "bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/30",
};

export const getBadge = (e) => {
  if (e.status === "live")
    return { label: `Live • ${e.counters.registrationCount} participating`, tone: "live" };
  if (e.status === "judging") return { label: "Judging", tone: "amber" };
  if (e.status === "ended") return { label: "Completed", tone: "muted" };
  if (e.myRegistration) return { label: "Registered", tone: "emerald", check: true };
  if (e.status === "registration_open") return { label: "Registration open", tone: "teal" };
  if (e.status === "registration_closed") return { label: "Registration closed", tone: "muted" };
  return { label: "Upcoming", tone: "muted" };
};

export const getCta = (e) => {
  switch (e.status) {
    case "live":
      return e.myRegistration
        ? { label: "Join now", variant: "primary" }
        : { label: "Watch", variant: "ghost" };
    case "judging":
      return { label: "Judging", variant: "disabled" };
    case "ended":
      return { label: "View recap", variant: "ghost" };
    case "registration_open":
      return e.myRegistration
        ? { label: "View", variant: "ghost" }
        : { label: "Register", variant: "primary" };
    case "registration_closed":
      return e.myRegistration
        ? { label: "View", variant: "ghost" }
        : { label: "Closed", variant: "disabled" };
    default:
      return { label: "Opens soon", variant: "disabled" };
  }
};

export const getFooter = (e, now) => {
  const start = new Date(e.schedule.eventStartsAt).getTime();
  const end = new Date(e.schedule.eventEndsAt).getTime();
  if (e.status === "live") return `Ends in ${fmtDuration(end - now)}`;
  if (e.status === "judging") return "Judging in progress";
  if (e.status === "ended") return `Past • ${e.counters.registrationCount} attended`;
  if (e.myRegistration && start > now) return `Starts in ${fmtDuration(start - now)}`;
  return `${fmtDay(start)} • ${e.venue}`;
};