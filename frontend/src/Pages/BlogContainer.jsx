import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  IoSearchOutline,
  IoEye,
  IoClose,
  IoShareSocial,
} from "react-icons/io5";
import getTimeAgo from "../components/DateCovertion.jsx";
import { MagnifyingGlass } from "react-loader-spinner";
import blog1 from "../images/img_not_found2.png";
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

import Fuse from "fuse.js";
import highlightText from "../hooks/highlightText.jsx";


function BlogContainer({activeTab, setActiveTab}) {
  
  const {loading, tutorPlayList } = useTutorPlaylist();
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [postCategory, setPostCategory] = useState("");
  const [loader, setLoader] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const email = localStorage.getItem("email");
  const [bookMarkId, setBookMarkId] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // const [filterdPost, setFilterdPost] = useState([])
  const limit = 50;


  const [isStickyActive, setIsStickyActive] = useState(false);
  useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 40) {
      setIsStickyActive(true);
    } else {
      setIsStickyActive(false);
    }
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  // ------------------------------------------------------------------------------------------------------------
  const isFetching = useRef(false);

  const fetchPosts = async () => {
    if (isFetching.current || !hasMore) return;

    isFetching.current = true;
    setLoading2(true);

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

    setLoading2(false);
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
  }, [page, hasMore, loading2]);

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
  // const handleSearch = (e) => {
  //   setSearchTerm(e.target.value);
  // };

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

  const postLikes = async (authorEmail, postId) => {
    // e.preventDefault();
    try {
      const response =  await axiosInstance.put(`/blog/posts/likes/${authorEmail}/${postId}`, {
        emailAuthor: email,
      });

      if (response.status === 200){
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
      }
    
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

 

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


const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300); // 300ms delay

  return () => clearTimeout(timer);
}, [searchTerm]);

  const fuse = useMemo(() => {
  return new Fuse(posts, {
    keys: [
      "title",
      "description",
      "category",
      "authorname",
      "community"
    ],
    threshold: 0.3, // lower = stricter search
  });
}, [posts]);

  // Search quary
const filteredPosts = useMemo(() => {
  let filtered =[...posts];

  // if (searchTerm.trim() !== "") {
  //   const query = searchTerm.toLowerCase();

  //   filtered = filtered.filter(
  //     (post) =>
  //       post.title?.toLowerCase().includes(query) ||
  //       post.description?.toLowerCase().includes(query) ||
  //       post.category?.toLowerCase().includes(query) ||
  //       post.authorname?.toLowerCase().includes(query)
  //   );
  // }

    if (debouncedSearch.trim() !== "") {
    filtered = fuse.search(debouncedSearch).map((r) => r.item);
  }

  if (postCategory !== "") {
    filtered = filtered.filter(
      (post) => post.category === postCategory
    );
  }

  return filtered;
}, [posts, searchTerm, postCategory, debouncedSearch]);

// console.log("filteredposts", filteredPosts)
  // console.log("posts", bookMarkId);
  // console.log("tutorPlayList", tutorPlayList);



// const highlightText = (text, query) => {
//   if (!query) return text;

//   const regex = new RegExp(`(${query})`, "gi");
//   const parts = text.split(regex);

//   return parts.map((part, i) =>
//     part.toLowerCase() === query.toLowerCase() ? (
//       <mark key={i} className="bg-yellow-400 text-black">
//         {part}
//       </mark>
//     ) : (
//       part
//     )
//   );
// };

  return (
    <div className="min-h-screen relative  ">

      <div className="flex-col w-full md:gap-16 relative flex-wrap justify-center h-auto mx-auto">
        {/* Tutor Playlist section starts here */}
        {activeTab === "playlists" && (
          <section className="space-y-4 mt-4 px-3 md:px-0 px-auto  mx-auto w-full md:w-full ">
       
            <div className=" md:px-4 shadow-inner">
              {/* {  loading2 ? <TutorPlaylistGridSkeleton /> : <TutorPlaylistGrid />} */}
              {tutorPlayList.length===0 ? (
                  <TutorPlaylistGridSkeleton />
                ) : (
                  <TutorPlaylistGrid />
                )}
            </div>
          </section>
        )}
        {/* Tutor Playlist section ends here */}

        {activeTab === "posts" && (
          <>
            {/* ================= SEARCH ================= */}
            <div className="flex mx-3 md:mx-0 justify-center mt-7">
              <div className="w-full mx-auto max-w-md flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
                <IoSearchOutline className="text-xl text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, topics, or categories"
                  value={searchTerm}
                  // onChange={handleSearch}
                  onChange={(e)=>{setSearchTerm(e.target.value)}}
                  className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            {posts.length > 0 && (
            <div
                className={`w-full sticky top-0 z-40
                ${isStickyActive ? "bg-gray-900 " : "bg-transparent"}`}
              >

      
              <div 
              // className="flex md:max-w-5xl md:w-fit mt-10 scrollbar-hide mx-auto items-center justify-start gap-3 mb-5 overflow-x-auto"
              className="flex w-full px-3  md:w-fit md:max-w-7xl  mt-2 py-5 z-50 scrollbar-hide mx-auto items-center justify-start gap-3 md:mb-5 overflow-x-auto"
              >
                {/* All Button */}
                <div
                  onClick={() => setPostCategory("")}
                  className={`w-fit text-nowrap cursor-pointer rounded-md  text-xs px-3 py-1.5 md:py-2 transition-all duration-200 ${
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
                    className={`w-fit text-nowrap cursor-pointer rounded-md  text-xs px-3 py-1.5 md:py-2 transition-all duration-200 ${
                      postCategory === data
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {data}
                  </div>
                ))}
                
              </div>
             
                    </div>
            )}

            {loading2 && !posts.length > 0 && <PillLoader />}

            <section className="w-full  mx-auto">
            
              {/* <h2 className="text-2xl mx-4 md:mx-0 md:text-4xl font-bold tracking-wide text-gray-200">
                  Recommended Posts
                </h2> */}

              <div className="mx-auto grid grid-cols-1 md:px-2 w-full  mx-auto  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-10 mt-5 md:mt-10 h-auto">
                {
                
                 (
                  filteredPosts?.map((data, index) => (
    
              
              
              <article
                      key={data._id}
                      className="
                      bg-[#0f172a]
                      overflow-hidden
                      shadow-2xl
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
                            {/* {data.authorname} */}
                             {highlightText(data.authorname, debouncedSearch)}
                            
                          </p>
                          <p className="text-xs text-gray-400">
                            {getTimeAgo(data.timestamp)}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/viewpage/${data.authoremail}/${data._id}`}
                        onClick={() => postViews(data.authoremail, data._id)}
                        className="block "
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
                          {/* {data.title} */}
                           {highlightText(data.title, debouncedSearch)}
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
                            onClick={() =>
                              postLikes(data.authoremail, data._id)
                            }
                            className="flex items-center gap-1 text-teal-500"
                          >
                            {(data.likes || []).includes(email) ? (
                              <BiSolidLike className="text-xs text-teal-600" />
                            ) : (
                              <BiLike className="text-xs" />
                            )}
                            <span className="text-xs">
                              {data.likes?.length || " "}
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
                              <PiBookmarksSimpleFill className="text-teal-600" />
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
               
                {!posts.length > 0 && loading2 && <BlogSkeleton />}
                {posts.length > 0 && loading2 && (
                  <p className="col-span-full py-4 text-gray-500 text-center">
                    loading2...
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
                      ariaLabel="loading2"
                      glassColor="#4B5563"
                      color="#60A5FA"
                    />
                    <p className="text-sm text-gray-400 mt-3">Loading2 posts…</p>
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
