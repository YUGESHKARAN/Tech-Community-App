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
import { getItem, removeItem } from "../utils/encode";
import ProfilePageSkeleton from "../components/loaders/ProfilePageSkeleton";
import AchievementSection from "../components/Achievements";
import BadgeIcons from "../components/achievements/BadgeIcons";
import { motion } from "framer-motion";
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
  const userName = localStorage.getItem("username");
  const [loader, setLoader] = useState(false);
  const [bioEdit, setBioEdit] = useState(false);
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
    localStorage.setItem("username", authorName);
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
  // console.log("author", author)
  // console.log("profile links", profileLinks)
  return (
    <>
      <div className=" bg-gray-900 text-white">
        <NavBar />

        {!loader ? (
          <div className="w-full min-h-screen max-w-[1800px] mx-auto px-4 md:px-6 pt-2  md:pt- pb-8 pb-24">
            {/* ── Page header ──────────────────────────────────────── */}
            {/* <div className="flex items-center justify-between mb-0 md:mb-8 px-1">
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300 mb-0.5">
                  Account
                </p>
                <h1 className="text-xl md:text-3xl font-medium tracking-tight text-emerald-400">
                  My Profile
                </h1>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors"
                title="Delete Account"
              >
                <RiDeleteBin6Line size={14} />
                <span className="hidden md:inline">Delete Account</span>
              </button>
            </div> */}

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
      onClick={() => setEditProfile((prev) => !prev)}
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
           /* ─────────────────────────────────────────────────────────────────────────────
   BytesBase · Profile Page — Two-column grid (left card + right panel)
   RIGHT PANEL completely restructured:
     • Non-edit: fields render as clean read-only display rows (not fake inputs)
     • Edit mode: form fields appear with clear section grouping
     • Bio Links always full-width, not crammed into a half-column
     • Add Link form lives BELOW bio links (not beside them) — logical flow
   All state / handlers preserved verbatim.
─────────────────────────────────────────────────────────────────────────────*/

<div
  style={{
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "16px",
    marginBottom: "12px",
    alignItems: "start",
  }}
  className="md:grid-cols-[300px_1fr] grid-cols-1"
>

  {/* ══════════════════════════════════════════════════════════════════════
      LEFT — Identity card  (unchanged from original redesign)
  ══════════════════════════════════════════════════════════════════════ */}
  <div
    className="md:sticky top-6 self-start"
    style={{
      background: "#111118",
      border: "1px solid #1E1E2E",
      borderRadius: "16px",
      overflow: "hidden",
    }}
  >
    {/* Avatar zone */}
    <div
      style={{
        background: "linear-gradient(160deg, #14141F 0%, #0E0E1A 100%)",
        padding: "32px 24px 24px",
        textAlign: "center",
        borderBottom: "1px solid #1E1E2E",
        position: "relative",
      }}
    >
      {/* Role badge */}
      <span style={{ position: "absolute", top: "14px", left: "14px" }}>
        <RoleBadge role={role} />
      </span>

      {/* Segmented arc ring */}
      <div style={{ position: "relative", width: "fit-content", margin: "0 auto 16px" }}>
        <svg width="136" height="136" viewBox="0 0 136 136"
          style={{ position: "absolute", top: "-4px", left: "-4px", transform: "rotate(-90deg)" }}>
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <circle key={i} cx="68" cy="68" r="62" fill="none"
              stroke={i%3===0?"#00E5A0":i%3===1?"#7C6FCD":"#1E1E2E"}
              strokeWidth="2.5" strokeDasharray="30 46.8"
              strokeDashoffset={-i*11.7} opacity={i<5?1:0.25} />
          ))}
        </svg>
        <div style={{ width:"128px", height:"128px", borderRadius:"50%", overflow:"hidden", border:"3px solid #1A1A24", position:"relative" }}>
          {previewImage ? (
            <img src={previewImage} alt="Preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          ) : author.profile ? (
            <img src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`} alt="Profile" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          ) : (
            <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#1A1A24" }}>
              <HiOutlineUserCircle style={{ fontSize:"72px", color:"#2E2E42" }} />
            </div>
          )}
        </div>
        {editProfile && (
          <>
            <label htmlFor="image" title="Change photo"
              style={{ position:"absolute", bottom:"4px", right:"4px", width:"28px", height:"28px", borderRadius:"50%", background:"#1A1A28", border:"1px solid #2E2E42", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#00E5A0" }}>
              <MdEdit style={{ fontSize:"13px" }} />
            </label>
            <input type="file" id="image" accept="image/*" onChange={onImageChange} className="hidden" />
          </>
        )}
      </div>

      {/* Name */}
      <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:"17px", color:"#E8E8F0", letterSpacing:"-0.02em", margin:"0 0 4px" }}>
        {userName || "—"}
      </h2>

      {/* Badges */}
      {author?.role !== "student" && (
        <div onClick={scrollToAchievements} style={{ cursor:"pointer", marginTop:"10px" }}>
          <BadgeIcons badges={author?.badges} />
        </div>
      )}
    </div>

    {/* Stats */}
    {author.role !== "student" && (followers?.length>0 || following?.length>0 || posts.length>0) && (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(70px,1fr))", borderBottom:"1px solid #1E1E2E" }}>
        {author.role==="coordinator" && followers?.length>0 && (
          <div style={{ padding:"14px 8px", textAlign:"center", borderRight:"1px solid #1E1E2E" }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"18px", fontWeight:700, color:"#00E5A0", margin:"0 0 2px" }}>{followers?.length??0}</p>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#5A5A78", letterSpacing:"0.12em", margin:0, textTransform:"uppercase" }}>followers</p>
          </div>
        )}
        {author.role!=="student" && posts.length>0 ? (
          <Link to="/yourposts" style={{ textDecoration:"none" }}>
            <div style={{ padding:"14px 8px", textAlign:"center", borderRight:"1px solid #1E1E2E" }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,229,160,0.04)")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"18px", fontWeight:700, color:"#00E5A0", margin:"0 0 2px" }}>{posts.length}</p>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#5A5A78", letterSpacing:"0.12em", margin:0, textTransform:"uppercase" }}>posts</p>
            </div>
          </Link>
        ) : author.role!=="student" ? (
          <div style={{ padding:"14px 8px", textAlign:"center", borderRight:"1px solid #1E1E2E" }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"18px", fontWeight:700, color:"#2E2E42", margin:"0 0 2px" }}>0</p>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#5A5A78", letterSpacing:"0.12em", margin:0, textTransform:"uppercase" }}>posts</p>
          </div>
        ) : null}
        {following?.length>0 && (
          <div style={{ padding:"14px 8px", textAlign:"center" }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"18px", fontWeight:700, color:"#7C6FCD", margin:"0 0 2px" }}>{following?.length??0}</p>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#5A5A78", letterSpacing:"0.12em", margin:0, textTransform:"uppercase" }}>following</p>
          </div>
        )}
      </div>
    )}

    {/* Bio */}
    <div style={{ padding:"20px 20px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", letterSpacing:"0.18em", textTransform:"uppercase", color:"#5A5A78" }}>// about</span>
        {editProfile && (!bioEdit ? (
          <button onClick={()=>setBioEdit(true)}
            style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"10px", color:"#00E5A0", background:"none", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono',monospace" }}>
            <MdEdit style={{ fontSize:"11px" }} /> edit
          </button>
        ) : (
          <button onClick={()=>setBioEdit(false)}
            style={{ fontSize:"10px", color:"#5A5A78", background:"none", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono',monospace" }}>
            preview
          </button>
        ))}
      </div>
      {!bioEdit ? (
        <p style={{ fontSize:"12px", lineHeight:"1.7", color:bioDescription?.trim()?.length>0?"#9898B0":"#3A3A52", whiteSpace:"pre-wrap", wordBreak:"break-word", margin:0, fontStyle:bioDescription?.trim()?.length===0?"italic":"normal" }}>
          {bioDescription?.trim()?.length>0 ? bioDescription : "Add a short bio, let others know about you..."}
        </p>
      ) : (
        <div>
          <textarea rows={4} maxLength={220} value={bioDescription}
            onChange={e=>{setBioDescription(e.target.value);setUpdateButton(true);}}
            placeholder="Write a short bio..."
            style={{ width:"100%", background:"#0D0D16", border:"1px solid #2A2A3A", borderRadius:"8px", padding:"10px 12px", fontSize:"12px", color:"#C8C8D8", fontFamily:"'Inter',sans-serif", lineHeight:"1.6", outline:"none", resize:"none", boxSizing:"border-box" }}
            onFocus={e=>(e.target.style.borderColor="rgba(0,229,160,0.4)")}
            onBlur={e=>(e.target.style.borderColor="#2A2A3A")} />
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"4px" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"#3A3A52" }}>{bioDescription?.length}/220</span>
          </div>
        </div>
      )}
    </div>
  </div>


  {/* ══════════════════════════════════════════════════════════════════════
      RIGHT — Profile form  (fully restructured)
  ══════════════════════════════════════════════════════════════════════ */}
  <form
    onSubmit={handleSubmit}
    style={{ display:"flex", flexDirection:"column", gap:"12px" }}
  >

    {/* ── Section 1: Identity ──────────────────────────────────────────── */}
    <div style={{ background:"#111118", border:"1px solid #1E1E2E", borderRadius:"16px", overflow:"hidden" }}>
      {/* Section header */}
      <div style={{ padding:"14px 20px", borderBottom:"1px solid #1A1A24", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#5A5A78", letterSpacing:"0.18em", textTransform:"uppercase" }}>
          01 · identity
        </span>
      </div>

      <div style={{ padding:"20px" }}>

        {/* --- VIEW MODE: clean display rows --- */}
        {!editProfile ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
            {/* Display name row */}
            <div style={{ display:"flex", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #111118" }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#3A3A52", letterSpacing:"0.16em", textTransform:"uppercase", width:"140px", flexShrink:0 }}>
                display_name
              </span>
              <span style={{ fontSize:"14px", fontWeight:500, color:"#E8E8F0", fontFamily:"'Inter',sans-serif" }}>
                {authorName || "—"}
              </span>
            </div>
            {/* Email row */}
            <div style={{ display:"flex", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #111118" }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#3A3A52", letterSpacing:"0.16em", textTransform:"uppercase", width:"140px", flexShrink:0 }}>
                email
              </span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", color:"#5A5A78" }}>
                {authorEmail}
              </span>
            </div>
            {/* Communities row */}
            {author.community?.length > 0 && (
              <div style={{ display:"flex", alignItems:"flex-start", padding:"14px 0" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#3A3A52", letterSpacing:"0.16em", textTransform:"uppercase", width:"140px", flexShrink:0, paddingTop:"2px" }}>
                  {author.role==="coordinator" ? "coordinating" : "member_of"}
                </span>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                  {author.community.map((com,i) => (
                    <span key={i} style={{ padding:"3px 10px", fontSize:"11px", fontFamily:"'JetBrains Mono',monospace", background:"rgba(124,111,205,0.08)", color:"#7C6FCD", border:"1px solid rgba(124,111,205,0.2)", borderRadius:"20px" }}>
                      {com}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- EDIT MODE: actual form fields --- */
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {/* Display name input */}
            <div>
              <label htmlFor="authorName"
                style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", letterSpacing:"0.18em", textTransform:"uppercase", color:"#5A5A78", marginBottom:"8px" }}>
                display_name
              </label>
              <input type="text" id="authorName" value={authorName} placeholder="Your name" required
                disabled={!editProfile}
                onChange={e=>{setAuthorName(e.target.value);setUpdateButton(true);}}
                style={{ width:"100%", background:"#0D0D16", border:"1px solid #1E1E2E", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", color:"#E8E8F0", fontFamily:"'Inter',sans-serif", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s, box-shadow 0.15s" }}
                onFocus={e=>{e.target.style.borderColor="rgba(0,229,160,0.4)";e.target.style.boxShadow="0 0 0 3px rgba(0,229,160,0.06)";}}
                onBlur={e=>{e.target.style.borderColor="#1E1E2E";e.target.style.boxShadow="none";}} />
            </div>
            {/* Email (always read-only) */}
            <div>
              <label htmlFor="authorEmail"
                style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", letterSpacing:"0.18em", textTransform:"uppercase", color:"#5A5A78", marginBottom:"8px" }}>
                email · read_only
              </label>
              <input type="email" id="authorEmail" value={authorEmail} readOnly
                style={{ width:"100%", background:"rgba(255,255,255,0.02)", border:"1px solid #1A1A24", borderRadius:"8px", padding:"10px 14px", fontSize:"12px", color:"#3E3E58", fontFamily:"'JetBrains Mono',monospace", outline:"none", cursor:"not-allowed", boxSizing:"border-box" }} />
            </div>
            {/* Communities */}
            {author.community?.length > 0 && (
              <div>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", letterSpacing:"0.18em", textTransform:"uppercase", color:"#5A5A78", marginBottom:"10px" }}>
                  {author.role==="coordinator" ? "coordinating" : "member_of"}
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {author.community.map((com,i) => (
                    <span key={i} style={{ padding:"4px 12px", fontSize:"11px", fontFamily:"'JetBrains Mono',monospace", background:"rgba(124,111,205,0.08)", color:"#7C6FCD", border:"1px solid rgba(124,111,205,0.2)", borderRadius:"20px" }}>
                      {com}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>


    {/* ── Section 2: Bio Links ─────────────────────────────────────────── */}
    <div style={{ background:"#111118", border:"1px solid #1E1E2E", borderRadius:"16px", overflow:"hidden" }}>
      <div style={{ padding:"14px 20px", borderBottom:"1px solid #1A1A24" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#5A5A78", letterSpacing:"0.18em", textTransform:"uppercase" }}>
          02 · bio_links
        </span>
      </div>

      <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:"8px" }}>
        {/* Existing links — always full width */}
        {profileLinks?.length > 0 ? (
          profileLinks.map((link, index) => (
            <div key={index}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", padding:"12px 14px", background:"#0D0D16", border:"1px solid #1E1E2E", borderRadius:"10px", transition:"border-color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor="#2E2E42")}
              onMouseLeave={e=>(e.currentTarget.style.borderColor="#1E1E2E")}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", minWidth:0 }}>
                <div style={{ width:"34px", height:"34px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"8px", background:"#1A1A24", border:"1px solid #2A2A3A", flexShrink:0 }}>
                  {link.title==="LinkedIn" ? <FaLinkedin style={{ fontSize:"15px", color:"#7C6FCD" }} />
                  : link.title==="GitHub" ? <FaSquareGithub style={{ fontSize:"15px", color:"#E8E8F0" }} />
                  : link.title==="Portfolio" ? <BsPersonSquare style={{ fontSize:"15px", color:"#00E5A0" }} />
                  : <PiLinkSimpleFill style={{ fontSize:"15px", color:"#5A5A78" }} />}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:"13px", fontWeight:500, color:"#C8C8D8", margin:"0 0 2px", fontFamily:"'Inter',sans-serif" }}>
                    {link.title}
                  </p>
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:"10px", color:"#3E5A78", fontFamily:"'JetBrains Mono',monospace", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"280px", textDecoration:"none" }}>
                    {userName}/{link.title}
                  </a>
                </div>
              </div>

              {editProfile && (
                <div style={{ display:"flex", alignItems:"center", gap:"6px", flexShrink:0 }}>
                  <button type="button" title="Edit"
                    onClick={()=>{setCurrentLinkTitle(link.title);setCurrentLinkUrl(link.url);setLinkId(link._id);setLinks(prev=>prev.filter((_,i)=>i!==index));setShowLinkBox(true);setUpdateButton(true);}}
                    style={{ width:"30px", height:"30px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"7px", background:"rgba(124,111,205,0.08)", color:"#7C6FCD", border:"1px solid rgba(124,111,205,0.18)", cursor:"pointer" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="rgba(124,111,205,0.16)")}
                    onMouseLeave={e=>(e.currentTarget.style.background="rgba(124,111,205,0.08)")}>
                    <MdEdit style={{ fontSize:"13px" }} />
                  </button>
                  <button type="button" title="Remove"
                    onClick={()=>removeLinks(authorEmail,link._id)}
                    style={{ width:"30px", height:"30px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"7px", background:"rgba(255,107,107,0.07)", color:"#FF6B6B", border:"1px solid rgba(255,107,107,0.18)", cursor:"pointer" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,107,107,0.14)")}
                    onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,107,107,0.07)")}>
                    <IoIosRemoveCircleOutline style={{ fontSize:"13px" }} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding:"28px 16px", background:"#0D0D16", border:"1px dashed #1E1E2E", borderRadius:"10px", textAlign:"center" }}>
            <PiLinkSimpleFill style={{ fontSize:"22px", color:"#2A2A3A", margin:"0 auto 8px", display:"block" }} />
            <p style={{ fontSize:"11px", color:"#3A3A52", fontFamily:"'Inter',sans-serif", lineHeight:"1.6", margin:0 }}>
              GitHub, LinkedIn, portfolio — add your links.
            </p>
          </div>
        )}

        {/* Pending (unsaved) links */}
        {links.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"4px" }}>
            {links.map((link, index) => (
              <div key={`${link.title}-${index}`}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", padding:"10px 14px", background:"rgba(0,229,160,0.04)", border:"1px solid rgba(0,229,160,0.15)", borderRadius:"9px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", minWidth:0 }}>
                  {link.title==="LinkedIn" ? <FaLinkedin style={{ fontSize:"13px", flexShrink:0 }} />
                  : link.title==="GitHub" ? <FaSquareGithub style={{ fontSize:"13px", flexShrink:0 }} />
                  : link.title==="Portfolio" ? <BsPersonSquare style={{ fontSize:"13px", flexShrink:0 }} />
                  : <PiLinkSimpleFill style={{ fontSize:"13px", flexShrink:0 }} />}
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:"12px", fontWeight:500, color:"#C8C8D8", margin:"0 0 1px" }}>{link.title}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:"9px", color:"#3E5A78", fontFamily:"'JetBrains Mono',monospace", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"240px", textDecoration:"none" }}>
                      {link.url}
                    </a>
                  </div>
                </div>
                <button type="button"
                  onClick={()=>setLinks(prev=>prev.filter((_,i)=>i!==index))}
                  style={{ color:"rgba(255,107,107,0.5)", background:"none", border:"none", cursor:"pointer", flexShrink:0 }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#FF6B6B")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,107,107,0.5)")}>
                  <IoIosRemoveCircleOutline style={{ fontSize:"16px" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit link form — only in edit mode, below the links list ── */}
      {editProfile && (profileLinks.length < 5 || showLinkBox) && (
        <div style={{ borderTop:"1px solid #1A1A24", padding:"16px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#5A5A78", letterSpacing:"0.14em", textTransform:"uppercase" }}>
              {showLinkBox ? "edit_link" : `${5-profileLinks.length}_slot${5-profileLinks.length>1?"s":""}_remaining`}
            </span>
            {currentLinkTitle.length > 0 && (
              <button
                onClick={e=>{e.preventDefault();setCurrentLinkTitle("");setCurrentLinkUrl("");setShowLinkBox(false);}}
                style={{ fontSize:"10px", padding:"3px 10px", borderRadius:"6px", background:"rgba(255,107,107,0.07)", color:"#FF6B6B", border:"1px solid rgba(255,107,107,0.18)", cursor:"pointer", fontFamily:"'JetBrains Mono',monospace" }}>
                clear
              </button>
            )}
          </div>

          {(profileLinks?.length + links?.length < 5 || showLinkBox) && (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {/* Platform select or custom input */}
              {currentLinkTitle !== "Others" ? (
                <select value={currentLinkTitle} onChange={e=>setCurrentLinkTitle(e.target.value)}
                  style={{ width:"100%", background:"#0D0D16", border:"1px solid #1E1E2E", borderRadius:"8px", padding:"10px 14px", fontSize:"12px", color:"#C8C8D8", fontFamily:"'JetBrains Mono',monospace", outline:"none", cursor:"pointer", boxSizing:"border-box" }}>
                  <option value="" disabled>select_platform</option>
                  {!profileLinks.some(l=>l.title==="GitHub" && currentLinkTitle!=="GitHub") && <option value="GitHub">GitHub</option>}
                  {!profileLinks.some(l=>l.title==="LinkedIn" && currentLinkTitle!=="LinkedIn") && <option value="LinkedIn">LinkedIn</option>}
                  {!profileLinks.some(l=>l.title==="Portfolio" && currentLinkTitle!=="Portfolio") && <option value="Portfolio">Portfolio</option>}
                  {showLinkBox && profileLinks.map(row=><option key={row.title} value={row.title}>{row.title}</option>)}
                  <option value="Others">Others</option>
                </select>
              ) : (
                <input type="text" placeholder="platform_name" onChange={e=>setCustomTitle(e.target.value)}
                  style={{ width:"100%", background:"#0D0D16", border:"1px solid #1E1E2E", borderRadius:"8px", padding:"10px 14px", fontSize:"12px", color:"#C8C8D8", fontFamily:"'JetBrains Mono',monospace", outline:"none", boxSizing:"border-box" }} />
              )}
              <input type="url" value={currentLinkUrl} onChange={e=>setCurrentLinkUrl(e.target.value)} placeholder="https://..."
                style={{ width:"100%", background:"#0D0D16", border:"1px solid #1E1E2E", borderRadius:"8px", padding:"10px 14px", fontSize:"12px", color:"#C8C8D8", fontFamily:"'JetBrains Mono',monospace", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" }}
                onFocus={e=>(e.target.style.borderColor="rgba(0,229,160,0.35)")}
                onBlur={e=>(e.target.style.borderColor="#1E1E2E")} />
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button type="button"
                  onClick={()=>{
                    const titleToUse=currentLinkTitle==="Others"?customTitle?.trim():currentLinkTitle.trim();
                    const sanitizedUrl=sanitizeUrl(currentLinkUrl.trim());
                    if(titleToUse&&sanitizedUrl){
                      setLinks([...links,{title:titleToUse,url:sanitizedUrl,id:linkId}]);
                      setUpdateButton(true);setCurrentLinkTitle("");setCurrentLinkUrl("");setCustomTitle("");setLinkId(null);
                    } else if(titleToUse){toast.error("Invalid URL","Please enter a valid http(s) URL.");}
                  }}
                  style={{ padding:"8px 20px", fontSize:"11px", fontFamily:"'JetBrains Mono',monospace", fontWeight:500, borderRadius:"8px", background:"rgba(0,229,160,0.08)", color:"#00E5A0", border:"1px solid rgba(0,229,160,0.2)", cursor:"pointer", letterSpacing:"0.05em" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,229,160,0.14)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="rgba(0,229,160,0.08)")}>
                  {showLinkBox ? "update_link" : "+ add_link"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>


    {/* ── Save button ─────────────────────────────────────────────────── */}
    {updateButton && editProfile && (
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button type="submit" disabled={loading || !updateButton}
          style={{ padding:"10px 28px", fontSize:"12px", fontFamily:"'JetBrains Mono',monospace", fontWeight:500, letterSpacing:"0.06em", borderRadius:"10px", background:loading||!updateButton?"#1A1A24":"rgba(0,229,160,0.1)", color:loading||!updateButton?"#3A3A52":"#00E5A0", border:`1px solid ${loading||!updateButton?"#1E1E2E":"rgba(0,229,160,0.25)"}`, cursor:loading||!updateButton?"not-allowed":"pointer" }}
          onMouseEnter={e=>{if(!loading&&updateButton)e.currentTarget.style.background="rgba(0,229,160,0.18)";}}
          onMouseLeave={e=>{if(!loading&&updateButton)e.currentTarget.style.background="rgba(0,229,160,0.1)";}}>
          {loading ? "saving..." : "save_changes →"}
        </button>
      </div>
    )}
  </form>
</div>

             {author?.role !== "student" && (
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
            <AchievementSection badges={author?.badges} achievementRef={achievementRef}  />
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
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-300 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 placeholder:text-gray-600"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white/[0.04] text-gray-300 border border-white/[0.07] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAuthor}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
