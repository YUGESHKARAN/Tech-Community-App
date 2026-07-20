import React, { useState, useMemo } from "react";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { Link } from "react-router-dom";
import useAuthorCommunity from "../hooks/useAuthorCommunity";
import CommunityCardSkeleton from "../components/loaders/CommunityCardSkeleton";
import toast from "../components/toaster/Toast";
import { getItem } from "../utils/encode";
import formatCount from "../utils/NumberConversion";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbBrain,
  TbShieldLock,
  TbChartDots,
  TbSparkles,
  TbWorldWww,
  TbBulb,
  TbTrophy,
  TbCrown,
  TbFlame,
  TbUsers,
  TbFileText,
  TbFlame as TbFlameFilter,
  TbClockHour4,
  TbSparkles as TbSparklesFilter,
} from "react-icons/tb";

import { initials, avatarColor } from "../utils/ProfileAvatar";
import useGetCommunityStats from "../hooks/techCommunity/useGetCommunityStats";
import { FILTERS } from "../utils/techCommunityFilters";
import useTopContributors from "../hooks/admins/useTopContributors";
import { getLast3MonthsName } from "../utils/dateFunction";
import TopContributorsSkeleton from "../components/loaders/dashboard/TopContributorsSkeleton";
import TechCommunityTopContributorsSkeleton from "../components/loaders/TechCommunityTopContributorsSkeleton";



const streakSample = {
  currentStreak: 4,
  longestStreak: 9,
  lastActiveDate: "2026-07-18",
};

// ── Per-domain visual identity — icon + accent color ───────────────────────
const domainStyle = {
  "AI/ML": { icon: TbBrain, from: "#0d9488", to: "#0f766e" },
  "Cyber Security": { icon: TbShieldLock, from: "#7c3aed", to: "#6d28d9" },
  "Data Science": { icon: TbChartDots, from: "#059669", to: "#047857" },
  GenAI: { icon: TbSparkles, from: "#ea580c", to: "#c2410c" },
  "Web Development": { icon: TbWorldWww, from: "#2563eb", to: "#1d4ed8" },
};
const defaultStyle = { icon: TbBulb, from: "#0d9488", to: "#0f766e" };
const getDomainStyle = (name) => domainStyle[name] || defaultStyle;


function TechCommunityLanding() {
  const email = getItem("email");
  const role = getItem("role");
  const [filter, setFilter] = useState("current_month");
  const [limit, setLimit] = useState(10);
   const months = getLast3MonthsName();
  const { topContributors, topContributorsLoading } = useTopContributors(
      email,
      limit,
      filter
    );

  // ── real membership toggle logic — unchanged from before ──
  const { authorCommunity, setAuthorCommunity } = useAuthorCommunity(email);
  const { communityStats, statsLoader, setcommunityStats, getCommunityStats } = useGetCommunityStats();
  
  const loading = false; // swap for your hook's loading flag

  const [loadingDomains, setLoadingDomains] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState("all");

  // const updateCommunity = async (techCommunityName, communityId) => {
  //   if (loadingDomains.has(techCommunityName)) return;

  //   setLoadingDomains((prev) => new Set(prev).add(techCommunityName));

  //   const isJoined = authorCommunity?.includes(techCommunityName);

  //   try {
  //     const response = await axiosInstance.put(
  //       "/blog/author/control/updateCommunity",
  //       { email, techcommunity: techCommunityName },
  //     );

  //     // optimistic update — legacy community array
  //     if (isJoined) {
  //       setAuthorCommunity((prev) =>
  //         prev.filter((c) => c !== techCommunityName),
  //       );
  //     } else {
  //       setAuthorCommunity((prev) => [
  //         ...new Set([...prev, techCommunityName]),
  //       ]);
  //     }

  //     // optimistic update — new landing page userRole per community
  //     setCommunities((prev) =>
  //       prev.map((c) =>
  //         c._id === communityId
  //           ? {
  //               ...c,
  //               userRole: isJoined ? null : "member",
  //               memberCount: c.memberCount + (isJoined ? -1 : 1),
  //             }
  //           : c,
  //       ),
  //     );

  //     if (response.status === 201) {
  //       toast[isJoined ? "info" : "success"](
  //         isJoined ? "Left" : "Joined",
  //         isJoined
  //           ? "You have left the community!"
  //           : "You have joined the community!",
  //       );
  //     }
  //   } catch (err) {
  //     console.log("error", err);
  //   } finally {
  //     setLoadingDomains((prev) => {
  //       const updated = new Set(prev);
  //       updated.delete(techCommunityName);
  //       return updated;
  //     });
  //   }
  // };
  const updateCommunity = async (email, techCommunity) => {
    if (loadingDomains.has(techCommunity)) return;

    setLoadingDomains((prev) => new Set(prev).add(techCommunity));

    const isJoined = authorCommunity?.includes(techCommunity);

    try {
      const response = await axiosInstance.put(
        "/blog/author/control/updateCommunity",
        { email, techcommunity: techCommunity },
      );

      // optimistic update — legacy community array
      if (isJoined) {
        setAuthorCommunity((prev) => prev.filter((c) => c !== techCommunity));
      } else {
        setAuthorCommunity((prev) => [...new Set([...prev, techCommunity])]);
      }

      // optimistic update — new landing page userRole, matched by name
      setcommunityStats((prev) =>
        prev.map((c) =>
          c.name === techCommunity
            ? {
                ...c,
                userRole: isJoined ? null : "member",
                memberCount: c.memberCount + (isJoined ? -1 : 1),
              }
            : c,
        ),
      );

      if (response.status === 201) {
        toast[isJoined ? "info" : "success"](
          isJoined ? "Left" : "Joined",
          isJoined
            ? "You have left the community!"
            : "You have joined the community!",
        );
        // getCommunityStats();
      }
    } catch (err) {
      console.log("error", err);
    } finally {
      setLoadingDomains((prev) => {
        const updated = new Set(prev);
        updated.delete(techCommunity);
        return updated;
      });
    }
  };

  const filteredCommunities = useMemo(() => {
    // const list = [...communities];
    const list = [...communityStats];
    switch (activeFilter) {
      case "trending":
        return list
          .filter((c) => c.weeklyPostCount > 0)
          .sort((a, b) => b.weeklyPostCount - a.weeklyPostCount);
      case "active":
        return list.sort(
          (a, b) => b.memberCount + b.postCount - (a.memberCount + a.postCount),
        );
      case "newest":
        return list.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      default:
        return list;
    }
  }, [communityStats, activeFilter]);

  const yourCommunities = communityStats.filter((c) => c.userRole !== null);
  const exploreCommunities = communityStats.filter((c) => c.userRole === null);

  // console.log("communityStats", communityStats);
  // console.log("statsLoader", statsLoader);
  // console.log("topContributors", topContributors);

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.03,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 18,
      scale: 0.96,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      scale: 0.96,
      transition: {
        duration: 0.2,
      },
    },
  };

  const CommunityCard = ({ item }) => {
    const style = getDomainStyle(item.name);
    const Icon = style.icon;
    const isLoading = loadingDomains.has(item.name);

    return (
      <div className="group h-52 md:h-60 relative theme border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-all duration-300">
        <Link
          to={`/techDomainDetails/${encodeURIComponent(item.name)}`}
          className="flex flex-col"
        >
          {/* ── colored banner header ── */}
          <div
            className="px-4 pt-4 pb-3 flex items-center gap-3 relative"
            style={{
              background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon className="text-white text-sm md:text-lg" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-base truncate">
                {item.name}
              </h2>
              <p className="text-white/80 text-[11px]">Tech Domain</p>
            </div>

            {item.userRole && (
              <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/25 text-white">
                {/* Coordinator */}
                {item.userRole}
              </span>
            )}
          </div>

          {/* ── stats + avatar stack ── */}
          <div className="px-4 pt-4 md:mt-3 pb-2 flex flex-col   gap-2.5">
            <div className="flex  gap-4">
              <span className="flex items-center gap-1.5 md:text-sm text-xs text-gray-300">
                <TbUsers className="text-sm md:text-base text-gray-500" />
                <b className="text-gray-100 font-semibold">
                  {formatCount(item.memberCount)}
                </b>
                members
              </span>
              <span className="flex items-center gap-1.5 text-xs md:text-sm text-gray-300">
                <TbFileText className="text-sm md:text-base text-gray-500" />
                <b className="text-gray-100 font-semibold">
                  {formatCount(item.postCount)}
                </b>
                posts
              </span>
            </div>

            <div className="flex mt-1 md:mt-3 items-center">
              {item.profiles.slice(0, 4).map((p, i) => (
                <div
                key={p.email}>
                  {p.profile ? (
                    <img
                      key={p.email}
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.profile}`}
                      alt={p.name}
                      style={{
                        marginLeft: i === 0 ? 0 : "-6px",
                      }}
                      className="h-7 min-w-7 rounded-full border border-teal-600 bg-gray-400"
                    />
                  ) : (
                    <div
                      key={p.email}
                      className="w-7 h-7 rounded-full border-2 border-[#0f172a] flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0"
                      style={{
                        backgroundColor: avatarColor(p.name),
                        marginLeft: i === 0 ? 0 : "-6px",
                      }}
                    >
                      {initials(p.name)}
                    </div>
                  )}
                </div>
              ))}
              {item.memberCount > 4 && (
                <span className="text-[10px] md:text-xs text-gray-500 ml-1.5">
                  +{item.memberCount - 4} more
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* ── footer — trend badge + join/leave button ── */}
        <div className="px-4 pb-4 pt-1 flex items-center mt-2 md:mt-3 justify-between gap-2">
          {item.weeklyPostCount >= 5 ? (
            <span className="flex items-center gap-1 text-[10px] md:text-xs md:text-xs md:px-3 py-2 font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-emerald-400">
              <TbFlame /> {item.weeklyPostCount} posts this week
            </span>
          ) : item.weeklyPostCount > 0 ? (
            <span className="flex items-center gap-1 text-[10px] md:text-xs md:px-3 py-2  font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">
              <TbFlame /> {item.weeklyPostCount} posts this week
            </span>
          ) : (
            <span className="text-[10px] md:text-xs md:px-3 py-2 font-semibold px-2.5 py-1 rounded-full bg-white/5 text-gray-500">
              Quiet this week
            </span>
          )}

          {item.userRole === "coordinator" ? (
            <div
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full"
              style={{ background: `${style.from}22`, color: style.from }}
            >
              Coordinating
            </div>
          ) : item.userRole === "member" ? (
            <button
              type="button"
              onClick={() => updateCommunity(email, item.name)}
              disabled={isLoading}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 disabled:opacity-50"
            >
              {isLoading ? "Leaving..." : "✓ Joined"}
            </button>
          ) : (
            <>
              {role === "student" ? (
                <button
                  type="button"
                  onClick={() => updateCommunity(email, item.name)}
                  disabled={isLoading}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full text-white disabled:opacity-50"
                  style={{ background: style.from }}
                >
                  {isLoading ? "Joining..." : "+ Join"}
                </button>
              ) : (
                <div className="text-xs font-semibold px-3.5 py-1.5 border border-neutral-700 rounded-full text-white disabled:opacity-50">
                  {role === "coordinator" ? "Contributor" : "Maintainer"}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen theme text-white flex flex-col">
      <NavBar />

      <div className="flex-grow px-4 md:px-12  relative max-w-[1800px] mx-auto w-full pb-20">
        {/* ── Hero header ── */}
        <div className="pt-3  relative pb-1 md:pb-3 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-200 leading-none mb-2">
            Tech Communities
          </h1>
          <p className="text-xs text-gray-400 max-w-sm md:max-w-xl mx-auto leading-relaxed">
            {role === "student"
              ? "Join a domain, connect with coordinators, and stay at the frontier of technology."
              : "Lead with knowledge - contribute content, collaborate with people, and elevate the ecosystem."}
          </p>
        </div>

        {/* ── Sticky filter bar — now a sibling, not nested inside the short hero div ── */}
        <div className="sticky top-0 z-40 -mx-4 md:-mx-12 px-4 md:px-12 py-3  mb-3 theme ">
          <div className="flex items-center justify-center gap-2 md:gap-4  flex-wrap">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.value;
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActiveFilter(f.value)}
                  className={`flex items-center gap-1.5 text-xs font-medium md:px-3.5 px-2 py-1 md:py-1.5 rounded-full border transition-colors 
            ${
              isActive
                ? // ? "bg-emerald-500 text-black border-transparent"
                  "bg-white/5 text-white border-white/10 hover:text-gray-200 hover:border-white/2"
                : "bg-white/5 text-gray-400 border-white/10 hover:text-gray-200 hover:border-white/20"
            }
             bg-white/5 text-gray-400 border-white/10 hover:text-gray-200 hover:border-white/20`}
                >
                  {Icon && (
                    <Icon
                      className={`text-sm ${isActive ? f.color : "text-gray-500"}`}
                    />
                  )}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main layout: communities left, leaderboard + streak right ── */}
        <div className="grid grid-cols-1 md:gird-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* ── Main column ── */}

          {/* ── Sidebar ── */}
          <div className="flex col-span-1 order-3 lg:order-1 md:col-span-2 lg:col-span-1 flex-col gap-3 lg:sticky lg:top-16">
            {/* Top contributors */}
            <h3 className="text-sm md:ml-2 font-semibold text-gray-300 ">
              Overall Leaderboard
            </h3>
            {!topContributorsLoading?
              <div className="theme border border-[#1e293b] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <TbTrophy className="text-amber-400" />
                  Top contributors
                </div>
                
                <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="theme outline-none text-gray-200 cursor-pointer text-xs rounded px-2 py-1 border border-[#334155]"
                    >
                      <option value="overall">Overall</option>
                      {Object.keys(months).map((key) => (
                        <option key={key} value={key}>
                          {key==="current_month"? "This Month": months[key]}
                        </option>
                      ))} 
                    </select>
              </div>

              <div className="flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide max-h-96 gap-1">
                {topContributors.slice(0,4)?.map((c, i) => {
                  const rank = i + 1;
                  const isYou =
                    c.email === email;
                  const medalColors = ["#00f01c", "#cd7f32", "#8f9296"];

                  return (
                    <Link
                     to={`/viewProfile/${c.email}`}
                      key={c.email}
                      className={`flex items-center gap-2 py-1.5 px-1 rounded-lg ${
                        isYou ? "bg-emerald-500/10" : ""
                      }`}
                    >
                      {rank <= 3 ? (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${medalColors[rank - 1]}33` }}
                        >
                          <TbCrown
                            className="text-[11px]"
                            style={{ color: medalColors[rank - 1] }}
                          />
                        </div>
                      ) : (
                        <span className="w-5 text-center text-[11px] text-gray-500 font-medium flex-shrink-0">
                          {rank}
                        </span>
                      )}

                      {c.profile? <img
                      key={c.email}
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${c.profile}`}
                      alt={c.name}
                      
                      className="h-6 w-6 rounded-full border border-teal-600 bg-gray-400"
                    />:

                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-semibold text-gray-200 flex-shrink-0">
                        {initials(c.name)}
                      </div>}

                      <span
                        className={`text-[11px]  font-medium truncate flex-1 ${
                          isYou ? "text-emerald-400" : "text-gray-200"
                        }`}
                      >
                        {c.name}
                        {isYou && (
                          <span className="ml-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500 text-black">
                            You
                          </span>
                        )}
                      </span>

                      <span
                        className={`text-[11px] whitespace-nowrap ${
                          isYou ? "text-emerald-400" : "text-gray-400"
                        }`}
                      >
                        {c.postsCount} Posts
                      </span>
                    </Link>
                  );
                })}
          
              </div>
            </div>:
            <TechCommunityTopContributorsSkeleton/>}
          </div>

          {<div className="md:col-span-3 col-span-1 order-3 md:order-2">
            {statsLoader ? (
              <div className="grid grid-cols-1 sm:grid-cols-2  gap-5">
                {/* <CommunityCardSkeleton /> */}
                <h3 className="text-sm col-span-full font-semibold text-gray-300 ">
                  Your Communities
                </h3>
                {[...Array(8)].map((_, index) => (
                  <CommunityCardSkeleton key={index} />
                ))}
              </div>
            ) : activeFilter === "all" ? (
              <>
                {yourCommunities?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">
                      Your Communities
                    </h3>
                    {/* <div className="grid grid-cols-1 sm:grid-cols-2  gap-5"> */}
                    <motion.div
                      layout
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                    >
                      {yourCommunities.map((item) => (
                        <CommunityCard key={item._id} item={item} />
                      ))}
                    </motion.div>
                    {/* </div> */}
                  </div>
                )}

                {exploreCommunities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">
                      Explore Communities
                    </h3>
                    {/* <div className="grid grid-cols-1 sm:grid-cols-2  gap-5"> */}
                    <motion.div
                      layout
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                    >
                      {exploreCommunities.map((item) => (
                        <CommunityCard key={item._id} item={item} />
                      ))}
                    </motion.div>

                    {/* </div> */}
                  </div>
                )}
              </>
            ) : (
              // <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    {FILTERS.find((f) => f.value === activeFilter)?.label}
                    <span className="text-gray-500 font-normal ml-1.5">
                      ({filteredCommunities.length})
                    </span>
                  </h3>

                  {filteredCommunities.length > 0 ? (
                    // <div className="grid grid-cols-1 sm:grid-cols-2  gap-5">
                    <motion.div
                      layout
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                    >
                      {filteredCommunities.map((item) => (
                        <CommunityCard key={item._id} item={item} />
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No communities posted anything this week yet.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
              // </div>
            )}
          </div>}

          {/* <div className="flex col-span-1 w-full  lg:order-3 order-2 md:col-span-2 lg:col-span-1 flex-col gap-2 lg:sticky lg:top-16">
            <h3 className="text-sm md:ml-2 font-semibold text-gray-300 ">
              Performance Tracker
            </h3>
            <div className="w-full theme border   border-[#1e293b] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
                <TbFlame className="text-amber-400" />
                Your streak
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-100">
                  {streakSample.currentStreak}
                </span>
                <span className="text-xs text-gray-400">days</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Post today to keep it going · Longest:{" "}
                {streakSample.longestStreak} days
              </p>
            </div>
          </div> */}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TechCommunityLanding;
