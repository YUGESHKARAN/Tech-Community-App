import React, { useState, useRef, useEffect, useContext } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import {
  MdAnnouncement,
  MdDataObject,
  MdGroups,
  MdLogout,
  MdPostAdd,
} from "react-icons/md";
import { IoHome, IoLogOut, IoLogOutOutline, IoPeople } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import bloglogo from "../assets/bloglogo.png";
import { RiUser3Line } from "react-icons/ri";
import { IoIosClose, IoMdNotifications } from "react-icons/io";
import { GlobalStateContext } from "../GlobalStateContext";
import { TfiAnnouncement } from "react-icons/tfi";
import axiosInstance from "../instances/Axiosinstances";
import user from "../images/user.png";

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
        `/blog/author/notification/delete?email=${userEmail}&notificationId=${notificationId}`
      );

      console.log("deleted", response.data);
      fetchNotifications();
    } catch (err) {
      console.log("error", err);
    }
  };

  const deleteAllNotification = async (userEmail) => {
    const confirm = window.confirm(
      "Are you sure want to delete all the notifications"
    );
    if (!confirm) return;
    try {
      const response = await axiosInstance.delete(
        `/blog/author/notification/deleteall?email=${userEmail}`
      );

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

  return (
    <div className="flex relative justify-between items-center  h-16 bg-gray-900 mb-2 px-5">
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
      <ul className="lg:flex justify-center text-base hidden font-semibold text-gray-300 w-3/5  items-center gap-10">
        <li className="transition-all duration-200  hover:text-white">
          <Link to="/home" className="flex items-center gap-1">
            <IoHome className="text-xl" />
            Home
          </Link>
        </li>

        <li className="transition-all duration-200  hover:text-white">
          <Link to="/community" className="flex  items-center gap-1">
            <MdGroups className="text-2xl" /> Tech Communities
          </Link>
        </li>
        <li className="transition-all duration-200 hover:text-white">
          <Link to="/authors" className="flex items-center gap-1">
            <IoPeople className="text-2xl " />
            Authors
          </Link>
        </li>
        {role === "coordinator" && (
          <li className="transition-all  duration-200 hover:text-white">
            <Link to="/addPost" className="flex items-center gap-1">
              <MdPostAdd className="text-2xl" /> Add Post
            </Link>
          </li>
        )}

        {/* <li className='transition-all duration-200 hover:text-white'>
                    <Link to="/profile" className='flex items-center gap-1'>
                        <FaUserAlt className='text-lg'/>My Profile
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
        <Link to="/profile" className="flex items-center gap-1">
          {profile !== "undefined" ? (
            <img
              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`}
              className="w-5 h-5 border border-green-500 rounded-full object-contain"
            />
          ) : (
            <RiUser3Line className="text-xl text-[#0be881]" />
          )}{" "}
          Hi,{username}
        </Link>
      </p>

      <div className="transition-all flex items-center duration-200 hover:text-white">
        <p className="text-white lg:flex justify-end w-full hidden font-semibold items-center gap-1 mr-3 text-sm">
          <Link to="/profile" className="flex items-center gap-1">
            {profile !== "undefined" ? (
              <img
                src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`}
                className="w-7 h-7 rounded-full border border-green-500  object-contain"
              />
            ) : (
              <RiUser3Line className="text-xl text-[#0be881]" />
            )}{" "}
            Hi,{username}
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
        ☰
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${
          isSidebarOpen
            ? "fixed right-0 top-0 h-full w-64 shadow-xl"
            : "fixed right-[-300px] top-0 h-full w-64 shadow-xl"
        } bg-gray-800 text-white transition-all duration-1000 z-50`}
      >
        <ul className="w-full  flex flex-col gap-10 text-center mt-10">
          <li className="transition-all w-11/12 ml-10 duration-200 mx-auto">
            <Link
              to="/home"
              className="flex items-center hover:text-gray-400 transition-all duration-200  hover:text-gray-400 transition-all duration-200 justify-start w-24"
            >
              <IoHome className="text-xl mr-3  text-green-500" /> Home
            </Link>
          </li>
          <li className="transition-all w-11/12 ml-10  text-left duration-200 mx-auto">
            <Link
              to="/community"
              className="flex items-center hover:text-gray-400 transition-all duration-200  hover:text-gray-400 transition-all duration-200 justify-start w-fit"
            >
              <MdGroups className="text-xl mr-3 text-green-500" /> Tech
              Communities
            </Link>
          </li>

          {role === "coordinator" && (
            <li className="transition-all w-11/12 ml-10  mx-auto duration-200">
              <Link
                to="/yourposts"
                className="flex items-center hover:text-gray-400 transition-all duration-200  justify-start"
              >
                <MdDataObject className="text-xl mr-3 text-green-500" />
                My Posts
              </Link>
            </li>
          )}

          <li className="transition-all w-11/12 ml-10  mx-auto duration-200">
            <Link
              to="/authors"
              className="flex items-center hover:text-gray-400 transition-all duration-200  justify-start"
            >
              <IoPeople className="text-xl mr-3 text-green-500" />
              Authors
            </Link>
          </li>

          {role === "coordinator" && (
            <li className="transition-all w-11/12 ml-10  mx-auto duration-200">
              <Link
                to="/addPost"
                className="flex items-center hover:text-gray-400 transition-all duration-200  justify-start"
              >
                <MdPostAdd className="text-xl mr-3 text-green-500" />
                Add Post
              </Link>
            </li>
          )}
          <li className="transition-all w-11/12 ml-10  mx-auto duration-200">
            <Link
              to="/profile"
              className="flex items-center  hover:text-gray-400 transition-all duration-200  justify-start"
            >
              <FaUserAlt className="text-xl mr-3 text-green-500" />
              My Profile
            </Link>
          </li>

          <li className="transition-all w-11/12 ml-10  mx-auto duration-200">
            <Link
              to="/announcement"
              className="flex items-center hover:text-gray-400 transition-all duration-200  justify-start"
            >
              <MdAnnouncement className="text-2xl mr-1 text-white" />
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
          <li className="mx-auto">
            <a href="" onClick={exit}>
              <IoLogOutOutline className="text-3xl text-red-600" />
              {/* <IoLogOutOutline /> */}
            </a>
          </li>
        </ul>
      </div>

      {/* notification */}
  

      <div
        ref={notificationRef}
        className={`${
          showNotefication
            ? "fixed top-14 right-2 z-50 w-52 md:w-80 max-h-72 overflow-y-auto bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl rounded-xl p-4 pt-0 space-y-3 transition-all duration-300 scrollbar-hide"
            : "hidden"
        }`}
      >
        {/* Header */}
        <div className="flex items-center pt-3 justify-between sticky top-0 bg-gradient-to-br from-gray-800 to-gray-900 z-40 pb-2 border-b border-gray-700">
          <h2 className="md:text-sm text-xs font-semibold text-white tracking-wide">
            🔔 Notifications
          </h2>
          <button
            onClick={() => deleteAllNotification(userEmail)}
            className="text-xs font-medium text-gray-900 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md transition duration-200"
          >
            Clear All
          </button>
        </div>

        {/* Notification List */}
        <div className="flex flex-col space-y-2 md:space-y-4">
          {[...note].reverse().map((data, index) => (
            <div
              key={index}
              className="relative flex items-start gap-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-all duration-200 group"
            >
              {/* Profile */}
              <img
                src={data.profile?`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`:user}
                alt="Profile"
                className="w-7 h-7 bg-white rounded-full border-2 border-green-500 object-contain shadow-sm"
              />

              {/* Content */}
              <Link
                to={data.url}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <p className="text-sm text-white font-semibold truncate">
                  {data.user}
                </p>
                <p className="text-[10px] text-gray-300 truncate max-w-[200px]">
                  {data.message || "You got a notification"}...
                </p>
              </Link>

              {/* Delete Icon */}
              <div
                onClick={() => deleteSigleNotification(userEmail, data._id)}
                className="absolute top-1 right-1 text-gray-400 hover:text-red-500 cursor-pointer transition duration-200"
              >
                <IoIosClose size={18} />
              </div>
            </div>
          ))}
        </div>

        {/* Optional: No Notifications State */}
        {note.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
