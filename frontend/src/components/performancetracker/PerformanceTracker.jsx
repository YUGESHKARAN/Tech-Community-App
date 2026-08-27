import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  TbFlame, TbTrophy, TbCalendar, TbBolt,
  TbChevronLeft, TbChevronRight, TbX,
  TbFileText, TbMessageCircle, TbArrowRight,
  TbMessage, TbLoader2,
} from "react-icons/tb";

// ── Sample data imports ───────────────────────────────────────────────────────
// Swap these for real hooks when ready:
//   const { data: streakData } = useGetStreakData(authorId);
//   onFetchYear={(year) => axiosInstance.get(`/api/authors/${authorId}/contributions?year=${year}`).then(r => r.data)}
//   onFetchDayEvents={(date, page) => axiosInstance.get(`/api/authors/${authorId}/events?date=${date}&page=${page}&limit=10`).then(r => r.data)}
import {
  SAMPLE_STREAK,
  SAMPLE_CONTRIBUTIONS_BY_YEAR,
} from "./performanceSampleData";
import formatCount from "../../utils/NumberConversion";

// ── Sample day events ─────────────────────────────────────────────────────────
// Swap with real API: GET /api/authors/:authorId/events?date=YYYY-MM-DD&page=1&limit=10
const SAMPLE_DAY_EVENTS = {
  "2026-08-18": {
    totalPts: 13, total: 3, page: 1, hasMore: false,
    events: [
      { _id: "evt001", type: "post",       targetId: "post001", communityId: null,                       discussionId: null,    title: "Evaluating LLMs using LangSmith",                              communityName: "AI/ML", pts: 5, createdAt: "2026-08-19T09:14:00.000Z" },
      { _id: "evt002", type: "discussion", targetId: "disc001", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: null,    title: "Why does my LoRA fine-tune overfit after 3 epochs?",            communityName: "AI/ML", pts: 3, createdAt: "2026-08-19T11:32:00.000Z" },
      { _id: "evt003", type: "reply",      targetId: "reply001",communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: "disc001",title: "Replied to: Why does my LoRA fine-tune overfit after 3 epochs?", communityName: "AI/ML", pts: 1, createdAt: "2026-08-19T14:05:00.000Z" },
    ],
  },
  "2026-08-17": {
    totalPts: 8, total: 2, page: 1, hasMore: false,
    events: [
      { _id: "evt004", type: "post",       targetId: "post002", communityId: null,                       discussionId: null,  title: "Multi-Agent System using LangGraph",                  communityName: "GenAI", pts: 5, createdAt: "2026-08-17T10:00:00.000Z" },
      { _id: "evt005", type: "discussion", targetId: "disc002", communityId: "66f1a2b3c4d5e6f7a8b9c0d4", discussionId: null,  title: "Idea: a shared prompt-eval leaderboard for this community", communityName: "GenAI", pts: 3, createdAt: "2026-08-17T15:20:00.000Z" },
    ],
  },
  "2026-07-14": {
    totalPts: 15, total: 4, page: 1, hasMore: true,
    events: [
      { _id: "evt006", type: "post",       targetId: "post003", communityId: null,                       discussionId: null,     title: "Supervised Machine Learning",              communityName: "AI/ML",  pts: 5, createdAt: "2026-07-14T08:00:00.000Z" },
      { _id: "evt007", type: "post",       targetId: "post004", communityId: null,                       discussionId: null,     title: "Unsupervised Learning techniques",         communityName: "AI/ML",  pts: 5, createdAt: "2026-07-14T10:30:00.000Z" },
      { _id: "evt008", type: "discussion", targetId: "disc003", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: null,     title: "Show and tell: RL gridworld from scratch", communityName: "AI/ML",  pts: 3, createdAt: "2026-07-14T14:10:00.000Z" },
      { _id: "evt009", type: "reply",      targetId: "reply002",communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: "disc003",title: "Replied to: Show and tell: RL gridworld from scratch", communityName: "AI/ML", pts: 1, createdAt: "2026-07-14T16:45:00.000Z" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const effectiveStreak = (currentStreak, lastActiveDate) => {
  if (!lastActiveDate) return 0;
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr     = today.toISOString().slice(0, 10);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  return lastActiveDate === todayStr || lastActiveDate === yesterdayStr
    ? currentStreak
    : 0;
};

const pointsToLevel = (pts) => {
  if (!pts || pts === 0) return 0;
  if (pts <= 4)          return 1;
  if (pts <= 9)          return 2;
  if (pts <= 14)         return 3;
  return 4;
};

const buildGrid = (contributions, year) => {
  const today     = new Date();
  const yearEnd   = year === today.getFullYear() ? today : new Date(year, 11, 31);
  const gridStart = new Date(year, 0, 1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd   = new Date(yearEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const weeks   = [];
  let current   = new Date(gridStart);
  while (current <= gridEnd) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key         = current.toISOString().slice(0, 10);
      const points      = contributions?.[key] || 0;
      const isFuture    = current > today;
      const isOutOfYear = current.getFullYear() !== year;
      week.push({ date: key, points, level: isFuture || isOutOfYear ? -1 : pointsToLevel(points), future: isFuture, outOfYear: isOutOfYear });
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const buildMonthLabels = (weeks) => {
  const labels  = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    const firstDay = week.find((d) => !d.future && !d.outOfYear);
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    const label = new Date(firstDay.date).toLocaleString("default", { month: "short" });
    if (month !== lastMonth) { labels.push({ index: wi, label }); lastMonth = month; }
  });
  return labels;
};

const countActiveDays = (c) => Object.values(c || {}).filter((v) => v > 0).length;
const totalPoints     = (c) => Object.values(c || {}).reduce((s, v) => s + v, 0);

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const eventUrl = (event) => {
  switch (event.type) {
    case "post":       return `/post/${event.targetId}`;
    case "discussion": return `/community/${event.communityId}?tab=discussions&open=${event.targetId}`;
    case "reply":      return `/community/${event.communityId}?tab=discussions&open=${event.discussionId}#${event.targetId}`;
    default:           return "#";
  }
};

const EVENT_META = {
  post:       { label: "Published a post",        Icon: TbFileText,      color: "text-emerald-400", bg: "bg-emerald-500/10" },
  discussion: { label: "Started a discussion",    Icon: TbMessageCircle, color: "text-blue-400",    bg: "bg-blue-500/10"    },
  reply:      { label: "Replied to a discussion", Icon: TbMessage,       color: "text-amber-400",   bg: "bg-amber-500/10"   },
};

const LEVEL_COLORS = {
  "-1": "transparent",
  "0":  "rgba(255,255,255,0.04)",
  "1":  "rgba(13,148,136,0.25)",
  "2":  "rgba(13,148,136,0.50)",
  "3":  "rgba(13,148,136,0.75)",
  "4":  "rgba(13,148,136,1.00)",
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
  const display      = effectiveStreak(currentStreak, lastActiveDate);
  const streakLapsed = display === 0 && currentStreak > 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="theme border border-[#1e293b] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <TbFlame className={`text-base ${display > 0 ? "text-amber-400" : "text-gray-600"}`} />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Current streak
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold ${display > 0 ? "text-gray-100" : "text-gray-600"}`}>
            {formatCount(display)}
          </span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        <p className={`text-[10px] mt-1 ${
          streakLapsed ? "text-amber-500/70" : display > 0 ? "text-emerald-500/70" : "text-gray-600"
        }`}>
          {streakLapsed
            ? "Streak ended — post today to restart"
            : display > 0
            ? "Keep it going!"
            : "Post today to start a streak"}
        </p>
      </div>

      <div className="theme border border-[#1e293b] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <TbTrophy className="text-base text-amber-400/60" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Longest streak
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-100">{formatCount(longestStreak)}</span>
          <span className="text-xs text-gray-500">days</span>
        </div>
        <p className="text-[10px] text-gray-600 mt-1">All-time personal best</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  DAY EVENT DRAWER
// ─────────────────────────────────────────────────────────────────────────────
const DayEventDrawer = ({ date, onClose, sampleDayEvents = {} }) => {
  const [events,      setEvents]      = useState([]);
  const [totalPts,    setTotalPts]    = useState(0);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    // swap for: axiosInstance.get(`/api/authors/${authorId}/events?date=${date}&page=1&limit=10`)
    const t = setTimeout(() => {
      const data = sampleDayEvents[date] || { events: [], totalPts: 0, total: 0, hasMore: false, page: 1 };
      setEvents(data.events || []);
      setTotalPts(data.totalPts || 0);
      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
      setPage(data.page || 1);
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, [date]);

  const loadMore = async () => {
    setLoadingMore(true);
    // swap for: const data = await axiosInstance.get(`/api/authors/${authorId}/events?date=${date}&page=${page + 1}&limit=10`);
    // setEvents((prev) => [...prev, ...data.events]);
    // setPage(data.page); setHasMore(data.hasMore);
    setLoadingMore(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] flex flex-col
                   theme border-t border-[#1e293b] rounded-t-2xl shadow-2xl"
        style={{ animation: "slideUp 0.22s cubic-bezier(0.32,0.72,0,1)" }}
      >
        {/* handle bar */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-[#1e293b] flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-200">{formattedDate}</h3>
            {!loading && total > 0 && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                <b className="text-emerald-400">{totalPts} pts</b> across{" "}
                <b className="text-gray-300">{total}</b>{" "}
                {total === 1 ? "activity" : "activities"}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <TbX className="text-base" />
          </button>
        </div>

        {/* event list */}
        <div className="overflow-y-auto flex-1 px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <TbLoader2 className="text-2xl text-emerald-400 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-600">
              No recorded activity on this day.
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-4">
              {events.map((event) => {
                const meta = EVENT_META[event.type] || EVENT_META.post;
                const Icon = meta.Icon;
                const url  = eventUrl(event);
                return (
                  <Link
                    key={event._id}
                    to={url}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl theme border border-[#1e293b]
                               hover:border-white/10 transition-all duration-200 group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <Icon className={`text-sm ${meta.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">
                        {meta.label}
                        {event.communityName && (
                          <span className="text-gray-600"> · {event.communityName}</span>
                        )}
                      </p>
                      <p className="text-xs font-medium text-gray-200 truncate">
                        {event.title}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        {timeAgo(event.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        +{event.pts}
                      </span>
                      <TbArrowRight className="text-sm text-gray-600 group-hover:text-gray-300 transition-colors" />
                    </div>
                  </Link>
                );
              })}

              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-2.5 text-xs font-medium text-gray-400 hover:text-gray-200
                             theme border border-[#1e293b] rounded-xl transition-colors disabled:opacity-50 mt-1"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center gap-2">
                      <TbLoader2 className="animate-spin text-sm" /> Loading...
                    </span>
                  ) : (
                    `Load more (${total - events.length} remaining)`
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  ACTIVITY GRAPH
// ─────────────────────────────────────────────────────────────────────────────
const ActivityGraph = ({
  joinedYear,
  sampleContributionsByYear = {},
  sampleDayEvents 
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear,  setSelectedYear]  = useState(currentYear);
  const [contributions, setContributions] = useState(
    sampleContributionsByYear[currentYear]?.contributions || {}
  );
  const [loading,       setLoading]       = useState(false);
  const [hoveredDay,    setHoveredDay]    = useState(null);
  const [activeDay,     setActiveDay]     = useState(null);

  const yearOptions = useMemo(() => {
    const start = joinedYear || currentYear;
    const years = [];
    for (let y = currentYear; y >= start; y--) years.push(y);
    return years;
  }, [joinedYear, currentYear]);

  useEffect(() => {
    setLoading(true);
    // swap for: onFetchYear(selectedYear).then(data => setContributions(data.contributions))
    const t = setTimeout(() => {
      setContributions(sampleContributionsByYear[selectedYear]?.contributions || {});
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [selectedYear]);

  const weeks       = useMemo(() => buildGrid(contributions, selectedYear), [contributions, selectedYear]);
  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);
  const activeDays  = countActiveDays(contributions);
  const pts         = totalPoints(contributions);

  const CELL = 11;
  const GAP  = 3;
  const STEP = CELL + GAP;

  const handleCellClick = (day) => {
    if (day.future || day.outOfYear || day.points === 0) return;
    setActiveDay(day.date);
  };

  return (
    <>
      <div className="theme border border-[#1e293b] rounded-xl p-4">
        {/* header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <TbCalendar className="text-sm text-gray-500" />
            <span className="text-xs font-semibold text-gray-300">Activity</span>
            <span className="text-[10px] text-gray-600">
              ·{" "}<b className="text-gray-400">{activeDays}</b> active days
              ·{" "}<b className="text-gray-400">{pts}</b> pts
            </span>
          </div>

          {/* year selector */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { const i = yearOptions.indexOf(selectedYear); if (i < yearOptions.length - 1) setSelectedYear(yearOptions[i + 1]); }}
              disabled={selectedYear === yearOptions[yearOptions.length - 1]}
              className="p-0.5 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors"
            >
              <TbChevronLeft className="text-sm" />
            </button>
            <div className="flex gap-1">
              {yearOptions.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYear(y)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                    selectedYear === y
                      ? "bg-white/5 text-white border-white/20"
                      : "text-gray-500 border-transparent hover:text-gray-300"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { const i = yearOptions.indexOf(selectedYear); if (i > 0) setSelectedYear(yearOptions[i - 1]); }}
              disabled={selectedYear === currentYear}
              className="p-0.5 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors"
            >
              <TbChevronRight className="text-sm" />
            </button>
          </div>
        </div>

        {/* graph */}
        <div className={`overflow-x-auto transition-opacity duration-200 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
          <div style={{ minWidth: weeks.length * STEP + 28 }}>
            {/* month labels */}
            <div className="flex mb-1" style={{ paddingLeft: 28 }}>
              {weeks.map((_, wi) => {
                const ml = monthLabels.find((m) => m.index === wi);
                return (
                  <div key={wi} style={{ width: STEP, flexShrink: 0 }} className="text-[9px] text-gray-600">
                    {ml ? ml.label : ""}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-0">
              {/* day-of-week labels */}
              <div className="flex flex-col" style={{ gap: GAP, marginRight: 4 }}>
                {DAY_NAMES.map((d, i) => (
                  <div
                    key={d}
                    style={{
                      height: CELL, lineHeight: `${CELL}px`, fontSize: 9,
                      color: "rgba(156,163,175,0.5)",
                      visibility: [1, 3, 5].includes(i) ? "visible" : "hidden",
                      width: 24, textAlign: "right", paddingRight: 4, flexShrink: 0,
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* week columns */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP, marginRight: GAP }}>
                  {week.map((day) => {
                    const isClickable = !day.future && !day.outOfYear && day.points > 0;
                    const isHovered   = hoveredDay === day.date;
                    const isActive    = activeDay  === day.date;
                    return (
                      <div
                        key={day.date}
                        className="relative"
                        style={{ width: CELL, height: CELL, flexShrink: 0 }}
                        onMouseEnter={() => !day.future && !day.outOfYear && setHoveredDay(day.date)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => handleCellClick(day)}
                      >
                        <div
                          style={{
                            width: CELL, height: CELL,
                            borderRadius: 2,
                            background: LEVEL_COLORS[String(day.level)],
                            border: `1px solid ${LEVEL_BORDER[String(day.level)]}`,
                            cursor: isClickable ? "pointer" : "default",
                            transform: isActive ? "scale(1.25)" : isHovered && isClickable ? "scale(1.15)" : "scale(1)",
                            transition: "transform 0.1s ease",
                            outline: isActive ? "2px solid rgba(52,211,153,0.6)" : "none",
                            outlineOffset: 1,
                          }}
                        />

                        {/* hover tooltip */}
                        {isHovered && !day.outOfYear && (
                          <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-30
                                       pointer-events-none whitespace-nowrap
                                       bg-[#0f172a] border border-white/10 rounded-lg
                                       px-2.5 py-1.5 shadow-xl text-[10px] text-gray-200"
                          >
                            {day.points > 0 ? (
                              <>
                                <b className="text-emerald-400">{day.points} pts</b>
                                {" · "}
                                {new Date(day.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                {isClickable && <span className="text-gray-500 ml-1">— click to view</span>}
                              </>
                            ) : (
                              <>No activity · {new Date(day.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</>
                            )}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <span className="text-[9px] text-gray-600">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  style={{
                    width: CELL, height: CELL, borderRadius: 2,
                    background: LEVEL_COLORS[String(level)],
                    border: `1px solid ${LEVEL_BORDER[String(level)]}`,
                    flexShrink: 0,
                  }}
                />
              ))}
              <span className="text-[9px] text-gray-600">More</span>
            </div>
          </div>
        </div>

        {/* point scale */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-white/5 flex-wrap">
          {[
            { label: "Post",       p: "5 pts" },
            { label: "Discussion", p: "3 pts" },
            { label: "Reply",      p: "1 pt"  },
          ].map(({ label, p }) => (
            <span key={label} className="flex items-center gap-1 text-[9px] text-gray-500">
              <TbBolt className="text-[10px] text-emerald-500/60" />
              <b className="text-gray-400">{label}</b> = {p}
            </span>
          ))}
          <span className="text-[9px] text-gray-600 ml-auto">
            Click an active day to see events
          </span>
        </div>
      </div>

      {/* drawer — rendered outside the graph card so it overlays correctly */}
      {activeDay && (
        <DayEventDrawer
          date={activeDay}
          onClose={() => setActiveDay(null)}
          sampleDayEvents={sampleDayEvents}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * PerformanceTracker
 *
 * Props:
 *   streakData            — { currentStreak, longestStreak, lastActiveDate, joinedYear }
 *   contributionsByYear   — { [year]: { contributions: { "YYYY-MM-DD": pts } } }
 *   dayEvents             — { "YYYY-MM-DD": { events, totalPts, total, hasMore, page } }
 *   isOwn                 — true = own profile (streak + heatmap)
 *                           false = other's profile (heatmap only)
 *
 * With sample data (now):
 *   <PerformanceTracker isOwn={true} />
 *
 * With real API (swap):
 *   const { data: streak } = useGetStreakData(authorId);
 *   <PerformanceTracker
 *     streakData={streak}
 *     isOwn={currentUserEmail === profileEmail}
 *   />
 */
const PerformanceTracker = ({
  streakData          = SAMPLE_STREAK,
  contributionsByYear = SAMPLE_CONTRIBUTIONS_BY_YEAR,
  dayEvents           = SAMPLE_DAY_EVENTS,
  isOwn               = true,
}) => {
  if (!streakData) return null;

  const { currentStreak, longestStreak, lastActiveDate, joinedYear } = streakData;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm md:ml-2 font-semibold text-gray-300">
        {isOwn ? "Your Performance" : "Contribution Activity"}
      </span>

      {isOwn && (
        <StreakWidget
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          lastActiveDate={lastActiveDate}
        />
      )}

      {/* <ActivityGraph
        joinedYear={joinedYear}
        sampleContributionsByYear={contributionsByYear}
        sampleDayEvents={dayEvents}
      /> */}
    </div>
  );
};

export default PerformanceTracker;