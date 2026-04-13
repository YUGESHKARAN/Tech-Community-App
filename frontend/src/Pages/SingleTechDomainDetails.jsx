import React, { useState, useEffect, useRef, useMemo } from "react";
import NavBar from "../ui/NavBar";
import blog1 from "../images/blog1.jpg";
import { AiOutlineMail } from "react-icons/ai";
import { GrLinkedin } from "react-icons/gr";
import Footer from "../ui/Footer";
import user from "../images/user.png";
import axiosInstance from "../instances/Axiosinstances";
import { Link } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { PiLinkSimpleFill } from "react-icons/pi";
import { BsPersonSquare } from "react-icons/bs";
import { useParams } from "react-router-dom";
import useAuthorCommunity from "../hooks/useAuthorCommunity";
import CoordinatorGridSkeleton from "../components/loaders/CoordinatorGridSkeleton ";
import StudentGridSkeleton from "../components/loaders/StudentGridSkeleton ";
import toast from "../components/toaster/Toast";
import { getItem } from "../utils/encode";
import { MdCardMembership } from "react-icons/md";
import useGetCommunityAnalytics from "../hooks/useGetCommunityAnalytics";
import SingleDomainPosts from "../components/SingleDomainPosts";
function SingleTechDomainDetails() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);
  const [authors, setAuthors] = useState([]);
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  const { authorCommunity, setAuthorCommunity } = useAuthorCommunity(email);
  // const role = localStorage.getItem("role");
  const role = getItem("role");

  // --------------------------------------------------------------------------------------

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [updateCommunityLoader, setUpdateCommunity] = useState(false);
  const [followAuthorLoaderId, setFollowAuthorLoaderId] = useState(null);
  const fetchingRef = useRef(false);
  const { communities, loading: statsLoader } = useGetCommunityAnalytics();

  const authorsDetails = async () => {
    if (fetchingRef.current || loading || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/blog/author/getAuthorsByDomain/${decodedCategory}?page=${page}&limit=20`,
      );

      const newAuthors = response.data.filteredAuthors;
      // console.log("response data", response.data);

      if (!newAuthors || newAuthors.length === 0) {
        setHasMore(false);
        return;
      }

      setAuthors((prev) => [...prev, ...newAuthors]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    authorsDetails();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    setAuthors([]);
    setPage(1);
    setHasMore(true);
  }, [decodedCategory]);

  // --------------------------------------------------------------------------------------

  const addFollower = async (userEmail) => {
    // console.log("useremail", userEmail);
    setFollowAuthorLoaderId(userEmail);
    try {
      const response = await axiosInstance.put(
        `/blog/author/follow/${userEmail}`,
        { emailAuthor: email },
      );
      setAuthors((prev) =>
        prev.map((author) => {
          if (author.email === userEmail) {
            const isFollowing = author.followers?.includes(email);

            return {
              ...author,
              followers: isFollowing
                ? author.followers.filter((f) => f !== email)
                : [...(author.followers || []), email],
            };
          }
          return author;
        }),
      );
      // if (response.status === 200) {

      // }
    } catch (err) {
      console.log("error", err);
    } finally {
      setFollowAuthorLoaderId(null);
    }
  };

  const updateCommunity = async (email, techCommunity) => {
    try {
      setUpdateCommunity(true);
      const response = await axiosInstance.put(
        "/blog/author/control/updateCommunity",
        {
          email: email,
          techcommunity: techCommunity,
        },
      );
      if (authorCommunity?.includes(techCommunity)) {
        setAuthorCommunity((prev) =>
          prev.filter((comm) => comm !== techCommunity),
        );
        // toast.info('Left', 'You have left the community!');
      } else {
        setAuthorCommunity((prev) => [...new Set([...prev, techCommunity])]);
        // toast.success('Joined', 'You have joined the community!');
      }
      if (response.status === 201) {
        if (authorCommunity?.includes(techCommunity)) {
          // setAuthorCommunity((prev)=>prev.filter((comm)=> comm!== techCommunity))
          toast.info("Left", "You have left the community!");
        } else {
          // setAuthorCommunity((prev) => [...new Set([...prev, techCommunity])]);
          toast.success("Joined", "You have joined the community!");
        }
      }
    } catch (err) {
      console.log("error", err);
    } finally {
      setUpdateCommunity(false);
    }
  };

  // console.log("authors", authors)
  // console.log("role", role)
  // console.log("decodedCategory", decodedCategory)
  // console.log("authorCommunity", authorCommunity)
  // console.log("communities", communities)
  const categoryStats = useMemo(() => {
    let filtered = communities;
    return filtered.find((comm) => comm.categoryname == decodedCategory);
  }, [communities]);

  // console.log("categoryStats", categoryStats);
  const [showPosts, setShowPosts] = useState(false);  

  return (
    // <div className="w-full h-auto bg-gray-900  relative text-white">
    //   <NavBar />

    //   <div className="min-h-screen">
    //     {/* Page Header */}
    //    {/* HEADER */}
    // <section className="pt-10  px-4 md:px-10 mx-auto md:pt-14 pb-6 border-b border-white/5">
    //   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

    //     {/* Title */}
    //     <div>
    //       <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
    //         <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
    //           {decodedCategory}
    //         </span>{" "}
    //         <span className="text-white/80">Community</span>
    //       </h1>

    //       <p className="text-sm text-gray-400 mt-2">
    //         Connect, collaborate and grow within this tech domain
    //       </p>
    //     </div>

    //     {/* Action */}
    //     <div>
    //       {role === "coordinator" || role === "admin" ? (
    //         authorCommunity.includes(decodedCategory) && (
    //           <span className="px-4 md:px-10 py-2 text-sm text-emerald-400 bg-emerald-600/20 rounded-xl shadow-md">
    //             Coordinator
    //           </span>
    //         )
    //       ) : (
    //         <button
    //           onClick={() => updateCommunity(email, decodedCategory)}
    //           className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300
    //           ${
    //             authorCommunity.includes(decodedCategory)
    //               ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
    //               : "bg-white text-gray-900 hover:bg-gray-200"
    //           }`}
    //         >
    //           {authorCommunity.includes(decodedCategory)
    //             ? "✓ Joined"
    //             : "Join Community"}
    //         </button>
    //       )}
    //     </div>

    //   </div>
    // </section>

    //     {/* Content */}
    //     <section className="w-full px-4 md:px-10 mx-auto mt-10 space-y-10 mt-0">
    //       {/* Coordinators */}
    //       {authors.filter((a) => a.role === "coordinator").length > 0 && (
    //         <>
    //        <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
    //         Community Coordinators
    //       </h2>

    //           <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
    //             {authors
    //               .filter((a) => a.role === "coordinator")
    //               .map((author, index) => (
    //                 <div
    //                   key={index}
    //                   className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 text-center hover:shadow-xl transition"
    //                 >
    //                   <Link to={`/viewProfile/${author.email}`}>
    //                     <img
    //                       src={
    //                         author.profile
    //                           ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
    //                           : user
    //                       }
    //                       className="w-24 h-24 mx-auto bg-white rounded-full object-cover border border-gray-600"
    //                     />
    //                   </Link>

    //                   <h3 className="mt-3 font-semibold text-white truncate">
    //                     {author.authorName}
    //                   </h3>
    //                   <p className="text-xs text-gray-400 truncate">
    //                     {author.email}
    //                   </p>

    //                   <div className="flex justify-center gap-6 mt-4 text-xs text-gray-300">
    //                     <span>
    //                       <b className="text-white">
    //                         {author.followers.length}
    //                       </b>{" "}
    //                       Followers
    //                     </span>
    //                  {author?.postCount>0 &&   <span>
    //                       <b className="text-white">{author?.postCount}</b> Posts
    //                     </span>}
    //                   </div>

    //                   {/* Social media components */}

    //                   {/* {author.profileLinks?.length > 0 && (
    //                                 <div className="flex justify-center gap-3 mt-4">
    //                                   {author.profileLinks.map((link, i) => (
    //                                     <Link key={i} to={link.url} target="_blank">
    //                                       {link.title === "LinkedIn" ? (
    //                                         <FaLinkedin className="text-gray-300 hover:text-green-400 transition" />
    //                                       ) : link.title === "GitHub" ? (
    //                                         <FaSquareGithub className="text-gray-300 hover:text-green-400 transition" />
    //                                       ) : (
    //                                         <PiLinkSimpleFill className="text-gray-300 hover:text-green-400 transition" />
    //                                       )}
    //                                     </Link>
    //                                   ))}
    //                                 </div>
    //                               )} */}

    //                   {author.email != email ? (
    //                     <div className="mt-5">
    //                       {author.followers.includes(email) ? (
    //                         <button
    //                           onClick={() => addFollower(author.email)}
    //                           className="w-full py-2 cursor-pointer rounded-lg bg-gray-700 text-gray-300 text-sm cursor-default"
    //                         >
    //                           Following
    //                         </button>
    //                       ) : (
    //                         <button
    //                           onClick={() => addFollower(author.email)}
    //                           className="w-full py-2 rounded-lg bg-green-500 text-gray-900 text-sm font-medium hover:bg-green-400 transition"
    //                         >
    //                           Follow
    //                         </button>
    //                       )}
    //                     </div>
    //                   ) : (
    //                     <div className="mt-5 px-4 md:px-10 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-medium">
    //                       Coordinating
    //                     </div>
    //                   )}
    //                 </div>
    //               ))}

    //             {loading && (
    //               <div className="col-span-full flex justify-center py-4">
    //                   <div className="relative flex items-center justify-center">
    //                     {/* Outer Oval Ring */}
    //                     <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

    //                     {/* Inner Glow Pulse */}
    //                     {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
    //                   </div>
    //                 </div>
    //             )}

    //             {!hasMore && (
    //               <p className="text-center  col-span-full py-4 text-gray-500">
    //                 No more coordinators
    //               </p>
    //             )}
    //           </div>
    //         </>
    //       )}
    //       {loading &&
    //         authors.filter((a) => a.role === "coordinator").length == 0 && (
    //           <div className="col-span-full">
    //             <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
    //               Community Coordinators
    //             </h2>
    //             <CoordinatorGridSkeleton />
    //           </div>
    //         )}

    //       {/* Students */}
    //       {authors.filter((a) => a.role === "student").length > 0 && (
    //         <div>
    //           <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
    //             Community Members
    //             {/* ({authors.filter((a) => a.role === "student").length}) */}
    //           </h2>

    //           <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2 md:gap-4 mt-8">
    //             {authors
    //               .filter((a) => a.role === "student")
    //               .map((author, index) => (
    //                 <div
    //                   key={index}
    //                   className="
    //                                 bg-gray-900/70
    //                                 border border-gray-700
    //                                 rounded-xl
    //                                 p-5
    //                                 flex flex-col items-center
    //                                 text-center
    //                                 shadow
    //                                 hover:shadow-xl
    //                                 hover:-translate-y-1
    //                                 transition-all duration-300
    //                               "
    //                 >
    //                   {/* Avatar */}
    //                   <Link to={`/viewProfile/${author.email}`}>
    //                     <img
    //                       src={
    //                         author.profile
    //                           ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
    //                           : user
    //                       }
    //                       alt={author.authorName}
    //                       className="
    //                                       w-20 h-20
    //                                       rounded-full
    //                                       object-cover
    //                                       border border-gray-600
    //                                       shadow-sm
    //                                       hover:shadow-md
    //                                       transition
    //                                       bg-white
    //                                   "
    //                     />
    //                   </Link>

    //                   {/* Name */}
    //                   <h3 className="mt-4 font-semibold text-sm md:text-base text-white truncate w-full">
    //                     {author.authorName}
    //                   </h3>

    //                   {/* Email */}
    //                   <p className="text-xs text-gray-400 truncate w-full">
    //                     {author.email}
    //                   </p>

    //                   {/* Social Links */}

    //                   {/* {author.profileLinks?.length > 0 && (
    //                                 <div className="flex justify-center gap-4 mt-4">
    //                                   {author.profileLinks.map((link, i) => (
    //                                     <Link
    //                                       key={i}
    //                                       to={link.url}
    //                                       title={link.title}
    //                                       target="_blank"
    //                                       className="text-gray-400 hover:text-green-400 transition"
    //                                     >
    //                                       {link.title === "LinkedIn" ? (
    //                                         <FaLinkedin className="text-lg" />
    //                                       ) : link.title === "GitHub" ? (
    //                                         <FaSquareGithub className="text-lg" />
    //                                       ) : link.title === "Portfolio" ? (
    //                                         <BsPersonSquare className="text-lg" />
    //                                       ) : (
    //                                         <PiLinkSimpleFill className="text-lg" />
    //                                       )}
    //                                     </Link>
    //                                   ))}
    //                                 </div>
    //                               )} */}
    //                 </div>
    //               ))}

    //             {loading && (
    //               <div className="col-span-full flex justify-center py-4">
    //                   <div className="relative flex items-center justify-center">
    //                     {/* Outer Oval Ring */}
    //                     <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

    //                     {/* Inner Glow Pulse */}
    //                     {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
    //                   </div>
    //                 </div>
    //             )}

    //             {!hasMore && (
    //               <p className="text-center  col-span-full py-4 text-gray-500">
    //                 No more members
    //               </p>
    //             )}
    //           </div>
    //         </div>
    //       )}

    //       {loading &&
    //         authors.filter((a) => a.role === "student").length == 0 && (
    //           <div className="col-span-full">
    //             <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
    //               Community Members
    //             </h2>
    //             <StudentGridSkeleton />
    //           </div>
    //         )}
    //     </section>
    //   </div>

    //   <Footer />
    // </div>

    <div className="w-full min-h-screen bg-gray-900 text-white">
      <NavBar />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="px-4 md:px-10 pt-10 pb-7 border-white/5">
        <div className="w-full mx-auto md:flex flex-wrap items-start justify-between gap-5">
          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-5xl text-center md:text-left font-medium tracking-tight leading-none">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
                {decodedCategory}
              </span>{" "}
              <span className="text-white/60">Community</span>
            </h1>
            <p className="mt-2.5 text-xs text-center md:text-left md:text-sm text-gray-500">
              Connect, collaborate and grow together
            </p>
          </div>

          {/* Action */}
          <div className="flex px-4  md:px-0 pt-4 justify-center md:justify-none items-center md:pt-1">
            {role === "coordinator" || role === "admin" ? (
              authorCommunity.includes(decodedCategory) && (
                <span className="px-4 md:px-10 py-2 text-sm font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                  Coordinating
                </span>
              )
            ) : (
              <button
                onClick={() => updateCommunity(email, decodedCategory)}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed  ${
                  authorCommunity.includes(decodedCategory)
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    : "bg-gray-100/5 text-emerald-500   border border-emerald-500/25"
                }`}
                disabled={updateCommunityLoader}
              >
                {authorCommunity.includes(decodedCategory)
                  ? updateCommunityLoader
                    ? "Exiting..."
                    : "✓ Joined"
                  : updateCommunityLoader
                    ? "Joining..."
                    : "Join Community"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── STATS ROW ──────────────────────────────────────────── */}
      <div className="w-full mx-auto md:mx-0 px-4 md:px-10 ">
        {statsLoader ? (
          <div className="flex w-fit mx-auto md:mx-0 flex-wrap rounded-xl overflow-hidden border border-white/5 divide-x divide-white/5 animate-pulse">
            {[
              { label: "Coordinators" },
              { label: "Posts" },
              { label: "Members" },
            ].map(({ label }, i) => (
              <div
                key={i}
                className="flex flex-col px-7 py-4 bg-white/[0.03] items-center"
              >
                {/* Value skeleton */}
                <div className="h-5 w-10 bg-white/10 rounded-md mb-2" />

                {/* Label skeleton */}
                <span className="text-xs text-gray-500 mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex w-fit mx-auto md:mx-0 flex-wrap rounded-xl overflow-hidden border border-white/5 divide-x divide-white/5">
            {[
              { label: "Coordinators", value: categoryStats?.authorcount || 0 },
              { label: "Posts", value: categoryStats?.postscount || 0 },
              { label: "Members", value: categoryStats?.followerscount || 0 },
            ].map(({ label, value }, i) => (
              <div key={i} className="flex flex-col px-7 py-4 bg-white/[0.03]">
                {/* <span className="text-xl font-medium text-center text-white tracking-tight">
                  {value}
                </span> */}

                <span
                  className={`text-xl font-medium text-center tracking-tight ${label === "Posts" ? "text-emerald-400" : "text-white"}`}
                  onClick={()=>{setShowPosts(label === "Posts" ? true : false) }}
                >
                  {/* {label === "Posts" ? <Link to={`/community/posts/${encodeURIComponent(decodedCategory)}`}>{value}</Link> : value} */}
                  {value}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────── */}
    {!showPosts?  <main className="w-full mx-auto px-4 md:px-10 pb-16">
        {/* ── COORDINATORS ─────────────────────────────────────── */}
        {authors.filter((a) => a.role === "coordinator").length > 0 && (
          <section className="mt-10">
            <p className="text-xs text-center md:text-sm font-medium tracking-widest uppercase md:text-gray-400 text-gray-500 mb-4">
              Community Coordinators
            </p>

            <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {authors
                .filter((a) => a.role === "coordinator")
                .map((author, index) => (
                  <div
                    key={index}
                    className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 text-center hover:shadow-xl transition"
                  >
                    <Link to={`/viewProfile/${author.email}`}>
                      <img
                        src={
                          author.profile
                            ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                            : user
                        }
                        className="w-24 h-24 mx-auto bg-gray-700 rounded-full object-cover border border-gray-900"
                      />
                    </Link>

                    <h3 className="mt-3 font-semibold text-white truncate">
                      {author.authorName}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {author.email}
                    </p>

                    <div className="flex justify-center gap-6 mt-4 text-xs text-gray-300">
                      <span>
                        <b className="text-white">{author.followers.length}</b>{" "}
                        Followers
                      </span>
                      {author?.postCount > 0 && (
                        <span>
                          <b className="text-white">{author?.postCount}</b>{" "}
                          Posts
                        </span>
                      )}
                    </div>

                    {/* Social media components */}

                    {/* {author.profileLinks?.length > 0 && (
                                    <div className="flex justify-center gap-3 mt-4">
                                      {author.profileLinks.map((link, i) => (
                                        <Link key={i} to={link.url} target="_blank">
                                          {link.title === "LinkedIn" ? (
                                            <FaLinkedin className="text-gray-300 hover:text-green-400 transition" />
                                          ) : link.title === "GitHub" ? (
                                            <FaSquareGithub className="text-gray-300 hover:text-green-400 transition" />
                                          ) : (
                                            <PiLinkSimpleFill className="text-gray-300 hover:text-green-400 transition" />
                                          )}
                                        </Link>
                                      ))}
                                    </div>
                                  )} */}

                    {author.email != email ? (
                      <div className="mt-5">
                        {author.followers.includes(email) ? (
                          <button
                            onClick={() => addFollower(author.email)}
                            className="w-full py-2 cursor-pointer rounded-lg bg-gray-700 text-gray-300 text-sm cursor-default transition-all duration-400 disabled:bg-transparent"
                            disabled={followAuthorLoaderId === author.email}
                          >
                            {followAuthorLoaderId === author.email ? (
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
                            onClick={() => addFollower(author.email)}
                            className="w-full py-2 rounded-lg bg-green-500 text-gray-900 text-sm font-medium hover:bg-green-400 transition-all duration-400 disabled:bg-transparent"
                            disabled={followAuthorLoaderId === author.email}
                          >
                            {followAuthorLoaderId === author.email ? (
                              <div className="flex items-center py-1.5 justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                              </div>
                            ) : (
                              "Follow"
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 px-4 md:px-10 py-2 text-sm font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                        Coordinating
                      </div>
                    )}
                  </div>
                ))}

              {loading && (
                <div className="col-span-full flex justify-center py-4">
                  <div className="relative flex items-center justify-center">
                    {/* Outer Oval Ring */}
                    <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                    {/* Inner Glow Pulse */}
                    {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                  </div>
                </div>
              )}

              {!hasMore && (
                <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                  No more coordinators
                </p>
              )}
            </div>
          </section>
        )}

        {/* Coordinator skeleton */}
        {loading &&
          authors.filter((a) => a.role === "coordinator").length === 0 && (
            <section className="mt-10">
              <p className="text-xs text-center md:text-sm font-medium tracking-widest uppercase md:text-gray-400 text-gray-500 mb-4">
                Community Coordinators
              </p>
              <CoordinatorGridSkeleton />
            </section>
          )}

        {/* ── DIVIDER ────────────────────────────────────────────── */}
        {authors.filter((a) => a.role === "coordinator").length > 0 &&
          authors.filter((a) => a.role === "student").length > 0 && (
            <hr className="border-white/5 mt-10" />
          )}

        {/* ── MEMBERS ──────────────────────────────────────────── */}
        {authors.filter((a) => a.role === "student").length > 0 && (
          <section className="mt-4">
            <p className="text-xs text-center md:text-sm font-medium tracking-widest uppercase md:text-gray-400 text-gray-500 mb-4">
              Community Members
            </p>

            <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2 md:gap-4 mt-4">
              {authors
                .filter((a) => a.role === "student")
                .map((author, index) => (
                  <div
                    key={index}
                    className="
                                    bg-gray-900/70
                                    border border-gray-700
                                    rounded-xl
                                    p-5
                                    flex flex-col items-center
                                    text-center
                                    shadow
                                    hover:shadow-xl
                                    hover:-translate-y-1
                                    transition-all duration-300
                                  "
                  >
                    {/* Avatar */}
                    <Link to={`/viewProfile/${author.email}`}>
                      <img
                        src={
                          author.profile
                            ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                            : user
                        }
                        alt={author.authorName}
                        className="
                                          w-20 h-20
                                          rounded-full
                                          object-cover
                                          border border-gray-900
                                          shadow-sm
                                          hover:shadow-md
                                          transition
                                          bg-gray-700
                                      "
                      />
                    </Link>

                    {/* Name */}
                    <h3 className="mt-4 font-semibold text-sm md:text-base text-white truncate w-full">
                      {author.authorName}
                    </h3>

                    {/* Email */}
                    <p className="text-xs text-gray-400 truncate w-full">
                      {author.email}
                    </p>

                    {/* Social Links */}

                    {/* {author.profileLinks?.length > 0 && (
                                    <div className="flex justify-center gap-4 mt-4">
                                      {author.profileLinks.map((link, i) => (
                                        <Link
                                          key={i}
                                          to={link.url}
                                          title={link.title}
                                          target="_blank"
                                          className="text-gray-400 hover:text-green-400 transition"
                                        >
                                          {link.title === "LinkedIn" ? (
                                            <FaLinkedin className="text-lg" />
                                          ) : link.title === "GitHub" ? (
                                            <FaSquareGithub className="text-lg" />
                                          ) : link.title === "Portfolio" ? (
                                            <BsPersonSquare className="text-lg" />
                                          ) : (
                                            <PiLinkSimpleFill className="text-lg" />
                                          )}
                                        </Link>
                                      ))}
                                    </div>
                                  )} */}
                  </div>
                ))}

              {loading && (
                <div className="col-span-full flex justify-center py-4">
                  <div className="relative flex items-center justify-center">
                    {/* Outer Oval Ring */}
                    <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                    {/* Inner Glow Pulse */}
                    {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                  </div>
                </div>
              )}

              {!hasMore && (
                <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                  No more members
                </p>
              )}
            </div>
          </section>
        )}

        {/* Member skeleton */}
        {loading &&
          authors.filter((a) => a.role === "student").length === 0 && (
            <section className="mt-10">
              <p className="text-xs text-center md:text-sm font-medium tracking-widest uppercase md:text-gray-400 text-gray-500 mb-4">
                Community Members
              </p>
              <StudentGridSkeleton />
            </section>
          )}
      </main>:
      <SingleDomainPosts category={decodedCategory} />
        }

      <Footer />
    </div>
  );
}

export default SingleTechDomainDetails;

//     <div className="w-full min-h-screen bg-gray-900 text-white">
//   <NavBar />

//   <div className="w-full mx-auto px-4 md:px-10">

//     {/* HEADER */}
//     <section className="pt-10 md:pt-14 pb-6 border-b border-white/5">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

//         {/* Title */}
//         <div>
//           <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
//             <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
//               {decodedCategory}
//             </span>{" "}
//             <span className="text-white/80">Community</span>
//           </h1>

//           <p className="text-sm text-gray-400 mt-2">
//             Connect, collaborate and grow within this tech domain
//           </p>
//         </div>

//         {/* Action */}
//         <div>
//           {role === "coordinator" || role === "admin" ? (
//             authorCommunity.includes(decodedCategory) && (
//               <span className="px-4 md:px-10 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md">
//                 Coordinator
//               </span>
//             )
//           ) : (
//             <button
//               onClick={() => updateCommunity(email, decodedCategory)}
//               className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300
//               ${
//                 authorCommunity.includes(decodedCategory)
//                   ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
//                   : "bg-white text-gray-900 hover:bg-gray-200"
//               }`}
//             >
//               {authorCommunity.includes(decodedCategory)
//                 ? "✓ Joined"
//                 : "Join Community"}
//             </button>
//           )}
//         </div>

//       </div>
//     </section>

//     {/* CONTENT */}
//     <section className="mt-10 md:mt-14 space-y-14">

//       {/* ================= COORDINATORS ================= */}
//       {authors.filter((a) => a.role === "coordinator").length > 0 && (
//         <div>
//           <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
//             Community Coordinators
//           </h2>

//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">

//             {authors
//               .filter((a) => a.role === "coordinator")
//               .map((author, index) => (
//                 <div
//                   key={index}
//                   className="group bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center hover:border-white/20 hover:shadow-lg transition-all duration-300"
//                 >

//                   <Link to={`/viewProfile/${author.email}`}>
//                     <img
//                       src={
//                         author.profile
//                           ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
//                           : user
//                       }
//                       className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full object-cover border border-white/10"
//                     />
//                   </Link>

//                   <h3 className="mt-4 text-sm md:text-base font-semibold text-white truncate">
//                     {author.authorName}
//                   </h3>

//                   <p className="text-xs text-gray-400 truncate">
//                     {author.email}
//                   </p>

//                   {/* Stats */}
//                   <div className="flex justify-center gap-4 mt-4 text-xs">
//                     <span className="text-gray-400">
//                       <span className="text-white font-semibold">
//                         {author.followers.length}
//                       </span>{" "}
//                       Followers
//                     </span>

//                     {author?.postCount > 0 && (
//                       <span className="text-gray-400">
//                         <span className="text-white font-semibold">
//                           {author.postCount}
//                         </span>{" "}
//                         Posts
//                       </span>
//                     )}
//                   </div>

//                   {/* Actions */}
//                   {author.email !== email ? (
//                     <button
//                       onClick={() => addFollower(author.email)}
//                       className={`mt-5 w-full py-2 rounded-lg text-xs font-medium transition-all
//                       ${
//                         author.followers.includes(email)
//                           ? "bg-white/5 text-gray-400 cursor-default"
//                           : "bg-emerald-500 text-gray-900 hover:bg-emerald-400"
//                       }`}
//                     >
//                       {author.followers.includes(email)
//                         ? "Following"
//                         : "Follow"}
//                     </button>
//                   ) : (
//                     <div className="mt-5 py-2 rounded-lg text-xs font-medium bg-amber-400 text-black">
//                       Coordinating
//                     </div>
//                   )}
//                 </div>
//               ))}

//             {/* Loader */}
//             {loading && (
//               <div className="col-span-full flex justify-center py-6">
//                 <div className="flex items-center gap-2 text-xs text-gray-400">
//                   <div className="w-4 h-4 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
//                   Loading...
//                 </div>
//               </div>
//             )}

//             {!hasMore && (
//               <p className="text-center col-span-full py-4 text-gray-500">
//                 No more coordinators
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Skeleton if no coordinators yet */}
//       {loading &&
//         authors.filter((a) => a.role === "coordinator").length === 0 && (
//           <div>
//             <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
//               Community Coordinators
//             </h2>
//             <CoordinatorGridSkeleton />
//           </div>
//         )}

//       {/* ================= STUDENTS ================= */}
//       {authors.filter((a) => a.role === "student").length > 0 && (
//         <div>
//           <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
//             Community Members
//           </h2>

//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">

//             {authors
//               .filter((a) => a.role === "student")
//               .map((author, index) => (
//                 <div
//                   key={index}
//                   className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/[0.04] transition"
//                 >
//                   <Link to={`/viewProfile/${author.email}`}>
//                     <img
//                       src={
//                         author.profile
//                           ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
//                           : user
//                       }
//                       className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border border-white/10"
//                     />
//                   </Link>

//                   <h3 className="mt-3 text-sm font-semibold text-white truncate w-full">
//                     {author.authorName}
//                   </h3>

//                   <p className="text-xs text-gray-500 truncate w-full">
//                     {author.email}
//                   </p>
//                 </div>
//               ))}

//             {/* Loader */}
//             {loading && (
//               <div className="col-span-full flex justify-center py-6">
//                 <div className="flex items-center gap-2 text-xs text-gray-400">
//                   <div className="w-4 h-4 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
//                   Loading...
//                 </div>
//               </div>
//             )}

//             {!hasMore && (
//               <p className="text-center col-span-full py-4 text-gray-500">
//                 No more members
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Skeleton if no students yet */}
//       {loading &&
//         authors.filter((a) => a.role === "student").length === 0 && (
//           <div>
//             <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
//               Community Members
//             </h2>
//             <StudentGridSkeleton />
//           </div>
//         )}

//     </section>
//   </div>

//   <Footer />
// </div>
