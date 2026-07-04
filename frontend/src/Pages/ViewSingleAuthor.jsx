import React, { useState, useEffect, useRef } from "react";
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
import empty_state_author from "../assets/author_not_found_3.png";
import AchievementSection from "../components/Achievements";
import BadgeIcons from "../components/achievements/BadgeIcons";
import { AnimatePresence, motion } from "framer-motion";
import formatCount from "../utils/NumberConversion";
import useGetFollowersDetails from "../hooks/useGetFollowersDetails";
import { IoClose } from "react-icons/io5";
import ProfilePageSkeleton from "../components/loaders/ProfilePageSkeleton";

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
  const [bioDescription, setBioDescription] = useState("");

  const fetchAuthor = async () => {
    try {
      setLoading(true);
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
      setBioDescription(authorData.bio);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAuthor();
  }, [email]);

  const addFollower = async (email) => {
    // console.log("useremail", userEmail);
    setFollowAuthorLoaderId(email);
    try {
      const response = await axiosInstance.put(`/blog/author/follow/${email}`, {
        emailAuthor: authorEmail,
      });

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
  const { followLoading, followersDetails, followingDetails, getFollowersDetails } =
    useGetFollowersDetails(email);

    useEffect(()=>{
      getFollowersDetails(email)
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


  // console.log("followers", followers)
  // console.log("userEmail", authorEmail)
  // console.log("email", email)

  return (
    <div className=" bg-gray-900 min-h-screen flex flex-col justify-between text-white">
      <NavBar />
      {!loading ? (
        authorName && (
          <div className="w-full 3xl:max-w-[1800px] max-w-7xl mx-auto min-h-screen mx-auto px-4 md:px-6 pt-2 md:pt-6 pb-8 pb-24">
            {/* ── Page header ──────────────────────────────────────── */}
            <div className="md:mb-8 px-1">
              <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300 mb-0.5">
                Account
              </p>
              <h1 className="text-xl md:text-3xl font-medium tracking-tight text-emerald-400">
                Profile Page
              </h1>
            </div>

            {/* ── Two-column layout ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 mt-4 md:mt-0 mb-3 items-start">
              {/* ══ LEFT — Profile card ══════════════════════════════ */}
              <div className="bg-gray-900/50 relative border border-white/[0.09] md:border-white/[0.1] rounded-2xl p-6  text-center">

             <div className="flex items-start md:items-center md:flex-col mt-9 w-full  justify-start gap1.5 md:gap-2">
                {/* Avatar */}
                <div className="relative md:w-24 w-16 shrink-0">
                  {author.profile ? (
                    <img
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                      alt="Profile"
                      className="w-14 h-14 md:w-24 md:h-24 rounded-full object-cover  border md:border-2 border-emerald-500/60"
                    />
                  ) : (
                    <div className="w-14 h-14 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-gray-800 border-1 md:border-2 border-white/10">
                      <HiOutlineUserCircle className="text-gray-600 text-7xl md:text-8xl" />
                    </div>
                  )}
                </div>
                <div className="flex w-full  flex-col justify-start">
                  {/* Name */}
                  <h2 className="md:text-xl text-xl truncate  line-clamp-4 break-all text-wrap text-left md:text-center font-medium leading-snug text-white my-1">
                    {authorName}
                  </h2>
                  <p className="text-xs truncate text-left text-wrap md:text-center line-clamp-4 text-wrap break-all text-gray-500">
                    {email}
                  </p>

                </div>
                </div>

                

                {/* Role pill */}
                <span className="absolute left-4 top-4 ">
                  {/* {author.role.charAt(0).toUpperCase()}{author.role.slice(1)} */}
                  <RoleBadge role={author.role} />
                </span>

                {author?.role !== "student" && (
                  <div
                    onClick={scrollToAchievements}
                    className="cursor-pointer"
                  >
                    <BadgeIcons parentClass="right-6" badges={author?.badges} />
                  </div>
                )}

                {bioDescription && (
                  <div className="my-5 pl-1 md:mt-3  text-left">
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
                     ${bioDescription.length > 50 ? "text-left md:pl-0 pl-2" : "text-center md:px-2"}
                  `}
                    >
                      {bioDescription}
                    </div>
                  </div>
                )}

                {/* Stats row */}
                {(followers?.length > 0 ||
                  following?.length > 0 ||
                  posts.length > 0) && (
                  <div className="flex justify-center gap-px mt-5 mb-3 rounded-xl overflow-hidden border border-white/[0.06]">
                    {author.role === "coordinator" && followers?.length > 0 && (
                      <div
                        onClick={() => {
                          setFollowLabel("Followers");
                          setShowFollows(true);
                        }}
                        className="flex-1 py-3  cursor-pointer  bg-white/[0.02]"
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
                      <Link
                        to={`/singleAuthorPosts/${email}`}
                        className="flex-1"
                      >
                        <div className="py-3 bg-white/[0.02] hover:bg-emerald-500/5 transition-colors h-full">
                          <p className="text-base font-medium text-emerald-400">
                            {formatCount(posts.length)}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Posts
                          </p>
                        </div>
                      </Link>
                    ) : author.role === "coordinator" ? (
                      <div className="flex-1 py-3 bg-white/[0.02]">
                        <p className="text-base font-medium text-gray-600">0</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Posts
                        </p>
                      </div>
                    ) : null}

                    {following?.length > 0 && (
                      <div
                        onClick={() => {
                          setFollowLabel("Following");
                          setShowFollows(true);
                        }}
                        className="flex-1 py-3  cursor-pointer  bg-white/[0.02]"
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

                {author.role === "coordinator" &&
                  coordEamil !== authorEmail && (
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
              <div className="bg-gray-900/50 border border-white/[0.09] md:border-white/[0.1] rounded-2xl p-6 md:p-8">
                <div className="grid md:grid-cols-1 gap-6">

                  <div className="space-y-5">
                      {/* Communities — below role */}
                    {author.community?.length > 0 && (
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
                            className="flex items-start gap-3 px-3.5 py-3 bg-white/[0.02] border border-white/[0.06]  rounded-xl hover:border-white/[0.1] transition-colors"
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
                      <div className="px-4 py-8 bg-white/[0.015] flex items-center justify-center border border-dashed border-white/[0.08] md:h-[260px] rounded-xl text-center">
                        <div>
                        <PiLinkSimpleFill className="text-2xl text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 leading-relaxed">
                          No bio links available.
                        </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
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
                <AchievementSection
                  badges={author?.badges}
                  achievementRef={achievementRef}
                />
              </motion.div>
            )}
          </div>
        )
      ) : (
        <ProfileViewSkeleton role={author.role} />
        // <ProfilePageSkeleton />
      )}
      {!loading && !authorName && (
        <div className="w-full h-[44vh] max-w-[1800px] mx-auto mb-24 md:h-[55vh] flex flex-col items-center justify-center">
          {/* <p className="text-gray-500">Post not found.</p> */}
          <img className="w-60 md:w-72 " src={empty_state_author} alt="" />
          <p className="text-gray-400 max-w-xs md:max-w-md text-sm md:text-base flex justify-center items-center text-center">
            Author not found !
          </p>
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
                            <h3 className="md:text-sm text-sm flex items-center gap-2 font-semibold">
                            Author <p className="line-clapm-1 truncate max-w-[150px]  md:max-w-[200px]">{authorName}'s</p> {followLabel}
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
  );
}

export default ViewSingleAuthor;
