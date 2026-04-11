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
  const [loading, setLoading] = useState(false)


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

  // console.log("followers", followers)
  // console.log("userEmail", authorEmail)
  // console.log("email", email)

  return (
    // <div className="min-h-screen relative bg-gray-900 text-white">
    //   <NavBar />

    //   <div className="mx-auto md:pb-12 md:px-4 py-6 w-full">
    //     {/* Header */}
    //     <h1 className="text-2xl  px-3 md:px-0 md:text-3xl mb-3 font-semibold text-white w-full mx-auto">
    //       Profile Page
    //     </h1>

    //     {/* Two Column Layout */}
    //     <div className="grid md:grid-cols-[350px_1fr] pb-7 md:pb-0 md:mt-7 mt-4 md:gap-4">
    //       {/* LEFT COLUMN — Profile Overview */}
    //       <div className="bg-gray-900 backdrop-blur-xl mx-3 md:mx-0 rounded-2xl p-6 text-center md:shadow-[0_10px_40px_rgba(0,0,0,0.6)] md:border border-neutral-800">
    //         {/* Profile Picture */}
    //         <div className="relative w-fit mx-auto mb-4 group">
    //           {author.profile ? (
    //             <img
    //               src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
    //               alt="Profile"
    //               className="rounded-full object-cover border-2 border-emerald-500 w-36 h-36 md:w-40 md:h-40 shadow-md"
    //             />
    //           ) : (
    //             <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center rounded-full bg-neutral-800 border border-neutral-600 shadow-lg">
    //               <HiOutlineUserCircle className="text-neutral-500 text-8xl" />
    //             </div>
    //           )}

    //           {/* Subtle Glow */}
    //           {/* <div className="absolute inset-0 rounded-full ring-2 ring-emerald-500/10 group-hover:ring-emerald-500/30 transition-all duration-300" /> */}

    //           {/* Name */}
    //           <h1 className="text-center text-lg md:text-xl font-semibold mt-3 text-white tracking-wide">
    //             {authorName}
    //           </h1>
    //         </div>

    //         {/* Stats */}
    //         <div className="flex justify-center gap-8 md:gap-6 mb-6 text-sm">
    //           {author.role !== "student" && followers?.length > 0 && (
    //             <div className="flex flex-col items-center">
    //               <p className="text-neutral-400 text-xs uppercase tracking-wide">
    //                 Followers
    //               </p>
    //               <p className="text-lg font-semibold text-white">
    //                 {followers?.length ?? 0}
    //               </p>
    //             </div>
    //           )}

    //           {author.role !== "student" && posts.length > 0 ? (
    //             <Link
    //               to={`/singleAuthorPosts/${email}`}
    //               className="flex flex-col items-center group"
    //             >
    //               <p className="text-neutral-400 text-xs uppercase tracking-wide">
    //                 Content
    //               </p>
    //               <button
    //                 className="
    //         mt-1 px-3 py-1 text-sm rounded-lg 
    //         bg-emerald-500/10 text-emerald-400
    //         border border-emerald-500/20
    //         group-hover:bg-emerald-500/20
    //         transition-all duration-300
    //       "
    //               >
    //                 {posts.length}
    //               </button>
    //             </Link>
    //           ) : (
    //             author.role === "coordinator" && (
    //               <div className="flex flex-col items-center">
    //                 <p className="text-neutral-400 text-xs uppercase tracking-wide">
    //                   Content
    //                 </p>
    //                 <p className="text-sm text-neutral-500 mt-1">Yet to...</p>
    //               </div>
    //             )
    //           )}

    //           {following?.length > 0 && (
    //             <div className="flex flex-col items-center">
    //               <p className="text-neutral-400 text-xs uppercase tracking-wide">
    //                 Following
    //               </p>
    //               <p className="text-lg font-semibold text-white">
    //                 {following?.length ?? 0}
    //               </p>
    //             </div>
    //           )}
    //         </div>

    //         {/* Tech Communities */}
    //         {author.community?.length > 0 && (
    //           <div className="mt-5">
    //             <p className="text-emerald-400 font-medium mb-3 text-xs uppercase tracking-wider">
    //               Tech Communities{" "}
    //               {author.role === "coordinator" ? "coordinating" : "joined"}
    //             </p>

    //             <div className="flex flex-wrap justify-center gap-2">
    //               {author.community.map((com, i) => (
    //                 <span
    //                   key={i}
    //                   className="
    //           px-3 py-1 text-xs
    //           bg-emerald-500/10
    //           text-emerald-300
    //           border border-emerald-500/20
    //           rounded-full
    //         "
    //                 >
    //                   {com}
    //                 </span>
    //               ))}
    //             </div>
    //           </div>
    //         )}

    //         {/* Follow Button */}
    //         {author.role === "coordinator" && coordEamil !== authorEmail && (
    //           <div className="mt-6">
    //             {author.followers.includes(authorEmail) ? (
    //               <button
    //                 onClick={() => addFollower(email)}
    //                 className="
    //         px-5 py-2 rounded-lg
    //         bg-gray-900 text-emerald-500
    //         border border-neutral-700
    //         text-sm font-medium
    //         cursor-pointer transition-all duration-400 disabled:border-none disabled:bg-transparent
    //       "
    //                 disabled={followAuthorLoaderId === email}
    //               >
    //                 {followAuthorLoaderId === email ? (
    //                   <div className="flex items-center py-1.5 justify-center gap-1">
    //                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
    //                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
    //                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
    //                   </div>
    //                 ) : (
    //                   "Following"
    //                 )}
    //               </button>
    //             ) : (
    //               <button
    //                 onClick={() => addFollower(email)}
    //                 className="
    //       px-5 py-2 rounded-lg
    //         bg-emerald-500 text-black
    //         text-sm font-semibold
    //         hover:bg-emerald-600
    //         border border-neutral-700
    //         transition-all duration-300
             
    //         cursor-pointer transition-all duration-400 disabled:border-none disabled:bg-transparent
    //       "
    //                 disabled={followAuthorLoaderId === email}
    //               >
    //                 {followAuthorLoaderId === email ? (
    //                   <div className="flex items-center py-1.5 justify-center gap-1">
    //                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
    //                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
    //                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
    //                   </div>
    //                 ) : (
    //                   "Follow +"
    //                 )}
    //               </button>
    //             )}
    //           </div>
    //         )}
    //       </div>

    //       {/* RIGHT COLUMN — Profile Form */}
    //       <div className="space-y-4  bg-gray-900 rounded-2xl gap-3 grid xl:grid-cols-2  px-5 pb-6 md:py-6 md:p-10 md:px-16 md:shadow-[0_10px_40px_rgba(0,0,0,0.6)] md:border border-neutral-800">
    //         {/* Author Name */}
    //         {/* <div>
    //           <label
    //             htmlFor="authorName"
    //             className="block text-gray-300 font-medium mb-1"
    //           >
    //             Author Name
    //           </label>
    //           <input
    //             type="text"
    //             id="authorName"
    //             value={authorName}
    //             onChange={(e) =>{ setAuthorName(e.target.value); setUpdateButton(true);}}
    //             className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-orange-500 focus:border-orange-500"
    //             placeholder="Enter author name"
    //             required
    //           />
    //         </div> */}

    //         {/* Author Email */}
    //         <div className="space-y-8">
    //           <div>
    //             <label
    //               htmlFor="authorName"
    //               className="block text-gray-300 font-medium mb-1"
    //             >
    //               Author Name
    //             </label>
    //             <input
    //               type="text"
    //               id="authorName"
    //               value={authorName}
    //               readOnly
    //               onChange={(e) => {
    //                 setAuthorName(e.target.value);
    //                 setUpdateButton(true);
    //               }}
    //               className="mt-1 text-sm outline-none block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
    //               placeholder="Enter author name"
    //               required
    //             />
    //           </div>
    //           <div>
    //             <label
    //               htmlFor="email"
    //               className="block text-sm text-gray-300 font-medium mb-2"
    //             >
    //               Author Email
    //             </label>
    //             <input
    //               type="email"
    //               id="email"
    //               value={email}
    //               readOnly
    //               className="mt-1 block w-full px-4 py-2 text-sm outline-none bg-gray-700  rounded-md text-gray-400"
    //             />
    //           </div>

    //           {/* Role */}
    //           <div>
    //             <label
    //               htmlFor="role"
    //               className="block text-gray-300 text-sm font-medium mb-2"
    //             >
    //               Author Role
    //             </label>
    //             <input
    //               type="text"
    //               id="role"
    //               value={author.role}
    //               readOnly
    //               className="mt-1 block text-sm w-full outline-none px-4 py-2 bg-gray-700  rounded-md text-gray-400"
    //             />
    //           </div>
    //         </div>

    //         {/* Contact Links Section */}
    //         <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/70 rounded-xl h-fit shadow-md p-2 md:p-6 backdrop-blur-md ">
    //           <h3 className="text-xl font-semibold text-center text-white mb-4">
    //             Bio Links
    //           </h3>

    //           {profileLinks?.length > 0 ? (
    //             <div className="space-y-3">
    //               {profileLinks.map((link, index) => (
    //                 <div
    //                   key={index}
    //                   className="relative bg-gray-800/60 hover:bg-gray-800/90  rounded-lg p-3 transition-all duration-300 group"
    //                 >
    //                   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    //                     <div className="w-full flex flex-col">
    //                       <div className="flex gap-2 items-center">
    //                         {link.title === "LinkedIn" ? (
    //                           <FaLinkedin className="text-xl" />
    //                         ) : link.title === "GitHub" ? (
    //                           <FaSquareGithub className="text-xl" />
    //                         ) : link.title === "Portfolio" ? (
    //                           <BsPersonSquare className="text-xl" />
    //                         ) : (
    //                           <PiLinkSimpleFill className="text-xl" />
    //                         )}
    //                         <p className="text-gray-300 text-sm font-medium mb-1">
    //                           {link.title}
    //                         </p>
    //                       </div>
    //                       <a
    //                         href={link.url}
    //                         target="_blank"
    //                         rel="noopener noreferrer"
    //                         className="text-blue-400 text-[10px] font-normal hover:underline break-all"
    //                       >
    //                         {authorName}/{link.title}
    //                       </a>
    //                     </div>
    //                   </div>
    //                 </div>
    //               ))}
    //             </div>
    //           ) : (
    //             <p className="text-gray-400 text-center text-sm mt-4">
    //               No bio links available.
    //             </p>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>


    //   <div className="absolute bottom-0 w-full">
    //     {" "}
    //     <Footer />
    //   </div>
    // </div>

    <div className=" bg-gray-900 text-white">
      <NavBar />

     {!loading? 
     <div className="w-full min-h-screen mx-auto px-4 md:px-6 py-8 pb-24">

        {/* ── Page header ──────────────────────────────────────── */}
        <div className="mb-8 px-1">
          <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500 mb-1">
            Account
          </p>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-white">
            Profile Page
          </h1>
        </div>

        {/* ── Two-column layout ─────────────────────────────────── */}
        <div className="grid md:grid-cols-[300px_1fr] gap-4 items-start">

          {/* ══ LEFT — Profile card ══════════════════════════════ */}
          <div className="bg-gray-800/40 border border-white/[0.06] rounded-2xl p-4 text-center">

            {/* Avatar */}
            <div className="relative w-fit mx-auto mb-5">
              {author.profile ? (
                <img
                  src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                  alt="Profile"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-emerald-500/60"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-gray-800 border-2 border-white/10">
                  <HiOutlineUserCircle className="text-gray-600 text-7xl md:text-8xl" />
                </div>
              )}
            </div>

            {/* Name */}
            <h2 className="text-base font-medium text-white mb-1">
              {authorName}
            </h2>

            {/* Role pill */}
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-5">
              {author.role}
            </span>

            {/* Stats row */}
            {author.role !== "student" &&
              (followers?.length > 0 || following?.length > 0 || posts.length > 0) && (
                <div className="flex justify-center gap-px mb-3 rounded-xl overflow-hidden border border-white/[0.06]">
                  {author.role !== "student" && followers?.length > 0 && (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-white">{followers?.length ?? 0}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Followers</p>
                    </div>
                  )}

                  {author.role !== "student" && posts.length > 0 ? (
                    <Link to={`/singleAuthorPosts/${email}`} className="flex-1">
                      <div className="py-3 bg-white/[0.02] hover:bg-emerald-500/5 transition-colors h-full">
                        <p className="text-base font-medium text-emerald-400">{posts.length}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Posts</p>
                      </div>
                    </Link>
                  ) : author.role === "coordinator" ? (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-gray-600">0</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Posts</p>
                    </div>
                  ) : null}

                  {following?.length > 0 && (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-white">{following?.length ?? 0}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Following</p>
                    </div>
                  )}
                </div>
              )}

            {/* Follow / Following button */}
            {/* {author.role === "coordinator" && coordEamil !== authorEmail && (
              <div className="mt-2">
                {author.followers.includes(authorEmail) ? (
                  <button
                    onClick={() => addFollower(email)}
                    disabled={followAuthorLoaderId === email}
                    className="w-full py-2 text-sm font-medium rounded-lg bg-white/[0.04] text-emerald-400 border border-white/[0.07] hover:bg-white/[0.07] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {followAuthorLoaderId === email ? (
                      <div className="flex items-center justify-center gap-1 py-0.5">
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
                    disabled={followAuthorLoaderId === email}
                    className="w-full py-2 text-sm font-medium rounded-lg bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {followAuthorLoaderId === email ? (
                      <div className="flex items-center justify-center gap-1 py-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce" />
                      </div>
                    ) : (
                      "Follow +"
                    )}
                  </button>
                )}
              </div>
            )} */}

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
            md:hover:bg-emerald-600
            border border-neutral-700
            transition-all duration-300
             
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
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500"
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
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/30 border border-white/[0.04] rounded-lg text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500"
                  >
                    Author Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/30 border border-white/[0.04] rounded-lg text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="role"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500"
                  >
                    Author Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={author.role}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/30 border border-white/[0.04] rounded-lg text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Communities — below role */}
                {author.community?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500">
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
                <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500 mb-3">
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
                            className="text-[10px] text-gray-500 hover:text-blue-400 transition-colors truncate block max-w-[180px]"
                          >
                            {authorName}/{link.title}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 bg-white/[0.015] border border-dashed border-white/[0.08] rounded-xl text-center">
                    <PiLinkSimpleFill className="text-2xl text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      No bio links available.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>:
      <ProfileViewSkeleton role={author.role} />
}
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}

export default ViewSingleAuthor;
