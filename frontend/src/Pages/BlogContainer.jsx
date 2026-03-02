import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  IoSearchOutline,
  IoEye,
  IoClose,
  IoShareSocial,
} from "react-icons/io5";
import getTimeAgo from "../components/DateCovertion.jsx";
import { MagnifyingGlass } from "react-loader-spinner";
import blog1 from "../images/img_not_found.png";
import { BiLike, BiSolidLike } from "react-icons/bi";
import axiosInstance from "../instances/Axiosinstances";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
// import { toast } from "react-toastify";
import user from "../images/user.png";
import { ToastContainer, toast } from "react-toastify";

import useTutorPlaylist from "../hooks/useTutorPlaylist";
import TutorPlaylistGrid from "../components/TutorPlaylistGrid.jsx";
import BlogSkeleton from "../components/loaders/BlogSkeleton.jsx";
import PillLoader from "../components/loaders/PillSkeleton.jsx";
import TutorPlaylistGridSkeleton from "../components/loaders/TutorPlaylistGridSkeleton.jsx";
function BlogContainer({activeTab, setActiveTab}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [postCategory, setPostCategory] = useState("");
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("email");
  const [bookMarkId, setBookMarkId] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  const { playlistCount } = useTutorPlaylist();
  // const [activeTab, setActiveTab] = useState("posts"); // default posts
  // const [activeTab, setActiveTab] = useState(
  //   localStorage.getItem("dashboardTab") || "posts",
  // );

  // useEffect(() => {
  //   localStorage.setItem("dashboardTab", activeTab);
  // }, [activeTab]);

  // Fetch posts from API
  // const fetchPosts = async () => {
  //   setLoader(true);
  //   try {
  //     const response = await axiosInstance.get(
  //       `/blog/posts/recommended/${email}`
  //     );
  //     // setPosts(
  //     //   response.data.posts.filter((post) => post.authoremail !== email)
  //     // );
  //     setPosts(response.data.posts);
  //   } catch (err) {
  //     console.error("Error fetching posts:", err);
  //   }
  //   setLoader(false);
  // };

  // ------------------------------------------------------------------------------------------------------------
  const isFetching = useRef(false);

  const fetchPosts = async () => {
    if (isFetching.current || !hasMore) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const res = await axiosInstance.get(
        `/blog/posts/recommended/${email}?page=${page}&limit=${limit}`,
      );

      const newPosts = res.data.posts;

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    isFetching.current = false;
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200;

      if (bottom) {
        fetchPosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loading]);

  // ------------------------------------------------------------------------------------------------------------

  // share post with social media
  const sharePost = async (title, email, id) => {
    try {
      const data = {
        title: title,
        text: title,
        url: `${window.location.origin}/viewpage/${email}/${id}`,
      };
      const response = await navigator.share(data);
      // console.log("post shared successfully", response);
    } catch (err) {
      console.log("error sharing post", err);
    }
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get unique categories
  const getUniqueCategories = (posts) => {
    return [...new Set(posts.map((post) => post.category))];
  };

  // Track post views
  const postViews = async (authorEmail, postId) => {
    try {
      await axiosInstance.put(`/blog/posts/views/${authorEmail}/${postId}`, {
        emailAuthor: email,
      });
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  const postLikes = async (authorEmail, postId, e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/blog/posts/likes/${authorEmail}/${postId}`, {
        emailAuthor: email,
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(email)
                  ? post.likes.filter((like) => like !== email) // Unlike the post
                  : [...post.likes, email], // Like the post
              }
            : post,
        ),
      );
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  // Filter posts based on search
  const filterdPost = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderTextWithHashtags = (text) => {
    if (!text) return null;

    // Convert visible "\r\n" or "\\n" into real line breaks
    const cleanedText = text.replace(/\\r\\n|\\n|\\r\n/g, " ");

    return cleanedText.split("\n").map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.split(/(\s+#\w+)/g).map((word, index) =>
          word.startsWith(" # ") ? (
            <span key={index} className="text-md text-white font-italy">
              {word}
            </span>
          ) : (
            <React.Fragment key={index}>{word}</React.Fragment>
          ),
        )}
        <br />
      </React.Fragment>
    ));
  };

  const addBookMarkPostId = async (postId) => {
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
        { postId },
      );

      if (response.status === 200) {
        setBookMarkId((prev) => {
          if (prev.includes(postId)) {
            // toast.success("bookmark removed successfully");
            return prev.filter((id) => id !== postId);
          } else {
            // toast.success("post bookmarked successfully");
            return [...prev, postId];
          }
        });
      }
    } catch (err) {
      console.log("error", err.message);
      toast.error("unable to bookmark");
    }
  };

  const fetchBookmarkIds = async () => {
    try {
      const res = await axiosInstance.get(`/blog/posts/bookmarkIds/${email}`);
      // console.log("all bookmark ids", res.data.postIds?.length);
      setBookMarkId(res.data.postIds || []);
    } catch (err) {
      console.log("failed to load bookmark ids");
    }
  };

  useEffect(() => {
    fetchBookmarkIds();
  }, []);

  // console.log("posts", bookMarkId);
  // console.log("tutorPlayList", tutorPlayList);

  return (
    <div className="min-h-screen relative  ">
      {/* <div className="sticky top-0 z-40 p-2  pl-4 md:pt-2 w-full  md:w-11/12 mx-auto backdrop-blur-md ">
        <div className="flex items-center gap-10">
         
          <button
            onClick={() => setActiveTab("posts")}
            className={`relative pb-1 md:pb-2 text-sm md:text-base font-semibold transition-all duration-300
        ${
          activeTab === "posts"
            ? "text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
          >
            Posts
            {activeTab === "posts" && (
              <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-teal-500 rounded-full"></span>
            )}
          </button>

          
          <button
            onClick={() => setActiveTab("playlists")}
            className={`relative pb-1 md:pb-2 text-sm md:text-base font-semibold transition-all duration-300
        ${
          activeTab === "playlists"
            ? "text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
          >
            Playlists
            {activeTab === "playlists" && (
              <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-teal-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div> */}
      <div className="flex-col w-11/12 md:gap-16 relative flex-wrap justify-center h-auto mx-auto">
        {/* Tutor Playlist section starts here */}
        {activeTab === "playlists" && (
          <section className="space-y-4 mt-4 md:mt-4">
            <h2 className="md:pl-4  text-2xl md:text-4xl font-bold tracking-wide text-gray-200">
              Featured Playlists
            </h2>
            <div className=" md:p-4 shadow-inner">
              {/* {  loading ? <TutorPlaylistGridSkeleton /> : <TutorPlaylistGrid />} */}
              {playlistCount > 0 ? (
                loading ? (
                  <TutorPlaylistGridSkeleton />
                ) : (
                  <TutorPlaylistGrid />
                )
              ) : (
                <p className="text-gray-400 flex justify-center items-center h-56 text-center py-4">
                  No playlists available!
                </p>
              )}
            </div>
          </section>
        )}
        {/* Tutor Playlist section ends here */}

        {activeTab === "posts" && (
          <>
            {/* ================= SEARCH ================= */}
            <div className="flex justify-center mt-4">
              <div className="w-11/12 mx-auto max-w-md flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
                <IoSearchOutline className="text-xl text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, topics, or categories"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-400"
                />
              </div>
            </div>
            {posts.length > 0 && (
              <div className="flex md:max-w-5xl md:w-fit mt-10 scrollbar-hide mx-auto items-center justify-start gap-3 mb-5 overflow-x-auto">
                {/* All Button */}
                <div
                  onClick={() => setPostCategory("")}
                  className={`w-fit text-nowrap cursor-pointer rounded-md md:text-sm text-xs px-3 py-1 md:py-2 transition-all duration-200 ${
                    postCategory === ""
                      ? "bg-emerald-600/20 text-emerald-400"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  All
                </div>

                {/* Dynamic Categories */}
                {getUniqueCategories(posts).map((data, index) => (
                  <div
                    key={index}
                    onClick={() => setPostCategory(data)}
                    className={`w-fit text-nowrap cursor-pointer rounded-md md:text-sm text-xs px-3 py-1 md:py-2 transition-all duration-200 ${
                      postCategory === data
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {data}
                  </div>
                ))}
              </div>
            )}

            {loading && !posts.length > 0 && <PillLoader />}

            <section className="w-full  mt-7 md:p-4">
            
              <h2 className="text-2xl md:text-4xl font-bold tracking-wide text-gray-200">
                  Recommended Posts
                </h2>

              <div className="md:w-full grid grid-cols-1 w-full mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 md:gap-10 mt-7 md:mt-10 h-auto">
                {
                
                 (
                  (postCategory === ""
                    ? filterdPost
                    : posts.filter((post) => post.category === postCategory)
                  ).map((data, index) => (
            //         <article
            //         className="bg-[#0f172a]
           
   
            // overflow-hidden
            // transition
            // py-1
            // hover:border-gray-700"
            
            //         >
            //           <div className="flex mb-2 gap-2 px-4 items-center">
            //             <Link to={`/viewProfile/${data.authoremail}`}>
            //               <img
            //                 src={
            //                   data.profile
            //                     ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
            //                     : user
            //                 }
            //                 className="w-8 max-h-10 bg-white object-cover rounded-full border border-white/50"
            //                 alt={data.authorname}
            //               />
            //             </Link>

            //             <div className="flex flex-col">
            //               <p className="text-xs text-white font-semibold">
            //                 {data.authorname}
            //               </p>
            //               <p className="text-xs text-gray-400 font-semibold">
                         
            //                 {getTimeAgo(data.timestamp)}
            //               </p>
            //             </div>
            //           </div>

            //           <Link
            //             to={`/viewpage/${data.authoremail}/${data._id}`}
            //             onClick={() => postViews(data.authoremail, data._id)}
            //             // className="cursor-pointer flex items-center gap-1 hover:text-blue-300"
            //           >
            //             <img
            //               src={
            //                 data.image
            //                   ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
            //                   : blog1
            //               }
            //               className="w-full
            //             h-44 md:h-36
            //             object-cover
            //             hover:opacity-90
            //             transition"
            //               alt={data.title}
            //             />
            //           </Link>

            //           <div className="min-h-28 px-4 h-auto pt-4">
            //             <h2 className="md:text-xl text-lg text-white font-bold">
            //               {data.title && data.title.slice(0, 20)}...
            //             </h2>
            //             <p className="text-xs text-gray-400 mt-2 line-clamp-2 md:line-clamp-1">
                       
            //               {renderTextWithHashtags(data.description)}
            //             </p>
            //           </div>

            //           <div className="flex px-4 justify-between items-center mb-2">
            //             <div className="flex gap-3 items-center">
            //               <div className="flex items-center gap-2">
            //                 <Link
            //                   to={`/viewpage/${data.authoremail}/${data._id}`}
            //                   onClick={() =>
            //                     postViews(data.authoremail, data._id)
            //                   }
            //                   className="cursor-pointer flex items-center gap-1 hover:text-blue-300"
            //                 >
            //                   <IoEye className="text-sm text-blue-400" />
            //                   <span className="text-[9px]">
            //                     {data.views.length || ""}
            //                   </span>
            //                 </Link>

            //                 <button
            //                   type="button"
            //                   onClick={(e) =>
            //                     postLikes(data.authoremail, data._id, e)
            //                   }
            //                   className="cursor-pointer flex items-center gap-1 hover:text-blue-300 bg-transparent border-0 disabled:opacity-50"
            //                 >
            //                   {(data.likes || []).includes(email) ? (
            //                     <BiSolidLike className="text-sm text-blue-400" />
            //                   ) : (
            //                     <BiLike className="text-sm text-blue-400" />
            //                   )}
            //                   <span className="text-[9px] text-white">
            //                     {data.likes && data.likes.length > 0
            //                       ? data.likes.length
            //                       : ""}
            //                   </span>
            //                 </button>
            //                 <div
            //                   onClick={() =>
            //                     sharePost(
            //                       data.title,
            //                       data.authoremail,
            //                       data._id,
            //                     )
            //                   }
            //                   className="cursor-pointer flex items-center gap-1 hover:text-blue-300"
            //                 >
            //                   <IoShareSocial className="text-sm text-blue-400" />
            //                 </div>
            //                 <div
            //                   onClick={() => {
            //                     addBookMarkPostId(data._id);
            //                   }}
            //                   className="cursor-pointer flex items-center gap-1 hover:text-blue-300"
            //                 >
            //                   {Array.isArray(bookMarkId) &&
            //                   bookMarkId.includes(data._id) ? (
            //                     <PiBookmarksSimpleFill className="text-blue-500" />
            //                   ) : (
            //                     <PiBookmarksSimpleLight />
            //                   )}
            //                 </div>
            //               </div>
            //             </div>
            //             <button
            //               onClick={() => setPostCategory(data.category)}
            //               className="px-2 py-1 rounded-full bg-gray-600 text-gray-300 text-sm md:text-xs font-medium transition-colors duration-200"
            //             >
            //               {data.category}
            //             </button>
            //           </div>
            //         </article>
              
              
              <article
                      key={data._id}
                      className="
                      bg-[#0f172a]
                      overflow-hidden
                      
                      md:shadow-2xl
                     
                      transition-transform
                      duration-500
                      md:mb-4
                    "
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Link to={`/viewProfile/${data.authoremail}`}>
                          <img
                            src={
                              data.profile
                                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
                                : user
                            }
                            className="w-9 h-9 rounded-full bg-white object-cover border border-gray-700"
                            alt={data.authorname}
                          />
                        </Link>

                        <div className="leading-tight">
                          <p className="text-sm font-semibold text-white">
                            {data.authorname}
                          </p>
                          <p className="text-xs text-gray-400">
                            {getTimeAgo(data.timestamp)}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/viewpage/${data.authoremail}/${data._id}`}
                        onClick={() => postViews(data.authoremail, data._id)}
                        className="block"
                      >
                        <img
                          src={
                            data.image
                              ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                              : blog1
                          }
                          alt={data.title}
                          className="w-full  h-60 transition-transform
                      duration-500  md:hover:scale-[1.05]  md:h-48  object-cover"
                        />
                      </Link>

                      <div className="px-4 py-4 space-y-2">
                        <h3 className="text-base font-semibold text-white line-clamp-1">
                          {data.title}
                        </h3>

                        <p className="text-xs text-gray-400  line-clamp-2  md:line-clamp-1 ">
                          {renderTextWithHashtags(data.description)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between px-4 pb-7 ">
                        <div className="flex items-center gap-3 text-gray-400">
                          {/* <Link
                            to={`/viewpage/${data.authoremail}/${data._id}`}
                            onClick={() =>
                              postViews(data.authoremail, data._id)
                            }
                            className="flex items-center gap-1 text-xs text-gray-500"
                          >
                       
                            <span className="text-xs">{data.views.length}</span> views
                          </Link> */}

                          <button
                            onClick={(e) =>
                              postLikes(data.authoremail, data._id, e)
                            }
                            className="flex items-center gap-1 text-teal-500"
                          >
                            {(data.likes || []).includes(email) ? (
                              <BiSolidLike className="text-xs text-teal-600" />
                            ) : (
                              <BiLike className="text-xs" />
                            )}
                            <span className="text-xs">
                              {data.likes?.length || ""}
                            </span>
                          </button>

                          <button
                            onClick={() =>
                              sharePost(data.title, data.authoremail, data._id)
                            }
                            className="text-teal-500"
                          >
                            <IoShareSocial className="text-xs" />
                          </button>

                          <button
                            onClick={() => addBookMarkPostId(data._id)}
                            className="text-teal-500"
                          >
                            {Array.isArray(bookMarkId) &&
                            bookMarkId.includes(data._id) ? (
                              <PiBookmarksSimpleFill className="text-teal-600 text-xs" />
                            ) : (
                              <PiBookmarksSimpleLight />
                            )}
                          </button>
                           <Link
                            to={`/viewpage/${data.authoremail}/${data._id}`}
                            onClick={() =>
                              postViews(data.authoremail, data._id)
                            }
                            className="flex items-center gap-1 text-xs text-gray-500"
                          >
                       
                            <span className="text-xs">{data.views.length}</span> views
                          </Link>
                        </div>

                        

                        <button
                          onClick={() => setPostCategory(data.category)}
                          className="
                            text-xs
                            px-2 py-1
                            rounded-full
                           inline-block text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded
                          "
                        >
                          {data.category}
                        </button>
                      </div>
                    </article>
                  ))
                )}
               
                {!posts.length > 0 && loading && <BlogSkeleton />}
                {posts.length > 0 && loading && (
                  <p className="col-span-full py-4 text-gray-500 text-center">
                    loading...
                  </p>
                )}

                {!hasMore && (
                  <p className="text-center col-span-full py-4 text-gray-500">
                    No more posts
                  </p>
                )}
              </div>
            </section>

            {/* <section className="w-full mt-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-6">
                Recommended Posts
              </h2>

              <div
                className="
                        grid grid-cols-1
                      
                        gap-6
                      "
              >
                {loader ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <MagnifyingGlass
                      visible
                      height="90"
                      width="90"
                      ariaLabel="loading"
                      glassColor="#4B5563"
                      color="#60A5FA"
                    />
                    <p className="text-sm text-gray-400 mt-3">Loading posts…</p>
                  </div>
                ) : (
                  (postCategory === ""
                    ? filterdPost
                    : posts.filter((post) => post.category === postCategory)
                  ).map((data) => (
                    <article
                      key={data._id}
                      className="
            bg-[#0f172a]
            border border-gray-800
            rounded-xl
            overflow-hidden
            transition
            hover:border-gray-700
          "
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Link to={`/viewProfile/${data.authoremail}`}>
                          <img
                            src={
                              data.profile
                                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
                                : user
                            }
                            className="w-9 h-9 rounded-full object-cover border border-gray-700"
                            alt={data.authorname}
                          />
                        </Link>

                        <div className="leading-tight">
                          <p className="text-sm font-semibold text-white">
                            {data.authorname}
                          </p>
                          <p className="text-xs text-gray-400">
                            {getTimeAgo(data.timestamp)}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/viewpage/${data.authoremail}/${data._id}`}
                        onClick={() => postViews(data.authoremail, data._id)}
                        className="block"
                      >
                        <img
                          src={
                            data.image
                              ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                              : blog1
                          }
                          alt={data.title}
                          className="w-full md:h-96 h-48 object-cover"
                        />
                      </Link>

                      <div className="px-4 py-4 space-y-2">
                        <h3 className="text-base font-semibold text-white line-clamp-2">
                          {data.title}
                        </h3>

                        <p className="text-sm text-gray-400 line-clamp-2">
                          {renderTextWithHashtags(data.description)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                        <div className="flex items-center gap-4 text-gray-400">
                          <Link
                            to={`/viewpage/${data.authoremail}/${data._id}`}
                            onClick={() =>
                              postViews(data.authoremail, data._id)
                            }
                            className="flex items-center gap-1 hover:text-blue-400"
                          >
                            <IoEye className="text-sm" />
                            <span className="text-xs">{data.views.length}</span>
                          </Link>

                          <button
                            onClick={(e) =>
                              postLikes(data.authoremail, data._id, e)
                            }
                            className="flex items-center gap-1 hover:text-blue-400"
                          >
                            {(data.likes || []).includes(email) ? (
                              <BiSolidLike className="text-sm text-blue-400" />
                            ) : (
                              <BiLike className="text-sm" />
                            )}
                            <span className="text-xs">
                              {data.likes?.length || ""}
                            </span>
                          </button>

                          <button
                            onClick={() =>
                              sharePost(data.title, data.authoremail, data._id)
                            }
                            className="hover:text-blue-400"
                          >
                            <IoShareSocial className="text-sm" />
                          </button>

                          <button
                            onClick={() => addBookMarkPostId(data._id)}
                            className="hover:text-blue-400"
                          >
                            {Array.isArray(bookMarkId) &&
                            bookMarkId.includes(data._id) ? (
                              <PiBookmarksSimpleFill className="text-blue-500" />
                            ) : (
                              <PiBookmarksSimpleLight />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => setPostCategory(data.category)}
                          className="
                text-xs
                px-2 py-1
                rounded-full
                bg-gray-800
                text-gray-300
                hover:bg-gray-700
              "
                        >
                          {data.category}
                        </button>
                      </div>
                    </article>
                  ))
                )}

                {!hasMore && (
                  <p className="col-span-full text-center py-6 text-gray-500">
                    No more posts
                  </p>
                )}
              </div>
            </section> */}
          </>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}

export default BlogContainer;
