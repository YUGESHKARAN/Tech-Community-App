import React, { useState, useRef, useEffect, useContext } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import {
  MdAnnouncement,
  MdAppSettingsAlt,
  MdDataObject,
  MdGroups,
  MdLogout,
  MdPostAdd,
} from "react-icons/md";
import { IoHome, IoLogOut, IoLogOutOutline, IoPeople } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import bloglogo from "../assets/bloglogo.png";
import {
  RiBookMarkedFill,
  RiMenuFold3Fill,
  RiMenuFoldFill,
  RiMenuFoldLine,
  RiUser3Line,
} from "react-icons/ri";
import { IoIosClose, IoIosGitNetwork, IoMdNotifications } from "react-icons/io";
import { GlobalStateContext } from "../GlobalStateContext";
import { TfiAnnouncement, TfiMenuAlt } from "react-icons/tfi";
import { VscMenu } from "react-icons/vsc";
import axiosInstance from "../instances/Axiosinstances";
import user from "../images/user.png";
import { CiMenuKebab } from "react-icons/ci";
import { BsFillMenuButtonWideFill, BsPersonWorkspace } from "react-icons/bs";
import getTimeAgo from "../components/DateCovertion";
function NavBar() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const { notification, setNotification } = useContext(GlobalStateContext);
  const username = localStorage.getItem("username");
  const userEmail = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const profile = localStorage.getItem("profile");
  const [showNotefication, setShowNotification] = useState(false);
  const [announcement, setAnnouncement] = useState([]);
  const [socket, setSocket] = useState(null);
  const email = localStorage.getItem("email");  

  const exit = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    // localStorage.removeItem("message");

    logout();
  };

  const [note, setNote] = useState([]);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch stored notifications from the server
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get(`/blog/author/${userEmail}`);
      setNote(response.data.notification);
      setAnnouncement(response.data.announcement);
      //   console.log("author email data", response.data.notification)
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userEmail]);

  //   useEffect(() => {
  //   fetchNotifications(); // initial load

  //   const interval = setInterval(() => {
  //     fetchNotifications(); // poll every 40 sec
  //   }, 40000);

  //   return () => clearInterval(interval);
  // }, [userEmail]);

  const deleteSigleNotification = async (userEmail, notificationId) => {
    try {
      const response = await axiosInstance.delete(
        `/blog/author/notification/delete?email=${userEmail}&notificationId=${notificationId}`,
      );

      fetchNotifications();
    } catch (err) {
      console.log("error", err);
    }
  };

  const deleteAllNotification = async (userEmail) => {
    const confirm = window.confirm(
      "Are you sure want to delete all the notifications",
    );
    if (!confirm) return;
    try {
      const response = await axiosInstance.delete(
        `/blog/author/notification/deleteall?email=${userEmail}`,
      );
      fetchNotifications();

      console.log("deleted", response.data);
    } catch (err) {
      console.log("error", err);
    }
  };

  const notificationRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotification(false); // Close notification on outside click
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // console.log("profile",profile)
  console.log("notification", note)

  return (
    <div
      className="
  
  flex items-center justify-between
  w-full h-16 px-3 md:px-6
  border-b border-slate-700/50
  shadow-sm
  z-100
 
 
"
      // className="flex border-b border-slate-700/50 relative justify-between items-center  h-16 bg-gray-900 mb-2 px-5"
    >
      <div className="md:text-xl text-sm w-1/2 md:w-1/5 font-bold text-white">
        <Link to="/home">
          <img
            src={bloglogo}
            className="w-10 md:w-30 rounded-full"
            alt="Blog Logo"
          />
        </Link>
      </div>

      {/* Desktop Menu */}
      <ul className="lg:flex justify-center text-xs hidden font-semibold text-gray-300 w-3/5  items-center gap-10">


       <NavIcon
              to="/home"
              icon={<IoHome />}
              label="Home"
              
            />

              {role === "coordinator" && (
        <NavIcon
              to="/workspace"
              icon={<BsPersonWorkspace />}
              label=" My Workspace"
              
            />
        )}

             {role === "admin" && 
        <NavIcon
              to="/control"
              icon={<MdAppSettingsAlt />}
              label=" Control Panel"
              
            />
        }
         <NavIcon
              to="/community"
              icon={<MdGroups />}
              label="Tech Communities"
              
            />

              <NavIcon
              to="/authors"
              icon={<IoIosGitNetwork />}
              label=" My Network"
              
            />

            

            

          <NavIcon
              to={`/bookMarkPage/${email}`}
              icon={<RiBookMarkedFill />}
              label=" My Bookmark"
              
            />

       

{/* 
        <li className="transition-all duration-200  hover:text-white">
          <Link to="/home" className="flex items-center gap-1">
            <IoHome className="text-xl" />
            Home
          </Link>
        </li> */}

        {/* {role === "admin" && 
        <li className="transition-all duration-200  hover:text-white">
          <Link to="/control" className="flex items-center gap-1">
            <MdAppSettingsAlt className="text-xl" />
            Control Panel
          </Link>
        </li>
        } */}

              

        {/* <li className="transition-all duration-200  hover:text-white">
          <Link to="/community" className="flex  items-center gap-1">
            <MdGroups className="text-2xl" /> Tech Communities
          </Link>
        </li> */}
{/* 
        <li className="transition-all duration-200 hover:text-white">
          <Link to="/authors" className="flex items-center gap-1">
            <IoIosGitNetwork className="text-2xl " />
            My Network
          </Link>
        </li> */}


        {/* {role === "coordinator" && (
          <li className="transition-all  duration-200 hover:text-white">
            <Link to="/workspace" className="flex items-center gap-1">
              <BsPersonWorkspace className="text-2xl" /> My Workspace
            </Link>
          </li>
        )} */}
{/* 
        <li className="transition-all  duration-200 hover:text-white">
            <Link to={`/bookMarkPage/${email}`} className="flex items-center gap-1">
              <RiBookMarkedFill className="text-2xl" /> My Bookmark
            </Link>
          </li> */}

        <li className="transition-all duration-200 hover:text-white">
          <Link
            to="/announcement"
            className="flex items-center transition-all duration-200  justify-start"
          >
            <MdAnnouncement className="text-xl  mr-1" />
            <sup
              className={`${
                announcement.length > 0
                  ? "text-[10px] bg-green-600 w-4 h-4 flex items-center justify-center rounded-full text-white"
                  : "text-[10px]  flex items-center justify-center rounded-full text-white"
              }`}
            >
              {announcement.length > 0 ? announcement.length : ""}
            </sup>
          </Link>
        </li>

        <li>
          <a href="" className="text-2xl font-bold text-red-500" onClick={exit}>
            <MdLogout />
          </a>
        </li>
      </ul>

      {/* Mobile Hamburger Button */}
      <p className="text-white flex justify-end w-full lg:hidden  font-semibold items-center gap-1 mr-3 text-sm">
        <Link to="/profile" className="flex text-sm  items-center gap-1">
          {profile !== "undefined" ? (
            <img
              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`}
              className="w-5 h-5 border border-green-500 rounded-full object-cover"
            />
          ) : (
            <RiUser3Line className="text-xl text-[#0be881]" />
          )}{" "}
          <p className="truncate"> Hi,{username}</p> 
        </Link>
      </p>

      <div className="transition-all flex items-center duration-200 hover:text-white">
        <p className="text-white lg:flex justify-end w-full hidden font-semibold items-center gap-1 mr-3 text-sm">
          <Link to="/profile" className="flex  items-center gap-1">
            {profile !== "undefined" ? (
              <img
                src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`}
                className="w-6 h-6 rounded-full border border-green-500  object-cover"
              />
            ) : (
              <RiUser3Line className="text-xl text-[#0be881]" />
            )}{" "}
            <p className="truncate"> Hi,{username}</p> 
          </Link>
        </p>
        <div className="flex items-center ">
          <IoMdNotifications
            onClick={() => {
              setShowNotification(!showNotefication);
            }}
            className="text-lg cursor-pointer text-white"
          />
          <sup
            className={`${
              note.length > 0
                ? "text-[10px] bg-red-500 w-4 h-4 flex items-center justify-center rounded-full text-white"
                : "text-[10px]  flex items-center justify-center rounded-full text-white"
            }`}
          >
            {note.length > 0 ? note.length : ""}
          </sup>
        </div>
      </div>

      <button onClick={toggleSidebar} className="lg:hidden ml-2 text-white">
        {/* ☰ */}
        <RiMenuFoldFill className="text-xl" />
      </button>

      {/* Sidebar */}
    
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md
        bg-[#0b1220]
        text-white shadow-2xl z-50
        transition-transate duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        rounded-b-3xl border border-white/10
        ${
          isSidebarOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-6 pointer-events-none"
        }
      `}
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            to="/home"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2"
          >
            <img src={bloglogo} alt="Logo" className="w-9 h-9 rounded-full" />
            {/* <span className="text-sm font-semibold tracking-wide">Home</span> */}
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white/50 hover:text-white transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* ================= PRIMARY ICON NAV ================= */}
        <div className="flex justify-between px-6 py-3">
          <NavIcon
            to="/home"
            icon={<IoHome />}
            label="Home"
            close={setIsSidebarOpen}
          />

          {/* {role === "admin" && (
            <NavIcon
              to="/control"
              icon={<MdAppSettingsAlt />}
              label="Controls"
              close={setIsSidebarOpen}
            />
          )} */}

          <NavIcon
            to="/community"
            icon={<MdGroups />}
            label="Community"
            close={setIsSidebarOpen}
          />
            <NavIcon
              to={`/bookMarkPage/${email}`}
              icon={<RiBookMarkedFill />}
              label="Bookmark"
              close={setIsSidebarOpen}
            />

             {role == 'student' && <NavIcon
            to="/profile"
            icon={<FaUserAlt />}
            label="Profile"
            close={setIsSidebarOpen}
          />}
 
        </div>

        {/* ================= SECONDARY TILES ================= */}
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
            
            {role === "admin" && (
            <NavTile
              to="/control"
              icon={<MdAppSettingsAlt />}
              title="Control Panel"
              subtitle="Manage Users"
              close={setIsSidebarOpen}
            />
          )}
          
          {role === "coordinator" && (
            <NavTile
              to="/workspace"
              icon={<BsPersonWorkspace />}
              title="Workspace"
              subtitle="Manage Content"
              close={setIsSidebarOpen}
            />
          )}
          <NavTile
            to="/authors"
            icon={<IoIosGitNetwork />}
            title="Network"
            subtitle="Connections"
            close={setIsSidebarOpen}
          />


         {role!='student' && <NavTile
            to="/profile"
            icon={<FaUserAlt />}
            title="Profile"
            subtitle="Account"
            close={setIsSidebarOpen}
          />}

          <NavTile
            to="/announcement"
            icon={<MdAnnouncement />}
            title="Updates"
            subtitle="Announcements"
            badge={announcement?.length}
            close={setIsSidebarOpen}
          />
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-5 pb-5">
          <button
            onClick={exit}
            className="w-full flex items-center justify-center gap-2
                     py-2.5 rounded-xl text-sm
                     bg-red-500/20 hover:bg-red-500/20
                     text-red-400 transition"
          >
            <IoLogOutOutline />
            Logout
          </button>
        </div>
      </div>

     <div
  ref={notificationRef}
  className={`${
    showNotefication
      ? "fixed top-16 right-2 z-50 md:w-[320px]  w-72  pb-4 bg-gray-900  border border-gray-700 shadow-2xl rounded-xl md:rounded-2xl transition-all duration-300"
      : "hidden"
  }`}
>
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900 z-40 rounded-t-2xl">
    <h2 className="text-sm font-semibold text-white tracking-wide flex items-center ">
      🔔 Notifications
    </h2>

    <button
      onClick={() => deleteAllNotification(userEmail)}
      className="text-xs text-gray-300 hover:text-white transition"
    >
      Clear all
    </button>
  </div>

  {/* Notification List */}
  <div className="flex flex-col divide-y max-h-[440px] overflow-y-auto emerald-scrollbar divide-gray-800">
    {[...note].reverse().map((data, index) => (
      <div
        key={index}
        className="group relative px-4 py-3 hover:bg-gray-800 transition duration-200"
      >
        <Link to={data.url} className="flex gap-3 items-start">
          
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={
                data.profile
                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
                  : user
              }
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover bg-white border border-gray-600"
            />

            {/* Activity indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-gray-900"></span>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {data.user}
            </p>

            <p className="text-xs text-gray-400 line-clamp-2">
              {data.message || "You got a notification"}
            </p>

            <span className="text-[10px] text-gray-500 mt-1">
              {getTimeAgo(data.timestamp)}
            </span>
          </div>
        </Link>

        {/* Delete Button */}
        <button
          onClick={() => deleteSigleNotification(userEmail, data._id)}
          className="absolute top-3 right-3 md:opacity-0 group-hover:opacity-50 transition text-gray-500 hover:text-red-300"
        >
          <IoIosClose size={18} />
        </button>
      </div>
    ))}
        
  
  
  </div>

  {/* Empty State */}
  {note.length === 0 && (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
      {/* <span className="text-2xl mb-2">🔔</span> */}
      No notifications yet
    </div>
  )}
</div>

      
    </div>
  );
}

function NavIcon({ to, icon, label, close }) {
  return (
    <Link
      to={to}
      onClick={() => close(false)}
      className="flex flex-col items-center gap-0
                 text-white/70 hover:text-white transition"
    >
      <span className="text-xl text-emerald-400">{icon}</span>
      <span className="text-[11px]">{label}</span>
    </Link>
  );
}

function NavIconDesktop({ to, icon, label, }) {
  return (
    <Link
      to={to}
      // onClick={() => close(false)}
      className="flex flex-col items-center gap-1
                 text-white/70 hover:text-white transition"
    >
      <span className="text-xl text-emerald-400">{icon}</span>
      <span className="text-[11px]">{label}</span>
    </Link>
  );
}

function NavTile({ to, icon, title, subtitle, badge, close }) {
  return (
    <Link
      to={to}
      onClick={() => close(false)}
      className="relative rounded-2xl p-4
                 bg-white/5 hover:bg-white/10 transition"
    >
      <span className="text-emerald-400 text-lg">{icon}</span>

      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="text-xs text-white/40">{subtitle}</p>

      {badge > 0 && (
        <span
          className="absolute top-3 right-3
                         text-[10px] px-2 py-0.5 rounded-full
                         bg-emerald-500/20 text-emerald-300"
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export default NavBar;
