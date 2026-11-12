// Options and filtering for the events browse page.

export const TABS = [
  { key: "all", label: "All Programs" },
  { key: "hackathon", label: "Hackathons" },
  { key: "innovation_challenge", label: "Innovation Challenges" },
  { key: "startup_challenge", label: "Startup Challenges" },
];

export const SORTS = [
  { key: "soonest", label: "Soonest" },
  { key: "latest", label: "Latest" },
  { key: "xp", label: "Most XP" },
  { key: "az", label: "A–Z" },
];

export const STATUS_OPTIONS = [
  { key: "any", label: "Any status" },
  { key: "registration_open", label: "Open for registration" },
  { key: "live", label: "Live" },
  { key: "judging", label: "Judging" },
  { key: "ended", label: "Ended" },
];

export const PARTICIPATION_OPTIONS = [
  { key: "any", label: "Any" },
  { key: "individual", label: "Individual" },
  { key: "team", label: "Team" },
];

export const DATE_OPTIONS = [
  { key: "any", label: "Any time" },
  { key: "7d", label: "Next 7 days" },
  { key: "30d", label: "Next 30 days" },
];

export const DEFAULT_FILTERS = { status: "any", participation: "any", date: "any" };

const CATEGORY_NAME = Object.fromEntries(
  TABS.filter((t) => t.key !== "all").map((t) => [t.key, t.label])
);

const themeName = (t) => (typeof t === "string" ? t : t?.title || t?.name || "");

// Themes are searched only once they are revealed, matching what participants can see.
const matchesSearch = (e, q, now) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  const revealed = new Date(e.schedule.themeRevealAt).getTime() <= now;
  const fields = [e.title, e.tagline, e.overview, e.organizer, CATEGORY_NAME[e.category]];
  if (revealed) fields.push(...(e.themes || []).map(themeName));
  return fields.some((f) => (f || "").toLowerCase().includes(needle));
};

const DAY = 86400000;

// Keeps events that are running now or start within the chosen window.
const matchesDate = (e, key, now) => {
  if (key === "any") return true;
  const start = new Date(e.schedule.eventStartsAt).getTime();
  const end = new Date(e.schedule.eventEndsAt).getTime();
  const horizon = now + (key === "7d" ? 7 : 30) * DAY;
  return end >= now && start <= horizon;
};

/** True when an event passes the category tab, the search text and the filter panel. */
export const matchesBrowse = (e, { tab, query, filters, now }) =>
  (tab === "all" || e.category === tab) &&
  matchesSearch(e, query, now) &&
  (filters.status === "any" || e.status === filters.status) &&
  (filters.participation === "any" || e.participation.type === filters.participation) &&
  matchesDate(e, filters.date, now);

const SORT_FNS = {
  soonest: (a, b) => new Date(a.schedule.eventStartsAt) - new Date(b.schedule.eventStartsAt),
  latest: (a, b) => new Date(b.schedule.eventStartsAt) - new Date(a.schedule.eventStartsAt),
  xp: (a, b) => (b.xpReward || 0) - (a.xpReward || 0),
  az: (a, b) => (a.title || "").localeCompare(b.title || ""),
};

export const sortBrowse = (list, key) => [...list].sort(SORT_FNS[key]);

/** Number of filter panel groups that are not set to "any". */
export const activeFilterCount = (filters) =>
  Object.values(filters).filter((v) => v !== "any").length;