import React, { useState, useEffect, useRef } from "react";
import NavBar from "../ui/NavBar";
import BlogContainer from "./BlogContainer";
import Footer from "../ui/Footer";
import { Link, useLocation } from "react-router-dom";

import {
  MdAnnouncement,
  MdAppSettingsAlt,
  MdArrowDropDown,
} from "react-icons/md";
import axiosInstance from "../instances/Axiosinstances";
import { RiBookMarkedFill, RiUser3Line } from "react-icons/ri";
import { IoIosGitNetwork } from "react-icons/io";
import { BsPersonWorkspace } from "react-icons/bs";

import { motion, AnimatePresence } from "framer-motion";
import { getItem, storeItem } from "../utils/encode";
function HomePage() {


  const [activeTab, setActiveTab] = useState(
    // localStorage.getItem("dashboardTab") || "posts",
    getItem("dashboardTab") || "posts",
  );

  useEffect(() => {
    // localStorage.setItem("dashboardTab", activeTab);
    storeItem("dashboardTab", activeTab);
  }, [activeTab]);

  return (
    // <div className="min-h-screen h-auto  relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
    <div className="min-h-screen  h-auto  relative bg-gray-900 text-white flex flex-col">
      <NavBar />
          


      <div className=" flex  w-full items-center max-w-[1800px] justify-between p-2 pl-3 pb-0 md:p-0 md:pl-3  md:pt-2 md:ml-4 xl:mx-auto">
        {/* <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={() => setActiveTab("posts")}
            className={`relative pb-1 md:pb-2 text-[10px] md:text-xs font-medium transition-all duration-300
        ${
          activeTab === "posts"
            ? "text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
          >
            Posts
            {activeTab === "posts" && (
              <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-teal-500 rounded-full"/>
            )}
          </button>

          <button
            onClick={() => setActiveTab("playlists")}
            className={`relative pb-1 md:pb-2 text-[10px] md:text-xs font-medium transition-all duration-300
        ${
          activeTab === "playlists"
            ? "text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
          >
            Playlists
            {activeTab === "playlists" && (
              <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-teal-500 rounded-full"/>
            )}
          </button>
        </div> */}
        <div className="flex items-center gap-3 md:gap-5">
  <button
    onClick={() => setActiveTab("posts")}
    className={`relative pb-1 md:pb-2 text-[10px] md:text-xs font-medium transition-colors duration-300
      ${
        activeTab === "posts"
          ? "text-white"
          : "text-gray-400 hover:text-gray-200"
      }`}
  >
    <motion.span
      animate={{
        scale: activeTab === "posts" ? 1.05 : 1,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      Posts
    </motion.span>

    {activeTab === "posts" && (
      <motion.span
        layoutId="footer-tab-indicator"
        className="absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full bg-teal-500"
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
        }}
      />
    )}
  </button>

  <button
    onClick={() => setActiveTab("playlists")}
    className={`relative pb-1 md:pb-2 text-[10px] md:text-xs font-medium transition-colors duration-300
      ${
        activeTab === "playlists"
          ? "text-white"
          : "text-gray-400 hover:text-gray-200"
      }`}
  >
    <motion.span
      animate={{
        scale: activeTab === "playlists" ? 1.05 : 1,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      Playlists
    </motion.span>

    {activeTab === "playlists" && (
      <motion.span
        layoutId="footer-tab-indicator"
        className="absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full bg-teal-500"
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
        }}
      />
    )}
  </button>
</div>

      </div>

 

      <div className="flex-grow ">
        <BlogContainer activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <Footer />
    </div>
  );
}

export default HomePage;
