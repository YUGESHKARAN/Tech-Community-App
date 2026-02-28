import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";
import BlogContainer from "./BlogContainer";
import Footer from "../ui/Footer";
import { Link } from "react-router-dom";

import { MdAnnouncement, MdAppSettingsAlt } from "react-icons/md";
import axiosInstance from "../instances/Axiosinstances";
import { RiBookMarkedFill, RiUser3Line } from "react-icons/ri";
import { IoIosGitNetwork } from "react-icons/io";
import { BsPersonWorkspace } from "react-icons/bs";
function HomePage() {
  const username = localStorage.getItem("username");

  const [categoryCount, setCategoryCount] = useState(0);
  const [announcement, setAnnouncement] = useState([]);
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");



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

  
 

  return (
   
    // <div className="min-h-screen h-auto  relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
    <div className="min-h-screen h-auto  relative bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
      <NavBar />

      {/* Page Title */}
      <h1 className="text-center text-3xl md:text-4xl font-extrabold mt-8 mb-10 tracking-wide bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
      {/* <h1 className="text-center text-3xl md:text-4xl font-extrabold mt-8 mb-10 tracking-wide text-white/90"> */}
        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
      </h1>

      {/* Stats / Quick Actions Grid */}
      <div className="grid grid-cols-2  md:grid-cols-4 gap-6 w-11/12 md:w-9/12 mx-auto mb-10">
        {/* Control / My Posts / Announcement */}
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
                {/* {yourPost && yourPost.length} */}
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

        {/* Bookmarks */}
        <div className="bg-white/10 backdrop-blur-md border border-white/40 rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          <Link
            to={`/bookMarkPage/${email}`}
            className="flex flex-col items-center"
          >
            <RiBookMarkedFill className="text-4xl mb-2 text-white" />
            <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">Bookmarks</h3>
          </Link>
        </div>

        {/* Authors */}
        <div className="bg-white/10  border border-white/40  backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          <Link to="/authors" className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-2 text-white">
              {/* {authors.length} */}
               <IoIosGitNetwork  />
            </span>
            <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">My Network</h3>
          </Link>
        </div>

        {/* Tech Domains */}
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
      </div>

      {/* Blog Container */}
      <div className="flex-grow ">
        <BlogContainer/>
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
//     <div className="min-h-screen bg-[#0b1120] text-white flex flex-col">
//       <NavBar />
   
    
//       {/* Mobile Quick Actions */}
// <MobileQuickActions
//   role={role}
//   email={email}
//   announcement={announcement}
//   categoryCount={categoryCount}
// />      

//       {/* MAIN LAYOUT */}
//       <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-6 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

//           {/* LEFT SIDEBAR */}
//           <aside className="hidden lg:block lg:col-span-2 sticky top-24 h-fit">
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
//           </aside>

//           {/* CENTER FEED */}
//           <section className="lg:col-span-7 space-y-6">
//             {/* Feed stays primary */}
//             <BlogContainer />
//           </section>

//           {/* RIGHT PANEL */}
//           <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit space-y-6">
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
//           </aside>

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

// const SidebarItem = ({ to, icon, label }) => (
//   <Link
//     to={to}
//     className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition"
//   >
//     {icon && <span className="text-lg text-gray-400">{icon}</span>}
//     <span className="font-medium">{label}</span>
//   </Link>
// );

// export default HomePage;