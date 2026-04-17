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
import { getItem } from "../utils/encode";
function HomePage() {


  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("dashboardTab") || "posts",
  );

  useEffect(() => {
    localStorage.setItem("dashboardTab", activeTab);
  }, [activeTab]);

  return (
    // <div className="min-h-screen h-auto  relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
    <div className="min-h-screen h-auto  relative bg-gray-900 text-white flex flex-col">
      <NavBar />


      <div className=" flex items-center justify-between top-0 z-40 p-2 pl-3 md:p-0  md:pt-2 w-fit   md:ml-4 md:mx-auto">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setActiveTab("posts")}
            className={`relative pb-1 md:pb-2 text-sm font-medium transition-all duration-300
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
            className={`relative pb-1 md:pb-2 text-sm font-medium transition-all duration-300
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
