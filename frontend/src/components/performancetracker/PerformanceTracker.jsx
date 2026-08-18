import React, { useMemo } from "react";
import { TbFlame, TbTrophy, TbCalendar, TbBolt } from "react-icons/tb";

// ─────────────────────────────────────────────────────────────────────────────
//  SAMPLE DATA
//  Replace with real data from useGetPerformanceTracker(email) hook.
//
//  API response shape:
//  {
//    currentStreak:  number,           // consecutive active days up to today
//    longestStreak:  number,           // all-time highest streak
//    lastActiveDate: "YYYY-MM-DD",     // Asia/Kolkata date string
//    contributions: {                  // UserContributions.days map
//      "YYYY-MM-DD": number,           // total weighted points for that day
//    }
//  }
// ─────────────────────────────────────────────────────────────────────────────
const generateSampleContributions = () => {
  const today    = new Date();
  const data     = {};
  const patterns = [5, 0, 3, 8, 0, 1, 6, 0, 0, 3, 15, 0, 5, 1];

  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    // realistic sparse pattern
    const weight = patterns[i % patterns.length];
    if (weight > 0 && Math.random() > 0.3) {
      data[key] = weight + Math.floor(Math.random() * 4);
    }
  }
  // recent active streak — last 6 days always active
  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data[d.toISOString().slice(0, 10)] = 3 + Math.floor(Math.random() * 10);
  }
  return data;
};

export const SAMPLE_PERFORMANCE = {
  currentStreak:  6,
  longestStreak:  14,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  contributions:  generateSampleContributions(),
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive the effective streak to display.
 * If lastActiveDate is neither today nor yesterday, the streak has
 * lapsed — show 0 rather than the stored (stale) currentStreak.
 * This is the "derive at read time" pattern from the production plan.
 */
const effectiveStreak = (currentStreak, lastActiveDate) => {
  if (!lastActiveDate) return 0;
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr     = today.toISOString().slice(0, 10);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (lastActiveDate === todayStr || lastActiveDate === yesterdayStr) {
    return currentStreak;
  }
  return 0; // streak lapsed — correct on read, no write needed
};

/**
 * Map a daily point total to an intensity level 0–4.
 * Mirrors the leaderboard point weights.
 */
const pointsToLevel = (pts) => {
  if (!pts || pts === 0) return 0;
  if (pts <= 4)          return 1;
  if (pts <= 9)          return 2;
  if (pts <= 14)         return 3;
  return 4;
};

/**
 * Build a 13-week × 7-day grid (91 days) ending today.
 * Returns an array of week arrays, each containing 7 day objects.
 */
const buildGrid = (contributions) => {
  const today = new Date();
  // start from the Sunday 12 weeks ago so weeks align cleanly
  const gridStart = new Date(today);
  gridStart.setDate(gridStart.getDate() - 90);
  // rewind to the nearest Sunday
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const weeks = [];
  let current = new Date(gridStart);

  while (current <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key      = current.toISOString().slice(0, 10);
      const points   = contributions?.[key] || 0;
      const isFuture = current > today;
      week.push({
        date:   key,
        points,
        level:  isFuture ? -1 : pointsToLevel(points),
        future: isFuture,
      });
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

/** Month labels positioned over the grid */
const buildMonthLabels = (weeks) => {
  const labels = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    const firstDay   = week.find((d) => !d.future);
    if (!firstDay) return;
    const month      = new Date(firstDay.date).getMonth();
    const monthName  = new Date(firstDay.date).toLocaleString("default", { month: "short" });
    if (month !== lastMonth) {
      labels.push({ index: wi, label: monthName });
      lastMonth = month;
    }
  });
  return labels;
};

/** Total qualifying activity days in the grid */
const countActiveDays = (contributions) =>
  Object.values(contributions || {}).filter((v) => v > 0).length;

/** Total points across all days */
const totalPoints = (contributions) =>
  Object.values(contributions || {}).reduce((sum, v) => sum + v, 0);

// ── Level → color (using inline styles so it works without Tailwind JIT) ──────
const LEVEL_COLORS = {
  "-1": "transparent",                           // future
  "0":  "rgba(255,255,255,0.04)",               // no activity
  "1":  "rgba(13,148,136,0.25)",                // light  (#0d9488 at 25%)
  "2":  "rgba(13,148,136,0.50)",                // medium
  "3":  "rgba(13,148,136,0.75)",                // strong
  "4":  "rgba(13,148,136,1.00)",                // peak
};

const LEVEL_BORDER = {
  "-1": "transparent",
  "0":  "rgba(255,255,255,0.04)",
  "1":  "rgba(13,148,136,0.30)",
  "2":  "rgba(13,148,136,0.55)",
  "3":  "rgba(13,148,136,0.80)",
  "4":  "rgba(13,148,136,1.00)",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─────────────────────────────────────────────────────────────────────────────
//  STREAK WIDGET
// ─────────────────────────────────────────────────────────────────────────────
const StreakWidget = ({ currentStreak, longestStreak, lastActiveDate }) => {
  const displayStreak = effectiveStreak(currentStreak, lastActiveDate);
  const streakLapsed  = displayStreak === 0 && currentStreak > 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* current streak */}
      <div className="theme border border-[#1e293b] rounded-xl p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 mb-1">
          <TbFlame
            className={`text-base ${
              displayStreak > 0 ? "text-amber-400" : "text-gray-600"
            }`}
          />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Current streak
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-bold ${
              displayStreak > 0 ? "text-gray-100" : "text-gray-600"
            }`}
          >
            {displayStreak}
          </span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        {streakLapsed ? (
          <p className="text-[10px] text-amber-500/70 mt-0.5">
            Streak ended — post today to start again
          </p>
        ) : displayStreak > 0 ? (
          <p className="text-[10px] text-emerald-500/70 mt-0.5">
            Keep it going!
          </p>
        ) : (
          <p className="text-[10px] text-gray-600 mt-0.5">
            Post today to start a streak
          </p>
        )}
      </div>

      {/* longest streak */}
      <div className="theme border border-[#1e293b] rounded-xl p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 mb-1">
          <TbTrophy className="text-base text-amber-400/60" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Longest streak
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-100">
            {longestStreak}
          </span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        <p className="text-[10px] text-gray-600 mt-0.5">All-time personal best</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
const Tooltip = ({ day }) => {
  const date   = new Date(day.date);
  const label  = date.toLocaleDateString("en-IN", {
    weekday: "short", month: "short", day: "numeric",
  });
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50
                    pointer-events-none whitespace-nowrap
                    bg-[#0f172a] border border-white/10 rounded-lg px-2.5 py-1.5
                    shadow-xl text-[10px] text-gray-200">
      {day.points > 0
        ? <><b className="text-emerald-400">{day.points} pts</b> · {label}</>
        : <>No activity · {label}</>
      }
      {/* arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4
                      border-transparent border-t-white/10" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  ACTIVITY GRAPH
// ─────────────────────────────────────────────────────────────────────────────
const ActivityGraph = ({ contributions, isOwn }) => {
  const weeks        = useMemo(() => buildGrid(contributions), [contributions]);
  const monthLabels  = useMemo(() => buildMonthLabels(weeks), [weeks]);
  const activeDays   = countActiveDays(contributions);
  const pts          = totalPoints(contributions);

  const [hoveredDay, setHoveredDay] = React.useState(null);

  const CELL_SIZE = 11; // px
  const GAP       = 3;  // px
  const STEP      = CELL_SIZE + GAP;

  return (
    <div className="theme border border-[#1e293b] rounded-xl p-4">
      {/* header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TbCalendar className="text-sm text-gray-500" />
          <span className="text-xs font-semibold text-gray-300">
            Activity — last 3 months
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span>
            <b className="text-gray-300">{activeDays}</b> active days
          </span>
          <span>
            <b className="text-gray-300">{pts}</b> total pts
          </span>
        </div>
      </div>

      {/* graph */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: weeks.length * STEP + 24 }}>
          {/* month labels */}
          <div
            className="flex mb-1"
            style={{ paddingLeft: 24 }}
          >
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.index === wi);
              return (
                <div
                  key={wi}
                  style={{ width: STEP, flexShrink: 0 }}
                  className="text-[9px] text-gray-600"
                >
                  {ml ? ml.label : ""}
                </div>
              );
            })}
          </div>

          {/* day rows */}
          <div className="flex gap-0">
            {/* day-of-week labels */}
            <div
              className="flex flex-col"
              style={{ gap: GAP, marginRight: 4 }}
            >
              {DAY_NAMES.map((d, i) => (
                <div
                  key={d}
                  style={{
                    height:     CELL_SIZE,
                    lineHeight: `${CELL_SIZE}px`,
                    fontSize:   9,
                    color:      "rgba(156,163,175,0.6)",
                    // only show Mon, Wed, Fri to reduce clutter
                    visibility: [1, 3, 5].includes(i) ? "visible" : "hidden",
                    width:      20,
                    textAlign:  "right",
                    paddingRight: 4,
                    flexShrink: 0,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* week columns */}
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="flex flex-col"
                style={{ gap: GAP, marginRight: GAP }}
              >
                {week.map((day) => (
                  <div
                    key={day.date}
                    className="relative"
                    style={{ width: CELL_SIZE, height: CELL_SIZE, flexShrink: 0 }}
                    onMouseEnter={() => !day.future && setHoveredDay(day.date)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div
                      style={{
                        width:        CELL_SIZE,
                        height:       CELL_SIZE,
                        borderRadius: 2,
                        background:   day.future
                          ? "transparent"
                          : LEVEL_COLORS[String(day.level)],
                        border:       `1px solid ${
                          day.future
                            ? "transparent"
                            : LEVEL_BORDER[String(day.level)]
                        }`,
                        cursor:       day.points > 0 ? "pointer" : "default",
                      }}
                    />
                    {hoveredDay === day.date && <Tooltip day={day} />}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* legend */}
          <div
            className="flex items-center gap-1.5 mt-3 justify-end"
            style={{ paddingRight: 0 }}
          >
            <span className="text-[9px] text-gray-600">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                style={{
                  width:        CELL_SIZE,
                  height:       CELL_SIZE,
                  borderRadius: 2,
                  background:   LEVEL_COLORS[String(level)],
                  border:       `1px solid ${LEVEL_BORDER[String(level)]}`,
                  flexShrink:   0,
                }}
              />
            ))}
            <span className="text-[9px] text-gray-600">More</span>
          </div>
        </div>
      </div>

      {/* point scale note */}
      <div className="flex gap-3 mt-3 pt-3 border-t border-white/5 flex-wrap">
        {[
          { label: "Post", pts: "5 pts", color: "#0d9488" },
          { label: "Discussion", pts: "3 pts", color: "#0d9488" },
          { label: "Reply", pts: "1 pt",  color: "#0d9488" },
        ].map(({ label, pts }) => (
          <span key={label} className="flex items-center gap-1 text-[9px] text-gray-500">
            <TbBolt className="text-[10px] text-emerald-500/60" />
            <b className="text-gray-400">{label}</b> = {pts}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * PerformanceTracker
 *
 * Props:
 *   data    — shaped like SAMPLE_PERFORMANCE above.
 *             Replace with real API data when hook is ready.
 *   isOwn   — true when viewing your own profile (shows private streak info).
 *             false when viewing another user's profile (shows public view only).
 *
 * Usage:
 *   import PerformanceTracker, { SAMPLE_PERFORMANCE } from "./PerformanceTracker";
 *
 *   // with sample data:
 *   <PerformanceTracker data={SAMPLE_PERFORMANCE} isOwn={true} />
 *
 *   // with real data (once hook exists):
 *   const { data } = useGetPerformanceTracker(email);
 *   <PerformanceTracker data={data} isOwn={currentUserEmail === profileEmail} />
 */
const PerformanceTracker = ({ data = SAMPLE_PERFORMANCE, isOwn = true }) => {
  if (!data) return null;

  const { currentStreak, longestStreak, lastActiveDate, contributions } = data;

  return (
    <div className="flex flex-col gap-4">
      {/* section label */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {isOwn ? "Your performance" : "Contribution activity"}
        </span>
      </div>

      {/* streaks — only shown on own profile */}
      {isOwn && (
        <StreakWidget
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          lastActiveDate={lastActiveDate}
        />
      )}

      {/* activity heatmap — public */}
      <ActivityGraph contributions={contributions} isOwn={isOwn} />
    </div>
  );
};

export default PerformanceTracker;