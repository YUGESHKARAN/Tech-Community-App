import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  IoSearchOutline,
  IoEye,
  IoClose,
  IoShareSocial,
} from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { MagnifyingGlass } from "react-loader-spinner";
import getTimeAgo from "../components/DateCovertion.jsx";
import blog1 from "../images/img_not_found2.png";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import { BiBookmarkAlt, BiLike, BiSolidLike } from "react-icons/bi";
import axiosInstance from "../instances/Axiosinstances";
import user from "../images/user.png";
import { useParams } from "react-router-dom";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";

import TutorBookMarkPlaylist from "../components/TutorBookMarkPlaylist.jsx";
import BlogSkeleton from "../components/loaders/BlogSkeleton.jsx";
import PillLoader from "../components/loaders/PillSkeleton.jsx";
import TutorPlaylistGridSkeleton from "../components/loaders/TutorPlaylistGridSkeleton.jsx";
import useTutorPlaylist from "../hooks/useTutorPlaylist.js";
import useGetBookmarkPlaylist from "../hooks/useGetBookmarkPlaylist.js";
import { getItem } from "../utils/encode.js";
import empty_state_post from "../assets/empty_state_post.png";

function BookMarkPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [postCategory, setPostCategory] = useState("");
  const [loader, setLoader] = useState(false);
  const [authorName, setauthorName] = useState("");
  const [authorProfile, setAuthorProfile] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [bookMarkId, setBookMarkId] = useState([]);
  // const { email } = useParams();
  // const email = localStorage.getItem('email')
  const email = getItem('email')
  const {loading:playlistLoading, bookMarPlaylist} = useGetBookmarkPlaylist(email)

  // ----------------------------------------------------------------------------------------
  // const getBookMarkPosts = async () => {
  //   setLoader(true);
  //   try {
  //     const response = await axiosInstance.get(
  //       `/blog/posts/getBookmarkPosts/${email}`
  //     );
  //     if (response.status == 200) {
  //       setPosts(response.data.posts);
  //       setBookMarkId(response.data.postIds);
  //       setauthorName(response.data.authorName);
  //       setAuthorProfile(response.data.profile);
  //     }
  //   } catch (err) {
  //     console.log("error", err.message);
  //   } finally {
  //     setLoader(false);
  //   }
  // };

  const [page, setPage] = useState(1);
  const limit = 20;
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("dashboardTabBookMark") || "posts",
  );

  useEffect(() => {
    localStorage.setItem("dashboardTabBookMark", activeTab);
  }, [activeTab]);

  const getBookMarkPosts = async () => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/blog/posts/getBookmarkPosts/bookmark/${email}?page=${page}&limit=${limit}`,
      );

      if (response.status === 200) {
        const newPosts = response.data.posts;

        if (newPosts.length === 0) {
          setHasMore(false);
          return;
        }

        // Append, don't replace
        setPosts((prev) => [...prev, ...newPosts]);

        // Maintain exact same behavior for metadata
        setBookMarkId((prev) => [...prev, ...response.data.postIds]);
        setauthorName(response.data.authorName);
        setAuthorProfile(response.data.profile);

        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // ----------------------------------------------------------------------------------------



  const addBookMarkPostId = async (postId) => {
    // e.preventDefault();

    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
        { postId },
      );

        if (response.status === 200) {
        // setBookMarkId((prev) => {
        //   if (prev.includes(postId)) {
        //     // toast.success("bookmark removed successfully");
        //     return prev.filter((id) => id !== postId);
        //   } else {
        //     // toast.success("post bookmarked successfully");
        //     return [...prev, postId];
        //   }
        // });

        setPosts((post)=>
          post.filter((p)=> p._id!== postId)
        )
        filterdPost.filter((p)=> p._id!== postId)
      }
    } catch (err) {
      console.log("error", err.message);
      // toast.error("Unable to bookmark");
    }
  };

  useEffect(() => {
    getBookMarkPosts();
  }, [page]);

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

  // share post with social media
  const sharePost = async (title, email, postId) => {
    try {
      const postData = {
        title: title,
        text: title,
        url: `${window.location.origin}/viewpage/${email}/${postId}`,
      };

      const response = await navigator.share(postData);
      console.log("response", response);
    } catch (err) {
      console.log("error sharing post", err);
    }
  };

  const postLikes = async (authorEmail, postId) => {
    // if (e) {
    //   e.preventDefault();
    //   e.stopPropagation();
    // }
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

  // Filter posts based on search
  const filterdPost = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };


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
  // console.log("local email", email);
  // console.log("your post",filterdPost)

  const renderTextWithHashtags = (text) => {
    if (!text) return null;

    // Convert visible "\r\n" or "\\n" into real line breaks
    const cleanedText = text.replace(/\\r\\n|\\n|\\r\n/g, " ");

    return cleanedText.split("\n").map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.split(/(\s+#\w+)/g).map((word, index) =>
          word.startsWith(" #") ? (
            <span
              key={index}
              className="text-md text-white font-italy font-bold"
            >
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

  return (
    <div className="w-full  bg-gray-900 h-auto reltive  ">
      <NavBar />
      <h1 className=" text-2xl mt-4 px-2  md:w-full flex items-center gap-2 mx-auto md:text-3xl font-semibold text-white tracking-wide">
        <BiBookmarkAlt />
        <span className="group text-white"> My Bookmarks </span>{" "}
      </h1>

      <div
        // className="w-11/12  mx-auto mb-10 border-b border-gray-800"
        className=" flex items-center justify-between top-0 z-40 p-2 pl-3 md:p-0  md:pt-2 w-screen  md:w-fit md:ml-4 mx-auto "
      >
        <div className="flex items-center gap-5">
          {/* Posts */}
          <button
            onClick={() => setActiveTab("posts")}
            className={`relative pb-3 text-sm  font-semibold transition-all duration-300
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

          {/* Playlists */}
          <button
            onClick={() => setActiveTab("playlists")}
            className={`relative pb-3 text-sm  font-semibold transition-all duration-300
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
      </div>
      
      <div className="flex-col w-full md:gap-16 relative px-3 md:px-0 flex-wrap min-h-screen justify-center h-auto mx-auto">
        {activeTab === "playlists" && (
          <div className="md:px-4 w-full  mx-auto shadow-inner ">
            {/* <TutorBookMarkPlaylist/> */}
            {/* {(playlistLoading && bookMarPlaylist.length ===0) ? (
              <TutorPlaylistGridSkeleton />
            ) : (
              <TutorBookMarkPlaylist />
            )} */}
            <TutorBookMarkPlaylist />
          </div>
        )}

        {activeTab === "posts" && (
          <>
            {/* Search and Filter Section */}
            {/* {posts?.length > 0 && (
              <div className="w-full  px-4 mx-auto items-center gap-2 mt-7 justify-center">
                <div className="w-full mx-auto max-w-md flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
                  <IoSearchOutline className="text-2xl text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title or category"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="bg-transparent focus:outline-none w-full text-sm text-white placeholder-gray-400"
                  />
                </div>
              </div>
            )} */}

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

             {loading && !posts.length > 0 && <PillLoader/>}

            <div className="flex relative  w-full flex-wrap justify-center h-auto mx-auto">
              

              <div className="mx-auto grid grid-cols-1 w-full  md:px-2 mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-10 mt-5 md:mt-10 h-auto">

                {
             
                  (postCategory === ""
                    ? filterdPost
                    : posts.filter((post) => post.category === postCategory)
                  ).reverse().map((data, index) => (
                
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
                        <Link to={`/viewProfile/${data.authorEmail}`}>
                          <img
                            src={
                              data.profile
                                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
                                : user
                            }
                            className="w-9 h-9 rounded-full bg-gray-700 object-cover border border-gray-900"
                            alt={data.authorName}
                          />
                        </Link>

                        <div className="leading-tight">
                          <p className="text-sm font-semibold text-white">
                            {data.authorName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {getTimeAgo(data.timestamp)}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/viewpage/${data.authorEmail}/${data._id}`}
                        onClick={() => postViews(data.authorEmail, data._id)}
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
                       

                          <button
                            onClick={() =>
                              postLikes(data.authorEmail, data._id)
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
                              sharePost(data.title, data.authorEmail, data._id)
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
                              <PiBookmarksSimpleLight className="text-teal-600 text-xs" />
                            )}
                          </button>
                          <Link
                            to={`/viewpage/${data.authorEmail}/${data._id}`}
                            onClick={() =>
                              postViews(data.authorEmail, data._id)
                            }
                            className="flex items-center gap-1 text-xs text-gray-500"
                          >
                            <span className="text-xs">{data.views.length}</span>{" "}
                            views
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
                }
                {!posts.length > 0 && loading && <BlogSkeleton />}
                {posts.length > 0 && loading && (
                   <div className="col-span-full flex justify-center">
                      <div className="relative flex items-center justify-center">
                        {/* Outer Oval Ring */}
                        <div className="w-7 h-7 border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                        {/* Inner Glow Pulse */}
                        {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                      </div>
                    </div>
                )}
              </div>
             

              {!loading && posts.length == 0 && (
                  <div className="flex h-[70vh] md:h-[55vh] flex-col justify-center items-center ">
                              <img
                                className="w-60 md:w-80 "
                                src={empty_state_post}
                                alt=""
                              />
                    <p className="text-gray-400 max-w-xs md:max-w-md text-sm flex justify-center items-center text-center">
                  No posts bookmarked!
                </p>
                
              </div>
              
              )}
               {!hasMore && posts.length >0 && (
                  <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                    No more posts
                  </p>
                )}
            </div>
          </>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="">
              <img
                src={selectedImage}
                alt="Selected"
                className="max-w-full w-11/12 mx-auto max-h-full"
              />
              <button
                onClick={handleCloseModal}
                className="absolute top-10 right-7"
              >
                <IoClose className="text-2xl text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default BookMarkPage;
