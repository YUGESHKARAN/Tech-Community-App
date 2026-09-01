import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../../instances/Axiosinstances";
import { Link } from "react-router-dom";
import {
  TbFlame, TbTrophy, TbCalendar, TbBolt,
  TbChevronLeft, TbChevronRight, TbX,
  TbFileText, TbMessageCircle, TbArrowRight,
  TbMessage, TbLoader2,
} from "react-icons/tb";

import { createPortal } from "react-dom";

// ── Sample data imports ───────────────────────────────────────────────────────
// Swap these for real hooks when ready:
//   const { data: streakData } = useGetStreakData(authorId);
//   onFetchYear={(year) => axiosInstance.get(`/api/authors/${authorId}/contributions?year=${year}`).then(r => r.data)}
//   onFetchDayEvents={(date, page) => axiosInstance.get(`/api/authors/${authorId}/events?date=${date}&page=${page}&limit=10`).then(r => r.data)}
import {
  SAMPLE_STREAK,
  SAMPLE_CONTRIBUTIONS_BY_YEAR,
} from "./performanceSampleData";
import { getItem } from "../../utils/encode";

// ── Sample day events ─────────────────────────────────────────────────────────
// Each key MUST match a date that has points in SAMPLE_CONTRIBUTIONS_BY_YEAR
// so the cell is rendered as active and clickable on the heatmap.
// Swap with real API: GET /api/authors/:authorId/events?date=YYYY-MM-DD&page=1&limit=10
const SAMPLE_DAY_EVENTS = {

  // ── Aug 2026 (streak period — recent, high activity) ─────────────────────

  "2026-08-19": {
    totalPts: 9, total: 3, page: 1, hasMore: false,
    events: [
      { _id: "e001", type: "post",       targetId: "post001", communityId: null,                       discussionId: null,     title: "Evaluating LLMs using LangSmith",                                      communityName: "AI/ML",  pts: 5, createdAt: "2026-08-19T09:14:00.000Z" },
      { _id: "e002", type: "discussion", targetId: "disc001", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: null,     title: "Why does my LoRA fine-tune overfit after 3 epochs?",                    communityName: "AI/ML",  pts: 3, createdAt: "2026-08-19T11:32:00.000Z" },
      { _id: "e003", type: "reply",      targetId: "rply001", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: "disc001",title: "Replied to: Why does my LoRA fine-tune overfit after 3 epochs?",        communityName: "AI/ML",  pts: 1, createdAt: "2026-08-19T14:05:00.000Z" },
    ],
  },

  "2026-08-18": {
    totalPts: 8, total: 2, page: 1, hasMore: false,
    events: [
      { _id: "e004", type: "post",       targetId: "post002", communityId: null,                       discussionId: null,     title: "Multi-Agent System using LangGraph",                                    communityName: "GenAI",  pts: 5, createdAt: "2026-08-18T10:00:00.000Z" },
      { _id: "e005", type: "discussion", targetId: "disc002", communityId: "66f1a2b3c4d5e6f7a8b9c0d4", discussionId: null,     title: "Idea: shared prompt-eval leaderboard for this community",              communityName: "GenAI",  pts: 3, createdAt: "2026-08-18T15:20:00.000Z" },
    ],
  },

  "2026-08-17": {
    totalPts: 12, total: 3, page: 1, hasMore: false,
    events: [
      { _id: "e006", type: "post",       targetId: "post003", communityId: null,                       discussionId: null,     title: "Clash of Clans Mini Language Model",                                   communityName: "AI/ML",  pts: 5, createdAt: "2026-08-17T08:30:00.000Z" },
      { _id: "e007", type: "discussion", targetId: "disc003", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: null,     title: "Best resources for learning transformer architecture in 2025?",        communityName: "AI/ML",  pts: 3, createdAt: "2026-08-17T11:00:00.000Z" },
      { _id: "e008", type: "reply",      targetId: "rply002", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: "disc003",title: "Replied to: Best resources for learning transformer architecture?",    communityName: "AI/ML",  pts: 1, createdAt: "2026-08-17T13:45:00.000Z" },
    ],
  },

  "2026-08-16": {
    totalPts: 5, total: 1, page: 1, hasMore: false,
    events: [
      { _id: "e009", type: "post",       targetId: "post004", communityId: null,                       discussionId: null,     title: "Design and Development of Attendance Tracker",                         communityName: "Web Development", pts: 5, createdAt: "2026-08-16T09:00:00.000Z" },
    ],
  },

  "2026-08-15": {
    totalPts: 8, total: 2, page: 1, hasMore: false,
    events: [
      { _id: "e010", type: "post",       targetId: "post005", communityId: null,                       discussionId: null,     title: "Cybersecurity Roadmap 2026",                                           communityName: "Cyber Security", pts: 5, createdAt: "2026-08-15T10:30:00.000Z" },
      { _id: "e011", type: "reply",      targetId: "rply003", communityId: "66f1a2b3c4d5e6f7a8b9c0d2", discussionId: "disc004",title: "Replied to: What is the best open-source WAF in 2025?",               communityName: "Cyber Security", pts: 1, createdAt: "2026-08-15T15:00:00.000Z" },
    ],
  },

  "2026-08-14": {
    totalPts: 3, total: 1, page: 1, hasMore: false,
    events: [
      { _id: "e012", type: "discussion", targetId: "disc005", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: null,     title: "Show and tell: built a reinforcement learning gridworld from scratch", communityName: "AI/ML",  pts: 3, createdAt: "2026-08-14T14:00:00.000Z" },
    ],
  },

  // ── July 2026 (peak month) ───────────────────────────────────────────────

  "2026-07-28": {
    totalPts: 12, total: 3, page: 1, hasMore: false,
    events: [
      { _id: "e013", type: "post",       targetId: "post006", communityId: null,                       discussionId: null,     title: "Supervised Machine Learning deep dive",                                communityName: "AI/ML",  pts: 5, createdAt: "2026-07-28T08:00:00.000Z" },
      { _id: "e014", type: "post",       targetId: "post007", communityId: null,                       discussionId: null,     title: "Unsupervised Learning with scikit-learn",                              communityName: "Data Science", pts: 5, createdAt: "2026-07-28T10:30:00.000Z" },
      { _id: "e015", type: "reply",      targetId: "rply004", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: "disc005",title: "Replied to: Show and tell: RL gridworld from scratch",               communityName: "AI/ML",  pts: 1, createdAt: "2026-07-28T16:45:00.000Z" },
    ],
  },

  "2026-07-14": {
    totalPts: 15, total: 4, page: 1, hasMore: true,
    events: [
      { _id: "e016", type: "post",       targetId: "post008", communityId: null,                       discussionId: null,     title: "Computer Vision with PyTorch — end to end guide",                     communityName: "AI/ML",  pts: 5, createdAt: "2026-07-14T08:00:00.000Z" },
      { _id: "e017", type: "post",       targetId: "post009", communityId: null,                       discussionId: null,     title: "Attention is All You Need — annotated walkthrough",                    communityName: "AI/ML",  pts: 5, createdAt: "2026-07-14T10:00:00.000Z" },
      { _id: "e018", type: "discussion", targetId: "disc006", communityId: "66f1a2b3c4d5e6f7a8b9c0d4", discussionId: null,     title: "Idea: weekly paper reading club for this community",                   communityName: "GenAI",  pts: 3, createdAt: "2026-07-14T13:00:00.000Z" },
      { _id: "e019", type: "reply",      targetId: "rply005", communityId: "66f1a2b3c4d5e6f7a8b9c0d4", discussionId: "disc006",title: "Replied to: Idea: weekly paper reading club",                          communityName: "GenAI",  pts: 1, createdAt: "2026-07-14T16:00:00.000Z" },
    ],
  },

  "2026-07-03": {
    totalPts: 15, total: 3, page: 1, hasMore: false,
    events: [
      { _id: "e020", type: "post",       targetId: "post010", communityId: null,                       discussionId: null,     title: "Building a RAG pipeline with LangChain and Pinecone",                  communityName: "GenAI",  pts: 5, createdAt: "2026-07-03T09:00:00.000Z" },
      { _id: "e021", type: "post",       targetId: "post011", communityId: null,                       discussionId: null,     title: "Vector databases compared: Pinecone vs Weaviate vs Qdrant",           communityName: "GenAI",  pts: 5, createdAt: "2026-07-03T11:00:00.000Z" },
      { _id: "e022", type: "discussion", targetId: "disc007", communityId: "66f1a2b3c4d5e6f7a8b9c0d4", discussionId: null,     title: "Q&A: when to use HyDE vs standard retrieval in RAG?",                 communityName: "GenAI",  pts: 3, createdAt: "2026-07-03T14:30:00.000Z" },
    ],
  },

  // ── June 2026 ────────────────────────────────────────────────────────────

  "2026-06-17": {
    totalPts: 12, total: 3, page: 1, hasMore: false,
    events: [
      { _id: "e023", type: "post",       targetId: "post012", communityId: null,                       discussionId: null,     title: "Deploying FastAPI on EC2 with Nginx and PM2",                          communityName: "Web Development", pts: 5, createdAt: "2026-06-17T09:00:00.000Z" },
      { _id: "e024", type: "discussion", targetId: "disc008", communityId: "66f1a2b3c4d5e6f7a8b9c0d5", discussionId: null,     title: "Q&A: React Query vs SWR for data fetching in 2025",                   communityName: "Web Development", pts: 3, createdAt: "2026-06-17T12:00:00.000Z" },
      { _id: "e025", type: "reply",      targetId: "rply006", communityId: "66f1a2b3c4d5e6f7a8b9c0d5", discussionId: "disc008",title: "Replied to: React Query vs SWR for data fetching",                    communityName: "Web Development", pts: 1, createdAt: "2026-06-17T15:00:00.000Z" },
    ],
  },

  "2026-06-09": {
    totalPts: 12, total: 2, page: 1, hasMore: false,
    events: [
      { _id: "e026", type: "post",       targetId: "post013", communityId: null,                       discussionId: null,     title: "MySQL RAG System with LangChain",                                      communityName: "Data Science", pts: 5, createdAt: "2026-06-09T10:00:00.000Z" },
      { _id: "e027", type: "discussion", targetId: "disc009", communityId: "66f1a2b3c4d5e6f7a8b9c0d3", discussionId: null,     title: "Show and tell: built a full EDA pipeline from scratch",                communityName: "Data Science", pts: 3, createdAt: "2026-06-09T14:00:00.000Z" },
    ],
  },

  // ── March 2026 (peak month) ───────────────────────────────────────────────

  "2026-03-24": {
    totalPts: 15, total: 4, page: 1, hasMore: false,
    events: [
      { _id: "e028", type: "post",       targetId: "post014", communityId: null,                       discussionId: null,     title: "Sarvam AI — Indic LLMs for real-world applications",                  communityName: "GenAI",  pts: 5, createdAt: "2026-03-24T08:00:00.000Z" },
      { _id: "e029", type: "post",       targetId: "post015", communityId: null,                       discussionId: null,     title: "Building a Multilingual RAG with Sarvam Translate",                    communityName: "GenAI",  pts: 5, createdAt: "2026-03-24T10:00:00.000Z" },
      { _id: "e030", type: "discussion", targetId: "disc010", communityId: "66f1a2b3c4d5e6f7a8b9c0d4", discussionId: null,     title: "Q&A: best chunking strategy for long PDF documents in RAG?",          communityName: "GenAI",  pts: 3, createdAt: "2026-03-24T13:00:00.000Z" },
      { _id: "e031", type: "reply",      targetId: "rply007", communityId: "66f1a2b3c4d5e6f7a8b9c0d4", discussionId: "disc010",title: "Replied to: best chunking strategy for long PDF documents in RAG?",  communityName: "GenAI",  pts: 1, createdAt: "2026-03-24T16:00:00.000Z" },
    ],
  },

  "2026-03-12": {
    totalPts: 15, total: 3, page: 1, hasMore: false,
    events: [
      { _id: "e032", type: "post",       targetId: "post016", communityId: null,                       discussionId: null,     title: "Zero-shot vs Few-shot prompting — a practical comparison",            communityName: "GenAI",  pts: 5, createdAt: "2026-03-12T09:00:00.000Z" },
      { _id: "e033", type: "post",       targetId: "post017", communityId: null,                       discussionId: null,     title: "Chain-of-thought prompting with GPT-4o",                               communityName: "GenAI",  pts: 5, createdAt: "2026-03-12T11:00:00.000Z" },
      { _id: "e034", type: "discussion", targetId: "disc011", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: null,     title: "Announcement: weekly knowledge drop #1 — attention mechanisms",       communityName: "AI/ML",  pts: 3, createdAt: "2026-03-12T15:00:00.000Z" },
    ],
  },

  // ── Feb 2026 ─────────────────────────────────────────────────────────────

  "2026-02-09": {
    totalPts: 15, total: 3, page: 1, hasMore: false,
    events: [
      { _id: "e035", type: "post",       targetId: "post018", communityId: null,                       discussionId: null,     title: "Penetration Testing with Kali Linux — beginner guide",                 communityName: "Cyber Security", pts: 5, createdAt: "2026-02-09T09:00:00.000Z" },
      { _id: "e036", type: "discussion", targetId: "disc012", communityId: "66f1a2b3c4d5e6f7a8b9c0d2", discussionId: null,     title: "Q&A: OWASP Top 10 — which vulnerabilities matter most in 2025?",     communityName: "Cyber Security", pts: 3, createdAt: "2026-02-09T12:00:00.000Z" },
      { _id: "e037", type: "reply",      targetId: "rply008", communityId: "66f1a2b3c4d5e6f7a8b9c0d2", discussionId: "disc012",title: "Replied to: OWASP Top 10 — which vulnerabilities matter most?",       communityName: "Cyber Security", pts: 1, createdAt: "2026-02-09T15:30:00.000Z" },
    ],
  },

  // ── Jan 2026 ─────────────────────────────────────────────────────────────

  "2026-01-07": {
    totalPts: 8, total: 2, page: 1, hasMore: false,
    events: [
      { _id: "e038", type: "post",       targetId: "post019", communityId: null,                       discussionId: null,     title: "2026 AI roadmap — what to learn and in what order",                    communityName: "AI/ML",  pts: 5, createdAt: "2026-01-07T09:00:00.000Z" },
      { _id: "e039", type: "discussion", targetId: "disc013", communityId: "66f1a2b3c4d5e6f7a8b9c0d1", discussionId: null,     title: "Announcement: welcome to the AI/ML community 2026",                   communityName: "AI/ML",  pts: 3, createdAt: "2026-01-07T14:00:00.000Z" },
    ],
  },

  "2026-01-03": {
    totalPts: 5, total: 1, page: 1, hasMore: false,
    events: [
      { _id: "e040", type: "post",       targetId: "post020", communityId: null,                       discussionId: null,     title: "My 2025 in review — 18 posts, 3 projects, 1 buildathon",              communityName: "AI/ML",  pts: 5, createdAt: "2026-01-03T10:00:00.000Z" },
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

// const buildGrid = (contributions, year) => {
//   const today     = new Date();
//   const yearEnd   = year === today.getFullYear() ? today : new Date(year, 11, 31);
//   const gridStart = new Date(year, 0, 1);
//   gridStart.setDate(gridStart.getDate() - gridStart.getDay());
//   const gridEnd   = new Date(yearEnd);
//   gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

//   const weeks   = [];
//   let current   = new Date(gridStart);
//   while (current <= gridEnd) {
//     const week = [];
//     for (let d = 0; d < 7; d++) {
//       const key         = current.toISOString().slice(0, 10);
//       const points      = contributions?.[key] || 0;
//       const isFuture    = current > today;
//       const isOutOfYear = current.getFullYear() !== year;
//       week.push({ date: key, points, level: isFuture || isOutOfYear ? -1 : pointsToLevel(points), future: isFuture, outOfYear: isOutOfYear });
//       current = new Date(current);
//       current.setDate(current.getDate() + 1);
//     }
//     weeks.push(week);
//   }
//   return weeks;
// };

// const buildMonthLabels = (weeks) => {
//   const labels  = [];
//   let lastMonth = null;
//   weeks.forEach((week, wi) => {
//     const firstDay = week.find((d) => !d.future && !d.outOfYear);
//     if (!firstDay) return;
//     const month = new Date(firstDay.date).getMonth();
//     const label = new Date(firstDay.date).toLocaleString("default", { month: "short" });
//     if (month !== lastMonth) { labels.push({ index: wi, label }); lastMonth = month; }
//   });
//   return labels;
// };

// add this helper above buildGrid
const localDateStr = (d) => {
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const buildGrid = (contributions, year) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yearEnd =
    year === today.getFullYear()
      ? (() => {
          const d = new Date(today);
          d.setDate(d.getDate() + (6 - d.getDay()));
          return d;
        })()
      : new Date(year, 11, 31);

  const gridStart = new Date(year, 0, 1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(yearEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const weeks = [];
  let current = new Date(gridStart);

  while (current <= gridEnd) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key         = localDateStr(current); // ← fix: local date not UTC
      const points      = contributions?.[key] || 0;
      const isFuture    = current >= tomorrow;
      const isOutOfYear = current.getFullYear() !== year;
      week.push({
        date: key, points,
        level: isFuture || isOutOfYear ? -1 : pointsToLevel(points),
        future: isFuture,
        outOfYear: isOutOfYear,
      });
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
    // parse as local date — append T00:00 to force local timezone interpretation
    const date  = new Date(firstDay.date + 'T00:00');
    const month = date.getMonth();
    const label = date.toLocaleString("default", { month: "short" });
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
    case "discussion": return `/discussion/${event.communityId}/${event.targetId}`;
    case "reply":      return `/discussion/${event.communityId}/${event.discussionId}#${event.targetId}`;
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
      <div className="theme flex flex-col justify-between border border-[#1e293b] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <TbFlame className={`text-base ${display > 0 ? "text-amber-400" : "text-gray-600"}`} />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Current streak
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold ${display > 0 ? "text-gray-100" : "text-gray-600"}`}>
            {display}
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

      <div className="theme flex flex-col justify-between border border-[#1e293b] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <TbTrophy className="text-base text-amber-400/60" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Longest streak
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-100">{longestStreak}</span>
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
// DayEventDrawer — receives all state from parent (useDayEvents hook)
// No internal data fetching — pure display + pagination trigger
const DayEventDrawer = ({
  date,
  onClose,
  events       = [],
  totalPts     = 0,
  total        = 0,
  hasMore      = false,
  loading      = false,
  loadingMore  = false,
  onLoadMore,
}) => {
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const loadMore = () => { if (onLoadMore) onLoadMore(); };
//  console.log("events", events)
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
        <div className="overflow-y-auto overflow-y-hidden scrollbar-hide flex-1 px-5 py-3">
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
//  ACTIVITY GRAPH  — pure display component, no data fetching
//  All state owned by PerformanceTracker and passed down as props
//  so it maps 1:1 with what useYearContributions + useDayEvents return.
// ─────────────────────────────────────────────────────────────────────────────
const ActivityGraph = ({
  // year / contributions
  joinedYear,
  contributions        = {},
  contributionsLoading = false,
  selectedYear,
  onYearChange,
  // day click → opens drawer
  onDayClick,
  // drawer state (driven by useDayEvents in parent)
  activeDay,
  drawerEvents       = [],
  drawerTotalPts     = 0,
  drawerTotal        = 0,
  drawerHasMore      = false,
  drawerLoading      = false,
  drawerLoadingMore  = false,
  onDrawerClose,
  onLoadMore,
}) => {
  const currentYear  = new Date().getFullYear();
  const [hoveredDay, setHoveredDay] = useState(null);

  const yearOptions = useMemo(() => {
    const start = joinedYear || currentYear;
    const years = [];
    for (let y = currentYear; y >= start; y--) years.push(y);
    return years;
  }, [joinedYear, currentYear]);

  const weeks       = useMemo(() => buildGrid(contributions, selectedYear), [contributions, selectedYear]);
  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);
  const activeDays  = countActiveDays(contributions);
  const pts         = totalPoints(contributions);

  const CELL = 11;
  const GAP  = 3;
  const STEP = CELL + GAP;

  const handleCellClick = (day) => {
    if (day.future || day.outOfYear || day.points === 0) return;
    onDayClick(day.date);
  };

  // ── Portal tooltip — rendered at document body level ──────────────────────
// Avoids overflow clipping from the scroll container


const CellTooltip = ({ day, anchorRect }) => {
  if (!anchorRect) return null;

  // position above the cell center
  const top  = anchorRect.top  + window.scrollY - 8;   // 8px gap above cell
  const left = anchorRect.left + window.scrollX + anchorRect.width / 2;

  return createPortal(
    <div
      className=" pointer-events-none whitespace-nowrap absolute z-[9999]
                 bg-[#0f172a] border border-white/10 rounded-lg
                 px-2.5 py-1.5 shadow-xl text-[10px] text-gray-200"
      style={{
        top:       top,
        left:      left,
        transform: "translate(-50%, -100%)",
      }}
    >
      {day.points > 0 ? (
        <>
          <b className="text-emerald-400">{day.points} pts</b>
          {" · "}
          {new Date(day.date + "T00:00").toLocaleDateString("en-IN", {
            month: "short", day: "numeric",
          })}
          {!day.future && day.points > 0 && (
            <span className="text-gray-500 ml-1">— click to view</span>
          )}
        </>
      ) : (
        <>No activity · {new Date(day.date + "T00:00").toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</>
      )}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
    </div>,
    document.body
  );
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
              onClick={() => { const i = yearOptions.indexOf(selectedYear); if (i < yearOptions.length - 1) onYearChange(yearOptions[i + 1]); }}
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
                  onClick={() => onYearChange(y)}
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
              onClick={() => { const i = yearOptions.indexOf(selectedYear); if (i > 0) onYearChange(yearOptions[i - 1]); }}
              disabled={selectedYear === currentYear}
              className="p-0.5 rounded text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors"
            >
              <TbChevronRight className="text-sm" />
            </button>
          </div>
        </div>

        {/* graph */}
        <div className={`overflow-x-auto scrollbar-hide transition-opacity duration-200 ${contributionsLoading ? "opacity-40 pointer-events-none" : ""}`}>
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
                  {/* {week.map((day) => {
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

                        {isHovered && !day.outOfYear && (
                          <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-40
                                       pointer-events-none whitespace-nowrap
                                       bg-[#0f172a] border border-white/10 rounded-lg
                                       px-2.5 py-1.5 shadow-xl text-[10px] text-gray-200"
                          >
                            {day.points > 0 ? (
                              <>
                                <b className="text-emerald-400">{day.points} pts</b>
                                {" · "}
                                {new Date(day.date + 'T00:00').toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                {isClickable && <span className="text-gray-500 ml-1">— click to view</span>}
                              </>
                            ) : (
                              <>No activity · {new Date(day.date + 'T00:00').toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</>
                            )}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
                          </div>
                        )}
                      </div>
                    );
                  })} */}
{week.map((day) => {
  const isClickable = !day.future && !day.outOfYear && day.points > 0;
  const isHovered   = hoveredDay?.date === day.date;
  const isActive    = activeDay === day.date;

  return (
    <div
      key={day.date}
      className="relative"
      style={{ width: CELL, height: CELL, flexShrink: 0 }}
      onMouseEnter={(e) => {
        if (!day.future && !day.outOfYear) {
          setHoveredDay({
            date: day.date,
            rect: e.currentTarget.getBoundingClientRect(),
          });
        }
      }}
      onMouseLeave={() => setHoveredDay(null)}
      onClick={() => handleCellClick(day)}
    >
      <div
        style={{
          width: CELL, height: CELL,
          borderRadius: 2,
          background:   LEVEL_COLORS[String(day.level)],
          border:       `1px solid ${LEVEL_BORDER[String(day.level)]}`,
          cursor:       isClickable ? "pointer" : "default",
          transform:    isActive ? "scale(1.25)" : isHovered && isClickable ? "scale(1.15)" : "scale(1)",
          transition:   "transform 0.1s ease",
          outline:      isActive ? "2px solid rgba(52,211,153,0.6)" : "none",
          outlineOffset: 1,
        }}
      />

      {/* tooltip rendered via portal — no overflow clipping */}
      {isHovered && !day.outOfYear && (
        <CellTooltip day={day} anchorRect={hoveredDay?.rect} />
      )}
    </div>
  );
})}
                </div>
              ))}
              {/* // updated cell render: */}

            </div>

            
          </div>
          
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
          onClose={onDrawerClose}
          events={drawerEvents}
          totalPts={drawerTotalPts}
          total={drawerTotal}
          hasMore={drawerHasMore}
          loading={drawerLoading}
          loadingMore={drawerLoadingMore}
          onLoadMore={onLoadMore}
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
 *   authorId  — the author whose performance to display
 *   isOwn     — true = own profile (streak + heatmap), false = heatmap only
 *
 * Data flow:
 *   PerformanceTracker owns all state via three hooks:
 *     useStreakData         → streak numbers + joinedYear
 *     useYearContributions  → heatmap { "YYYY-MM-DD": pts } per selected year
 *     useDayEvents          → paginated events for a clicked day
 *
 *   All state is passed down as flat props to ActivityGraph and DayEventDrawer.
 *   Neither child fetches data — they only display and trigger callbacks.
 *
 * Usage:
 *   <PerformanceTracker authorId={author._id} isOwn={true} />
 *
 * Sample data mode (no authorId — for UI testing):
 *   <PerformanceTracker isOwn={true} />
 */
const PerformanceTracker = ({userId=null, streakData,streakLoading, showStreak=false, showActivityGraph=false,  isOwn = true }) => {
  const currentYear = new Date().getFullYear();
  let authorId = getItem("authorId");
  if(!isOwn)
  {
    authorId = userId
  }

  // ── Streak ────────────────────────────────────────────────────────────────
  // When no authorId, fall back to sample streak for UI testing
  // const [streakData, setStreakData] = useState(authorId ? null : SAMPLE_STREAK);
  // const [streakLoading, setStreakLoading] = useState(!!authorId);

  // useEffect(() => {
  //   if (!authorId) return;
  //   setStreakLoading(true);
  //   axiosInstance.get(`/bytes//${authorId}/streak`)
  //     .then((r) => setStreakData(r.data))
  //     .catch(() => setStreakData(SAMPLE_STREAK)) // fallback on error
  //     .finally(() => setStreakLoading(false));
  // }, [authorId]);

  // ── Year contributions ────────────────────────────────────────────────────
  const [selectedYear,      setSelectedYear]      = useState(currentYear);
  const [contributions,     setContributions]     = useState(
    authorId ? {} : (SAMPLE_CONTRIBUTIONS_BY_YEAR[currentYear]?.contributions || {})
  );
  const [contributionsLoading, setContributionsLoading] = useState(!!authorId);
  // cache: { [year]: contributions } — avoids re-fetching on year toggle
  const [contribCache, setContribCache] = useState(
    authorId ? {} : SAMPLE_CONTRIBUTIONS_BY_YEAR
  );

  const fetchYear = useCallback(async (year) => {
    if (!authorId) {
      // sample mode — instant swap from local cache
      setSelectedYear(year);
      setContributions(SAMPLE_CONTRIBUTIONS_BY_YEAR[year]?.contributions || {});
      return;
    }
    setSelectedYear(year);
    if (contribCache[year]) {
      setContributions(contribCache[year]);
      return;
    }
    setContributionsLoading(true);
    try {
      const r = await axiosInstance.get(`/bytes/performanceTrack/contributions/${authorId}?year=${year}`);
      const data = r.data.contributions || {};
      setContributions(data);
      setContribCache((prev) => ({ ...prev, [year]: data }));
    } catch {
      setContributions({});
    } finally {
      setContributionsLoading(false);
    }
  }, [authorId, contribCache]);

  // auto-fetch current year on mount (real API only)
  useEffect(() => {
    if (!authorId) return;
    fetchYear(currentYear);
  }, [authorId]);

  // ── Day events ────────────────────────────────────────────────────────────
  const [activeDay,        setActiveDay]        = useState(null);
  const [drawerEvents,     setDrawerEvents]     = useState([]);
  const [drawerTotalPts,   setDrawerTotalPts]   = useState(0);
  const [drawerTotal,      setDrawerTotal]      = useState(0);
  const [drawerHasMore,    setDrawerHasMore]    = useState(false);
  const [drawerLoading,    setDrawerLoading]    = useState(false);
  const [drawerLoadingMore,setDrawerLoadingMore]= useState(false);
  const [drawerPage,       setDrawerPage]       = useState(1);

  const handleDayClick = useCallback(async (date) => {
    setActiveDay(date);
    setDrawerEvents([]);
    setDrawerPage(1);
    setDrawerHasMore(false);
    setDrawerLoading(true);

    if (!authorId) {
      // sample mode
      const data = SAMPLE_DAY_EVENTS[date] || { events: [], totalPts: 0, total: 0, hasMore: false };
      setTimeout(() => {
        setDrawerEvents(data.events || []);
        setDrawerTotalPts(data.totalPts || 0);
        setDrawerTotal(data.total || 0);
        setDrawerHasMore(data.hasMore || false);
        setDrawerLoading(false);
      }, 280);
      return;
    }

    try {
      const r = await axiosInstance.get(
        `/bytes/performanceTrack/events/${authorId}?date=${date}&page=1&limit=10`
      );
      setDrawerEvents(r.data.events || []);
      setDrawerTotalPts(r.data.totalPts || 0);
      setDrawerTotal(r.data.total || 0);
      setDrawerHasMore(r.data.hasMore || false);
      setDrawerPage(1);
    } catch {
      setDrawerEvents([]);
    } finally {
      setDrawerLoading(false);
    }
  }, [authorId]);

  const handleLoadMore = useCallback(async () => {
    if (!drawerHasMore || drawerLoadingMore || !activeDay) return;
    const nextPage = drawerPage + 1;
    setDrawerLoadingMore(true);

    if (!authorId) { setDrawerLoadingMore(false); return; }

    try {
      const r = await axiosInstance.get(
        `/bytes/performanceTrack/events/${authorId}?date=${activeDay}&page=${nextPage}&limit=10`
      );
      setDrawerEvents((prev) => [...prev, ...(r.data.events || [])]);
      setDrawerHasMore(r.data.hasMore || false);
      setDrawerPage(nextPage);
    } catch {
      // silent — don't clear existing events on load-more failure
    } finally {
      setDrawerLoadingMore(false);
    }
  }, [authorId, activeDay, drawerHasMore, drawerLoadingMore, drawerPage]);

  const handleDrawerClose = useCallback(() => {
    setActiveDay(null);
    setDrawerEvents([]);
    setDrawerTotalPts(0);
    setDrawerTotal(0);
    setDrawerHasMore(false);
    setDrawerPage(1);
  }, []);

  // console.log("contributions", contributions)

  // ── Render ────────────────────────────────────────────────────────────────
  if (streakLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <TbLoader2 className="text-xl text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!streakData) return null;

  const { currentStreak, longestStreak, lastActiveDate, joinedYear } = streakData;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm md:ml-2 font-semibold text-gray-300">
        {isOwn ? "Your Contribution Activity" : "Contribution Activity"}
      </span>

      {isOwn && showStreak && (
        <StreakWidget
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          lastActiveDate={lastActiveDate}
        />
      )}

     {showActivityGraph && <ActivityGraph
        joinedYear={joinedYear}
        contributions={contributions}
        contributionsLoading={contributionsLoading}
        selectedYear={selectedYear}
        onYearChange={fetchYear}
        onDayClick={handleDayClick}
        activeDay={activeDay}
        drawerEvents={drawerEvents}
        drawerTotalPts={drawerTotalPts}
        drawerTotal={drawerTotal}
        drawerHasMore={drawerHasMore}
        drawerLoading={drawerLoading}
        drawerLoadingMore={drawerLoadingMore}
        onDrawerClose={handleDrawerClose}
        onLoadMore={handleLoadMore}
      />}
    </div>
  );
};

export default PerformanceTracker;