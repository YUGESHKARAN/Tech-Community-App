import React, { useState, useEffect, useRef } from "react";
import NavBar from "../ui/NavBar";

import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiOutlineUserCircle } from "react-icons/hi";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { FaLinkedin, FaUserAlt } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";
import { ImProfile } from "react-icons/im";

import { PiLinkSimpleFill } from "react-icons/pi";
import { MdEdit } from "react-icons/md";
import toast from "../components/toaster/Toast";
import { getItem, removeItem, storeItem } from "../utils/encode";
import ProfilePageSkeleton from "../components/loaders/ProfilePageSkeleton";
import AchievementSection from "../components/Achievements";
import BadgeIcons from "../components/achievements/BadgeIcons";
import { motion, AnimatePresence } from "framer-motion";
import formatCount from "../utils/NumberConversion";
import { IoClose } from "react-icons/io5";
import useGetFollowersDetails from "../hooks/useGetFollowersDetails";
function ProfilePage() {
  const { logout } = useAuth();
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  // const role = localStorage.getItem("role");
  const role = getItem("role");
  const [author, setAuthor] = useState({});
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [image, setImage] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [bioDescription, setBioDescription] = useState("");
  const [editProfile, setEditProfile] = useState(false);

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

  const [links, setLinks] = useState([]);
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [linkId, setLinkId] = useState(null); // New state for link ID
  const [profileLinks, setProfileLinks] = useState([]); // New state for profile links
  const [showLinkBox, setShowLinkBox] = useState(false); // State to toggle link input box
  const [customTitle, setCustomTitle] = useState("");
  const [updateButton, setUpdateButton] = useState(false);
  const [posts, setPosts] = useState([]);
  const [password, setPassword] = useState("");
  const userName = getItem("username");
  const [loader, setLoader] = useState(false);
  const [bioEdit, setBioEdit] = useState(true);
  const deleteAuthor = async () => {
    setShowConfirm(true);

    if (!password) {
      toast.warning(
        "Required",
        "Your password is required to delete the account",
      );
      setShowConfirm(false);
      return "";
    }
    setLoading(true);

    try {
      // const response = await axiosInstance.delete(`/blog/author/${email}`,
      const response = await axiosInstance.delete(
        `/blog/admin/delete/${email}`,
        {
          data: { password },
        },
      );

      response.status === 200 && logout();
    } catch (err) {
      console.log(err);
      toast.error("Unauthorized", "Unable to delete the account");
    } finally {
      setLoading(false);
      setPassword("");
      setShowConfirm(false);
    }
  };

  const fetchAuthor = async () => {
    try {
      setLoader(true);
      const response = await axiosInstance.get(`/blog/author/${email}`);
      const authorData = response.data;
      setAuthorName(authorData.authorname);
      setAuthorEmail(authorData.email);
      setAuthor(response.data);
      setImage(response.data.profile);
      setFollowers(authorData.followers);
      setFollowing(authorData.following);
      setProfileLinks(authorData.personalLinks);
      setBioDescription(authorData.bio);
      setPosts(authorData.posts);
    } catch (err) {
      console.log(err);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    fetchAuthor();
  }, []);

  const onImageChange = (e) => {
    setImage(e.target.files[0]);
    setUpdateButton(true);

    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      // You can also send this file to backend here if needed
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setLoading(true);
    const formData = new FormData();
    formData.append("authorname", authorName);
    // localStorage.setItem("username", authorName);
    storeItem("username", authorName);
    formData.append("email", authorEmail);
    formData.append("links", JSON.stringify(links));
    formData.append("bio", bioDescription);

    if (image !== "") {
      formData.append("profile", image);
    }

    try {
      const response = await axiosInstance.put(
        `/blog/author/${email}`,
        // `/blog/author/${email}`,
        formData,
      );

      if (response.status === 201) {
        // navigate("/home"); // Redirect to the homepage
        toast.success("Updated", "Account details updated successfully");
        setLinks([]);
        fetchAuthor();
        setLinkId(null); // Reset link ID after submission
        setShowLinkBox(false);
      }

      // console.log("links", links);
    } catch (error) {
      console.log("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
      setUpdateButton(false);
      setBioEdit(false);
      setEditProfile(false);
    }
  };

  const removeLinks = async (authorEmail, linkId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this link?",
      );
      if (!confirm) {
        setLoading(false);
        return; // If user cancels, exit the function
      }
      const response = await axiosInstance.delete(
        `/blog/author/personalLinks/${authorEmail}/links/${linkId}`,
      );
      if (response.status === 200) {
        setProfileLinks((prev) => prev.filter((link) => link._id !== linkId));
        toast.success("Removed", "Bio link removed successfully");
        // fetchAuthor();
        setShowLinkBox(false);
      }
    } catch (err) {
      toast.error("Error", "Error removing bio link");
      console.log("error", err);
    } finally {
      if (profileLinks === 0) setEditProfile(false);
    }
  };

  const RoleBadge = ({ role }) => {
    const styles = {
      admin: { bg: "#ec489918", color: "#ec4899", label: "Admin" },
      coordinator: { bg: "#f59e0b18", color: "#f59e0b", label: "Coordinator" },
      student: { bg: "#3b82f618", color: "#3b82f6", label: "Student" },
    };
    const s = styles[role] ?? styles.student;
    return (
      <span
        className="text-xs font-semibold px-2.5 py-1 md:px-3 md:py-1.5 md:text-xs border border-amber-400/20 rounded-lg"
        style={{ backgroundColor: s.bg, color: s.color }}
      >
        {s.label}
      </span>
    );
  };

  const achievementRef = useRef(null);

  const [highlightAchievement, setHighlightAchievement] = useState(false);

  const scrollToAchievements = () => {
    achievementRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setHighlightAchievement(true);

    setTimeout(() => {
      setHighlightAchievement(false);
    }, 1000);
  };

  const [showFollows, setShowFollows] = useState(false);
  const [followLabel, setFollowLabel] = useState("");
  const {followLoading, followersDetails, followingDetails, getFollowersDetails} = useGetFollowersDetails(email);

  useEffect(()=>{
    getFollowersDetails(email);
  }, [email])

  const avatarColor = (name) => {
    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
    ];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  };

  const initials = (name) => name?.slice(0, 2).toUpperCase() ?? "??";

  // console.log("author", author)
  // console.log("userName", userName)
  // console.log("profile links", profileLinks)
  // console.log("followers", followersDetails)
  // console.log("followingDetails", followingDetails)

  return (
    <>
      <div className=" bg-gray-900 text-white">
        <NavBar />

        {!loader ? (
          <div className="w-full min-h-screen 3xl:max-w-[1800px]  max-w-7xl mx-auto mx-auto px-4 md:px-6 pt-2   pb-8 pb-24">
            {/* ── Page header ──────────────────────────────────────── */}

            <div className="flex items-center justify-between mb-0 md:mb-8 px-1">
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300 mb-0.5">
                  Account
                </p>

                <h1 className="text-xl md:text-3xl font-medium tracking-tight text-emerald-400">
                  My Profile
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {/* Edit Profile */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => {
                    setEditProfile((prev) => !prev);
                    setBioEdit(false);
                  }}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-1.5
                    px-2
                    md:px-3.5
                    md:py-2
                    py-1.5
                    rounded-lg
                    bg-[#111827]
                    border
                    border-slate-700
                    text-slate-200
                    text-[11px]
                    font-medium
                  "
                >
                  <MdEdit className="text-sm  text-emerald-400" />

                  <motion.span
                    key={editProfile ? "Close Editing" : "Edit Profile"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {editProfile ? "Close Editing" : "Edit Profile"}
                  </motion.span>
                </motion.button>

                {/* Delete Account */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowConfirm(true)}
                  className="
                    flex items-center gap-2
                    md:px-3.5 md:py-2
                    px-2 py-1.5
                    rounded-lg
                    border border-red-500/20
                    bg-red-500/10
                    text-red-400
                    hover:bg-red-500/15
                    transition-all duration-300
                  "
                >
                  <RiDeleteBin6Line size={14} />

                  <span className="hidden md:inline text-xs font-medium">
                    Delete Account
                  </span>
                </motion.button>
              </div>
            </div>

            {/* ── Two-column layout ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]  md:gap-4 mt-4 md:mt-0 mb-3 items-start">
              {/* ══ LEFT — Profile card ══════════════════════════════ */}
              <div className="md:sticky md:top-6 relative self-start bg-gray-900/50 border md:border-white/[0.1] border-white/[0.09] rounded-2xl mt-0 p-6 pb-3 text-center">
                {/* Avatar */}

                <div className="flex items-start md:items-center md:flex-col mt-9 w-full  justify-start gap-1.5 md:gap-2">
                <div className="relative md:w-24 w-16 shrink-0 ">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-14 h-14 md:w-24 md:h-24 rounded-full object-cover border md:border-2 border-emerald-500/60"
                    />
                  ) : author.profile ? (
                    <img
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                      alt="Profile"
                      className="w-14 h-14 md:w-24 md:h-24 rounded-full object-cover border md:border-2 border-emerald-500/60"
                    />
                  ) : (
                    <div className="w-14 h-14 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-gray-800 border-2 border-white/10">
                      <HiOutlineUserCircle className="text-gray-600 text-7xl md:text-8xl" />
                    </div>
                  )}
                  {editProfile && (
                    <>
                      {" "}
                      <label
                        htmlFor="image"
                        className="absolute bottom-1 right-1 w-4 h-4 flex items-center justify-center bg-gray-700 hover:bg-gray-600 border border-white/10 text-emerald-400 rounded-full cursor-pointer transition-colors"
                        title="Change photo"
                      >
                        <MdEdit className="text-xs" />
                      </label>
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={onImageChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {/* Name */}
                <div className="flex w-full  flex-col justify-start">
               {!editProfile?
               <>
                <h2 className=" md:text-xl text-xl truncate  line-clamp-4 text-wrap text-left md:text-center break-all font-medium leading-snug text-white my-1">
                  {userName || "—"}
                </h2>
                <p className="text-xs truncate text-left text-wrap md:text-center line-clamp-4 text-wrap break-all text-gray-500">
                  {authorEmail}
                </p>
                </>:
                 <input
                        type="text"
                        id="authorName"
                        disabled={!editProfile}
                        value={authorName}
                        onChange={(e) => {
                          setAuthorName(e.target.value);
                          setUpdateButton(true);
                        }}
                        className={`w-full px-2 py-2 md:mt-2 text-xs border border-emerald-700 bg-transparent  rounded-lg text-gray-300 outline-none  focus:border-emerald-500/40
                        focus:ring-2
                        focus:ring-emerald-500/10
                        transition-all duration-200 placeholder:text-gray-600`}
                        placeholder="Your name"
                        required
                      />}

              
                {/* Role pill */}
                <span className=" absolute left-4 top-4 ">
                {/* <span className=" mt-2"> */}
                  <RoleBadge role={role} />
                </span>
                </div>
                </div>

                {author?.role !== "student" && (
                  <div
                    onClick={scrollToAchievements}
                    className="cursor-pointer"
                  >
                    <BadgeIcons  parentClass="right-6" badges={author?.badges} />
                  </div>
                )}

                {/* Bio Section */}
                <div className="my-5 px-1 text-left">
                  <div
                    className={`flex items-center gap-1 mb-2 ${bioEdit && "justify-between"}`}
                  >
                    <p className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">
                      About
                    </p>

            
                  </div>

                  {!editProfile ? (
                    <div
                      className="
                        w-full
                        text-xs 
                        leading-relaxed
                        whitespace-pre-wrap
                        text-gray-300
                        break-words
                        
                      "
                    >
                      {bioDescription?.trim()?.length > 0 ? (
                        bioDescription
                      ) : (
                        <span className="text-gray-500  text-xs md:text-xs">
                          Add a short bio, let others know about you...
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        rows={4}
                        maxLength={220}
                        value={bioDescription}
                        onChange={(e) => {
                          setBioDescription(e.target.value);
                          setUpdateButton(true);
                        }}
                        placeholder="Write a short bio..."
                        className="
                        w-full
                        rounded-lg
                        bg-gray-900
                        border border-emerald-700
                        p-3
                        text-xs
                        text-white
                        placeholder:text-gray-500
                        outline-none
                        resize-none
                        leading-relaxed
                        focus:border-emerald-500/40
                        focus:ring-2
                        focus:ring-emerald-500/10
                        transition-all duration-200
                        emerald-scrollbar
                      "
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">
                          {bioDescription?.length}/220
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                {
                  !editProfile && (followers?.length > 0 ||
                    following?.length > 0 ||
                    posts.length > 0) && (
                    <div className="flex justify-center gap-px mb-6 rounded-xl overflow-hidden border border-white/[0.06]">
                      {author.role === "coordinator" &&
                        followers?.length > 0 && (
                          <div
                            onClick={() => {
                              setFollowLabel("Followers");
                              setShowFollows(true);
                            }}
                            className="flex-1 py-3 cursor-pointer bg-white/[0.02]"
                          >
                            <p className="text-base font-medium text-white">
                              {formatCount(followers?.length ?? 0)}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Followers
                            </p>
                          </div>
                        )}

                      {author.role !== "student" && posts.length > 0 ? (
                        <Link to="/yourposts" className="flex-1">
                          <div className="py-3 bg-white/[0.02] hover:bg-emerald-500/5 transition-colors h-full">
                            <p className="text-base font-medium text-emerald-400">
                              {formatCount(posts.length)}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Posts
                            </p>
                          </div>
                        </Link>
                      ) : author.role !== "student" ? (
                        <div className="flex-1 py-3 bg-white/[0.02]">
                          <p className="text-base font-medium text-gray-600">
                            0
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Posts
                          </p>
                        </div>
                      ) : null}

                      {following?.length > 0 && (
                        <div
                          onClick={() => {
                            setFollowLabel("Followings");
                            setShowFollows(true);
                          }}
                          className="flex-1 py-3 cursor-pointer bg-white/[0.02]"
                        >
                          <p className="text-base font-medium text-white">
                            {formatCount(following?.length ?? 0)}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Following
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* ══ RIGHT — Form ═ ════════════════════════════════════ */}
              <form
                onSubmit={handleSubmit}
                className="bg-gray-900/50 border border-white/[0.09] md:border-white/[0.1] rounded-2xl mt-4 md:mt-0  p-6 "
              >
                <div className="md:grid flex flex-col md:grid-cols-1 gap-6">
                  
                  {/* ── form column ─────────────────────────────── */}
                  <div className="space-y-5">

                     {!editProfile && author.community?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300">
                          Communities{" "}
                          {author.role === "coordinator"
                            ? "coordinating"
                            : "joined"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {author.community.map((com, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 text-[10px] font-medium bg-white/[0.03] text-gray-400 border border-white/[0.06] rounded-full"
                            >
                              {com}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    
                    {/* Bio Links */}
                    <div>
                      <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300 mb-3">
                        Bio Links
                      </p>

                      {profileLinks?.length > 0 ? (
                        <div className="space-y-2">
                          {profileLinks.map((link, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-3 px-3.5 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                                  {link.title === "LinkedIn" ? (
                                    <FaLinkedin className="text-base " />
                                  ) : link.title === "GitHub" ? (
                                    <FaSquareGithub className="text-base " />
                                  ) : link.title === "Portfolio" ? (
                                    <BsPersonSquare className="text-base " />
                                  ) : (
                                    <PiLinkSimpleFill className="text-base " />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-300">
                                    {link.title}
                                  </p>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-400 hover:text-blue-500 transition-colors truncate block max-w-[180px]"
                                  >
                                    {userName}/{link.title}
                                  </a>
                                </div>
                              </div>

                              {editProfile && (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentLinkTitle(link.title);
                                      setCurrentLinkUrl(link.url);
                                      setLinkId(link._id);
                                      setLinks((prev) =>
                                        prev.filter((_, i) => i !== index),
                                      );
                                      setShowLinkBox(true);
                                      setUpdateButton(true);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                    title="Edit"
                                  >
                                    <MdEdit className="text-xs" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeLinks(authorEmail, link._id)
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                    title="Remove"
                                  >
                                    <IoIosRemoveCircleOutline className="text-xs" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`px-4 py-8 bg-white/[0.015] border flex flx-col items-center justify-center  border-dashed ${editProfile? 'md:h-[140px]':'md:h-[260px]'} border-white/[0.08] rounded-xl text-center`}>
                          <div>
                          <PiLinkSimpleFill className="text-2xl text-gray-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Add your LinkedIn, GitHub, portfolio or other
                            profile links.
                          </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Add Link form — mobile only */}
                   {editProfile && (
                      <div
                        className={`${
                          profileLinks.length >= 5 && !showLinkBox
                            ? "hidden"
                            : ""
                        } `}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300">
                            {showLinkBox
                              ? "Edit Link"
                              : 5 - profileLinks.length > 0
                                ? `${5 - profileLinks.length} slot${
                                    5 - profileLinks.length > 1 ? "s" : ""
                                  } remaining`
                                : "Add Link"}
                          </p>
                          {currentLinkTitle.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentLinkTitle("");
                                setCurrentLinkUrl("");
                                setShowLinkBox(false);
                              }}
                              className="text-[11px] px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {(profileLinks?.length + links?.length < 5 ||
                          showLinkBox) && (
                          <div className="flex flex-col gap-2.5">
                            <div className="md:flex grid grid-cols-1 items-center gap-2.5">

                          
                            {currentLinkTitle !== "Others" ? (
                              <select
                                value={currentLinkTitle}
                                onChange={(e) =>
                                  setCurrentLinkTitle(e.target.value)
                                }
                                className="w-full focus:border focus:border-emerald-500/40  focus:border-emerald-500/40
                        focus:ring-2
                        focus:ring-emerald-500/10
                        transition-all duration-200  px-4 py-2 cursor-pointer rounded-xl bg-gray-900 border border-gray-700 outline-none text-xs md:text-sm text-white"
                              >
                                <option value="" disabled>
                                  Add Bio Link
                                </option>
                                {!profileLinks.some(
                                  (l) =>
                                    l.title === "GitHub" &&
                                    currentLinkTitle !== "GitHub",
                                ) && <option value="GitHub">GitHub</option>}
                                {!profileLinks.some(
                                  (l) =>
                                    l.title === "LinkedIn" &&
                                    currentLinkTitle !== "LinkedIn",
                                ) && <option value="LinkedIn">LinkedIn</option>}
                                {!profileLinks.some(
                                  (l) =>
                                    l.title === "Portfolio" &&
                                    currentLinkTitle !== "Portfolio",
                                ) && (
                                  <option value="Portfolio">Portfolio</option>
                                )}
                                {showLinkBox &&
                                  profileLinks.map((row) => (
                                    <option key={row.title} value={row.title}>
                                      {row.title}
                                    </option>
                                  ))}
                                <option value="Others">Others</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                placeholder="Platform name"
                                onChange={(e) => setCustomTitle(e.target.value)}
                                className="w-full focus:border focus:border-emerald-500/40 px-4 py-2 rounded-md bg-gray-900 border border-gray-700 outline-none  focus:border-emerald-500/40
                        focus:ring-2
                        focus:ring-emerald-500/10
                        transition-all duration-200 text-white text-xs md:text-sm"
                              />
                            )}

                            <input
                              type="url"
                              value={currentLinkUrl}
                              onChange={(e) =>
                                setCurrentLinkUrl(e.target.value)
                              }
                              placeholder="https://..."
                              className="w-full focus:border  focus:border-emerald-500/40
                        focus:ring-2
                        focus:ring-emerald-500/10
                        transition-all duration-200 focus:border-emerald-500/40 w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 outline-none  outline-none text-white text-xs md:text-sm"
                            />
                              </div>

                            <button
                              type="button"
                              disabled={!currentLinkUrl}
                              onClick={() => {
                                const titleToUse =
                                  currentLinkTitle === "Others"
                                    ? customTitle?.trim()
                                    : currentLinkTitle.trim();
                                const sanitizedUrl = sanitizeUrl(
                                  currentLinkUrl.trim(),
                                );
                                if (titleToUse && sanitizedUrl) {
                                  const newLink = {
                                    title: titleToUse,
                                    url: sanitizedUrl,
                                    id: linkId,
                                  };
                                  setLinks([...links, newLink]);
                                  setUpdateButton(true);
                                  setCurrentLinkTitle("");
                                  setCurrentLinkUrl("");
                                  setCustomTitle("");
                                  setLinkId(null);
                                } else if (titleToUse) {
                                  toast.error(
                                    "Invalid URL",
                                    "Please enter a valid http(s) URL.",
                                  );
                                } else if (!titleToUse) {
                                  toast.error(
                                    "Invalid URL Title",
                                    "Please enter a valid URL Title.",
                                  );
                                }
                              }}
                              className={`self-start px-4 py-2 text-xs font-medium border disabled:border-neutral-700 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors 
                            ${
                              currentLinkUrl
                                ? "scale-105 animate-pulse border border-emerald-500"
                                : ""
                            } disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                            >
                              {showLinkBox ? "Update Link" : "Add Link"}
                            </button>
                          </div>
                        )}

                       
                        {links.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {links.map((link, index) => (
                              <div
                                key={`${link.title}-${index}`}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {link.title === "LinkedIn" ? (
                                    <FaLinkedin className="text-base  flex-shrink-0" />
                                  ) : link.title === "GitHub" ? (
                                    <FaSquareGithub className="text-base  flex-shrink-0" />
                                  ) : link.title === "Portfolio" ? (
                                    <BsPersonSquare className="text-base  flex-shrink-0" />
                                  ) : (
                                    <PiLinkSimpleFill className="text-base  flex-shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-300">
                                      {link.title}
                                    </p>
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-blue-400 hover:underline truncate block max-w-[180px]"
                                    >
                                      {link.url}
                                    </a>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setLinks((prevLinks) =>
                                      prevLinks.filter((_, i) => i !== index),
                                    )
                                  }
                                  className="text-red-400/60 hover:text-red-400 transition-colors flex-shrink-0"
                                >
                                  <IoIosRemoveCircleOutline className="text-base" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Submit row ──────────────────────────────────────── */}
                {updateButton && editProfile && (
                  <div className="mt-7 md:mt-4 ">
                    <button
                      type="submit"
                      disabled={loading || !updateButton}
                      className="px-5 py-2.5 text-xs md:text-sm rounded-lg scale-105 animate-pulse bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:bg-gray-700/50 disabled:border-none disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating…" : "Update My Profile"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {author?.role !== "student" && !editProfile && (
              <motion.div
                ref={achievementRef}
                animate={
                  highlightAchievement
                    ? {
                        scale: [1, 1.01, 1],
                      }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                <AchievementSection
                  badges={author?.badges}
                  achievementRef={achievementRef}
                />
              </motion.div>
            )}
          </div>
        ) : (
          <ProfilePageSkeleton />
        )}

        {/* ── Delete confirm modal ──────────────────────────────────── */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm bg-gray-900 border border-white/[0.08] rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                  <RiDeleteBin6Line className="text-red-400 text-base" />
                </div>
                <h2 className="text-base font-medium text-white">
                  Delete Account
                </h2>
              </div>

              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                This action is permanent. All your data and profile information
                will be erased and may not be recovered.
              </p>

              <div className="mb-5">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-emerald-800 outline-none rounded-lg text-gray-300 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 placeholder:text-gray-600"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-white/[0.04] text-gray-300 border border-gray-700 outline-none hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAuthor}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-600/80 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showFollows && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFollows(false)}
                className="
                        fixed inset-0 z-50
                        flex items-center justify-center
                        bg-black/70  h-full     
                      "
              />

              {/* Panel */}
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
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
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => {
                  setShowFollows(false);
                }}
                className="
                        fixed
                        inset-0
                        z-[1000]
                        flex
                        items-center
                        justify-center
                        p-4
                          "
              >
                <motion.div
                  className="
                          md:w-[500px]
                          w-[370px]
                          max-h-[500px]
                          rounded-xl
                          pb-4
                          bg-[#050b16]
                          border border-white/10
                          overflow-hidden
                        "
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                       My {followLabel}
                      </h3>

                      <p className="text-[10px] font-semibold text-gray-500 mt-1">
                        {followLabel === "Followers"
                          ? formatCount(followersDetails.length)
                          : formatCount(followingDetails.length)}{" "}
                        current {followLabel}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowFollows(false)}
                      className="
                              w-6 h-6 rounded-lg
                              hover:bg-white/5
                              text-gray-400
                              flex items-center justify-center
                              transition-all
                            "
                    >
                      <IoClose size={18} />
                    </button>
                  </div>

                  <div className="overflow-y-auto scrollbar-hide overflow-x-hidden max-h-[400px] px-4 py-2 md:p-4">
                    {!followLoading ? (followLabel === "Followers"
                      ? followersDetails
                      : followingDetails
                    ).map((p, index) => (
                      <motion.div
                        key={p.email}
                        // initial={{
                        //   opacity: 0,
                        //   x: -15,
                        // }}
                        // animate={{
                        //   opacity: 1,
                        //   x: 0,
                        // }}
                        // transition={{
                        //   delay: index * 0.03,
                        // }}
                      >
                        <Link
                          to={`/viewProfile/${p.email}`}
                          onClick={() => setShowFollows(false)}
                          className="
                                  flex items-center gap-2
                                  md:px-3 px-1 py-1.5
                                  rounded-2xl
                                  hover:bg-white/[0.03]
                                  transition-all
                                  group
                                "
                        >
                          {!p.profile ? (
                            <div
                              className="
                                      w-6 h-6
                                      rounded-full
                                      flex items-center justify-center
                                     text-[10px] font-semibold 
                                      text-white
                                      shrink-0
                                    "
                              style={{
                                backgroundColor: avatarColor(p.name),
                              }}
                            >
                              {initials(p.name)}
                            </div>
                          ) : (
                            <img
                              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.profile}`}
                              className="
                                      w-6 h-6
                                      rounded-full
                                      object-cover
                                      shrink-0
                                    "
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-xs  text-wrap line-clamp-1 max-w-[150px] md:max-w-[240px] text-white truncate">
                                {p.name}
                              </p>

                              {/* <RoleBadge role={p.role} /> */}
                              <p className="text-[10px] font-semibold text-gray-500">
                                {p.role}
                              </p>
                            </div>

                            {/* <p className="text-xs text-gray-500 truncate mt-0.5">
                                      {p.email}
                                    </p> */}
                          </div>
                          <div
                            className="
                                    text-gray-500
                                    group-hover:text-emerald-400
                                    transition-all
                                  "
                          >
                            <BadgeIcons
                              badges={p?.badges}
                              parentClass="static -space-x-1.5"
                              shieldClassName="w-4 h-4"
                            />
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  :
                  <div className="h-full w-full flex justify-center">
                    <div className="relative flex items-center justify-center">
                      {/* Outer Oval Ring */}
                      <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                      {/* Inner Glow Pulse */}
                      {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                    </div>
                  </div>}
                     
                  
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="w-full">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
