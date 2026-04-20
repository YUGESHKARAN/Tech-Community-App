import React, { useState, useEffect, useMemo } from "react";
import NavBar from "../ui/NavBar";
import axios from "axios";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { Link } from "react-router-dom";
import useAuthorCommunity from "../hooks/useAuthorCommunity";
import CommunityCardSkeleton from "../components/loaders/CommunityCardSkeleton";
import toast from "../components/toaster/Toast"
import { use } from "react";
import useGetCommunityAnalytics from "../hooks/useGetCommunityAnalytics";
import { getItem } from "../utils/encode";
import { MdCardMembership, MdOutlineCardMembership } from "react-icons/md";
function TechCommunity() {
  const [posts, setPosts] = useState([]);

  const username = localStorage.getItem("username");
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  // const role = localStorage.getItem("role");
  const role = getItem("role");
  // const [loading, setLoading] = useState(false)
  // const [authorCommunity, setAuthorCommunity] = useState([]);
  // const [authors, setAuthors] = useState([]);
   const { authorCommunity,setAuthorCommunity } = useAuthorCommunity(email);
  //  const [communities, setCommunities] = useState([]);
  const {communities,loading} = useGetCommunityAnalytics();
  const [updateDomain, setUpdateDomain] = useState(null)
  




  const updateCommunity = async (email, techCommunity) => {
    try {
      setUpdateDomain(techCommunity)
      const response = await axiosInstance.put(
        "/blog/author/control/updateCommunity",
        {
          email: email,
          techcommunity: techCommunity,
        }
      );

      if (authorCommunity?.includes(techCommunity)) {
        setAuthorCommunity((prev)=>prev.filter((comm)=> comm!== techCommunity))
        // toast.info('Left', 'You have left the community!');
      }
      else{
        setAuthorCommunity((prev) => [...new Set([...prev, techCommunity])]);
        // toast.success('Joined', 'You have joined the community!');
      }
      if (response.status === 201) {
         if (authorCommunity?.includes(techCommunity)) {
        // setAuthorCommunity((prev)=>prev.filter((comm)=> comm!== techCommunity))
        toast.info('Left', 'You have left the community!');
      }
      else{
        // setAuthorCommunity((prev) => [...new Set([...prev, techCommunity])]);
        toast.success('Joined', 'You have joined the community!');
      }
  
      }
    } catch (err) {
      console.log("error", err);
    }
    finally{
      setUpdateDomain(null)
    }
  };


  // console.log("authorCommunity", authorCommunity);
  // console.log("communities", communities);  
  //  const domainAccents = {
  //   "GenAI":                    { from: "#10b981", to: "#059669", icon: "⚡" },
  //   "AI/ML":                    { from: "#6366f1", to: "#4f46e5", icon: "🧠" },
  //   "Web Development":          { from: "#f59e0b", to: "#d97706", icon: "🌐" },
  //   "Cyber Security":           { from: "#ef4444", to: "#dc2626", icon: "🔐" },
  //   "Data Science":             { from: "#06b6d4", to: "#0891b2", icon: "📊" },
  //   "Blockchain":               { from: "#8b5cf6", to: "#7c3aed", icon: "🔗" },
  //   "IoT":                      { from: "#ec4899", to: "#db2777", icon: "📡" },
  //   "Embedded System":          { from: "#14b8a6", to: "#0d9488", icon: "🔧" },
  //   "Satellite Space Technology":{ from: "#a78bfa", to: "#7c3aed", icon: "🛰️" },
  //   "Design Thinking":          { from: "#fb923c", to: "#ea580c", icon: "🎨" },
  // };

   const domainAccents = {
    "GenAI":                    { from: "#10b981", to: "#059669" },
    "AI/ML":                    {  from: "#10b981", to: "#059669" },
    "Web Development":          {  from: "#10b981", to: "#059669" },
    "Cyber Security":           {  from: "#10b981", to: "#059669" },
    "Data Science":             {  from: "#10b981", to: "#059669" },
    "Blockchain":               {  from: "#10b981", to: "#059669" },
    "IoT":                      {  from: "#10b981", to: "#059669" },
    "Embedded System":          {  from: "#10b981", to: "#059669" },
    "Satellite Space Technology":{  from: "#10b981", to: "#059669" },
    "Design Thinking":          { from: "#10b981", to: "#059669" },
  };
 
  const getAccent = (name) =>
    domainAccents[name] || { from: "#10b981", to: "#059669", icon: "💡" };

 
  return (


      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavBar />
 
      <div className="flex-grow px-4 pb-20">
 
        {/* ── Hero header ───────────────────────────────────────────── */}
        <div className="pt-7 pb-7 md:pb-12 text-center">
          {/* <p className="text-[10px] font-semibold tracking-[0.3em] text-emerald-400 uppercase mb-3">
            Explore · Learn · Contribute
          </p> */}
          <h1 className="text-2xl md:text-4xl font-bold   text-gray-200 leading-none mb-4">
            Tech Communities
          </h1>
          <p className="text-xs text-gray-400 max-w-sm md:max-w-md mx-auto leading-relaxed">
            {role=='student'?'Join a domain, connect with coordinators, and stay at the frontier of technology.':'Lead with knowledge - contribute content, collaborate with people, and elevate the ecosystem.'}
          </p>
        </div>
 
        {/* ── Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {loading ? (
            <CommunityCardSkeleton />
          ) : (
            communities.map((item, index) => {
              const accent = getAccent(item.categoryname);
              const isJoined = authorCommunity.includes(item.categoryname);
              const isCoord  = role === "coordinator" || role === "admin";
 
              return (
              <div
                  key={index}
                  className="group relative bg-gray-900 border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-all duration-300"
               
                >
                 
                  <Link
                    to={`/techDomainDetails/${encodeURIComponent(item.categoryname)}`}
                    className="flex-1 p-5 flex flex-col gap-4"
                  >
                    {/* Icon + title */}
                    <div className="flex items-start justify-between gap-3">
               
                      <div>
                        <h2 
                        className="text-base md:text-xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg truncate  tracking-tight"
                        >

                          {item.categoryname}
                        </h2>
                        <p className="text-[11px] text-gray-400 md:text-gray-300 mt-0.5">Tech Domain</p>
                      </div>
                      {isJoined && <span className="text-xs flex gap-2 items-center justify-center text-emerald-400">
                     <MdCardMembership className="text-sm md:text-base text-yellow-500" />
                      </span>}
                    </div>
 
                    {/* Divider */}
                    <div className="h-px bg-[#1e293b]" />
 
                    {/* Stats */}
                    <div className="grid grid-cols-3 py-3 gap-2">
                      {[
                        { label: "Coordinators",   value: item.authorcount },
                        { label: "Posts",     value: item.postscount },
                        { label: "Members",   value: item.followerscount },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-lg py-2.5 px-1"
                        >
                          <span
                            className="text-lg font-bold leading-none"
                            style={{ color: accent.from }}
                          >
                            {stat.value}
                          </span>
                          <span className="text-[10px] text-gray-500 mt-1">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </Link>
 
                  {/* Footer — action button */}
                  <div className="px-5 pb-5">
                    {isCoord ?
                     (
                      isJoined ? (
                        <div
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border"
                          style={{
                            background: `${accent.from}12`,
                            borderColor: `${accent.from}30`,
                            color: accent.from,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent.from }} />
                          Coordinator
                        </div>
                      ) :  null
                    ) :
                     (
                      
                      <button
                        onClick={() => updateCommunity(email, item.categoryname)}
                        type="button"
                        className="w-full py-2 rounded-xl text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed "
                        disabled={updateDomain===item.categoryname}
                        
                        style={
                          isJoined
                            ? {
                                background: `${accent.from}12`,
                                border: `1px solid ${accent.from}30`,
                                color: accent.from,
                              }
                            : {
                                background: "#1e293b",
                                border: "1px solid #334155",
                                color: "#94a3b8",
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!isJoined) {
                            e.currentTarget.style.background = `${accent.from}18`;
                            e.currentTarget.style.borderColor = `${accent.from}40`;
                            e.currentTarget.style.color = accent.from;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isJoined) {
                            e.currentTarget.style.background = "#1e293b";
                            e.currentTarget.style.borderColor = "#334155";
                            e.currentTarget.style.color = "#94a3b8";
                          }
                        }}
                      >
                       {/* {isJoined ? updateDomain===item.categoryname?'Exiting...':"✓ Joined" : updateDomain===item.categoryname?"Joining...":"Join Community" } */}
                       {
                         isJoined
                        ? (updateDomain === item.categoryname ? "Exiting..." : "✓ Joined")
                        : (updateDomain === item.categoryname ? "Joining..." : "Join Community")
                      }
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
 
      <Footer />
    </div>
  

  );
}

export default TechCommunity;
