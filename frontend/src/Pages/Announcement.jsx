import React, { useState, useEffect, useRef } from "react";
// import axiosInstance from 'axiosInstance';
import NavBar from "../ui/NavBar";
import {
  RiChatDeleteFill,
  RiDeleteBack2Fill,
  RiDeleteBin6Line,
} from "react-icons/ri";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
// import { format } from 'date-fns';
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

function Announcement() {
  const username = localStorage.getItem("username");
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  const profile = localStorage.getItem("profile");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState("");
  // const [image, setImage] = useState(null);
  const [deliveredTo, setDeliveredTo] = useState("");
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState([]);
  const [loading, setLoading] = useState(false);
  // const role = localStorage.getItem("role");
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
      // console.log("announcement", response.data.announcement);
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
        toast.success("Delivered ", "New announcement delivered ");
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
      toast.success("Deleted ", "Announcement removed successfully ");
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
        //   className={`
        //   w-full
        //   rounded-lg
        //   border border-emerald-500/20
        //   bg-gradient-to-br from-emerald-500/5 to-transparent
        //   p-4 md:p-5
        //   space-y-5
        //   ${className}
        //    ${showInfo ? "block" : "hidden md:block"}

        //   mb-4
        // `}
      >
        {/* Header */}
        {/* <div className="flex items-center gap-2">
        <h2 className="text-sm md:text-base font-semibold text-white tracking-wide">
        About Announcements
        </h2>
      </div> */}

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

        {/* What You Can Do */}
        {/* <div className="space-y-2">
        <p className="text-xs text-emerald-400 font-medium">What You Can Do</p>
        <ul className="space-y-1.5 text-xs md:text-sm text-gray-300">
          <li className="flex gap-2"><span>•</span> Stay updated on events</li>
          <li className="flex gap-2"><span>•</span> Access shared links & resources</li>
          <li className="flex gap-2"><span>•</span> View posters for quick insights</li>
        </ul>
      </div> */}

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
            {/* to ensure quality and relevance. */}
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
        //   className={`
        //   w-full
        //   rounded-lg
        //   border border-emerald-500/20
        //   bg-gradient-to-br from-emerald-500/5 to-transparent
        //   p-4 md:p-5
        //   space-y-5
        //   mb-6

        //   ${showGuidelines ? "block" : "hidden md:block"}

        //   ${showAnnouncement && "hidden md:hidden"}

        // `}
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
                rounded-md text-xs md:text-sm   text-emerald-400 transition "
        >
          Create Campaign
        </button>
      </div>
    );
  }

  const renderTextWithHashtags = (text) => {
    if (!text) return null;

    const cleanedText = text
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n");

    return cleanedText.split("\n").map((line, lineIndex) => {
      // Handle empty lines for spacing
      if (!line.trim()) {
        return <div key={lineIndex} className="h-3" />;
      }

      const parts = line.split(/(\*\*.*?\*\*|#{1,6}[^\n]+|\s?#\w+)/gm);

      return (
        <div
          key={lineIndex}
          className="
          text-gray-300
          text-sm
          md:text-[15px]
          leading-relaxed
          break-words
          mb-2
        "
        >
          {parts.map((part, index) => {
            if (!part) return null;

            const trimmed = part.trim();

            // ---------- Markdown Headings ----------
            if (/^#{1,6}/.test(trimmed)) {
              const level = trimmed.match(/^#{1,6}/)?.[0].length || 1;

              const headingClasses = {
                1: "text-xl md:text-2xl font-semibold text-white block my-4",
                2: "text-lg md:text-xl font-semibold text-white block my-3",
                3: "text-base md:text-lg font-semibold text-white block my-2",
                4: "text-sm md:text-base font-semibold text-white block my-2",
                5: "text-sm font-semibold text-white block my-1",
                6: "text-xs font-semibold text-white block my-1",
              };

              return (
                <div key={index} className={headingClasses[level]}>
                  {trimmed.replace(/^#{1,6}\s*/, "")}
                </div>
              );
            }

            // ---------- Bold ----------
            if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
              return (
                <strong
                  key={index}
                  className="
                  font-semibold
                  text-white
                "
                >
                  {trimmed.replace(/\*\*/g, "")}
                </strong>
              );
            }

            // ---------- Unordered List ----------
            if (/^- /.test(trimmed)) {
              return (
                <div
                  key={index}
                  className="
                  flex
                  items-start
                  gap-2
                  my-1
                  text-gray-300
                  leading-relaxed
                "
                >
                  <span className="text-white mt-[2px]">•</span>

                  <span>{trimmed.replace(/^- /, "")}</span>
                </div>
              );
            }

            // ---------- Ordered List ----------
            if (/^\d+\.\s/.test(trimmed)) {
              const number = trimmed.match(/^\d+/)?.[0];

              return (
                <div
                  key={index}
                  className="
                  flex
                  items-start
                  gap-2
                  my-1
                  text-gray-300
                  leading-relaxed
                "
                >
                  <span className="text-white">{number}.</span>

                  <span>{trimmed.replace(/^\d+\.\s/, "")}</span>
                </div>
              );
            }

            // ---------- Hashtags ----------
            if (/^(\s)?#\w+/.test(part)) {
              return (
                <span
                  key={index}
                  className="
                  text-white
                  font-medium
                "
                >
                  {part}
                </span>
              );
            }

            // ---------- Normal Text ----------
            return (
              <React.Fragment key={index}>
                {part.replace(/\\\*/g, "*").replace(/\\\\/g, "\\")}
              </React.Fragment>
            );
          })}
        </div>
      );
    });
  };
  const renderTextWithHashtags2 = (text) => {
    if (!text) return null;

    const cleanedText = text
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n");

    return cleanedText.split("\n").map((line, lineIndex) => {
      const parts = line.split(/(\*\*.*?\*\*|#{1,6}[^\n]+|\s?#\w+)/gm);

      return (
        <React.Fragment key={lineIndex}>
          {parts.map((part, index) => {
            if (!part) return null;

            const trimmed = part.trim();

            // ---------- Markdown Headings ----------
            // Supports:
            // ###Heading
            // ### Heading
            if (/^#{1,6}/.test(trimmed)) {
              return (
                <span
                  key={index}
                  className="font-semibold  md:text-sm text-xs text-white"
                >
                  {trimmed.replace(/^#{1,6}\s*/, "")}
                </span>
              );
            }

            // ---------- Bold ----------
            if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
              return (
                <span
                  key={index}
                  className="font-semibold md:text-sm text-xs text-white"
                >
                  {trimmed.replace(/\*\*/g, "")}
                </span>
              );
            }

            // ---------- Hashtags ----------
            if (/^(\s)?#\w+/.test(part)) {
              return (
                <span
                  key={index}
                  className="text-white md:text-sm text-xs font-medium"
                >
                  {part}
                </span>
              );
            }

            // ---------- Normal ----------
            return (
              <React.Fragment key={index}>
                {part.replace(/\\\*/g, "*").replace(/\\\\/g, "\\")}
              </React.Fragment>
            );
          })}

          <br />
        </React.Fragment>
      );
    });
  };

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
          "Announcements Cleared",
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
    <div className="min-h-screen  bg-[#0f172a] text-slate-200">
      <NavBar />
      <div className="min-h-screen max-w-[1800px] mx-auto w-full">
        {/* ================= HEADER ================= */}
        <div className="w-full">
          <div className="w-full mx-auto px-4 md:px-20 pt-4 pb-5 md:pt-6 flex justify-between items-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="md:text-3xl text-xl font-semibold  tracking-tight  flex items-center gap-1 justify-center">
                <MdAnnouncement className="tetxt-xl pt-0.5 md:pt-0 md:text-3xl " />{" "}
                Announcements
              </h1>

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
              // <button
              //   onClick={() => {
              //     setShowGuidelines(!showGuidelines);
              //     setShowAnnouncement(false);
              //   }}
              //   className="
              //     md:hidden
              //     group
              //     inline-flex
              //     items-center
              //     md:gap-2
              //     gap-1.5
              //     md:px-4
              //     md:py-2.5
              //     px-2
              //     py-1
              //     md:rounded-xl
              //     rounded-lg
              //     bg-[#111827]
              //     border
              //     border-slate-700
              //     text-slate-200
              //     md:text-xs
              //     text-[11px]
              //     font-medium
              //     md:hover:border-emerald-500/40
              //     md:hover:bg-emerald-500/5
              //     transition-all
              //     duration-500
              //   "
              // >
              //   <div
              //     className="
              //       md:w-6
              //       md:h-6
              //       w-5
              //       h-5
              //       rounded-full
              //       flex
              //       items-center
              //       justify-center
              //       bg-emerald-500/10
              //       text-emerald-400
              //       group-hover:bg-emerald-500/15
              //     "
              //   >
              //     {showGuidelines ? <X size={11} /> : <Plus size={11} />}
              //   </div>

              //   <span>{showGuidelines ? "Close Panel" : "Create New"}</span>
              // </button>
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
                  gap-1.5
                  px-2
                  py-1
                  rounded-lg
                  bg-[#111827]
                  border
                  border-slate-700
                  text-slate-200
                  text-[11px]
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
            className="lg:sticky lg:overflow-y-scroll lg:h-screen scrollbar-hide top-7 self-start"
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
         <div className="bg-[#111827] border border-emerald-500/20  rounded-lg  mb-6 md:mb-0 p-6 space-y-6">
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
                            className="w-full mt-1 px-3 py-2 bg-[#0f172a] border border-slate-700
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
                            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg p-1">
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
                          {/* <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Announcement message..."
                            className="w-full mt-1 px-3 py-2 bg-[#0f172a] border border-slate-700
                     rounded-md focus:outline-none emerald-scrollbar focus:border-emerald-500/20 text-slate-300 leading-relaxed text-xs"
                          /> */}

                          {/* Editor / Preview Wrapper */}
                          <div className="relative">
                            {/* Top subtle glow */}
                            <div className="absolute inset-0 rounded-xl bg-emerald-500/[0.02] pointer-events-none" />

                            {preview ? (
                              <div
                                className="
                          w-full   min-h-24 h-[150px]
                          overflow-y-auto
                          emerald-scrollbar
                          px-4 py-3
                          rounded-md
                          bg-gray-900
                          border border-gray-700
                          text-white text-xs 
                          leading-relaxed
                         break-words
                         
                          whitespace-pre-wrap
                        "
                              >
                                {message?.trim()?.length > 0 ? (
                                  renderTextWithHashtags2(message)
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
                                className="w-full mt-2  focus:border focus:border-emerald-500/40 emerald-scrollbar px-4 py-3 rounded-md bg-gray-900 border border-gray-700 outline-none  text-white text-xs leading-relaxed"
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
                              className="w-1/2 px-3 py-2 bg-[#0f172a] border border-slate-700
                     rounded-md focus:outline-none focus:border-emerald-500/20 text-xs"
                            />
                            <input
                              type="url"
                              value={currentLinkUrl}
                              onChange={(e) =>
                                setCurrentLinkUrl(e.target.value)
                              }
                              placeholder="Link URL"
                              className="w-1/2 px-3 py-2 bg-[#0f172a] border border-slate-700
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
                                    "Invalid URL",
                                    "Please enter a valid http(s) URL.",
                                  );
                                }
                                   else if(!titleToUse){
                           toast.error(
                            "Invalid URL Title",
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
                            <div className="w-full h-32  mt-3 rounded-xl flex items-center justify-center bg-gray-700">
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
                                className="w-full h-32 object-cover rounded-md border border-slate-700"
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
                            className="mt-1 block w-full px-3 py-2 bg-[#0f172a]
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
                          <div className="bg-slate-800 border border-gray-700 rounded-md p-4">
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
                          disabled={loading}
                          className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-500/20
                          text-emerald-400 text-xs md:text-sm flex items-center justify-center gap-2 rounded-md transition"
                        >
                          <VscGitStashApply className="md:text-base text-sm " />{" "}
                          {loading ? "Publishing..." : "Publish"}
                        </button>
                      </form>
                    </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* DANGER ZONE */}
                {/* {role === "admin" && (
              <div className="bg-[#111827] border border-red-900 rounded-lg p-5">
                <h3 className="text-xs uppercase tracking-wide text-red-400 mb-4">
                  Danger Zone
                </h3>

                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full py-2 rounded-md
                             bg-red-600 hover:bg-red-500
                             text-white text-sm transition"
                >
                  Delete All Announcements
                </button>
              </div>
            )} */}
              </>
            )}
          </aside>

          {/* ================= MAIN FEED ================= */}
          <main
            className={`space-y-6 md:space-y-8 md:block ${showGuidelines && "hidden md:block"}`}
          >
            {/* <div
              className={`${role !== "student" ? "bg-[#111827] border border-slate-800 rounded-lg p-5" : "bg-[#111827] border border-slate-800 rounded-lg p-5"}`}
            >
              <div className="flex items-center justify-between ">
                <h3 className="text-xs uppercase tracking-wide text-emerald-400 font-semibold mb-4">
                  Overview
                </h3>

                {announcement.length > 0 && (
                  <button
                    onClick={() => {
                      clearAllAnnouncements();
                    }}
                    className="text-xs md:text-sm text-red-500 md:hover:text-red-600 transition-all duration-300 cursor-poiter"
                  >
                    <RiDeleteBin6Line />
                  </button>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex  justify-between">
                  <span className="text-white/70 font-medium">User Role</span>
                  <span className="capitalize text-slate-400 ">{role}</span>
                </div>

                <div className="flex text-sm justify-between">
                  <span className="text-white/70 font-medium">Inbox</span>
                  <span className="text-slate-400  ">
                    {announcement?.length > 0
                      ? announcement.length
                      : "Empty"}{" "}
                  </span>
                </div>
              </div>
            </div> */}

            <div
              className="rounded-3xl relative group overflow-hidden rounded-lg
        border border-emerald-500/20
        bg-gradient-to-br from-emerald-500/5 to-transparent  p-4 md:p-5
        "
            >
              {/* <div className="absolute top-0 left-0 mx-auto rounded-full right-0 h-[2px] bg-white/70" /> */}
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                    Overview
                  </p>
                  <h3 className="text-sm text-white mt-1">Community Summary</h3>
                </div>

                {announcement.length > 0 && (
                  <button
                    onClick={clearAllAnnouncements}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    title="Clear all announcements"
                  >
                    <RiDeleteBin6Line className="text-base" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">User Role</span>

                  <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs capitalize text-gray-200">
                    {role}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Inbox</span>

                  <span className="text-sm font-medium text-white">
                    {announcement?.length > 0 ? announcement.length : "Empty"}
                  </span>
                </div>
              </div>
            </div>

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
              reversedAnnouncements.map((item) => (
                // <div
                //   key={item._id}
                //   className="bg-[#111827] border border-slate-800 rounded-lg p-4 md:p-7 space-y-6"
                // >
                //   <div className="flex justify-between items-start">
                //     <div>
                //       <h2 className="md:text-xl text-lg max-w-[360px] md:max-w-full font-semibold text-white">
                //         {item.title}
                //       </h2>
                //       <div className="text-xs text-slate-400 mt-1">
                //         {/* {item.timestamp?.slice(0, 10)} */}
                //         {getTimeAgo(item.timestamp)}
                //       </div>
                //     </div>

                //     <button
                //       onClick={() => deleteAnnouncement(item._id)}
                //       // className="text-slate-500 border border-neutral-700 md:border-neutral-700 md:rounded  md:p-0.5  text-xs md:text-sm hover:text-red-400 transition"
                //     >
                //       {/* ✕ */}
                //       {/* <IoMdClose /> */}
                //       <AiFillCloseSquare className="text-lg md:text-xl text-gray-700 font-normal  md:hover:text-gray-600 transition-all duration-300" />
                //     </button>
                //   </div>

                //   <div className="md:text-sm text-xs leading-relaxed text-slate-300 ">
                //     {/* {item.message} */}
                //     {renderTextWithHashtags(item.message)}
                //   </div>

                //   {item.poster && item.poster !== "undefined" && (
                //     <div className="rounded-md overflow-hidden border cursor-pointer border-slate-700">
                //       <img
                //         src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.poster}`}
                //         alt=""
                //         className="w-full h-48 md:h-[400px] object-contain bg-black"
                //         onClick={() =>
                //           handleImageClick(
                //             `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.poster}`,
                //           )
                //         }
                //       />
                //     </div>
                //   )}

                //   {/* LINKS */}
                //   {item.links?.length > 0 && (
                //     <div className="flex flex-wrap gap-2">
                //       {item.links.map((link, i) => (
                //         <a
                //           key={i}
                //           href={link.url}
                //           target="_blank"
                //           rel="noopener noreferrer"
                //           className="px-2 md:px-3 md:py-1 py-1 rounded-2xl
                //                  border border-slate-700
                //                  text-xs text-emerald-400
                //                  hover:bg-emerald-600/10 transition"
                //         >
                //           {link.title}
                //         </a>
                //       ))}
                //     </div>
                //   )}

                //   {/* VIEW POST SECTION RESTORED */}
                //   <div className="flex justify-between items-center text-xs text-slate-500 pt-2 md:pt-2 md:border-t border-slate-800">
                //     <div className="flex items-center gap-2 md:gap-3">
                //       <Link to={`/viewProfile/${item.authorEmail}`}>
                //         {item?.profile && item.profile !== "undefined" ? (
                //           <img
                //             src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.profile}`}
                //             alt="Author"
                //             className="md:w-9 md:h-9 w-8 h-8 rounded-full object-cover border border-gray-200"
                //           />
                //         ) : (
                //           <div className="md:w-9 md:h-9 w-8 h-8 rounded-full object-cover border border-gray-300">
                //             <HiOutlineUserCircle className="text-[#786fa6] bg-gray-300 rounded-full w-full h-full " />
                //           </div>
                //         )}
                //       </Link>
                //       <div className="text-[10px] text-gray-500 md:text-gray-400">
                //         Posted by{" "}
                //         <p className="text-gray-200 text-xs font-semibold">
                //           {item.user}
                //         </p>
                //       </div>
                //     </div>
                //   </div>
                // </div>

                <div
                  key={item._id}
                  className="
                      group
                      relative
                      overflow-hidden
                      rounded-3xl
                      border border-slate-800/80
                      bg-gradient-to-b
                      from-[#0f172a]
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
                  {/* <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500" /> */}
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
                      {renderTextWithHashtags(item.message)}
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
                    <div className="px-5 md:px-7 mt-6">
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
                              <p className="text-sm font-medium text-white">
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
                                w-11
                                h-11
                                rounded-full
                                object-cover
                                border
                                border-slate-700
                              "
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-700">
                              <HiOutlineUserCircle className="w-full h-full text-[#786fa6] bg-slate-300" />
                            </div>
                          )}
                        </Link>

                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            Published by
                          </p>

                          <p className="text-sm font-semibold text-white">
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

        {/* {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
  
            <div className="relative max-w-6xl w-full flex items-center justify-center">
           
              <img
                src={selectedImage}
                alt="Preview"
                className="
                        max-h-[50vh]
                        w-auto
                        rounded-2xl
                        shadow-2xl
                        border border-gray-700
                        object-contain
                        transition-transform duration-300
                   
                      "
              />
              <button
                onClick={handleCloseModal}
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
                        bg-gray-900
                        border border-gray-700
                        text-white
                        shadow-lg
                        md:hover:bg-red-500
                        transition-all
                      "
              >
                <IoClose className="text-sm" />
              </button>
            </div>
          </div>
        )} */}
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
                    bg-gray-900
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
