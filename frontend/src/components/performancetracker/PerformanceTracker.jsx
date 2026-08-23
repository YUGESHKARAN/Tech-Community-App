import React, { useMemo, useState, useEffect } from "react";
import {
  TbFlame, TbTrophy, TbCalendar, TbBolt,
  TbChevronLeft, TbChevronRight,
} from "react-icons/tb";

// ─────────────────────────────────────────────────────────────────────────────
//  SAMPLE DATA — imported from the fixed deterministic file
//
//  When you wire up the real API, replace the two sample imports below with:
//
//  Streak:
//    const { data: streakData } = useGetStreakData(email);
//    GET /api/authors/:email/streak
//    → { currentStreak, longestStreak, lastActiveDate, joinedYear }
//
//  Contributions (fetched per year on year change):
//    const { data: yearData } = useGetContributions(email, selectedYear);
//    GET /api/authors/:email/contributions?year=2025
//    → { year, contributions: { "YYYY-MM-DD": number } }
//
//  Then pass them as props:
//    <PerformanceTracker
//      streakData={streakData}
//      contributionsByYear={null}        ← null = use onFetchYear instead
//      onFetchYear={(year) =>
//        axiosInstance.get(`/api/authors/${email}/contributions?year=${year}`)
//          .then(r => r.data.contributions)
//      }
//      isOwn={currentUserEmail === profileEmail}
//    />
// ─────────────────────────────────────────────────────────────────────────────
import {
  SAMPLE_STREAK,
  SAMPLE_CONTRIBUTIONS_BY_YEAR,
} from "./performanceSampleData";

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CELL_SIZE = 11;
const GAP       = 3;
const STEP      = CELL_SIZE + GAP;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// intensity level → background color
const LEVEL_COLORS = {
  "-1": "transparent",
  "0":  "rgba(255,255,255,0.04)",
  "1":  "rgba(13,148,136,0.20)",
  "2":  "rgba(13,148,136,0.45)",
  "3":  "rgba(13,148,136,0.72)",
  "4":  "rgba(13,148,136,1.00)",
};

// intensity level → border color
const LEVEL_BORDER = {
  "-1": "transparent",
  "0":  "rgba(255,255,255,0.05)",
  "1":  "rgba(13,148,136,0.28)",
  "2":  "rgba(13,148,136,0.52)",
  "3":  "rgba(13,148,136,0.78)",
  "4":  "rgba(13,148,136,1.00)",
};

// ─────────────────────────────────────────────────────────────────────────────
//  PURE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive the display streak at read time — if lastActiveDate is
 * neither today nor yesterday the streak has lapsed; show 0
 * without needing a DB write (production plan: derive at read time).
 */
const effectiveStreak = (currentStreak, lastActiveDate) => {
  if (!lastActiveDate || !currentStreak) return 0;
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return lastActiveDate === today || lastActiveDate === yesterday
    ? currentStreak
    : 0;
};

/** Daily point total → heatmap intensity level 0–4 */
const pointsToLevel = (pts) => {
  if (!pts || pts <= 0) return 0;
  if (pts <= 4)         return 1;
  if (pts <= 9)         return 2;
  if (pts <= 14)        return 3;
  return 4;
};

/**
 * Build the 52-week × 7-day grid for a given year.
 * Weeks start on Sunday, matching GitHub's layout.
 * Out-of-year padding cells (from the Sunday alignment) get level -1.
 */
const buildGrid = (contributions, year) => {
  const today   = new Date();
  const yearEnd = year === today.getFullYear() ? today : new Date(year, 11, 31);

  const gridStart = new Date(year, 0, 1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(yearEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const weeks   = [];
  let current   = new Date(gridStart);

  while (current <= gridEnd) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key        = current.toISOString().slice(0, 10);
      const points     = contributions?.[key] || 0;
      const isFuture   = current > today;
      const outOfYear  = current.getFullYear() !== year;
      week.push({
        date:     key,
        points,
        level:    isFuture || outOfYear ? -1 : pointsToLevel(points),
        future:   isFuture,
        outOfYear,
      });
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

/**
 * Build month label positions for the column headers.
 * Only emits a label when the month changes within the visible grid.
 */
const buildMonthLabels = (weeks) => {
  const labels  = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    const first = week.find((d) => !d.future && !d.outOfYear);
    if (!first) return;
    const month = new Date(first.date).getMonth();
    if (month !== lastMonth) {
      labels.push({
        index: wi,
        label: new Date(first.date).toLocaleString("default", { month: "short" }),
      });
      lastMonth = month;
    }
  });
  return labels;
};

const countActiveDays  = (c) => Object.values(c || {}).filter((v) => v > 0).length;
const sumTotalPoints   = (c) => Object.values(c || {}).reduce((s, v) => s + v, 0);

// ─────────────────────────────────────────────────────────────────────────────
//  TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
const Tooltip = ({ day }) => {
  const label = new Date(day.date).toLocaleDateString("en-IN", {
    weekday: "short", month: "short", day: "numeric",
  });
  return (
    <div
      style={{ transform: "translateX(-50%)" }}
      className="absolute bottom-full left-1/2 mb-2 z-50 pointer-events-none
                 whitespace-nowrap bg-[#0f172a] border border-white/10
                 rounded-lg px-2.5 py-1.5 shadow-2xl text-[10px] text-gray-200"
    >
      {day.points > 0
        ? <><b className="text-emerald-400">{day.points} pts</b> · {label}</>
        : <>No activity · {label}</>
      }
      <div className="absolute top-full left-1/2 -translate-x-1/2
                      border-4 border-transparent border-t-[#0f172a]" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  STREAK WIDGET
// ─────────────────────────────────────────────────────────────────────────────
const StreakWidget = ({ currentStreak, longestStreak, lastActiveDate }) => {
  const display     = effectiveStreak(currentStreak, lastActiveDate);
  const lapsed      = display === 0 && currentStreak > 0;
  const active      = display > 0;

  return (
    <div className="grid grid-cols-2 gap-3">

      {/* current streak */}
      <div className="theme border flex flex-col justify-between border-[#1e293b] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <TbFlame className={`text-base ${active ? "text-amber-400" : "text-gray-600"}`} />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Current streak
          </span>
        </div>
        <div className="flex justify-center items-baseline gap-1.5">
          <span className={`text-2xl font-bold ${active ? "text-gray-100" : "text-gray-600"}`}>
            {display}
          </span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        <p className="text-[10px] text-center mt-1">
          {lapsed
            ? <span className=" text-amber-500/70">Streak ended - post today to restart</span>
            : active
            ? <span className="text-emerald-500/70">Keep it going!</span>
            : <span className="text-gray-600 ">Post today to start a streak</span>
          }
        </p>
      </div>

      {/* longest streak */}
      <div className="theme border border-[#1e293b] flex flex-col justify-between rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <TbTrophy className="text-base text-amber-400/60" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Longest streak
          </span>
        </div>
        <div className="flex justify-center items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-100">{longestStreak}</span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        <p className="text-[10px] text-center text-gray-600 mt-1">All-time personal best</p>
      </div>

    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  ACTIVITY GRAPH
// ─────────────────────────────────────────────────────────────────────────────
const ActivityGraph = ({
  joinedYear,
  isOwn,
  // ── sample data path ──────────────────────────────────────────────────────
  // Remove contributionsByYear and use onFetchYear when wiring real API.
  contributionsByYear,   // { [year]: { contributions: {...} } }
  // ── real API path (swap in when ready) ────────────────────────────────────
  // onFetchYear: async (year) => contributions object for that year
  onFetchYear,
}) => {
  const currentYear  = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [contributions, setContributions] = useState(
    contributionsByYear?.[currentYear]?.contributions || {}
  );
  const [loading, setLoading] = useState(false);

  // all available years from joinedYear → currentYear
  const yearOptions = useMemo(() => {
    const from  = joinedYear || currentYear;
    const years = [];
    for (let y = currentYear; y >= from; y--) years.push(y);
    return years;
  }, [joinedYear, currentYear]);

  // ── data fetch on year change ──────────────────────────────────────────────
  // SAMPLE path: reads from the contributionsByYear map with a fake 250ms delay.
  // REAL path: call onFetchYear(year) which hits the backend.
  //
  // To swap: remove the if/else and just call onFetchYear(year).
  useEffect(() => {
    setLoading(true);

    if (onFetchYear) {
      // ── REAL API path ──
      onFetchYear(selectedYear)
        .then((data) => setContributions(data || {}))
        .catch(() => setContributions({}))
        .finally(() => setLoading(false));
    } else {
      // ── SAMPLE data path ──
      const timer = setTimeout(() => {
        setContributions(
          contributionsByYear?.[selectedYear]?.contributions || {}
        );
        setLoading(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [selectedYear, onFetchYear]);

  const weeks       = useMemo(() => buildGrid(contributions, selectedYear), [contributions, selectedYear]);
  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);
  const activeDays  = countActiveDays(contributions);
  const totalPts    = sumTotalPoints(contributions);

  const [hoveredDay, setHoveredDay] = useState(null);

  const canGoPrev = selectedYear < currentYear;
  const canGoNext = selectedYear > (yearOptions[yearOptions.length - 1] ?? currentYear);

  return (
    <div className="theme border border-[#1e293b] rounded-xl p-4">

      {/* ── header ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TbCalendar className="text-sm text-gray-500" />
          <span className="text-xs font-semibold text-gray-300">Activity</span>
          <span className="text-[10px] text-gray-600">
            · <b className="text-gray-400">{activeDays}</b> active days
            · <b className="text-gray-400">{totalPts}</b> pts
          </span>
        </div>

        {/* year selector */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => canGoNext && setSelectedYear((y) => y - 1)}
            disabled={!canGoNext}
            className="p-1 rounded text-gray-500 hover:text-gray-300 disabled:opacity-25 transition-colors"
          >
            <TbChevronLeft className="text-sm" />
          </button>

          <div className="flex gap-1 flex-wrap">
            {yearOptions.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setSelectedYear(y)}
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
                  selectedYear === y
                    ? "bg-white/5 text-white border-white/20"
                    : "text-gray-500 border-transparent hover:text-gray-300 hover:border-white/10"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => canGoPrev && setSelectedYear((y) => y + 1)}
            disabled={!canGoPrev}
            className="p-1 rounded text-gray-500 hover:text-gray-300 disabled:opacity-25 transition-colors"
          >
            <TbChevronRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* ── heatmap ── */}
      <div
        className={`overflow-x-auto scrollbar-hide transition-opacity duration-200 ${
          loading ? "opacity-30 pointer-events-none" : "opacity-100"
        }`}
      >
        <div style={{ minWidth: weeks.length * STEP + 32 }}>

          {/* month labels row */}
          <div className="flex mb-1" style={{ paddingLeft: 28 }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.index === wi);
              return (
                <div
                  key={wi}
                  style={{ width: STEP, flexShrink: 0 }}
                  className="text-[9px] text-gray-600 select-none"
                >
                  {ml ? ml.label : ""}
                </div>
              );
            })}
          </div>

          {/* day-of-week labels + week columns */}
          <div className="flex">

            {/* day labels */}
            <div className="flex flex-col flex-shrink-0" style={{ gap: GAP, marginRight: 4, width: 24 }}>
              {DAY_NAMES.map((d, i) => (
                <div
                  key={d}
                  style={{
                    height:       CELL_SIZE,
                    lineHeight:   `${CELL_SIZE}px`,
                    fontSize:     9,
                    color:        "rgba(156,163,175,0.45)",
                    textAlign:    "right",
                    paddingRight: 4,
                    visibility:   [1, 3, 5].includes(i) ? "visible" : "hidden",
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
                className="flex flex-col flex-shrink-0"
                style={{ gap: GAP, marginRight: GAP }}
              >
                {week.map((day) => (
                  <div
                    key={day.date}
                    className="relative"
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    onMouseEnter={() =>
                      !day.future && !day.outOfYear && setHoveredDay(day.date)
                    }
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div
                      style={{
                        width:        CELL_SIZE,
                        height:       CELL_SIZE,
                        borderRadius: 2,
                        background:   LEVEL_COLORS[String(day.level)],
                        border:       `1px solid ${LEVEL_BORDER[String(day.level)]}`,
                        cursor:       !day.future && !day.outOfYear && day.points > 0
                          ? "pointer"
                          : "default",
                        transition:   "background 0.1s",
                      }}
                    />
                    {hoveredDay === day.date && !day.outOfYear && (
                      <Tooltip day={day} />
                    )}
                  </div>
                ))}
              </div>
            ))}

          </div>

          

        </div>
      </div>
      {/* legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[9px] text-gray-600 select-none">Less</span>
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
            <span className="text-[9px] text-gray-600 select-none">More</span>
          </div>

      {/* ── point scale legend ── */}
      <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 flex-wrap">
        {[
          { label: "Post",       pts: "5 pts" },
          { label: "Discussion", pts: "3 pts" },
          { label: "Reply",      pts: "1 pt"  },
        ].map(({ label, pts }) => (
          <span key={label} className="flex items-center gap-1 text-[9px] text-gray-500">
            <TbBolt className="text-[10px] text-emerald-500/50" />
            <b className="text-gray-400">{label}</b>
            <span className="text-gray-600">= {pts}</span>
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
 *   streakData           — { currentStreak, longestStreak, lastActiveDate, joinedYear }
 *   contributionsByYear  — { [year]: { contributions: { "YYYY-MM-DD": number } } }
 *                          Pass null and use onFetchYear for the real API.
 *   onFetchYear          — async (year: number) => { "YYYY-MM-DD": number }
 *                          Called on year change. Ignored when contributionsByYear is set.
 *   isOwn                — true = own profile (shows streak widgets + heatmap)
 *                          false = another user's profile (heatmap only, no streak numbers)
 *
 * ── Usage with sample data (current) ────────────────────────────────────────
 *   import PerformanceTracker from "./PerformanceTracker";
 *   <PerformanceTracker isOwn={true} />
 *   // streakData and contributionsByYear default to sample data when omitted
 *
 * ── Usage with real API (swap in when hooks are ready) ──────────────────────
 *   const { data: streak } = useGetStreakData(email);
 *   <PerformanceTracker
 *     streakData={streak}
 *     contributionsByYear={null}
 *     onFetchYear={(year) =>
 *       axiosInstance
 *         .get(`/api/authors/${email}/contributions?year=${year}`)
 *         .then((r) => r.data.contributions)
 *     }
 *     isOwn={currentUserEmail === profileEmail}
 *   />
 */
const PerformanceTracker = ({
  streakData           = SAMPLE_STREAK,
  contributionsByYear  = SAMPLE_CONTRIBUTIONS_BY_YEAR,
  onFetchYear          = null,
  isOwn                = true,
}) => {
  if (!streakData) return null;

  const { currentStreak, longestStreak, lastActiveDate, joinedYear } = streakData;

  return (
    <div className="flex flex-col gap-4">

      {/* section label */}
      <span className="text-sm font-semibold text-gray-300  ">
        {isOwn ? "Your Performance" : "Contribution Activity"}
      </span>

      {/* streak cards — own profile only */}
      {isOwn && (
        <StreakWidget
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          lastActiveDate={lastActiveDate}
        />
      )}

      {/* activity heatmap — always shown */}
      {/* <ActivityGraph
        joinedYear={joinedYear}
        isOwn={isOwn}
        contributionsByYear={onFetchYear ? null : contributionsByYear}
        onFetchYear={onFetchYear}
      /> */}

    </div>
  );
};

export default PerformanceTracker;