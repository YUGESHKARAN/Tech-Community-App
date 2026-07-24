// import React, { useState, useEffect, useRef, useMemo } from "react";
// import NavBar from "../ui/NavBar";
// import blog1 from "../images/blog1.jpg";
// import { AiOutlineMail } from "react-icons/ai";
// import { GrLinkedin } from "react-icons/gr";
// import Footer from "../ui/Footer";
// import user from "../images/user.png";
// import axiosInstance from "../instances/Axiosinstances";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { FaLinkedin } from "react-icons/fa";
// import { FaSquareGithub } from "react-icons/fa6";
// import { PiLinkSimpleFill } from "react-icons/pi";
// import { BsFilterLeft, BsPersonSquare } from "react-icons/bs";
// import { IoCheckmark, IoSearch } from "react-icons/io5";
// import { IoIosGitNetwork } from "react-icons/io";
// import RecommendedAuthorsSkeleton from "../components/loaders/RecommendedAuthorsSkeleton ";
// import CoordinatorGridSkeleton from "../components/loaders/CoordinatorGridSkeleton ";
// import StudentGridSkeleton from "../components/loaders/StudentGridSkeleton ";
// import Cookies from "js-cookie";
// import Fuse from "fuse.js";
// import { getItem } from "../utils/encode";
// import highlightText from "../hooks/highlightText";
// import BadgeIcons from "../components/achievements/BadgeIcons";
// import formatCount from "../utils/NumberConversion";
// function Authors() {

//   const [authors, setAuthors] = useState([]);
//   const email = getItem("email");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [follow, setFollow] = useState(false);
//   const [recommendation, setRecommendation] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const token = Cookies.get("token");

//   // Search query
//   const [searchQuery, setSearchQuery] = useState("");
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const limit = 20;
//   const isFetching = useRef(false);
//   const [followLoadingIds, setFollowLoadingIds] = useState(new Set());
//   const [showAuthorFilter, setShowAuthorFilter] = useState(false);

//   const authorsDetails = async () => {
//     if (!hasMore || isFetching.current) return; // IMPORTANT

//     isFetching.current = true;
//     setLoading(true);

//     try {
//       const response = await axiosInstance.get(
//         `/blog/author/profiles?page=${page}&limit=${limit}`,
//       );

//       const newAuthors = response.data.data.filter(
//         (author) => author.email !== email,
//       );

//       if (newAuthors.length === 0) {
//         setHasMore(false);
//       } else {
//         setAuthors((prev) => [...prev, ...newAuthors]);
//         setPage((prev) => prev + 1);
//       }
//     } catch (err) {
//       console.error("error", err);
//     } finally {
//       isFetching.current = false;
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     authorsDetails();
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (
//         window.innerHeight + document.documentElement.scrollTop + 50 >=
//         document.documentElement.scrollHeight
//       ) {
//         authorsDetails();
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [page, hasMore]);

//   const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(searchQuery);
//     }, 300); // 300ms delay

//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   const fuse = useMemo(() => {
//     return new Fuse(authors, {
//       keys: ["authorName", "email"],
//       threshold: 0.2, // lower = stricter search
//     });
//   }, [authors]);

//   const filteredAuthors = useMemo(() => {
//     let filtered = [...authors];

//     if (debouncedSearch.trim() !== "") {
//       filtered = fuse.search(debouncedSearch).map((r) => r.item);
//     }
//     if (roleFilter !== "") {
//       filtered = filtered.filter((author) => author.role === roleFilter);
//     }

//     return filtered;
//   }, [searchQuery, roleFilter, authors, debouncedSearch]);

//   const recommendationURL = import.meta.env.VITE_RECOMMENDATION_URL;

//   const recommendtion_system = async () => {
//     try {
//       const response = await axios.post(
//         `${recommendationURL}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       // console.log("recommedation data",response.data)
//       setRecommendation(response.data.recommended_people);
//     } catch (err) {
//       console.log("error", err);
//     }
//   };

//   useEffect(() => {
//     recommendtion_system();
//   }, []);

//   const addFollower = async (userEmail) => {
//     setFollowLoadingIds((prev) => new Set(prev).add(userEmail));

//     try {
//       const response = await axiosInstance.put(
//         `/blog/author/follow/${userEmail}`,
//         { emailAuthor: email },
//       );

//       if (response.status === 200) {
//         setAuthors((prev) =>
//           prev.map((author) => {
//             if (author.email === userEmail) {
//               const isFollowing = author.followers?.includes(email);

//               return {
//                 ...author,
//                 followers: isFollowing
//                   ? author.followers.filter((f) => f !== email)
//                   : [...(author.followers || []), email],
//               };
//             }
//             return author;
//           }),
//         );
//       }
//     } catch (err) {
//       console.log("error", err);
//     } finally {
//       setFollowLoadingIds((prev) => {
//         const updated = new Set(prev);
//         updated.delete(userEmail);
//         return updated;
//       });
//     }
//   };
//   const recommendationSet = useMemo(
//     () => new Set(recommendation),
//     [recommendation],
//   );

//   let rcmdAuthors = authors.filter(
//     (author) =>
//       recommendationSet.has(author.email) && author.role === "coordinator",
//   );

//   const fuse2 = useMemo(() => {
//     return new Fuse(rcmdAuthors, {
//       keys: ["authorName", "email"],
//       threshold: 0.1, // lower = stricter search
//     });
//   }, [rcmdAuthors]);

//   const recommendedAuthors = useMemo(() => {
//     let filtered = authors.filter(
//       (author) =>
//         recommendationSet.has(author.email) && author.role === "coordinator",
//     );
//     if (debouncedSearch.trim() !== "") {
//       filtered = fuse2.search(debouncedSearch).map((r) => r.item);
//       // filtered = []
//     }
//     return filtered;
//   }, [authors, searchQuery, debouncedSearch, recommendationSet]);

//   const authorFilterRef = useRef();

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         authorFilterRef.current &&
//         !authorFilterRef.current.contains(event.target)
//       ) {
//         setShowAuthorFilter(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // console.log("authors", authors)
//   // console.log("recommendation", recommendation)

//   return (
//     <div className="w-full min-h-screen theme ">
//       <NavBar />

//       <div className="w-full max-w-[1800px] mx-auto px-4 mx-auto flex items-center gap-2 md:gap-3 py-3 md:pt-6">
//         <IoIosGitNetwork className="text-green-400 text-xl md:text-3xl" />
//         <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-white">
//           My Network
//         </h1>
//       </div>

//       {/* Search and Filter */}
//       <div className="w-full max-w-[1800px] px-4 mx-auto flex mt-0 md:mt-4   md:flex-row  items-center gap-2 md:gap-3 mb-3 md:mb-6">
//         <div
//           // className="md:w-1/3 w-3/5 px-4 py-2 flex items-center gap-2 justify-center rounded-md bg-gray-600 border border-white text-xs md:text-base text-white placeholder-gray-400"
//           className="w-full max-w-md flex items-center gap-3 theme-fields-lite border border-gray-700 rounded-xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition"
//         >
//           <IoSearch className="text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by name or email..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="bg-transparent w-full focus:outline-none text-xs md:text-sm text-white placeholder-gray-400"
//           />
//         </div>

//         <div className="relative transition-all duration-300 cursor-pointer">
//           <span
//             onClick={() => {
//               setShowAuthorFilter(true);
//             }}
//             className="reltive"
//           >
//             <BsFilterLeft className="text-gray-300  rounded-full p-0.5 text-3xl " />

//             <IoCheckmark
//               className={`${roleFilter !== "" ? "text-emerald-400" : "text-gray-300"} absolute bottom-1 right-0 transition-all duration-300`}
//             />
//           </span>

//           <div
//             ref={authorFilterRef}
//             className={`${
//               showAuthorFilter
//                 ? "absolute top-12 md:top-10 right-0 md:left-0 z-50 px-2 py-1 w-32 overflow-hidden rounded-lg border border-[#30363d] theme shadow-2xl"
//                 : "hidden"
//             }`}
//             onClick={() => {
//               setShowAuthorFilter(false);
//             }}
//           >
//             {/* Top Section */}
//             <div className="py-1.5">
//               <div
//                 onClick={() => {
//                   setRoleFilter("");
//                 }}
//               >
//                 <button
//                   className="
//                 w-full flex items-center gap-2
//                 pl-3  md:py-1.5 py-1
//                 text-xs text-gray-100
//                 hover:bg-gray-800/70
//                 transition-all duration-200
//                 rounded-lg
//               "
//                 >
//                   <span className="flex items-center gap-2">
//                     All{" "}
//                     {roleFilter === "" && (
//                       <IoCheckmark className="text-sm text-emerald-400" />
//                     )}
//                   </span>
//                 </button>
//               </div>

//               <div
//                 onClick={() => {
//                   setRoleFilter("coordinator");
//                 }}
//               >
//                 <button
//                   className="
//                 w-full flex items-center gap-2
//                 pl-3  md:py-1.5 py-1
//                 text-xs text-gray-100
//                 hover:bg-gray-800/70
//                 transition-all duration-200
//                 rounded-lg

//               "
//                 >
//                   <span className="flex items-center gap-2">
//                     {" "}
//                     Contributors{" "}
//                     {roleFilter === "coordinator" && (
//                       <IoCheckmark className="text-sm text-emerald-400" />
//                     )}
//                   </span>
//                 </button>
//               </div>

//               <div
//                 onClick={() => {
//                   setRoleFilter("student");
//                 }}
//               >
//                 <button
//                   className="
//                 w-full flex items-center gap-2
//                 pl-3  md:py-1.5 py-1
//                 text-xs text-gray-100
//                 hover:bg-gray-800/70
//                 transition-all duration-200
//                 rounded-lg

//               "
//                 >
//                   <span className="flex items-center gap-2">
//                     {" "}
//                     Users{" "}
//                     {roleFilter === "student" && (
//                       <IoCheckmark className="text-sm text-emerald-400" />
//                     )}
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Recommended authors */}
//       {recommendedAuthors?.length > 0 && !debouncedSearch && !roleFilter && (
//         <h2 className="w-full max-w-[1800px] mx-auto px-4 mx-auto tracking-wide  text-left text-lg text-green-400 md:text-2xl font-semibold">
//           Recommended
//         </h2>
//       )}

//       <div
//         className={`${recommendedAuthors?.length > 0 && !debouncedSearch && !roleFilter ? "flex w-full px-4 max-w-[1800px] mx-auto gap-2 overflow-x-auto scrollbar-hide mt-2 md:mt-4 pb-2" : "hidden"}`}
//       >
//         {recommendedAuthors.map((author, index) => (
//           <div
//             key={index}
//             className="min-w-[260px] theme border border-gray-700 rounded-xl p-4 shadow hover:shadow-xl transition"
//           >
//             <div className="flex items-center relative gap-3">
//               <Link
//                 to={`/viewProfile/${author.email}`}
//                 className="flex-shrink-0"
//               >
//                 <img
//                   src={
//                     author.profile
//                       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
//                       : user
//                   }
//                   className="w-12 h-12 bg-gray-700 rounded-full object-cover border border-gray-700"
//                 />
//               </Link>
//               {author?.badges?.length > 0 && (
//                   <Link to={`/viewProfile/${author.email}`}
//                  className="cursor-pointer text-xs w-fit">
//                   <BadgeIcons
//                     badges={author?.badges}
//                     parentClass="-top-1.5 -right-1.5  -space-x-1.5"
//                     shieldClassName="w-4 h-4"
//                   />
//                 </Link>
//               )}

//               <div className="flex-1 min-w-0 md:w-48 w-44">
//                 <h3 className="text-sm font-semibold min-w-0 text-white truncate">

//                   {highlightText(author.authorName, debouncedSearch)}
//                 </h3>
//                 <p className="text-xs text-gray-400 min-w-0 text-[9px] w-9/12 md:w-9/12 truncate">
//                   {highlightText(author.email, debouncedSearch)}
//                 </p>
//               </div>
//             </div>

//             <div
//               className={`flex md:mt-4 mt-1 text-[11px] md:text-xs text-gray-300 ${author?.postCount > 0 ? "justify-between" : "justify-center"}`}
//             >
//               <span className="text-gray-400">
//                 <b className="text-white">{formatCount(author.followers.length)}</b>{" "}
//                 Followers
//               </span>
//               {author?.postCount > 0 && (
//                 <span className="text-gray-400">
//                   <b className="text-white">{formatCount(author?.postCount)}</b> Posts
//                 </span>
//               )}
//             </div>

//             <div className="md:mt-4 mt-3">
//               {author.followers.includes(email) ? (
//                 <button
//                   onClick={() => addFollower(author.email)}
//                   className="w-full py-2 rounded-lg bg-gray-800 outline-none border-0 text-gray-300 text-sm transition-all duration-300 disabled:bg-transparent"
//                   disabled={followLoadingIds.has(author.email)}
//                 >
//                   {followLoadingIds.has(author.email) ? (
//                     <div className="flex items-center py-1.5 mt-0.5 justify-center gap-1">
//                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
//                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
//                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
//                     </div>
//                   ) : (
//                     "Following"
//                   )}
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => addFollower(author.email)}
//                   className={`w-full py-2 rounded-lg text-green-400 outline-0 ${!followLoadingIds.has(author.email) ? "border border-green-700" : "border-gray-900"}  text-sm font-medium outline-none hover:text-green-400 hover:border-green-700  md:hover:text-green-300 md:hover:border-green-600 transition-all duration-300 disabled:bg-transparent`}
//                   disabled={followLoadingIds.has(author.email)}
//                 >
//                   {followLoadingIds.has(author.email) ? (
//                     <div className="flex items-center py-1.5 mt-0.5 justify-center gap-1">
//                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
//                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
//                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
//                     </div>
//                   ) : (
//                     "+ Follow"
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//       {loading &&
//         recommendedAuthors?.length == 0 &&
//         filteredAuthors?.length == 0 && (
//           <>
//             <h2 className="w-full max-w-[1800px] mx-auto px-4 mx-auto  tracking-wide text-left text-lg text-green-400 md:text-2xl font-semibold">
//               Recommended
//             </h2>
//             <RecommendedAuthorsSkeleton />
//           </>
//         )}

//       <div className="w-full px-4 max-w-[1800px] mx-auto min-h-screen flex flex-col items-center text-white">
//         {/* Coordinators Section */}
//         {filteredAuthors.filter((author) => author.role === "coordinator")
//           .length > 0 && (
//           <h2 className="w-full   text-center text-sm md:text-gray-500 tracking-widest uppercase text-gray-500  font-semibold my-4 md:my-6">
//             Contributors
//           </h2>
//         )}

//         <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
//           {filteredAuthors
//             .filter((author) => author.role === "coordinator")
//             .map((author, index) => (
//               <div
//                 key={index}
//                 className="theme relative w-full border border-gray-700 rounded-xl p-5 text-center hover:shadow-xl transition"
//               >
//                 <Link to={`/viewProfile/${author.email}`}>
//                   <img
//                     src={
//                       author.profile
//                         ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
//                         : user
//                     }
//                     className="w-24 h-24 mx-auto bg-gray-700 rounded-full object-cover border border-gray-700"
//                   />
//                 </Link>

//                 {author?.badges?.length > 0 && (
//                   <Link
//                     to={`/viewProfile/${author.email}`}
//                     className="cursor-pointer text-xs w-full"
//                   >
//                     <BadgeIcons
//                       badges={author?.badges}
//                       parentClass=" right-2 top-2 -space-x-1.5 md:-space-x-2"
//                       shieldClassName="w-4 h-4 md:w-5 md:h-5 "
//                     />
//                   </Link>
//                 )}

//                 <h3 className="mt-3 font-semibold text-white truncate">

//                   {highlightText(author.authorName, debouncedSearch)}
//                 </h3>
//                 <p className="text-xs text-gray-400 mx-auto truncate">

//                   {highlightText(author.email, debouncedSearch)}
//                 </p>

//                 <div className="flex justify-center gap-6 mt-2 md:mt-4 text-[11px] md:text-xs text-gray-300">
//                   <span className="text-gray-400">
//                     <b className="text-white">{formatCount(author.followers.length)}</b>{" "}
//                     Followers
//                   </span>
//                   {author?.postCount > 0 && (
//                     <span className="text-gray-400">
//                       <b className="text-white">{formatCount(author.postCount)}</b> Posts
//                     </span>
//                   )}
//                 </div>

//                 <div className="md:mt-5 mt-3">
//                   {author.followers.includes(email) ? (
//                     <button
//                       onClick={() => addFollower(author.email)}
//                       className="w-full py-2 rounded-lg bg-gray-800 text-gray-400 outline-0 text-sm transition-all duration-400 disabled:bg-transparent"
//                       disabled={followLoadingIds.has(author.email)}
//                     >
//                       {followLoadingIds.has(author.email) ? (
//                         <div className="flex items-center py-1.5 justify-center gap-1">
//                           <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
//                           <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
//                           <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
//                         </div>
//                       ) : (
//                         "Following..."
//                       )}
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => addFollower(author.email)}
//                       className={`w-full py-2 rounded-lg text-green-400 outline-0  ${!followLoadingIds.has(author.email) ? " border border-green-700" : "border-0 "} text-sm font-medium  hover:text-green-400 hover:border-green-700  md:hover:text-green-300 md:hover:border-green-600 transition-all duration-400 disabled:bg-transparent`}
//                       disabled={followLoadingIds.has(author.email)}
//                     >
//                       {followLoadingIds.has(author.email) ? (
//                         <div className="flex items-center py-1.5 justify-center gap-1">
//                           <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
//                           <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
//                           <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
//                         </div>
//                       ) : (
//                         "+ Follow"
//                       )}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}

//           {filteredAuthors.filter((author) => author.role === "coordinator")
//             .length > 0 &&
//             loading && (
//               <div className="col-span-full flex justify-center py-4">
//                 <div className="relative flex items-center justify-center">
//                   <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />
//                 </div>
//               </div>
//             )}

//           {filteredAuthors.filter((author) => author.role === "coordinator")
//             .length == 0 &&
//             roleFilter !== "student" &&
//             loading && (
//               <div className="col-span-full">
//                 <h2 className="w-full   text-center text-sm md:text-gray-500 tracking-widest uppercase text-gray-500  font-semibold my-4 md:my-6">
//                   Contributors
//                 </h2>
//                 <CoordinatorGridSkeleton />
//               </div>
//             )}

//           {filteredAuthors.filter((author) => author.role === "coordinator")
//             .length > 0 &&
//             !hasMore && (
//               <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
//                 No more coordinators
//               </p>
//             )}
//         </div>

//         {/* Students Section */}
//         {filteredAuthors.filter((author) => author.role === "student").length >
//           0 && (
//           <h2
//             className={`w-full text-center text-sm md:text-gray-500 tracking-widest uppercase text-gray-500  font-semibold mt-4 ${roleFilter == "student" && "md:mt-6"}`}
//           >
//             Users
//           </h2>
//         )}

//         <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2 md:gap-4 mt-4 md:mt-6">
//           {filteredAuthors
//             .filter((author) => author.role === "student")
//             .map((author, index) => (
//               <div
//                 key={index}
//                 className="
//                   theme
//                   border border-gray-700
//                   rounded-xl
//                   p-5
//                   flex flex-col items-center
//                   text-center
//                   shadow
//                   hover:shadow-xl
//                   hover:-translate-y-1
//                   transition-all duration-300
//                 "
//               >
//                 {/* Avatar */}
//                 <Link to={`/viewProfile/${author.email}`}>
//                   <img
//                     src={
//                       author.profile
//                         ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
//                         : user
//                     }
//                     alt={author.authorName}
//                     className="
//                         w-20 h-20
//                         rounded-full
//                         object-cover
//                         border border-gray-700
//                         shadow-sm
//                         hover:shadow-md
//                         transition
//                         bg-gray-700
//                     "
//                   />
//                 </Link>

//                 {/* Name */}
//                 <h3 className="mt-4 font-semibold text-sm md:text-base text-white truncate w-full">

//                   {highlightText(author.authorName, debouncedSearch)}
//                 </h3>

//                 {/* Email */}
//                 <p className="text-xs text-gray-400 truncate w-full">

//                   {highlightText(author.email, debouncedSearch)}
//                 </p>

//               </div>
//             ))}

//           {filteredAuthors.filter((author) => author.role === "student")
//             .length > 0 &&
//             loading && (
//               <div className="col-span-full flex justify-center py-4">
//                 <div className="relative flex items-center justify-center">
//                   {/* Outer Oval Ring */}
//                   <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

//                 </div>
//               </div>
//             )}

//           {filteredAuthors.filter((author) => author.role === "student")
//             .length == 0 &&
//             roleFilter !== "coordinator" &&
//             loading && (
//               <div className="col-span-full">
//                 <h2 className="w-full   text-center text-sm md:text-gray-500 tracking-widest uppercase text-gray-500  font-semibold my-6">
//                   Users
//                 </h2>
//                 <StudentGridSkeleton />
//               </div>
//             )}

//           {filteredAuthors.filter((author) => author.role === "student")
//             .length > 0 &&
//             !hasMore && (
//               <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
//                 No more users
//               </p>
//             )}
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default Authors;

import React, { useState, useEffect, useRef, useMemo } from "react";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import user from "../images/user.png";
import axiosInstance from "../instances/Axiosinstances";
import axios from "axios";
import { Link } from "react-router-dom";
import { BsPersonSquare } from "react-icons/bs";
import { IoSearch } from "react-icons/io5";
import { IoIosGitNetwork } from "react-icons/io";
import {
  TbBrain,
  TbShieldLock,
  TbChartDots,
  TbSparkles,
  TbWorldWww,
  TbBulb,
  TbFlame,
  TbUsers,
  TbUserPlus,
  TbArrowRight,
} from "react-icons/tb";
import RecommendedAuthorsSkeleton from "../components/loaders/RecommendedAuthorsSkeleton ";
import CoordinatorGridSkeleton from "../components/loaders/CoordinatorGridSkeleton ";
import StudentGridSkeleton from "../components/loaders/StudentGridSkeleton ";
import Cookies from "js-cookie";
import Fuse from "fuse.js";
import { getItem } from "../utils/encode";
import useAuthorCommunity from "../hooks/useAuthorCommunity";
import highlightText from "../hooks/highlightText";
import BadgeIcons from "../components/achievements/BadgeIcons";
import formatCount from "../utils/NumberConversion";
import empty_state_author from "../assets/author_not_found_3.png";
// ── Per-domain visual identity — reused from the community landing page ──
const domainStyle = {
  "AI/ML": { icon: TbBrain, from: "#0d9488", to: "#0f766e" },
  "Cyber Security": { icon: TbShieldLock, from: "#7c3aed", to: "#6d28d9" },
  "Data Science": { icon: TbChartDots, from: "#059669", to: "#047857" },
  GenAI: { icon: TbSparkles, from: "#ea580c", to: "#c2410c" },
  "Web Development": { icon: TbWorldWww, from: "#2563eb", to: "#1d4ed8" },
};
const defaultDomainStyle = { icon: TbBulb, from: "#0d9488", to: "#0f766e" };
const getDomainStyle = (name) => domainStyle[name] || defaultDomainStyle;

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const FILTERS = [
  { value: "", label: "All" },
  { value: "coordinator", label: "Contributors" },
  { value: "student", label: "Students" },
];

// ── Reason chip label for enriched recommendations ──
const reasonLabel = (reason) => {
  if (!reason) return null;
  if (reason.type === "coordinates") return `Coordinates ${reason.community}`;
  if (reason.type === "sharedCommunity") return `Also in ${reason.community}`;
  if (reason.type === "mutualFollowing")
    return `${reason.count} mutual Following${reason.count > 1 ? "s" : ""}`;
  return null;
};

function Authors() {
  const [authors, setAuthors] = useState([]);
  const email = getItem("email");
  const role = getItem("role");
  const [roleFilter, setRoleFilter] = useState("");
  const [recommendation, setRecommendation] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const isFetching = useRef(false);
  const [followLoadingIds, setFollowLoadingIds] = useState(new Set());

  // ── header stat pills: following / followers / communities ──
  const { authorCommunity } = useAuthorCommunity(email);
  const [ownStats, setOwnStats] = useState({
    followingCount: 0,
    followersCount: 0,
  });
  const [statsLoader, setStatsLoader] = useState(false);

  useEffect(() => {
    if (!email) return;
    const fetchOwnStats = async () => {
      try {
        setStatsLoader(true);
        // NOTE: adjust this path to whatever your "get single author by
        // email" route actually is — this is a placeholder guess.
        const response = await axiosInstance.get(`/blog/author/${email}`);
        const me = response.data.data || response.data.author || response.data;
        setOwnStats({
          followingCount: me?.following?.length || 0,
          followersCount: me?.followers?.length || 0,
        });
      } catch (err) {
        console.log("error fetching own network stats", err);
      } finally {
        setStatsLoader(false);
      }
    };
    fetchOwnStats();
  }, [email]);

  const authorsDetails = async () => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/blog/author/profiles?page=${page}&limit=${limit}`,
      );

      const newAuthors = response.data.data.filter(
        (author) => author.email !== email,
      );

      if (newAuthors.length === 0) {
        setHasMore(false);
      } else {
        setAuthors((prev) => [...prev, ...newAuthors]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("error", err);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    authorsDetails();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.scrollHeight
      ) {
        authorsDetails();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fuse = useMemo(
    () => new Fuse(authors, { keys: ["authorName", "email"], threshold: 0.2 }),
    [authors],
  );

  const filteredAuthors = useMemo(() => {
    let filtered = [...authors];
    if (debouncedSearch.trim() !== "") {
      filtered = fuse.search(debouncedSearch).map((r) => r.item);
    }
    if (roleFilter !== "") {
      filtered = filtered.filter((author) => author.role === roleFilter);
    }
    return filtered;
  }, [roleFilter, authors, debouncedSearch, fuse]);

  const recommendationURL = import.meta.env.VITE_RECOMMENDATION_URL;

  // Flask now returns fully enriched objects — {authorName, email, profile,
  // role, postCount, followers, communities, reason} — no extra Node call needed.
  const recommendtion_system = async () => {
    try {
      const response = await axios.post(
        `${recommendationURL}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRecommendation(response.data.recommended_people || []);
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    recommendtion_system();
  }, []);

  const fuseRecommended = useMemo(
    () =>
      new Fuse(recommendation, {
        keys: ["authorName", "email"],
        threshold: 0.2,
      }),
    [recommendation],
  );

  const filteredRecommended = useMemo(() => {
    if (debouncedSearch.trim() === "") return recommendation;
    return fuseRecommended.search(debouncedSearch).map((r) => r.item);
  }, [recommendation, debouncedSearch, fuseRecommended]);

  const showRecommended =
    filteredRecommended.length > 0 && roleFilter === "" && !debouncedSearch;

  //     const addFollower = async (userEmail) => {
  //   setFollowLoadingIds((prev) => new Set(prev).add(userEmail));

  //   try {
  //     const response = await axiosInstance.put(
  //       `/blog/author/follow/${userEmail}`,
  //       { emailAuthor: email },
  //     );

  //     if (response.status === 200) {
  //       setAuthors((prev) =>
  //         prev.map((author) => {
  //           if (author.email === userEmail) {
  //             const isFollowing = author.followers?.includes(email);

  //             return {
  //               ...author,
  //               followers: isFollowing
  //                 ? author.followers.filter((f) => f !== email)
  //                 : [...(author.followers || []), email],
  //             };
  //           }
  //           return author;
  //         }),
  //       );
  //     }
  //   } catch (err) {
  //     console.log("error", err);
  //   } finally {
  //     setFollowLoadingIds((prev) => {
  //       const updated = new Set(prev);
  //       updated.delete(userEmail);
  //       return updated;
  //     });
  //   }
  // };
  const addFollower = async (userEmail) => {
    setFollowLoadingIds((prev) => new Set(prev).add(userEmail));

    try {
      const response = await axiosInstance.put(
        `/blog/author/follow/${userEmail}`,
        { emailAuthor: email },
      );

      if (response.status === 200) {
        const toggleFollowers = (list) =>
          list.map((author) => {
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
          });

        setAuthors((prev) => toggleFollowers(prev));
        setRecommendation((prev) => toggleFollowers(prev));
      }
    } catch (err) {
      console.log("error", err);
    } finally {
      setFollowLoadingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(userEmail);
        return updated;
      });
    }
  };

  // ── Follow button, shared between contributor and recommended cards ──

  const FollowButton = ({ author }) => {
    const isFollowing = author.followers?.includes(email);
    const isLoading = followLoadingIds.has(author.email);

    const handleClick = (e) => {
      e.preventDefault(); // stops any parent <a> from navigating
      e.stopPropagation(); // stops the event bubbling up to parent Link
      addFollower(author.email);
    };

    if (isFollowing) {
      return (
        <button
          // onClick={() => addFollower(author.email)}
          onClick={handleClick}
          disabled={isLoading}
          className="w-full py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold disabled:opacity-50"
        >
          {isLoading ? "..." : "Following"}
        </button>
      );
    }
    return (
      <button
        // onClick={() => addFollower(author.email)}
        onClick={handleClick}
        disabled={isLoading}
        className="w-full py-2 rounded-full text-emerald-400 border border-emerald-700 text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1 hover:text-emerald-300 hover:border-emerald-600 transition-colors duration-300"
      >
        <TbUserPlus className="text-sm" />
        {isLoading ? "..." : "Follow"}
      </button>
    );
  };

  const DomainTags = ({ communities = [] }) => {
    if (!communities.length) return null;
    return (
      <div className="flex gap-1.5 flex-wrap justify-center">
        {communities.slice(0, 2).map((c) => {
          const name = typeof c === "string" ? c : c.name;
          const style = getDomainStyle(name);
          return (
            <span
              key={name}
              className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: `${style.from}22`, color: style.from }}
            >
              {name}
            </span>
          );
        })}
      </div>
    );
  };

  // console.log("recommendation", recommendation)

  // ── Contributor card — banner header, badges, stats, follow ──
  const ContributorCard = ({ author }) => {
    return (
      <div className="theme border border-[#1e293b] rounded-xl md:rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
        <div className="pt-5 pb-10 md:pb-9 px-4 relative bg-white/[0.03] border-b border-emerald-500/20">
          {author.role === "coordinator" && (
            <span className="absolute top-3 right-3 text-[8px] md:text-[9px] md:font-semibold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-emerald-500/10 border border-emerald-700/40 text-emerald-400">
              Coordinator
            </span>
          )}
        </div>

        <Link to={`/viewProfile/${author.email}`} className="block px-4">
          <div className="relative -mt-8 mb-2 flex justify-center">
            <img
              src={
                author.profile
                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                  : user
              }
              className="md:w-16 w-14 h-14 md:h-16 rounded-full object-cover border-[3px] border-[#0f172a] bg-gray-700"
              alt={author.authorName}
            />
          </div>

          <div className="text-center mb-2">
            <h3 className="text-sm font-semibold text-white truncate">
              {highlightText(author.authorName, debouncedSearch)}
            </h3>
            <p className="text-[10px] text-gray-400 truncate">
              {highlightText(author.email, debouncedSearch)}
            </p>
          </div>

          {author?.badges?.length > 0 && (
            <div className="flex justify-center mb-2">
              <BadgeIcons
                badges={author.badges}
                parentClass="static -space-x-0"
                shieldClassName="w-4 h-4"
              />
            </div>
          )}

          <div className="mb-3">
            <DomainTags communities={author.communities} />
          </div>

          <div className="flex justify-center gap-4 text-[10px] text-gray-400 pt-2 border-t border-white/5 mb-3">
            {author?.postCount > 0 && (
              <span>
                <b className="text-white">{formatCount(author.postCount)}</b>{" "}
                posts
              </span>
            )}
            <span>
              <b className="text-white">
                {formatCount(
                  author.followersCount ?? author.followers?.length ?? 0,
                )}
              </b>{" "}
              followers
            </span>
          </div>
        </Link>

        <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
          <FollowButton author={author} />
        </div>
      </div>
    );
  };

  // ── Student card — flat, no follow button, whole card is a link ──
  const StudentCard = ({ author }) => {
    const primaryCommunity = author.communities?.[0];
    const domainName =
      typeof primaryCommunity === "string"
        ? primaryCommunity
        : primaryCommunity?.name;
    const style = domainName ? getDomainStyle(domainName) : null;

    return (
      <Link
        to={`/viewProfile/${author.email}`}
        className="theme border border-[#1e293b] rounded-2xl p-5 flex flex-col items-center text-center gap-1.5 hover:border-white/10 hover:-translate-y-0.5 transition-all duration-300"
      >
        <img
          src={
            author.profile
              ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
              : user
          }
          className="w-16 h-16 rounded-full object-cover border border-gray-700 bg-gray-700"
          alt={author.authorName}
        />
        <h3 className="mt-2 font-semibold text-sm text-white truncate w-full">
          {highlightText(author.authorName, debouncedSearch)}
        </h3>
        <p className="text-[10px] text-gray-400 truncate w-full">
          {highlightText(author.email, debouncedSearch)}
        </p>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
          Student
        </span>
        {domainName && (
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
            style={{ background: `${style.from}22`, color: style.from }}
          >
            {domainName}
          </span>
        )}
        {/* <span className="text-[10px] text-gray-500 mt-0.5">
          {formatCount(author.followersCount ?? author.followers?.length ?? 0)}{" "}
          followers
        </span> */}
        <span className="flex items-center gap-1 text-[9px] text-gray-600 mt-1">
          View profile <TbArrowRight className="text-[10px]" />
        </span>
      </Link>
    );
  };

  // ── Recommended card — reason chip up top, otherwise same info as contributor card ──
  const RecommendedCard = ({ author }) => {
    const primaryCommunity = author.communities?.[0];
    const style = getDomainStyle(
      typeof primaryCommunity === "string"
        ? primaryCommunity
        : primaryCommunity?.name,
    );
    const reason = reasonLabel(author.reason);

    return (
      <div className="min-w-[240px] relative theme border border-gray-700 rounded-xl py-2 px-4 md:p-4 shadow hover:shadow-xl  transition flex-shrink-0">
        {reason && (
          <span
            className="inline-block text-[9px] font-semibold px-2 py-1 rounded-full mb-1.5 md:mb-3"
            style={{ background: `${style.from}22`, color: style.from }}
          >
            {reason}
          </span>
        )}

        <div className="flex items-center gap-3 mb-3">
          <Link to={`/viewProfile/${author.email}`} className="flex-shrink-0">
            <img
              src={
                author.profile
                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                  : user
              }
              className="md:w-9 w-7 md:h-9 h-7 rounded-full object-cover border border-gray-700 bg-gray-700"
              alt={author.authorname}
            />
          </Link>
          <div className="flex-1 md:w-48 w-44 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {highlightText(author.authorname, debouncedSearch)}
            </h3>
            <p className="text-[9px] text-gray-400 min-w-0 text-[9px] w-9/12 md:w-9/12 truncate">
              {highlightText(author.email, debouncedSearch)}
            </p>
          </div>
          <p className="text-white">{author.posts?.length}</p>
        </div>

        {author?.badges?.length > 0 && (
          <BadgeIcons
            badges={author.badges}
            parentClass="top-4 md:top-6 right-4 -space-x-0"
            shieldClassName="w-4 h-4"
          />
        )}

        <div className="mb-3">
          <DomainTags communities={author.communities} />
        </div>

        <FollowButton author={author} />
      </div>
    );
  };

  // console.log("authors",authors)

  return (
    <div className="w-full min-h-screen theme">
      <NavBar />

      <div className="w-full max-w-[1800px] md:px-12 mx-auto px-4 flex items-center justify-between flex-wrap gap-1.5 md:gap-3 py-3 md:pb-0.5 md:pt-3">
        <div className="flex items-center gap-1 md:gap-3">
          <IoIosGitNetwork className="text-emerald-500/70 text-lg md:text-3xl" />
          <h1 className="text-lg md:text-3xl font-semibold tracking-tight text-gray-100">
            My Network
          </h1>
        </div>

        <div className="flex gap-1 md:gap-2 flex-wrap">
          {ownStats?.followersCount > 0 && role !== "student" && (
            <span className="text-[10px] md:text-xs text-gray-300 bg-white/5 md:border border-white/10 rounded-lg px-2 md:px-3.5 py-1 md:py-1.5">
              <b className="text-white font-semibold">
                {formatCount(ownStats.followersCount)}
              </b>{" "}
              followers
            </span>
          )}

          {ownStats?.followingCount > 0 &&
            <span className="text-[10px] md:text-xs text-gray-300 bg-white/5 md:border border-white/10 rounded-lg px-2 md:px-3.5 py-1 md:py-1.5">
              <b className="text-white font-semibold">
                {formatCount(ownStats.followingCount)}
              </b>{" "}
              following
            </span>
          }

          <span className="text-[10px] md:text-xs text-gray-300 bg-white/5 md:border border-white/10 rounded-lg px-2 md:px-3.5 py-1 md:py-1.5">
            <b className="text-white font-semibold">
              {formatCount(authorCommunity?.length || 0)}
            </b>{" "}
            communities
          </span>
        </div>
      </div>

      {/* Search + filter chips */}
      <div className="w-full max-w-[1800px] px-4 md:px-12 mx-auto px-auto justify-between flex flex-wrap mt-0 md:mt-4  items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="max-w-44 md:min-w-96 flex items-center gap-1 md:gap-3 theme-fields-lite border border-gray-700 rounded-lg md:rounded-xl px-3 md:px-3 py-1 md:py-1.5 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
          <IoSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full focus:outline-none text-[11px] md:text-sm text-white placeholder-gray-400"
          />
        </div>

        <div className="flex gap-1 md:gap-2 mt-0 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = roleFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                className={`md:text-xs text-[9px] font-medium px-2 md:px-3.5 py-0.5 md:py-1.5 rounded-xl md:rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-500 text-black border-transparent"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-gray-200 hover:border-white/20"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended */}
      {showRecommended && (
        <h2 className="w-full text-left px-4 md:px-12 text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium mb-2 mt-4 md:mt-6 md:mb-3">
          Recommended
        </h2>
      )}
      <div
        className={
          showRecommended
            ? "flex w-full px-4 md:px-12 max-w-[1800px] overflow-y-hidden mx-auto gap-3 overflow-x-auto scrollbar-hide  md:pb-1"
            : "hidden"
        }
      >
        {filteredRecommended.map((author, index) => (
          <RecommendedCard key={author.email || index} author={author} />
        ))}
      </div>

      {loading &&
        filteredRecommended.length === 0 &&
        filteredAuthors.length === 0 && (
          <>
            <h2 className="w-full text-left px-4 md:px-12 text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium mb-2 mt-4 md:mt-6 md:mb-3">
              Recommended
            </h2>
            <RecommendedAuthorsSkeleton />
          </>
        )}

      <div className="w-full px-4 md:px-12 max-w-[1800px] mx-auto min-h-screen flex flex-col items-center text-white">
        {/* Contributors */}
        {filteredAuthors.filter((a) => a.role === "coordinator").length > 0 &&
          roleFilter !== "student" && (
            <h2 className="w-full text-center text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium my-4">
              Contributors
            </h2>
          )}

        <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {filteredAuthors
            .filter((a) => a.role === "coordinator")
            .map((author, index) => (
              <ContributorCard key={author.email || index} author={author} />
            ))}

          {filteredAuthors.filter((a) => a.role === "coordinator").length > 0 &&
            loading && (
              <div className="col-span-full flex justify-center py-4">
                <div className="w-7 h-7 border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            )}

          {filteredAuthors.filter((a) => a.role === "coordinator").length ===
            0 &&
            roleFilter !== "student" &&
            loading && (
              <div className="col-span-full">
                <h2 className="w-full text-center text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium my-4 ">
                  Contributors
                </h2>
                <CoordinatorGridSkeleton />
              </div>
            )}

          {filteredAuthors.filter((a) => a.role === "coordinator").length > 0 &&
            !hasMore && (
              <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                No more coordinators
              </p>
            )}
        </div>

        {/* Students */}
        {filteredAuthors.filter((a) => a.role === "student").length > 0 &&
          roleFilter !== "coordinator" && (
            <h2
              className={`w-full text-center text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium mt-4${
                roleFilter === "student" && "md:mt-6"
              }`}
            >
              Students
            </h2>
          )}

        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5 mt-4 md:mt-6">
          {filteredAuthors
            .filter((a) => a.role === "student")
            .map((author, index) => (
              <StudentCard key={author.email || index} author={author} />
            ))}

          {filteredAuthors.filter((a) => a.role === "student").length > 0 &&
            loading && (
              <div className="col-span-full flex justify-center py-4">
                <div className="w-7 h-7 border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            )}

          {filteredAuthors.filter((a) => a.role === "student").length === 0 &&
            roleFilter !== "coordinator" &&
            loading && (
              <div className="col-span-full">
                <h2
                  className={`w-full text-center text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium mt-4 ${
                    roleFilter === "student" && "md:mt-6"
                  }`}
                >
                  Students
                </h2>
                <StudentGridSkeleton />
              </div>
            )}

          {filteredAuthors.filter((a) => a.role === "student").length > 0 &&
            !hasMore && (
              <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                No more students
              </p>
            )}

          {!loading && filteredAuthors?.length == 0 && (
            <div className="w-full h-[44vh] col-span-full max-w-[1800px] mx-auto mb-24 md:h-[55vh] flex flex-col items-center justify-center">
              {/* <p className="text-gray-500">Post not found.</p> */}
              <img className="w-60 md:w-72 " src={empty_state_author} alt="" />
              <p className="text-gray-400 max-w-xs md:max-w-md text-sm md:text-base flex justify-center items-center text-center">
                People Not Found !
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Authors;
