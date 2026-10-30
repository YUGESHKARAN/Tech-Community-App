import React, { useState, useEffect, useRef } from "react";
import NavBar from "../ui/NavBar";
import {
  RiChatDeleteFill,
  RiDeleteBack2Fill,
  RiDeleteBin6Line,
} from "react-icons/ri";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { Link } from "react-router-dom";
import {
  HiOutlineInformationCircle,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { MdAnnouncement } from "react-icons/md";
import getTimeAgo from "../components/DateCovertion";

import toast from "../components/toaster/Toast";
import { getItem, storeItem } from "../utils/encode";
import AnnouncementSkeleton from "../components/loaders/AnnouncementSkeleton";
import empty_state_announcement from "../assets/empty_announcement_state.png";
import { CiSquareRemove } from "react-icons/ci";
import { IoMdClose, IoMdCloseCircle } from "react-icons/io";
import { AiFillCloseCircle, AiFillCloseSquare } from "react-icons/ai";
import { LiaWindowCloseSolid } from "react-icons/lia";
import { VscGitStashApply } from "react-icons/vsc";
import { GoAlertFill, GoInfo } from "react-icons/go";
import { BsInfo, BsInfoCircle } from "react-icons/bs";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import formatCount from "../utils/NumberConversion";
import RenderTextWithHashtags from "../components/RenderTextWithHashtags";
import { isImpersonating } from "../hooks/director/Useimpersonation";
import { AnnounceSummarySkeleton } from "../components/loaders/AnnounSummarySkeleton";

import AnnouncementFilterBar from "../components/announcement/AnnouncementFilterBar";
import useAnnouncementFilters from "../hooks/announcement/useAnnouncementFilters";
import AnnouncementHeader from "../components/announcement/AnnouncementHeader";

function Announcement() {
  const username = getItem("username");
  const email = getItem("email");
  const profile = sessionStorage.getItem("profile");

 
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState("");
  const [deliveredTo, setDeliveredTo] = useState("");
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = getItem("role");
  const [communityOptions, setCommunityOptions] = useState([]);
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const imageInputRef = useRef(null);
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const announceCount = getItem("announceCount");
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [preview, setPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    message: "",
    deliveredTo: "",
  });

  const [announceLoading, setAnnounceLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [msgClearLoader, setMsgClearLoader] = useState(false);

  const fetchAllAnnouncement = async () => {
    try {
      setAnnounceLoading(true);
      const response = await axiosInstance.get(`/blog/author/${email}`);
      setAnnouncement(response.data.announcement);
      storeItem("announceCount", response.data.announcement.length);
    } catch (err) {
      console.log("error", err);
    } finally {
      setAnnounceLoading(false);
    }
  };

  // fetch authors to derive community options
  const fetchAuthorsForCommunities = async () => {
    try {
      const response = await axiosInstance.get(`/blog/author/${email}`); // adjust endpoint if different
      setCommunityOptions(response.data.community || []);
    } catch (err) {
      console.error("Error fetching authors for communities", err);
      setCommunityOptions([]);
    }
  };

  useEffect(() => {
    fetchAllAnnouncement();
    fetchAuthorsForCommunities();
  }, []);

  // toggle community selection
  const toggleCommunity = (community) => {
    setSelectedCommunities((prev) =>
      prev.includes(community)
        ? prev.filter((c) => c !== community)
        : [...prev, community],
    );
  };

  console.log("username", username)
  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!title.trim()) {
      errors.title = "Announcement title is required.";
    }

    if (!message.trim()) {
      errors.message = "Announcement message is required.";
    }

    if (!deliveredTo.trim()) {
      errors.deliveredTo = "Select recipient group";
    }

    // additional validation for community selection
    if (deliveredTo === "community" && selectedCommunities.length === 0) {
      errors.deliveredTo = "Select at least one community";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // prevent submit
    }

    // const email = localStorage.getItem("email");
    const email = getItem("email");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user", username);
      formData.append("title", title);
      formData.append("message", message);
      formData.append("links", JSON.stringify(links));
      formData.append("deliveredTo", deliveredTo);
      formData.append("email", email);
      formData.append("profile", profile);
      formData.append("techCommName", JSON.stringify(selectedCommunities));
      formData.append("poster", image);
      const response = await axiosInstance.post(
        `/blog/author/announcement/add`,
        // const response = await axiosInstance.post(`/blog/author/announcement/add`,
        formData,
      );

      if (response.status == 201) {
        toast.success("Delivered !", "New announcement delivered ");
        setTitle("");
        setMessage("");
        setLinks("");
        // setImage(null);
        setDeliveredTo("all");
        setShowAnnouncement(false);
        fetchAllAnnouncement();
        setSelectedCommunities([]);
        setImage("");
        setPreviewImage("");
        if (imageInputRef.current) {
          imageInputRef.current.value = null;
        }
      } else {
        alert("Failed to add announcement: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting announcement:", error);
    } finally {
      setLoading(false);
      setShowAnnouncement(false);
      setShowGuidelines(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    const verify = window.confirm(
      "Are you sure you want to delete this announcement?",
    );
    if (!verify) return;
    if (announceCount > 0) {
      storeItem("announceCount", announceCount - 1);
    }
    try {
      const response = await axiosInstance.delete(
        `/blog/author/announcements/${id}`,
      );
      // console.log("response", response);
      toast.success("Deleted !", "Announcement removed successfully ");
      // fetchAllAnnouncement();
      setAnnouncement((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.log("error", err);
    }
  };

  const onChangeImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setPreviewImage(preview);
    }
  };
  const reversedAnnouncements = Array.isArray(announcement)
    ? [...announcement].reverse()
    : [];

  const deleteAllAnouncement = async () => {
    try {
      const response = await axiosInstance.delete(
        `/blog/author/announcementsByAdmin/${email}`,
        { data: { password } },
      );
      if (response.status == 200) {
        fetchAllAnnouncement();
        setPassword("");
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setPassword("");
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

   const {
  filters, setFilters, clearAll, activeCount,
  filtered, publishers, queryInput, setQueryInput,
} = useAnnouncementFilters(Array.isArray(announcement) ? announcement : []);

  // console.log("communityOptions", communityOptions);
  // console.log("selectedCommunities", selectedCommunities);
  // console.log("announcements", reversedAnnouncements);

  function AnnouncementInfo({ className = "", showInfo }) {
    return (
      <div
        className={twMerge(
          clsx(
            `
               w-full
        rounded-lg
        border border-emerald-500/20
        bg-gradient-to-br from-emerald-500/5 to-transparent
        p-4 md:p-5
        space-y-5

         ${showInfo ? "block" : "hidden md:block"}
      
        mb-4`,
            className,
          ),
        )}
        >
      

        {/* Purpose */}
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-medium">Purpose</p>
          <ul className="space-y-1.5 text-xs md:text-sm text-gray-300">
            <li className="flex gap-2">
              <span>•</span> Platform updates
            </li>
            <li className="flex gap-2">
              <span>•</span> Campaigns & launch events
            </li>
            <li className="flex gap-2">
              <span>•</span> Hackathons & competitions updates
            </li>
            <li className="flex gap-2">
              <span>•</span> Community meetings
            </li>
            <li className="flex gap-2">
              <span>•</span> Domain-specific updates
            </li>
          </ul>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-medium">How It Helps</p>
          <ul className="space-y-1.5 text-xs md:text-sm text-gray-300">
            <li className="flex gap-2">
              <span>•</span> Never miss important updates
            </li>
            <li className="flex gap-2">
              <span>•</span> Engage with your community
            </li>
            <li className="flex gap-2">
              <span>•</span> Participate in relevant events
            </li>
          </ul>
        </div>

        {/* Note */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 font-medium">Note</p>
          <p className="text-xs md:text-sm text-gray-300">
            Announcements are only shared by{" "}
            <span className="text-white font-medium">Admins</span> and{" "}
            <span className="text-white font-medium">Coordinators</span> 
          </p>
        </div>
      </div>
    );
  }
  function AnnouncementGuidelines({
    showAnnouncement,
    showGuidelines,
    className = "",
  }) {
    return (
      <div
        className={twMerge(
          clsx(
            `
              w-full
        rounded-lg
        border border-emerald-500/20
        bg-gradient-to-br from-emerald-500/5 to-transparent
        p-4 md:p-5
        space-y-5
        mb-6
       
        ${showGuidelines ? "block" : "hidden md:block"}

        ${showAnnouncement && "hidden md:hidden"}
       
                `,
            className,
          ),
        )}

      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <h2 className="text-sm md:text-base font-semibold text-white tracking-wide">
            Announcement Guidelines
          </h2>
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-medium">Purpose</p>
          <ul className="space-y-1.5 text-xs md:text-sm text-gray-300">
            <li className="flex gap-2">
              <span>•</span> Campaigns, events, hackathons
            </li>
            <li className="flex gap-2">
              <span>•</span> Community meetings & tech activities
            </li>
            <li className="flex gap-2">
              <span>•</span>
              Must follow{" "}
              <span className="text-gray-400">university code of conduct</span>
            </li>
          </ul>
        </div>

        {/* Access */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 font-medium">Who Can Create</p>
          <p className="text-xs md:text-sm text-gray-300">
            Only <span className="text-white font-medium">Admins</span> and{" "}
            <span className="text-white font-medium">Coordinators</span>
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-medium">
            How to Create (very simple)
          </p>

          <div className="space-y-2 text-xs md:text-sm text-gray-300">
            <p>
              <span className="text-white">Title:</span> Clear subject
            </p>
            <p>
              <span className="text-white">Message:</span> What you communicate
            </p>
            <p>
              <span className="text-white">Links:</span> Event / meeting /
              survey
            </p>
            <p>
              <span className="text-white">Poster:</span> Suitable Thumbnail{" "}
              <span className="text-xs"> (1280 × 720 px)</span>
            </p>
            <p>
              <span className="text-white">Recipients:</span>{" "}
              <span className="text-gray-400">
                Community / Coordinators / All Users
              </span>
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-medium">Best Practices</p>
          <ul className="space-y-1.5 text-xs md:text-sm text-gray-300">
            <li className="flex gap-2">
              <span>•</span> Keep it clear & short
            </li>
            <li className="flex gap-2">
              <span>•</span> Add valid links & poster
            </li>
            <li className="flex gap-2">
              <span>•</span> Target the right audience
            </li>
          </ul>
        </div>
        <button
          onClick={() => setShowAnnouncement(!showAnnouncement)}
          className="md:px-4 px-3 py-2 md:py-2 bg-emerald-600/20 hover:bg-emerald-500/20
                rounded-md text-xs font-semibold   text-emerald-400 transition "
        >
          Create Campaign
        </button>
      </div>
    );
  }

  const clearAllAnnouncements = async () => {
    if (reversedAnnouncements.length === 0) {
      return;
    }

    const verify = window.confirm(
      "Are you sure you want to delete all announcements?",
    );

    if (!verify) {
      return;
    }

    setMsgClearLoader(true);
    try {
      const response = await axiosInstance.delete(
        `/blog/author/deleteAnnouncements/${email}`,
      );

      setAnnouncement([]);
      if (response.status === 200) {
        toast.info(
          "Announcements Cleared !",
          "All announcements have been successfully removed.",
        );
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  const sanitizeUrl = (rawUrl) => {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
      return null;
    } catch {
      return null;
    }
  };

  // console.log("guidelinses", showGuidelines)
  // console.log("announcement", reversedAnnouncements)
  return (
    <div className="min-h-screen  theme text-slate-200">
      <NavBar />
      <div className="min-h-screen max-w-[1800px] mx-auto w-full">
        {/* ================= HEADER ================= */}
        <div className="w-full">
          <div className="w-full mx-auto px-4 md:px-20 py-3  md:pb-2 flex justify-between items-center">
            <div className="flex items-center justify-center gap-2">

              <div className="flex items-center gap-1 md:gap-2">
                      <MdAnnouncement className="text-sm  pt-0.5 md:pt-0 md:text-xl" />
                      <h1 className="text-sm md:text-xl font-semibold tracking-tight text-gray-100">
                         Announcements
                      </h1>
                    </div>
              {role === "student" && (
                <span
                  onClick={() => {
                    setShowInfo(!showInfo);
                  }}
                  className="text-emerald-400 md:hidden text-xs"
                >
                  <BsInfoCircle />
                </span>
              )}
            </div>

            {role !== "student" && (
          
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setShowGuidelines(!showGuidelines);
                  setShowAnnouncement(false);
                }}
                className="
                  md:hidden
                  group
                  inline-flex
                  items-center
                  md:gap-1.5
                  gap-1
                  px-2
                  py-1
                  rounded-lg
                  theme
                  border
                  border-slate-700
                  text-slate-200
                  md:text-[11px]
                  text-[10px]
                  font-medium
                "
              >
                <motion.div
                  animate={{
                    rotate: showGuidelines ? 90 : 0,
                    scale: showGuidelines ? 1.05 : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    w-5 h-5
                    rounded-full
                    flex items-center justify-center
                    bg-emerald-500/10
                    text-emerald-400
                  "
                >
                  {showGuidelines ? <X size={11} /> : <Plus size={11} />}
                </motion.div>

                <motion.span
                  key={showGuidelines ? "close" : "create"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {showGuidelines ? "Close Panel" : "Create New"}
                </motion.span>
              </motion.button>
            )}
          </div>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="w-full mx-auto px-3 md:py-2 md:px-20 md:pb-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] md:gap-5">
          {/* ================= LEFT RAIL ================= */}

          <aside
            // className={`${!showAnnouncement?'md:sticky top-7 self-start':' md:sticky top-7 self-start'}`}
            className="lg:sticky lg:overflow-y-scroll overflow-x-hidden lg:h-screen scrollbar-hide top-7 self-start"
          >
            {role === "student" && (
              <AnnouncementInfo
                className="hidden md:block"
                showInfo={showInfo}
              />
            )}
            <AnimatePresence mode="wait">
              {role === "student" && showInfo && (
                <motion.div
                  key="info"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -20,
                    filter: "blur(8px)",
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                    filter: "blur(4px)",
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="overflow-hidden  md:hidden"
                >
                  <AnnouncementInfo showInfo={showInfo} />
                </motion.div>
              )}
            </AnimatePresence>

            {role !== "student" && (
              <AnnouncementGuidelines
                showAnnouncement={showAnnouncement}
                setShowAnnouncement={setShowAnnouncement}
                showGuidelines={showGuidelines}
                className={`hidden ${!showAnnouncement && "md:block"}`}
              />
            )}

            <AnimatePresence mode="wait">
              {role !== "student" && showGuidelines && (
                <motion.div
                  key="guidelines"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -20,
                    filter: "blur(8px)",
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                    filter: "blur(4px)",
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="overflow-hidden md:hidden"
                >
                  <AnnouncementGuidelines
                    showAnnouncement={showAnnouncement}
                    showGuidelines={showGuidelines}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {role !== "student" && (
              <>
                {/* CREATE PANEL */}
           

                <AnimatePresence mode="wait">
  {showAnnouncement && (
    <motion.div
      key="announcement-form"
      layout
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.98,
        filter: "blur(8px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={{
        opacity: 0,
        y: -12,
        scale: 0.98,
        filter: "blur(6px)",
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="lg:pb-12 overflow-hidden"
    >
      <motion.div
        layout
        transition={{
          layout: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
       
      >
        {/* Entire existing form content */}
         <div className="theme border border-emerald-500/20  rounded-lg overflow-hidden mb-6 md:mb-0 p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        {" "}
                        <h3 className="text-xs uppercase tracking-wide text-slate-400">
                          New Campaign
                        </h3>
                        <button
                          onClick={() => setShowAnnouncement(!showAnnouncement)}
                          className="text-emerald-500 text-xs "
                        >
                          ← Back
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* TITLE */}
                        <div>
                          <label className="block text-sm font-medium text-slate-300">
                            Subject Title{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement title"
                            className="w-full mt-1 px-3 py-2 theme border border-slate-700
                     rounded-md focus:outline-none focus:border-emerald-500/20 text-xs"
                          />
                          {fieldErrors.title && (
                            <p className="text-xs md:text-sm flex items-center gap-1 text-red-500 mt-1">
                              <TbAlertTriangleFilled /> {fieldErrors.title}
                            </p>
                          )}
                        </div>

                        {/* MESSAGE */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-300">
                              Message <span className="text-red-500">*</span>
                            </label>
                            {/* Tabs */}
                            <div className="flex items-center theme border border-gray-700 rounded-lg p-1">
                              <button
                                type="button"
                                onClick={() => setPreview(false)}
                                className={`px-2 py-0.5 text-[10px] outline-none   rounded-md transition-all duration-200 ${
                                  !preview
                                    ? "bg-emerald-500/20 text-emerald-400 "
                                    : "text-gray-400 hover:text-white"
                                }`}
                              >
                                Editor
                              </button>

                              <button
                                type="button"
                                onClick={() => setPreview(true)}
                                className={`px-2 py-0.5 text-[10px] outline-none  rounded-md transition-all duration-200 ${
                                  preview
                                    ? "bg-emerald-500/20 text-emerald-400 "
                                    : "text-gray-400 hover:text-white"
                                }`}
                              >
                                Preview
                              </button>
                            </div>
                          </div>

                          {/* Editor / Preview Wrapper */}
                          <div className="relative">
                            {/* Top subtle glow */}
                            <div className="absolute inset-0 rounded-xl bg-emerald-500/[0.02] pointer-events-none" />

                            {preview ? (
                              <div
                                className="
                          w-full   min-h-24 h-[150px]
                          overflow-y-auto
                          overflow-x-hidden
                          emerald-scrollbar
                          px-4 py-3
                          rounded-md
                          theme
                          border border-gray-700
                          text-white text-xs 
                        
                        
                        "
                              >
                                {message?.trim()?.length > 0 ? (
                                  <RenderTextWithHashtags text ={message}/>
                                ) : (
                                  <span className="text-gray-500">
                                    Preview content will appear here...
                                  </span>
                                )}
                              </div>
                            ) : (
                              <textarea
                                rows="6"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Announcement message..."
                                className="w-full mt-2  focus:border focus:border-emerald-500/40 emerald-scrollbar px-4 py-3 rounded-md theme border border-gray-700 outline-none  text-white text-xs leading-relaxed"
                              />
                            )}
                          </div>
                          {fieldErrors.message && (
                            <p className="text-xs md:text-sm flex items-center gap-1 text-red-500 mt-1">
                              <TbAlertTriangleFilled /> {fieldErrors.message}
                            </p>
                          )}
                        </div>

                        {/* LINKS */}
                        <div>
                          <div className="flex w-full items-center justify-between">
                            <label className="block text-sm font-medium text-slate-300">
                              Links
                            </label>
                            {currentLinkTitle.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentLinkTitle("");
                                  setCurrentLinkUrl("");
                                }}
                                className="text-[11px] px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={currentLinkTitle}
                              onChange={(e) =>
                                setCurrentLinkTitle(e.target.value)
                              }
                              placeholder="Link Title"
                              className="w-1/2 px-3 py-2 theme border border-slate-700
                     rounded-md focus:outline-none focus:border-emerald-500/20 text-xs"
                            />
                            <input
                              type="url"
                              value={currentLinkUrl}
                              onChange={(e) =>
                                setCurrentLinkUrl(e.target.value)
                              }
                              placeholder="Link URL"
                              className="w-1/2 px-3 py-2 theme border border-slate-700
                     rounded-md focus:outline-none focus:border-emerald-500/20 text-xs"
                            />
                            <button
                              type="button"
                              disabled={!currentLinkUrl}
                              onClick={() => {
                                const titleToUse = currentLinkTitle.trim();
                                const sanitizedUrl = sanitizeUrl(
                                  currentLinkUrl.trim(),
                                );
                                if (titleToUse && sanitizedUrl) {
                                  const newLink = {
                                    title: titleToUse,
                                    url: sanitizedUrl,
                                  };
                                  setLinks([
                                    ...(Array.isArray(links) ? links : []),
                                    newLink,
                                  ]);
                                  setCurrentLinkTitle("");
                                  setCurrentLinkUrl("");
                                } else if (titleToUse) {
                                  toast.error(
                                    "Invalid URL !",
                                    "Please enter a valid http(s) URL.",
                                  );
                                }
                                   else if(!titleToUse){
                           toast.error(
                            "Invalid URL Title !",
                            "Please enter a valid URL Title.",
                          );
                        }
                              }}
                              className={`
                                px-4 bg-emerald-500/20 w-fit py-1 md:py-2   text-black text-emerald-400  text-xs rounded-md hover:bg-emerald-600/20
                                ${
                          currentLinkUrl
                            ? "scale-105 animate-pulse border border-emerald-500"
                            : ""
                        }
                               disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed  `}
                            >
                              Add
                            </button>
                          </div>

                          {Array.isArray(links) && links.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {links.map((link, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center bg-slate-800 px-3 py-2 rounded-md"
                                >
                                  <span className="text-xs text-slate-300 truncate">
                                    {link.title}: {link.url}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLinks(
                                        links.filter((_, i) => i !== index),
                                      )
                                    }
                                    className="text-red-400 text-xs ml-2"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* POSTER */}
                        <div className="transition-all duration-300">
                          <label className="block text-sm font-medium text-slate-300">
                            Choose Poster
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            id="image"
                            onChange={onChangeImage}
                            ref={imageInputRef}
                            className="w-full mt-2 text-xs  text-gray-300 
                          file:mr-4 file:px-2 file:py-1 file:rounded-md 
                          file:border-0 file:bg-emerald-500/20 file:hover:bg-emerald-600/20 file:text-emerald-400 
                          file:cursor-pointer"
                          />

                          {!image && (
                            <div className="w-full h-40  mt-3 rounded-xl flex items-center justify-center bg-gray-700">
                              <p className="text-gray-400 text-xs">No Poster</p>
                            </div>
                          )}

                          {image && (
                            <button
                              type="button"
                              onClick={() => {
                                setImage("");
                                setPreviewImage("");
                                if (imageInputRef.current) {
                                  imageInputRef.current.value = null;
                                }
                              }}
                              className="text-xs text-yellow-400 underline mt-2"
                            >
                              Remove Selected Image
                            </button>
                          )}

                          {previewImage?.length > 0 && (
                            <div className="mt-3">
                              <img
                                src={previewImage}
                                className="w-full h-40 object-cover rounded-md border border-slate-700"
                              />
                            </div>
                          )}
                        </div>

                        {/* DELIVERED TO */}
                        <div>
                          <label className="block text-sm font-medium text-slate-300">
                            Delivered To <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={deliveredTo}
                            onChange={(e) => setDeliveredTo(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 theme
                    border border-slate-700 cursor-pointer rounded-md focus:outline-none focus:border-emerald-500/20 text-xs md:text-sm"
                          >
                            <option value="">Choose recipients</option>
                            <option value="community">Community</option>
                            <option value="coordinators">Coordinators</option>
                            <option value="all">All</option>
                          </select>

                          {fieldErrors.deliveredTo && (
                            <p className="text-xs md:text-sm flex items-center gap-1 text-red-500 mt-1">
                              <TbAlertTriangleFilled />{" "}
                              {fieldErrors.deliveredTo}
                            </p>
                          )}
                        </div>

                        {/* COMMUNITY MULTI SELECT */}
                        {deliveredTo === "community" && (
                          <div className="theme-fields-lite border border-gray-700 rounded-md p-4">
                            <div className="flex justify-between items-center mb-3">
                              <p className="text-xs text-slate-200 font-medium">
                                Select communities
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedCommunities(
                                      communityOptions.slice(),
                                    )
                                  }
                                  className="text-xs px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 transition-all duration-300
                           rounded text-emerald-400"
                                >
                                  Select all
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCommunities([])}
                                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-slate-600
                           rounded text-white transition-all duration-300"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <div className="max-h-40 overflow-y-auto space-y-2">
                              {communityOptions.map((comm, idx) => (
                                <label
                                  key={idx}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCommunities.includes(comm)}
                                    onChange={() => toggleCommunity(comm)}
                                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                  />
                                  <span className="text-slate-200">{comm}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading || isImpersonating()}
                          className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-500/20
                          text-emerald-400 text-xs font-semibold  flex items-center justify-center gap-2 rounded-md transition disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <VscGitStashApply className=" text-xs " />{" "}
                          {loading ? "Publishing..." : "Publish"}
                        </button>
                      </form>
                    </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </aside>

          {/* ================= MAIN FEED ================= */}
          <main
            className={`space-y-6 md:space-y-8 md:block ${showGuidelines && "hidden md:block"}`}
          >
      

          {!announceLoading ? (
  <AnnouncementHeader
    role={role}
    announcements={announcement}
    shown={filtered.length}
    activeCount={activeCount}
    onClearAll={clearAllAnnouncements}
  >
    {announcement.length > 0 && (
      <AnnouncementFilterBar
        filters={filters}
        setFilters={setFilters}
        clearAll={clearAll}
        activeCount={activeCount}
        publishers={publishers}
        total={announcement.length}
        shown={filtered.length}
        queryInput={queryInput}
        setQueryInput={setQueryInput}
      />
    )}
  </AnnouncementHeader>
) : (
  <AnnounceSummarySkeleton />
)}
           

               {!announceLoading && announcement.length > 0 && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <img className="w-40 md:w-52" src={empty_state_announcement} alt="" />
                  <p className="text-sm text-gray-400">No announcements match your filters.</p>
                  <button
                    onClick={clearAll}
                    className="rounded-md bg-emerald-600/20 px-4 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                  >
                    Clear filters
                  </button>
                </div>
              )}

            {announcement.length === 0 && !announceLoading && (
              <div className="flex h-[45vh] md:h-[50vh] md:h-auto flex-col justify-center items-center gap-2 md:gap-3 ">
                <img
                  className="w-48 md:w-60 "
                  src={empty_state_announcement}
                  alt=""
                />
                <span className="text-gray-400 max-w-xs md:text-base md:max-w-md text-sm flex justify-center items-center text-center ">
                  {" "}
                  Your announcements tab is empty!{" "}
                </span>
              </div>
            )}
         

            {!announceLoading &&
              // reversedAnnouncements.map((item) => (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className="
                      group
                      relative
                      overflow-hidden
                      rounded-xl 
                      border border-slate-800/80
                      bg-gradient-to-b
                      from-theme
                      via-[#0b1220]
                      to-[#0a101d]
                      shadow-xl
                      shadow-black/20
                      hover:border-slate-700
                      transition-all
                      duration-300
                    "
                >
                  {/* Top Accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-emerald-400/70" />

                  {/* Header */}
                  <div className="p-5 md:p-7 pb-4">
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span
                              className="
                                px-2.5 py-1
                                rounded-full
                                text-[10px]
                                font-medium
                                uppercase
                                tracking-wide
                                bg-emerald-500/10
                                text-emerald-400
                                border border-emerald-500/20
                              "
                            >
                              Announcement
                            </span>

                            <span className="text-xs text-slate-500">
                              {getTimeAgo(item.timestamp)}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteAnnouncement(item._id)}
                            className="
                              h-9
                              w-9
                              rounded-xl
                              md:border
                              border-slate-800
                              bg-slate-900/70
                              flex
                              items-center
                              justify-center
                              md:hover:border-red-500/30
                              md:hover:bg-red-500/10
                              transition-all
                            "
                          >
                            <AiFillCloseSquare className="text-slate-500 md:hover:text-red-400 text-lg" />
                          </button>
                        </div>
                        <h2
                          className="
                            text-lg
                            md:text-3xl
                            font-semibold
                            md:font-bold
                            text-white
                            leading-tight
                         "
                        >
                          {item.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-5 md:px-7">
                    <div
                      className="
                        text-sm
                        md:text-[15px]
                        leading-8
                        text-slate-300
                      "
                    >
                      <RenderTextWithHashtags text= {item.message}/>
                    </div>
                  </div>

                  {/* Hero Image */}
                  {item.poster && item.poster !== "undefined" && (
                    <div className="px-5 md:px-7 mt-6">
                      <div
                        className="
                          overflow-hidden
                          rounded-2xl
                          border
                          border-slate-800
                          bg-black
                          cursor-pointer
                        "
                        onClick={() =>
                          handleImageClick(
                            `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.poster}`,
                          )
                        }
                      >
                        <img
                          src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.poster}`}
                          alt=""
                          className="
                            w-full
                            max-h-[450px]
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-[1.02]
                          "
                        />
                      </div>
                    </div>
                  )}

                  {/* Resource Links */}
                  {item.links?.length > 0 && (
                    <div className="px-4  mt-6">
                      <div className="grid  md:grid-cols-4 gap-3">
                        {item.links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              flex
                              items-center
                              justify-between
                              rounded-2xl
                              border
                              border-slate-800
                              bg-slate-900/40
                              px-4
                              py-3
                              hover:border-emerald-500/30
                              hover:bg-emerald-500/5
                              transition-all
                            "
                          >
                            <div>
                              <p className="md:text-sm text-xs font-medium text-white">
                                {link.title}
                              </p>
                              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                {link.url}
                              </p>
                            </div>

                            <span className="text-emerald-400 text-lg">↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    className="
                      mt-6
                      border-t
                      border-slate-800
                      bg-slate-950/30
                      px-5
                      md:px-7
                      py-4
                    "
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link to={`/viewProfile/${item.authorEmail}`}>
                          {item?.profile && item.profile !== "undefined" ? (
                            <img
                              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.profile}`}
                              alt=""
                              className="
                                md:w-11 w-7 h-7 md:h-11
                                rounded-full
                                object-cover
                                border
                                border-slate-700
                              "
                            />
                          ) : (
                            <div className="md:w-11 w-7 h-7 md:h-11 rounded-full overflow-hidden border border-slate-700">
                              <HiOutlineUserCircle className="w-full h-full text-[#786fa6] bg-slate-300" />
                            </div>
                          )}
                        </Link>

                        <div>
                          <p className="md:text-[11px] text-[9px] uppercase tracking-wide text-slate-500">
                            Published by
                          </p>

                          <p className="md:text-sm text-xs font-semibold text-white">
                            {item.user}
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          hidden
                          md:flex
                          items-center
                          gap-2
                          text-xs
                          text-slate-500
                        "
                      >
                        Community Update
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {announceLoading && <AnnouncementSkeleton />}
          </main>
        </div>

             <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{
                opacity: 0,
                backdropFilter: "blur(0px)",
              }}
              animate={{
                opacity: 1,
                backdropFilter: "blur(12px)",
              }}
              exit={{
                opacity: 0,
                backdropFilter: "blur(0px)",
              }}
              transition={{
                duration: 0.25,
              }}
              onClick={handleCloseModal}
              className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/70
                p-4
              "
            >
              {/* Modal Container */}
              <motion.div
                layout
                onClick={(e) => e.stopPropagation()}
                initial={{
                  opacity: 0,
                  scale: 0.92,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: 10,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  relative
                  max-w-6xl
                  w-full
                  flex
                  items-center
                  justify-center
                "
              >
                {/* Image */}
                <motion.img
                  src={selectedImage}
                  alt="Preview"
                  initial={{
                    scale: 0.95,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.95,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    max-h-[50vh]
                    w-auto
                    rounded-2xl
                    shadow-2xl
                    border border-gray-700
                    object-contain
                  "
                />
        
                {/* Close Button */}
                <motion.button
                  onClick={handleCloseModal}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  transition={{
                    delay: 0.15,
                    duration: 0.2,
                  }}
                  whileHover={{
                    scale: 1.08,
                    rotate: 90,
                  }}
                  whileTap={{
                    scale: 0.92,
                  }}
                  className="
                    absolute
                    md:-top-4
                    md:-right-4
                    -top-3
                    -right-3
                    md:w-10
                    md:h-10
                    h-8
                    w-8
                    flex
                    items-center
                    justify-center
                    rounded-full
                    theme
                    border border-gray-700
                    text-white
                    shadow-lg
                    md:hover:bg-red-500
                    transition-colors
                  "
                >
                  <IoClose className="text-sm" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
      <Footer />
    </div>
  );
}

export default Announcement;
