import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";
import { Link, useParams } from "react-router-dom";

import { HiOutlineUserCircle } from "react-icons/hi";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";

import { PiLinkSimpleFill } from "react-icons/pi";
import { getItem } from "../utils/encode";
import ProfileViewSkeleton from "../components/loaders/ProfileViewSkeleton";
import empty_state_author from "../assets/author_not_found_3.png"
import AchievementSection from "../components/Achievements";
function ViewSingleAuthor() {
  const { email } = useParams();
  // const role = localStorage.getItem("role");
  const role = getItem("role");
  const [author, setAuthor] = useState({});
  const [authorName, setAuthorName] = useState("");
  // const [authorEmail, setAuthorEmail] = useState("");
  const [image, setImage] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [coordEamil, setCoordEmail] = useState("");
  const [posts, setPosts] = useState([]);
  // const authorEmail = localStorage.getItem("email");
  const authorEmail = getItem("email");
  const [profileLinks, setProfileLinks] = useState([]); // New state for profile links
  const [followAuthorLoaderId, setFollowAuthorLoaderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bioDescription, setBioDescription] = useState("")


  const fetchAuthor = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/blog/author/${email}`);
      const authorData = response.data;
      setAuthorName(authorData.authorname);
      setCoordEmail(authorData.email);
      setAuthor(response.data);
      setImage(response.data.profile);
      setFollowers(authorData.followers);
      setFollowing(authorData.following);
      setProfileLinks(authorData.personalLinks);
      setPosts(authorData.posts);
      setBioDescription(authorData.bio)
    } catch (err) {
      console.log(err);
    }
    finally{
      setLoading(false)
    }
  };
  useEffect(() => {
    fetchAuthor();
  }, [email]);

  const addFollower = async (email) => {
    // console.log("useremail", userEmail);
    setFollowAuthorLoaderId(email);
    try {
      
      const response = await axiosInstance.put(
        `/blog/author/follow/${email}`,
        { emailAuthor: authorEmail },
      );

      const isFollowing = followers.includes(authorEmail);

  // ✅ compute ONCE
  const updatedFollowers = isFollowing
    ? followers.filter((f) => f !== authorEmail)
    : [...followers, authorEmail];

  // ✅ update both states using SAME value
  setFollowers(updatedFollowers);

  setAuthor((prev) => ({
    ...prev,
    followers: updatedFollowers,
  }));
 
      //  fetchAuthor();
      // if (response.status == 200) {
      //   // console.log(response.data);
       
      // }
    } catch (err) {
      console.log("error", err);
    } finally {
      setFollowAuthorLoaderId(null);
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

  // console.log("followers", followers)
  // console.log("userEmail", authorEmail)
  // console.log("email", email)

  return (


    <div className=" bg-gray-900 min-h-screen flex flex-col justify-between text-white">
      <NavBar />
     {!loading? 
     authorName &&
     <div className="w-full min-h-screen mx-auto px-4 md:px-6 pt-2 md:pt-6 pb-8 pb-24">

        {/* ── Page header ──────────────────────────────────────── */}
        <div className="mb-8 px-1">
          <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300 mb-0.5">
            Account
          </p>
          <h1 className="text-xl md:text-3xl font-medium tracking-tight text-emerald-400">
            Profile Page
          </h1>
        </div>

        {/* ── Two-column layout ─────────────────────────────────── */}
        <div className="grid md:grid-cols-[300px_1fr] gap-4 items-start">

          {/* ══ LEFT — Profile card ══════════════════════════════ */}
          <div className="bg-gray-800/40 relative border border-white/[0.06] rounded-2xl p-4  text-center">

            {/* Avatar */}
            <div className="relative w-fit mx-auto mt-3 md:mb-3 mb-4">
              {author.profile ? (
                <img
                  src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-2 border-emerald-500/60"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gray-800 border-2 border-white/10">
                  <HiOutlineUserCircle className="text-gray-600 text-7xl md:text-8xl" />
                </div>
              )}
            </div>

            {/* Name */}
            <h2 className="md:text-lg text-lg leading-snug font-medium  text-white my-1">
              {authorName}
            </h2>

            {/* Role pill */}
             <span 
                className="absolute right-4 top-4 "
                >
                  {/* {author.role.charAt(0).toUpperCase()}{author.role.slice(1)} */}
                   <RoleBadge role={author.role} />
                </span>

                

                {
                  bioDescription &&
                    <div className="mb-5 pl-1 mt-3  text-left">
                      {/* <p className="text-[11px] tracking-widest uppercase text-gray-400 pb-1 font-medium">
                      About
                    </p> */}
                   <div
                      className={`  w-full
                  text-xs 
                  leading-relaxed
                  whitespace-pre-wrap
                  text-gray-300
                  break-words
                  ${bioDescription.length>50?'text-left md:pl-0 pl-2':'text-center md:px-2'}
                 
                  `}
                    >
                    {bioDescription}
                    </div>
                    </div>
                }

            {/* Stats row */}
            {author.role !== "student" &&
              (followers?.length > 0 || following?.length > 0 || posts.length > 0) && (
                <div className="flex justify-center gap-px mb-3 rounded-xl overflow-hidden border border-white/[0.06]">
                  {author.role === "coordinator" && followers?.length > 0 && (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-white">{followers?.length ?? 0}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Followers</p>
                    </div>
                  )}

                  {author.role !== "student" && posts.length > 0 ? (
                    <Link to={`/singleAuthorPosts/${email}`} className="flex-1">
                      <div className="py-3 bg-white/[0.02] hover:bg-emerald-500/5 transition-colors h-full">
                        <p className="text-base font-medium text-emerald-400">{posts.length}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Posts</p>
                      </div>
                    </Link>
                  ) : author.role === "coordinator" ? (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-gray-600">0</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Posts</p>
                    </div>
                  ) : null}

                  {following?.length > 0 && (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-white">{following?.length ?? 0}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Following</p>
                    </div>
                  )}
                </div>
              )}

                   {author.role === "coordinator" && coordEamil !== authorEmail && (
              <div className="mt-4 md:mt-0">
                {author.followers.includes(authorEmail) ? (
                  <button
                    onClick={() => addFollower(email)}
                    className="
            px-5 py-2 rounded-lg
            bg-gray-900 text-emerald-500
            border border-neutral-700
            text-sm font-medium
            cursor-pointer transition-all duration-400 disabled:border-none disabled:bg-transparent
          "
                    disabled={followAuthorLoaderId === email}
                  >
                    {followAuthorLoaderId === email ? (
                      <div className="flex items-center py-1.5 justify-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                      </div>
                    ) : (
                      "Following"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => addFollower(email)}
                    className="
                      px-5 py-2 rounded-lg
                        bg-emerald-400 text-black
                        text-sm font-semibold
                        
                        border border-neutral-700
                        transition-all duration-300
                        
                        cursor-pointer transition-all duration-400 disabled:border-none  disabled:bg-transparent
                      "
                    disabled={followAuthorLoaderId === email}
                  >
                    {followAuthorLoaderId === email ? (
                      <div className="flex items-center py-1.5 justify-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                      </div>
                    ) : (
                      "Follow +"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ══ RIGHT — Info panel ═══════════════════════════════ */}
          <div className="bg-gray-800/40 border border-white/[0.06] rounded-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">

              {/* ── Left column — fields ─────────────────────── */}
              <div className="space-y-5">

                {/* Author Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="authorName"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-300"
                  >
                    Author Name
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    value={authorName}
                    readOnly
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      setUpdateButton(true);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/30 border border-white/[0.04] rounded-lg text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-300"
                  >
                    Author Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/30 border border-white/[0.04] rounded-lg text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="role"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-300"
                  >
                    Author Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={author.role}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/30 border border-white/[0.04] rounded-lg text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Communities — below role */}
                {author.community?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300">
                      Communities{" "}
                      {author.role === "coordinator" ? "coordinating" : "joined"}
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
              </div>

              {/* ── Right column — Bio Links ─────────────────── */}
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300 mb-3">
                  Bio Links
                </p>

                {profileLinks?.length > 0 ? (
                  <div className="space-y-2">
                    {profileLinks.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 px-3.5 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                          {link.title === "LinkedIn" ? (
                            <FaLinkedin className="text-base " />
                          ) : link.title === "GitHub" ? (
                            <FaSquareGithub className="text-base " />
                          ) : link.title === "Portfolio" ? (
                            <BsPersonSquare className="text-base " />
                          ) : (
                            <PiLinkSimpleFill className="text-base" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-200">
                            {link.title}
                          </p>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 hover:text-blue-500 transition-colors truncate block max-w-[180px]"
                          >
                            {authorName}/{link.title}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 bg-white/[0.015] border border-dashed border-white/[0.08] rounded-xl text-center">
                    <PiLinkSimpleFill className="text-2xl text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      No bio links available.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
        { author?.role !=='student' && <AchievementSection badges={author?.badges}/>}
      </div>:
      <ProfileViewSkeleton role={author.role} />
}
{!loading && !authorName && (
  <div className="w-full h-[44vh] mb-24 md:h-[55vh] flex flex-col items-center justify-center">
              {/* <p className="text-gray-500">Post not found.</p> */}
              <img className="w-60 md:w-72 " src={empty_state_author} alt="" />
             <p className="text-gray-400 max-w-xs md:max-w-md text-sm md:text-base flex justify-center items-center text-center">
                Author not found !
              </p>
            </div>
)}
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}

export default ViewSingleAuthor;
