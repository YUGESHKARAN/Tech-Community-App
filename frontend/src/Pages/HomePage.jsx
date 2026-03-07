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
function HomePage() {
  const username = localStorage.getItem("username");

  const [categoryCount, setCategoryCount] = useState(0);
  const [announcement, setAnnouncement] = useState([]);
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  const [openDashboard, setOpenDashboard] = useState(false);
  const dashboardRef = useRef(null);
  const dashboardButtonRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpenDashboard(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dashboardRef.current &&
        !dashboardRef.current.contains(e.target) &&
        dashboardButtonRef.current &&
        !dashboardButtonRef.current.contains(e.target)
      ) {
        setOpenDashboard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenDashboard((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpenDashboard(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getData = async () => {
    try {
      // const response = await axios.get(`https://node-blog-app-seven.vercel.app/blog/posts/`);
      const response = await axiosInstance.get(`/blog/posts/`);
      // console.log("data", response.data);
      setCategoryCount(response.data.count);
      // setPosts(response.data.posts);
    } catch (err) {
      console.log("Error", err);
    }
  };

  const getAuthorData = async () => {
    try {
      // const response = await axios.get(`https://node-blog-app-seven.vercel.app/blog/posts/`);
      const response = await axiosInstance.get(`/blog/author/${email}`);
      // console.log("data", response.data);
      setAnnouncement(response.data.announcement);
    } catch (err) {
      console.log("Error", err);
    }
  };

  useEffect(() => {
    getData();
    getAuthorData();
  }, []);

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

      {/* Page Title */}
      {/* <h1 className="text-center text-3xl md:text-4xl font-extrabold mt-8 mb-10 tracking-wide bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
      </h1>
      <div className="grid grid-cols-2  md:grid-cols-4 gap-6 w-11/12 md:w-9/12 mx-auto mb-10">
        <div className="bg-white/10  border border-white/40  backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          {role === "admin" ? (
            <Link to="/control" className="flex flex-col items-center">
              <MdAppSettingsAlt className="text-4xl text-green-400 mb-2" />
              <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
                Controls
              </h3>
            </Link>
          ) : role === "coordinator" ? (
            <Link to="/workspace" className="flex flex-col items-center">
              <span className="text-4xl font-bold mb-2 text-white">
               
                <BsPersonWorkspace className="text-4xl text-white mb-2" />
              </span>
              <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
                Workspace
              </h3>
            </Link>
          ) : (
            <Link to="/announcement" className="flex flex-col items-center">
              <div className="relative flex justify-center items-center mb-2">
                <MdAnnouncement className="text-4xl text-green-400" />
                {announcement.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {announcement.length}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
                Announcement
              </h3>
            </Link>
          )}
        </div>

      
        <div className="bg-white/10 backdrop-blur-md border border-white/40 rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          <Link
            to={`/bookMarkPage/${email}`}
            className="flex flex-col items-center"
          >
            <RiBookMarkedFill className="text-4xl mb-2 text-white" />
            <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">Bookmarks</h3>
          </Link>
        </div>


        <div className="bg-white/10  border border-white/40  backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          <Link to="/authors" className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-2 text-white">
           
               <IoIosGitNetwork  />
            </span>
            <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">My Network</h3>
          </Link>
        </div>

      
        <div className="bg-white/10  border border-white/40  backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          <Link to="/community" className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-2 text-white">
              {categoryCount}
            </span>
            <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
              Domains
            </h3>
          </Link>
        </div>
      </div> */}

      {/* Dashboard Trigger */}
      {/* <div className="w-[92%] lg:w-11/12 mx-auto mt-10 mb-4">
  <button
  ref={dashboardButtonRef}
    onClick={() => setOpenDashboard((p) => !p)}
    className="w-full flex items-center justify-between px-5 py-3
               rounded-xl bg-white/5 backdrop-blur-md
               border border-white/10 hover:border-cyan-400/40
               transition-all"
  >
    <div className="flex flex-col items-start">
      <span className="text-xs uppercase tracking-wider text-white/40">
        Dashboard
      </span>
      <span className="text-sm font-semibold text-white">
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    </div>

    
  </button>
</div> */}
      {/* <div
  ref={dashboardButtonRef}
  className="w-[92%] lg:w-11/12 mx-auto mt-6 mb-3"
>
  <button
    onClick={() => setOpenDashboard((p) => !p)}
    className="flex items-center gap-3 px-3 py-2
               rounded-lg bg-white/5 backdrop-blur-md
               border border-white/10 hover:border-cyan-400/40
               transition-all"
  >
    <span className="text-xs font-medium text-white/70">
      {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
    </span>

    <span
      className={`text-cyan-400 text-xs transition-transform ${
        openDashboard ? "rotate-180" : ""
      }`}
    >
      <MdArrowDropDown className="text-xl" />
    </span>
  </button>
</div> */}

{/* {openDashboard && (
  <div
   ref={dashboardRef}
    className="w-[92%] lg:w-11/12 mx-auto mb-6 
               bg-[#0f172a] border border-white/10 
               rounded-lg overflow-hidden divide-y divide-white/10"
  >
    {role === "admin" ? (
      <Link
        to="/control"
        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <MdAppSettingsAlt className="text-cyan-400" />
          <span className="text-sm text-white">Controls</span>
        </div>
        <span className="text-white/30">→</span>
      </Link>
    ) : role === "coordinator" ? (
      <Link
        to="/workspace"
        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <BsPersonWorkspace className="text-cyan-400" />
          <span className="text-sm text-white">Workspace</span>
        </div>
        <span className="text-white/30">→</span>
      </Link>
    ) : (
      <Link
        to="/announcement"
        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <MdAnnouncement className="text-cyan-400" />
          <span className="text-sm text-white">Announcements</span>
        </div>
        {announcement.length > 0 && (
          <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full">
            {announcement.length}
          </span>
        )}
      </Link>
    )}

   
    <Link
      to={`/bookMarkPage/${email}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
    >
      <div className="flex items-center gap-3">
        <RiBookMarkedFill className="text-cyan-400" />
        <span className="text-sm text-white">Bookmarks</span>
      </div>
      <span className="text-white/30">→</span>
    </Link>

  
    <Link
      to="/authors"
      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
    >
      <div className="flex items-center gap-3">
        <IoIosGitNetwork className="text-cyan-400" />
        <span className="text-sm text-white">My Network</span>
      </div>
      <span className="text-white/30">→</span>
    </Link>

    
    <Link
      to="/community"
      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
    >
      <span className="text-sm text-white">Domains</span>
      <span className="text-sm font-semibold text-cyan-400">
        {categoryCount}
      </span>
    </Link>
  </div>
)} */}
 {/* Dashboard Dropdown Panel */}
      {/* <AnimatePresence>
        {openDashboard && (
          <motion.div
            ref={dashboardRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-[92%] lg:w-11/12 mx-auto mb-6
                 bg-[#0b1220]/85 backdrop-blur-xl
                 border border-white/10 rounded-2xl
                 shadow-2xl shadow-black/40 p-5"
          >
           
            <div className="mb-5">
              {role === "admin" ? (
                <Link
                  to="/control"
                  className="block rounded-xl p-4 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex gap-3 items-center">
                    <MdAppSettingsAlt className="text-cyan-400 text-xl" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Controls
                      </p>
                      <p className="text-xs text-white/40">
                        Platform configuration
                      </p>
                    </div>
                  </div>
                </Link>
              ) : role === "coordinator" ? (
                <Link
                  to="/workspace"
                  className="block rounded-xl p-4 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex gap-3 items-center">
                    <BsPersonWorkspace className="text-cyan-400 text-xl" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Workspace
                      </p>
                      <p className="text-xs text-white/40">Manage your work</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/announcement"
                  className="block rounded-xl p-4 bg-white/5 hover:bg-white/10 transition relative"
                >
                  <div className="flex gap-3 items-center">
                    <MdAnnouncement className="text-cyan-400 text-xl" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Announcements
                      </p>
                      <p className="text-xs text-white/40">Latest updates</p>
                    </div>
                  </div>
                  {announcement.length > 0 && (
                    <span className="absolute top-3 right-3 text-xs bg-red-500 px-2 py-0.5 rounded-full">
                      {announcement.length}
                    </span>
                  )}
                </Link>
              )}
            </div>

           
            <div className="grid grid-cols-2 gap-4">
              <Link
                to={`/bookMarkPage/${email}`}
                className="rounded-xl p-4 bg-white/5 hover:bg-white/10 transition"
              >
                <RiBookMarkedFill className="text-cyan-400 mb-2" />
                <p className="text-sm font-medium text-white">Bookmarks</p>
                <p className="text-xs text-white/40">Saved content</p>
              </Link>

              <Link
                to="/authors"
                className="rounded-xl p-4 bg-white/5 hover:bg-white/10 transition"
              >
                <IoIosGitNetwork className="text-cyan-400 mb-2" />
                <p className="text-sm font-medium text-white">Network</p>
                <p className="text-xs text-white/40">People & authors</p>
              </Link>
            </div>

            
            <Link
              to="/community"
              className="mt-4 flex justify-between items-center rounded-xl p-4 bg-white/5 hover:bg-white/10 transition"
            >
              <span className="text-sm font-medium text-white">Domains</span>
              <span className="text-sm font-semibold text-cyan-400">
                {categoryCount}
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence> */}
{/* Dashboard Dropdown Panel */}

      <div className=" flex items-center justify-between top-0 z-40 p-2 pl-3 md:p-0  md:pt-2 w-fit   md:ml-4 md:mx-auto">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setActiveTab("posts")}
            className={`relative pb-1 md:pb-2 text-sm md:text-base font-semibold transition-all duration-300
        ${
          activeTab === "posts"
            ? "text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
          >
            Posts
            {activeTab === "posts" && (
              <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-teal-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("playlists")}
            className={`relative pb-1 md:pb-2 text-sm md:text-base font-semibold transition-all duration-300
        ${
          activeTab === "playlists"
            ? "text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
          >
            Playlists
            {activeTab === "playlists" && (
              <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-teal-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* <button
          ref={dashboardButtonRef}
          onClick={() => setOpenDashboard((p) => !p)}
          className="flex items-center gap-3 px-3 py-2
               rounded-lg bg-white/5 backdrop-blur-md
               border border-white/10 hover:border-cyan-400/40
               transition-all"
        >
          <span className="text-xs font-medium text-white/70">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </span>

          <span
            className={`text-cyan-400 text-xs transition-transform ${
              openDashboard ? "rotate-180" : ""
            }`}
          >
            <MdArrowDropDown className="text-xl" />
          </span>
        </button> */}
      </div>

      



     

      {/* Blog Container */}
      <div className="flex-grow ">
        {/* <BlogContainer /> */}
        <BlogContainer activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <Footer />
    </div>
  );
}

export default HomePage;

// import React, { useState, useEffect } from "react";
// import NavBar from "../ui/NavBar";
// import BlogContainer from "./BlogContainer";
// import Footer from "../ui/Footer";
// import { Link } from "react-router-dom";

// import { MdAnnouncement, MdAppSettingsAlt } from "react-icons/md";
// import { RiBookMarkedFill } from "react-icons/ri";
// import { IoIosGitNetwork } from "react-icons/io";
// import { BsPersonWorkspace } from "react-icons/bs";
// import axiosInstance from "../instances/Axiosinstances";

// function HomePage() {
//   const email = localStorage.getItem("email");
//   const role = localStorage.getItem("role");

//   const [categoryCount, setCategoryCount] = useState(0);
//   const [announcement, setAnnouncement] = useState([]);

//   const getData = async () => {
//     try {
//       const response = await axiosInstance.get(`/blog/posts/`);
//       setCategoryCount(response.data.count);
//     } catch (err) {
//       console.log("Error", err);
//     }
//   };

//   const getAuthorData = async () => {
//     try {
//       const response = await axiosInstance.get(`/blog/author/${email}`);
//       setAnnouncement(response.data.announcement);
//     } catch (err) {
//       console.log("Error", err);
//     }
//   };

//   useEffect(() => {
//     getData();
//     getAuthorData();
//   }, []);

//   return (
//     <div className="min-h-screen relative bg-[#0b1120] text-white flex flex-col">
//       <NavBar />

//       {/* Mobile Quick Actions */}
// <MobileQuickActions
//   role={role}
//   email={email}
//   announcement={announcement}
//   categoryCount={categoryCount}
// />

//       {/* MAIN LAYOUT */}
//       <main className="flex-1  md:max-w-[1440px] w-full mx-auto px-1 md:px-6 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

//           {/* LEFT SIDEBAR */}
//           {/* <aside className="hidden lg:block lg:col-span-2 sticky top-5 h-fit">
//             <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4 space-y-4">

//               {role === "admin" && (
//                 <SidebarItem to="/control" icon={<MdAppSettingsAlt />} label="Controls" />
//               )}

//               {role === "coordinator" && (
//                 <SidebarItem to="/workspace" icon={<BsPersonWorkspace />} label="Workspace" />
//               )}

//               {role === "student" && (
//                 <SidebarItem
//                   to="/announcement"
//                   icon={<MdAnnouncement />}
//                   label={`Announcements (${announcement.length})`}
//                 />
//               )}

//               <SidebarItem
//                 to={`/bookMarkPage/${email}`}
//                 icon={<RiBookMarkedFill />}
//                 label="Bookmarks"
//               />

//               <SidebarItem
//                 to="/authors"
//                 icon={<IoIosGitNetwork />}
//                 label="My Network"
//               />

//               <SidebarItem
//                 to="/community"
//                 label={`Domains (${categoryCount})`}
//               />
//             </div>
//           </aside> */}
//           <aside className="hidden lg:block lg:col-span-2 sticky top-5 h-fit">
//   <div className="bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden">

//     {/* PROFILE / ROLE HEADER */}
//     <div className="px-4 py-5 border-b border-gray-800">
//       <p className="text-xs uppercase tracking-wide text-gray-400">
//         Dashboard
//       </p>
//       <p className="text-sm font-semibold text-white mt-1">
//         {role?.charAt(0).toUpperCase() + role?.slice(1)}
//       </p>
//     </div>

//     {/* MAIN SECTION */}
//     <div className="px-3 py-4 space-y-1">
//       <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase">
//         Main
//       </p>

//       {role === "admin" && (
//         <SidebarItem
//           to="/control"
//           icon={<MdAppSettingsAlt />}
//           label="Controls"
//         />
//       )}

//       {role === "coordinator" && (
//         <SidebarItem
//           to="/workspace"
//           icon={<BsPersonWorkspace />}
//           label="Workspace"
//         />
//       )}

//       {role === "student" && (
//         <SidebarItem
//           to="/announcement"
//           icon={<MdAnnouncement />}
//           label="Announcements"
//           badge={announcement.length}
//         />
//       )}
//     </div>

//     {/* PERSONAL SECTION */}
//     <div className="px-3 py-4 border-t border-gray-800 space-y-1">
//       <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase">
//         Personal
//       </p>

//       <SidebarItem
//         to={`/bookMarkPage/${email}`}
//         icon={<RiBookMarkedFill />}
//         label="Bookmarks"
//       />

//       <SidebarItem
//         to="/authors"
//         icon={<IoIosGitNetwork />}
//         label="My Network"
//       />

//       <SidebarItem
//         to="/community"
//         label={`Domains`}
//         meta={categoryCount}
//       />
//     </div>

//   </div>
// </aside>

//           {/* CENTER FEED */}
//           <section className="lg:col-span-10 space-y-6">
//             {/* Feed stays primary */}
//             <BlogContainer />
//           </section>

//           {/* RIGHT PANEL */}
//           {/* <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit space-y-6">
//             <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4">
//               <h3 className="text-sm font-semibold text-gray-200 mb-3">
//                 Trending Domains
//               </h3>
//               <p className="text-xs text-gray-400">
//                 Explore popular tech communities and topics.
//               </p>
//             </div>

//             <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4">
//               <h3 className="text-sm font-semibold text-gray-200 mb-3">
//                 Discover Creators
//               </h3>
//               <p className="text-xs text-gray-400">
//                 Connect with authors and coordinators.
//               </p>
//             </div>
//           </aside> */}

//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }

// const MobileQuickActions = ({ role, email, announcement, categoryCount }) => (
//   <div className="lg:hidden w-full overflow-x-auto scrollbar-hide px-4 py-3 border-b border-gray-800 bg-[#0b1120]">
//     <div className="flex gap-6 text-sm text-gray-300">

//       {role === "admin" && (
//         <MobileAction to="/control" label="Controls" />
//       )}

//       {role === "coordinator" && (
//         <MobileAction to="/workspace" label="Workspace" />
//       )}

//       {role === "student" && (
//         <MobileAction
//           to="/announcement"
//           label={`Announcements (${announcement.length})`}
//         />
//       )}

//       <MobileAction to={`/bookMarkPage/${email}`} label="Bookmarks" />
//       <MobileAction to="/authors" label="Network" />
//       <MobileAction to="/community" label={`Domains (${categoryCount})`} />
//     </div>
//   </div>
// );

// const MobileAction = ({ to, label }) => (
//   <Link
//     to={to}
//     className="whitespace-nowrap font-medium hover:text-white transition"
//   >
//     {label}
//   </Link>
// );
// /* ---------- Sidebar Item Component ---------- */

// const SidebarItem = ({ to, icon, label, badge, meta }) => (
//   <Link
//     to={to}
//     className="
//       group flex items-center gap-3
//       px-3 py-2.5 rounded-lg
//       text-sm font-medium
//       text-gray-300
//       hover:bg-[#111827]
//       hover:text-white
//       transition
//     "
//   >
//     {icon && (
//       <span className="
//         flex items-center justify-center
//         w-8 h-8 rounded-md
//         bg-gray-800
//         text-gray-400
//         group-hover:text-white
//       ">
//         {icon}
//       </span>
//     )}

//     <span className="flex-1">{label}</span>

//     {typeof meta === "number" && (
//       <span className="text-xs text-gray-400">
//         {meta}
//       </span>
//     )}

//     {badge > 0 && (
//       <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">
//         {badge}
//       </span>
//     )}
//   </Link>
// );

// export default HomePage;
