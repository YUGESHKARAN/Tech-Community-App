import React, { useState, useRef, useEffect, useContext } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import {
  MdAnnouncement,
  MdManageAccounts,
  MdDataObject,
  MdGroups,
  MdLogout,
  MdPostAdd,
} from "react-icons/md";
import { IoHome, IoLogOut, IoLogOutOutline, IoPeople } from "react-icons/io5";

import { FaPlus, FaUserAlt } from "react-icons/fa";
// import bloglogo from "../assets/bloglogo.png";
// import bloglogo from "../assets/byte_base_1.png";
// import bloglogo from "../assets/byte_base_logo.png";
import bloglogo from "../../../assets/bytes_base_logo_icon.png";
// import bloglogo from "../../../assets/embed_logo_1.png";
import {
  RiBookMarkedFill,
  RiMenuFold3Fill,
  RiMenuFoldFill,
  RiMenuFoldLine,
  RiMenuUnfoldFill,
  RiNotification2Line,
  RiNotification3Line,
  RiUser3Line,
} from "react-icons/ri";

import {
  FiFileText,
  FiFolderPlus,
  FiUpload,
  FiGrid,
  FiLayers,
  FiPlusCircle,
  FiEdit,
  FiFolder,
} from "react-icons/fi";

import { GoHome, GoPlus } from "react-icons/go";
import {
  IoIosClose,
  IoIosGitNetwork,
  IoIosSearch,
  IoMdNotifications,
} from "react-icons/io";
import { GlobalStateContext } from "../GlobalStateContext";
import { TfiAnnouncement, TfiMenuAlt } from "react-icons/tfi";
import { VscGitStashApply, VscMenu } from "react-icons/vsc";
import axiosInstance from "../instances/Axiosinstances";
import user from "../images/user.png";
import { CiMenuKebab } from "react-icons/ci";
import { BsFillMenuButtonWideFill, BsPersonWorkspace } from "react-icons/bs";
import getTimeAgo from "../components/DateCovertion";
import toast from "../components/toaster/Toast";
import { MdDashboard } from "react-icons/md";
import { getItem, removeItem, storeItem } from "../utils/encode";
import SearchModal from "../components/SearchModal";

function NavBar() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const { notification, setNotification } = useContext(GlobalStateContext);
  // const username = localStorage.getItem("username");
  const username = getItem("username");
  // const userEmail = localStorage.getItem("email");
  const userEmail = getItem("email");
  // const role = localStorage.getItem("role");
  const profile = localStorage.getItem("profile");
  const [showNotification, setShowNotification] = useState(false);
  const [announcement, setAnnouncement] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentScreen, setCurrentScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false)
  const { searchTerm, setSearchTerm, inputValue, setInputValue } =
    useContext(GlobalStateContext);

  // const [inputValue, setInputValue] = useState(searchTerm || "");

  // const email = localStorage.getItem("email");
  // const email = getItem("email");
  const role = getItem("role");

  const exit = () => {
    // localStorage.removeItem("role");
    setSearchTerm("");
    setInputValue("");
    removeItem("role");
    localStorage.removeItem("username");
    // localStorage.removeItem("email");
    removeItem("email");
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
    if (note.length === 0) {
      setLoading(true);
    }

    try {
      const response = await axiosInstance.get(
        `/blog/author/queueMessage/${userEmail}`,
      );
      setNote(response.data.notifications);
      setAnnouncement(response.data.announcements);
      storeItem("notiCount", response.data.notifications.length);
      storeItem("announceCount", response.data.announcements.length);
      //   console.log("author email data", response.data.notification)
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userEmail]);

  const notiCount = getItem("notiCount");
  const announceCount = getItem("announceCount");

  const deleteSigleNotification = async (userEmail, notificationId) => {
    setNote((note) => note.filter((n) => n._id !== notificationId));
    storeItem("notiCount", notiCount - 1);
    try {
      const response = await axiosInstance.delete(
        `/blog/author/notification/delete?email=${userEmail}&notificationId=${notificationId}`,
      );

      setNote((note) => note.filter((n) => n._id !== notificationId));
      // if (response.status === 200){
      //   setNote((note)=> note.filter((n)=> n._id !== notificationId))
      // }
    } catch (err) {
      console.log("error", err);
    }
  };

  const deleteAllNotification = async (userEmail) => {
    if (notiCount === 0) return;

    const confirm = window.confirm(
      "Are you sure want to delete all the notifications",
    );
    if (!confirm) return;
    storeItem("notiCount", 0);
    try {
      const response = await axiosInstance.delete(
        `/blog/author/notification/deleteall?email=${userEmail}`,
      );
      // fetchNotifications();

      if (response.status === 200) {
        toast.info("Cleared", "All notifications cleared");
        setNote([]);
      }

      // console.log("deleted", response.data);
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

  const addContentRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addContentRef.current &&
        !addContentRef.current.contains(event.target)
      ) {
        setShowAddContent(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showProfileSettings = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfileSettings.current &&
        !showProfileSettings.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div
      className="
      flex items-center width-max mx-auto justify-between
      w-full h-16 px-3 pl-4 md:px-6
      border-b border-slate-700/50
      shadow-sm
      z-100

      "
    >
      {/* ================= LEFT (LOGO) ================= */}
      <div className="flex items-center gap-3 w-1/2 md:w-1/5">
        <button
          onClick={toggleSidebar}
          className="xl:hidden border border-neutral-700 rounded-md p-1 text-white"
        >
          <RiMenuUnfoldFill className="text-xl" />
        </button>
        {role !== "admin" ? (
          <Link to="/home">
            <img
              src={bloglogo}
              className="w-7 h-7 md:w-9 md:h-9 rounded-full"
            />
          </Link>
        ) : (
          <Link to="/dashboard">
            <img
              src={bloglogo}
              className="w-7 h-7 md:w-9 md:h-9 rounded-full"
            />
          </Link>
        )}
      </div>

      {/* ================= CENTER NAV ================= */}
      <ul className="hidden xl:flex items-center justify-center gap-3 text-xs text-gray-400 font-medium w-3/5">
        {role === "admin" && (
          <NavIconDesktop
            to="/dashboard"
            icon={<MdDashboard />}
            label="Analytics"
          />
        )}

        {role !== "admin" && (
          <NavIconDesktop to="/home" icon={<IoHome />} label="Home" />
        )}

        {role === "admin" && (
          <NavIconDesktop
            to="/control"
            icon={<MdManageAccounts />}
            label="Control"
          />
        )}

        {role === "admin" && (
          <NavIconDesktop to="/home" icon={<IoHome />} label="Browse" />
        )}

        {role !== "student" && (
          <NavIconDesktop
            to="/workspace"
            icon={<BsPersonWorkspace />}
            label="Workspace"
          />
        )}

        <NavIconDesktop
          to="/community"
          icon={<MdGroups />}
          label="Communities"
        />
        <NavIconDesktop
          to="/authors"
          icon={<IoIosGitNetwork />}
          label="Network"
        />
        <NavIconDesktop
          to="/bookMarkPage"
          icon={<RiBookMarkedFill />}
          label="Bookmark"
        />
      </ul>

      {/* ================= RIGHT SECTION (DESKTOP + MOBILE SYNCED) ================= */}
      <div className="flex items-center gap-2 md:gap-4">
        <div
          onClick={() => setShowSearchModal(true)}
          className={`
            group
            flex items-center gap-2
            justify-center
            px-3   py-1.5
            w-[120px] md:w-[160px]
            rounded-lg
            md:rounded-lg
            bg-[#0f172a]/80
            border  
            hover:border-emerald-500/30
            hover:bg-[#111827]

            transition-all duration-200
            cursor-pointer
            backdrop-blur-sm

            ${searchTerm ? "border-emerald-700" : "border-neutral-600"}
            
            `}
        >
          {/* Search Icon */}
          <IoIosSearch
            className={`
            text-[17px]
            
            group-hover:text-emerald-400
            transition-colors duration-200
            shrink-0
            ${searchTerm ? "text-emerald-400" : "text-gray-500"}

            `}
          />

          {/* Search Text */}
          <div
            className="
              flex items-center justify-between
              flex-1 md:gap-2
              gap-1
              overflow-hidden
            "
          >
            <span
              className="
                text-xs
                md:text-[13px]
                md:text-gray-400
                text-gray-400
                truncate
                max-w-[100px]
              "
            >
              {searchTerm || "Search posts..."}
            </span>

            {/* Clear */}
            {searchTerm && !showSearchModal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                  setShowSearchModal(false);
                  setInputValue("");
                }}
                className={`
                  flex items-center justify-center
                  w-4 h-4
                  rounded-full
                  border 
                  p-1
                  text-[10px]
                  ${searchTerm ? "text-emerald-400 border-emerald-600 hover:text-emerald-300 hover:border-emerald-600" : "text-gray-500 hover:text-gray-400 hover:border-gray-400 border-neutral-600"}
                  transition-all duration-300
                  shrink-0
                  `}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {/* 🔔 Notifications */}
        <div className="relative hidden lg:block">
          <IoMdNotifications
            // <RiNotification3Line
            onClick={() => setShowNotification(!showNotification)}
            className="text-xl  text-white/70 hover:text-white transition-all duration-300 cursor-pointer transition"
          />
          {notiCount > 0 && (
            <span className="absolute -top-1.5 -right-2 text-[10px] bg-red-500 w-4 h-4 flex items-center justify-center rounded-full text-white">
              {notiCount}
            </span>
          )}
        </div>
        <Link
          to="/announcement"
          className="relative  hidden lg:block rounded-full hover:bg-white/10 transition"
        >
          <MdAnnouncement className="text-xl text-white/70 hover:text-white transition-all duration-300 cursor-pointer transition" />
          {announceCount > 0 && (
            <span className="absolute -top-2 -right-2 text-[10px] bg-emerald-500 text-white w-4 h-4 flex items-center justify-center rounded-full">
              {announceCount}
            </span>
          )}
        </Link>

        {/* 👤 USER PILL (DESKTOP) */}
        <Link
          to="/profile"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5
                 bg-white/5 hover:bg-white/10
                 border border-white/10
                 rounded-full transition-all duration-300 gap-2"
        >
          {profile !== "undefined" ? (
            <img
              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`}
              className="w-5 h-5 rounded-full object-cover border border-emerald-400"
            />
          ) : (
            <RiUser3Line className="text-lg text-emerald-400" />
          )}

          <span className="text-xs text-gray-200  truncate max-w-[120px]">
            Hi, {username}
          </span>
        </Link>

        {/* 👤 MOBILE USER */}

        {role !== "student" && (
          <div className="relative lg:hidden ">
            {/* <IoMdNotifications */}
            <GoPlus
              onClick={() => setShowAddContent(!showAddContent)}
              className="text-[27px] text-gray-300 rounded-md p-[5px] border border-neutral-600 hover:text-white transition-all duration-300 cursor-pointer transition"
            />
          </div>
        )}

        <div className="relative lg:hidden">
          {/* <IoMdNotifications */}
          <RiNotification3Line
            onClick={() => setShowNotification(!showNotification)}
            className="text-[27px] text-gray-300 rounded-md p-[5px] border border-neutral-600 hover:text-white transition-all duration-300 cursor-pointer transition"
          />
          {notiCount > 0 && (
            <span className="absolute -top-1 -right-1.5 text-[10px] bg-red-500 w-4 h-4 flex items-center justify-center rounded-full text-white">
              {notiCount}
            </span>
          )}
        </div>
        <div
          className="
            flex lg:hidden items-center
            w-[28px] h-[28px]
            items-center justify-center
            border border-neutral-600
            rounded-full transition
          "
        >
          <div 
          onClick={()=>{ setShowProfile((prev)=> !prev)}}
          className="  items-center gap-1">
            {profile !== "undefined" ? (
              <img
                src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`}
                className="w-[27px] h-[27px] rounded-full border border-emerald-400 object-cover"
              />
            ) : (
              <RiUser3Line className="text-2xl px-1 py-1 px-auto text-center text-emerald-400" />
            )}
          </div>
        </div>

        {/* 🚪 LOGOUT (DESKTOP ONLY) */}
        <button
          onClick={exit}
          className="hidden xl:flex items-center justify-center
                 w-9 h-9 rounded-full
                 bg-red-500/10 hover:bg-red-500/20
                 text-red-400 transition"
        >
          <MdLogout />
        </button>
      </div>
      {/* Sidebar */}

    <div
  ref={sidebarRef}
  className={`fixed top-0 left-0 w-[300px]
    bg-[#0b1220]
    text-white shadow-2xl z-50 h-full
    flex flex-col
    transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
    rounded-br-2xl rounded-tr-2xl border border-white/10
    ${
      isSidebarOpen
        ? "opacity-100 translate-x-0"
        : "opacity-0 -translate-x-full pointer-events-none"
    }`}
>
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-5 py-4 pb-3">
          {role !== "admin" ? (
            <Link
              to="/home"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2"
            >
              <img src={bloglogo} alt="Logo" className="w-7 h-7 rounded-full" />
            </Link>
          ) : (
            <Link
              to="/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2"
            >
              <img src={bloglogo} alt="Logo" className="w-7 h-7 rounded-full" />
            </Link>
          )}

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white/50 hover:text-white transition text-sm md:text-lg"
          >
            ✕
          </button>
        </div>

        {/* ================= PRIMARY ICON NAV ================= */}
        <div className="flex flex-col space-y-4 px-6 pt-10 pb-3">
          {role != "admin" && (
            <NavIcon
              to="/home"
              icon={<GoHome />}
              label="Home"
              close={setIsSidebarOpen}
            />
          )}

          {role == "admin" && (
            <NavIcon
              to="/home"
              icon={<GoHome />}
              label="Browse"
              close={setIsSidebarOpen}
            />
          )}

          <NavIcon
            to="/community"
            icon={<MdGroups />}
            label="Community"
            close={setIsSidebarOpen}
          />

          <NavIcon
            to="/authors"
            icon={<IoIosGitNetwork />}
            label="My Network"
            close={setIsSidebarOpen}
          />

          <NavIcon
            // to={`/bookMarkPage/${email}`}
            to={`/bookMarkPage`}
            icon={<RiBookMarkedFill />}
            label="Bookmark"
            close={setIsSidebarOpen}
          />

          {/* {role == "student" && (
            <NavIcon
              to="/profile"
              icon={<FaUserAlt />}
              label="Profile"
              close={setIsSidebarOpen}
            />
          )} */}

          <NavTile
            to="/announcement"
            icon={<MdAnnouncement />}
            title="Updates"
            subtitle="Announcements"
            badge={announceCount}
            close={setIsSidebarOpen}
          />
        </div>

        {/* ================= SECONDARY TILES ================= */}
        <div className="flex flex-col  flex-1 border-t border-neutral-700 px-6 mt-5 pt-5 pb-5 min-h-0">
          {role !== "student" && (
            <p className="text-gray-400 font-medium text-xs mb-5">Controls</p>
          )}

          <div className="flex flex-col space-y-4  pb-3 overflow-y-auto pr-1">
   
            {/* ------------------------------------------- */}

            {role == "admin" && (
              <NavIcon
                // to={`/bookMarkPage/${email}`}
                to={`/dashboard`}
                icon={<MdDashboard />}
                label="Analytics"
                close={setIsSidebarOpen}
              />
            )}

            {role === "admin" && (
              <NavIcon
                // to={`/bookMarkPage/${email}`}
                to={`/control`}
                icon={<MdManageAccounts />}
                label="Control Panel"
                close={setIsSidebarOpen}
              />
            )}

            {/* {role !== "student" && (
            <NavIcon
              to="/workspace"
              icon={<BsPersonWorkspace />}
              label="Workspace"
              close={setIsSidebarOpen}
            />
          )} */}

            {role !== "student" && (
              <>
                <NavIcon
                  to="/yourposts"
                  icon={<FiEdit />}
                  label="Manage Posts"
                  close={setIsSidebarOpen}
                />

                <NavIcon
                  to="/yourTutorPlaylists"
                  icon={<FiFolder />}
                  label="Manage Playlists"
                  close={setIsSidebarOpen}
                />
              </>
            )}
          </div>

          {/* <div className="mt-auto  pt-6 flex justify-center">
            <button
              onClick={exit}
              className="flex items-center gap-2 text-white/70 hover:text-white transition"
            >
              <IoLogOutOutline className="text-xl text-red-400" />
              <span className="text-[11px]">Sign Out</span>
            </button>
          </div> */}
        </div>
      </div>

      <div
        ref={notificationRef}
        className={`${
          showNotification && !showAddContent
            ? "fixed  top-16 right-2 z-50 md:w-[320px] w-72 pb-4 bg-gray-900 border border-gray-700 shadow-2xl rounded-xl md:rounded-lg transition-all duration-300"
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
            className="text-xs text-gray-300 hover:text-white transition-all duration-300"
          >
            Clear all
          </button>
        </div>

        {/* Notification List */}
        <div className="flex flex-col divide-y max-h-[440px] overflow-y-auto emerald-scrollbar divide-gray-800">
          {[...note].reverse().map((data, index) => (
            <div
              key={index}
              className="group relative px-4 py-3 md:hover:bg-gray-800   transition duration-200"
            >
              <Link
                onClick={() => {
                  setShowNotification(false);
                }}
                to={data.url}
                className="flex gap-3  items-start"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {data.profile ? (
                    <img
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover bg-gray-400 border border-gray-600"
                    />
                  ) : (
                    <div className="md:w-9 md:h-9 w-8 h-8 rounded-full object-cover border border-gray-300">
                      <HiOutlineUserCircle className="text-[#786fa6] bg-gray-200 rounded-full w-full h-full " />
                    </div>
                  )}

                  {/* Activity indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-gray-900"></span>
                </div>

                {/* Content */}
                <div className="flex relative  flex-col flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {data.user}
                  </p>

                  <p className="text-xs  md:mt-1 line-clamp-3 text-gray-400 ">
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
                className="absolute top-3 right-3 md:opacity-0 group-hover:opacity-50 transition text-gray-400 md:hover:text-red-300"
              >
                <IoIosClose size={18} />
              </button>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
            {/* <span className="text-2xl mb-2">🔔</span> */}
            Loading...
          </div>
        )}

        {/* Empty State */}
        {note.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
            {/* <span className="text-2xl mb-2">🔔</span> */}
            No notifications yet
          </div>
        )}
      </div>

      <div
        ref={addContentRef}
        className={`${
          showAddContent && !showNotification
            ? "fixed top-16 right-12 z-50 px-2 py-1 w-48 overflow-hidden rounded-2xl border border-[#30363d] bg-gray-900 shadow-2xl"
            : "hidden"
        }`}
      >
        {/* Top Section */}
        <div className="py-1.5">
          <Link
            onClick={() => {
              setShowAddContent(false);
            }}
            to="/addPost"
          >
            <button
              className="
                w-full flex items-center gap-2
                pl-2 py-1.5
                text-sm text-gray-100
                hover:bg-gray-800/70
                transition-all duration-200
                rounded-lg
              "
            >
              <FiPlusCircle className="text-[17px] text-gray-400" />
              <span className="text-[13px]">Add New Post</span>
            </button>
          </Link>

          <Link
            onClick={() => {
              setShowAddContent(false);
            }}
            to="/addTutorPlaylist"
          >
            <button
              className="
                w-full flex items-center gap-2
                pl-2 py-1.5
                text-sm text-gray-100
                hover:bg-gray-800/70
                transition-all duration-200
                rounded-lg
              "
            >
              <FiLayers className="text-[17px] text-gray-400" />
              <span className="text-[13px]">Create New Playlist</span>
            </button>
          </Link>

          <Link
            onClick={() => {
              setShowAddContent(false);
            }}
            to="/announcement"
          >
            <button
              className="
                w-full flex items-center gap-2
                pl-2 py-1.5
                text-sm text-gray-100
                hover:bg-gray-800/70
                transition-all duration-200
                rounded-lg
              "
            >
              <VscGitStashApply className="text-[17px] text-gray-400" />
              <span className="text-[13px]">Create New Campaign</span>
            </button>
          </Link>
        </div>
      </div>


       <div
        ref={showProfileSettings}
        className={`${
          !showAddContent && !showNotification && showProfile
            ? "fixed top-16 right-2 z-50 px-2  w-32 overflow-hidden rounded-lg border border-[#30363d] bg-gray-900 shadow-2xl"
            : "hidden"
        }`}
      >
        {/* Top Section */}
        <div className="py-1.5">
          <Link
            onClick={() => {
              setShowAddContent(false);
              setShowAddContent(false);
            }}
            to="/profile"
          >
            <button
              className="
                w-full flex items-center gap-1.5
                pl-2 py-1.5 pb-1
                text-sm text-gray-100
                hover:bg-gray-800/70
                transition-all duration-200
                rounded-lg 
              "
            >
              <MdManageAccounts className="text-[17px] text-emerald-500" />
              <span className="text-[11px]">Profile Settings</span>
            </button>
          </Link>

            <div className=" w-full flex items-center gap-1.5
                pl-2 py-1.5 pt-1
                text-sm text-gray-100
                hover:bg-gray-800/70
                transition-all duration-200
                rounded-lg">
            <button
              onClick={exit}
              className="flex items-center gap-2 text-white/70 hover:text-white transition"
            >
              <IoLogOutOutline className="text-[17px] text-red-400" />
              <span className="text-[11px]">Sign Out</span>
            </button>
          </div>

          
        </div>
      </div>

      <SearchModal
        open={showSearchModal}
        setOpen={setShowSearchModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
      />
    </div>
  );
}

function NavIcon({ to, icon, label, close }) {
  return (
    <Link
      to={to}
      onClick={() => close && close(false)}
      className="flex items-center gap-1.5
                   transition-all duration-300"
    >
      <span className=" text-sm text-gray-300/80">{icon}</span>
      <span className="text-sm text-gray-200">{label}</span>
    </Link>
  );
}

// import { useLocation } from "react-router-dom";
import { HiOutlineUserCircle } from "react-icons/hi";

import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { House } from "lucide-react";

function NavIconDesktop({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        relative
        flex items-center gap-1
        px-3 py-1.5
        rounded-xl
        text-xs
        transition-all
        duration-300
        group
        ${isActive ? "text-emerald-400" : "text-white/95 hover:text-white"}
      `}
    >
      {/* Icon */}
      <motion.span
        animate={{
          scale: isActive ? 1.08 : 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className={`
          text-base transition-all duration-300
          ${
            isActive
              ? "text-emerald-400"
              : "text-white/70 group-hover:text-white"
          }
        `}
      >
        {icon}
      </motion.span>

      {/* Label */}
      <motion.span
        animate={{
          scale: isActive ? 1.03 : 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className="tracking-wide"
      >
        {label}
      </motion.span>

      {/* Shared Sliding Indicator */}
      {isActive && (
        <motion.span
          layoutId="desktop-nav-indicator"
          className="
            absolute
            -bottom-[6px]
            left-0
            right-0
            mx-auto
            w-5
            h-[2px]
            rounded-full
            bg-emerald-400
          "
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
        />
      )}
    </Link>
  );
}
function NavTile({ to, icon, title, subtitle, badge, close }) {
  return (
    <Link
      to={to}
      onClick={() => close && close(false)}
      className="relative rounded-xl 
      flex items-start justify-start gap-2
                transition "
    >
      <span className="text-sm text-gray-300/80 text-sm mt-1">{icon}</span>
      <div className="flex mt-0 flex-col">
        <p className=" text-sm text-gray-200  ">{title}</p>
        <p className="text-xs text-white/40">{subtitle}</p>
      </div>
      {badge > 0 && (
        <span
          className="absolute top-2 right-3
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

//  <div
//         ref={sidebarRef}
//         className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md
//       bg-[#0b1220]
//       text-white shadow-2xl z-50
//       transition-transate duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
//       rounded-b-3xl border border-white/10

//       ${
//         isSidebarOpen
//           ? "opacity-100 translate-y-0"
//           : "opacity-0 -translate-y-6 pointer-events-none"
//       }`}
//       >
//         {/* ================= HEADER ================= */}
//         <div className="flex items-center justify-between px-5 py-4 pb-3">
//           {role !== "admin" ? (
//             <Link
//               to="/home"
//               onClick={() => setIsSidebarOpen(false)}
//               className="flex items-center gap-2"
//             >
//               <img src={bloglogo} alt="Logo" className="w-7 h-7 rounded-full" />
//               {/* <span className="text-sm font-semibold tracking-wide">Home</span> */}
//             </Link>
//           ) : (
//             <Link
//               to="/dashboard"
//               onClick={() => setIsSidebarOpen(false)}
//               className="flex items-center gap-2"
//             >
//               <img src={bloglogo} alt="Logo" className="w-7 h-7 rounded-full" />
//               {/* <span className="text-sm font-semibold tracking-wide">Home</span> */}
//             </Link>
//           )}

//           <button
//             onClick={() => setIsSidebarOpen(false)}
//             className="text-white/50 hover:text-white transition text-sm md:text-lg"
//           >
//             ✕
//           </button>
//         </div>

//         {/* ================= PRIMARY ICON NAV ================= */}
//         <div className="flex justify-between px-6 pt-2 pb-3">
//           {role != "admin" && (
//             <NavIcon
//               to="/home"
//               icon={<IoHome />}
//               label="Home"
//               close={setIsSidebarOpen}
//             />
//           )}

//           {role == "admin" && (
//             <NavIcon
//               to="/home"
//               icon={<IoHome />}
//               label="Browse"
//               close={setIsSidebarOpen}
//             />
//           )}

//           <NavIcon
//             to="/community"
//             icon={<MdGroups />}
//             label="Community"
//             close={setIsSidebarOpen}
//           />

//           {role !== "student" && (
//             <NavIcon
//               to="/authors"
//               icon={<IoIosGitNetwork />}
//               label="My Network"
//               close={setIsSidebarOpen}
//             />
//           )}
//           <NavIcon
//             // to={`/bookMarkPage/${email}`}
//             to={`/bookMarkPage`}
//             icon={<RiBookMarkedFill />}
//             label="Bookmark"
//             close={setIsSidebarOpen}
//           />

//           {role == "student" && (
//             <NavIcon
//               to="/profile"
//               icon={<FaUserAlt />}
//               label="Profile"
//               close={setIsSidebarOpen}
//             />
//           )}

//           <div
//             onClick={exit}
//             className="flex flex-col items-center gap-0
//                  text-white/70 hover:text-white transition"
//           >
//             <span className="text-xl text-red-400">
//               <IoLogOutOutline />
//             </span>
//             <span className="text-[11px]">Logout</span>
//           </div>
//         </div>

//         {/* ================= SECONDARY TILES ================= */}
//         <div className="grid grid-cols-2 gap-3 px-5 pt-2 pb-5">
//           {role == "admin" && (
//             <NavTile
//               to="/dashboard"
//               icon={<MdDashboard />}
//               title="Analytics"
//               subtitle="Dashboard"
//               close={setIsSidebarOpen}
//             />
//           )}
//           {role === "admin" && (
//             <NavTile
//               to="/control"
//               icon={<MdManageAccounts />}
//               title="Control Panel"
//               subtitle="Manage Users"
//               close={setIsSidebarOpen}
//             />
//           )}

//           {role !== "student" && (
//             <NavTile
//               to="/workspace"
//               icon={<BsPersonWorkspace />}
//               title="Workspace"
//               subtitle="Manage Content"
//               close={setIsSidebarOpen}
//             />
//           )}
//           {role === "student" && (
//             <NavTile
//               to="/authors"
//               icon={<IoIosGitNetwork />}
//               title="Network"
//               subtitle="Connections"
//               close={setIsSidebarOpen}
//             />
//           )}

//           {/* {role == "coordinator" && (
//             <NavTile
//               to="/profile"
//               icon={<FaUserAlt />}
//               title="Profile"
//               subtitle="Account"
//               close={setIsSidebarOpen}
//             />
//           )} */}

//           <NavTile
//             to="/announcement"
//             icon={<MdAnnouncement />}
//             title="Updates"
//             subtitle="Announcements"
//             badge={announceCount}
//             close={setIsSidebarOpen}
//           />
//         </div>
//       </div>

// function NavIcon({ to, icon, label, close }) {
//   return (
//     <Link
//       to={to}
//       onClick={() => close && close(false)}
//       className="flex flex-col items-center gap-0
//                  text-white/70 hover:text-white transition"
//     >
//       <span className=" text-xl md:text-lg text-emerald-400">{icon}</span>
//       <span className="text-[11px]">{label}</span>
//     </Link>
//   );
// }

// function NavTile({ to, icon, title, subtitle, badge, close }) {
//   return (
//     <Link
//       to={to}
//       onClick={() => close && close(false)}
//       className="relative rounded-2xl p-4
//                  bg-white/5 hover:bg-white/10 transition"
//     >
//       <span className="text-emerald-400 text-lg">{icon}</span>

//       <p className="mt-2 text-sm font-medium">{title}</p>
//       <p className="text-xs text-white/40">{subtitle}</p>

//       {badge > 0 && (
//         <span
//           className="absolute top-3 right-3
//                          text-[10px] px-2 py-0.5 rounded-full
//                          bg-emerald-500/20 text-emerald-300"
//         >
//           {badge}
//         </span>
//       )}
//     </Link>
//   );
// }
