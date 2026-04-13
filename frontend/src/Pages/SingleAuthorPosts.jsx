import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  IoSearchOutline,
  IoEye,
  IoClose,
  IoShareSocial,
} from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { MagnifyingGlass } from "react-loader-spinner";
import blog1 from "../images/img_not_found2.png";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import { BiLike, BiSolidLike } from "react-icons/bi";
import axiosInstance from "../instances/Axiosinstances";
import user from "../images/user.png";
import { useParams } from "react-router-dom";
import getTimeAgo from "../components/DateCovertion";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import BlogSkeleton from "../components/loaders/BlogSkeleton";
import PillLoader from "../components/loaders/PillSkeleton";
import Fuse from "fuse.js";
import highlightText from "../hooks/highlightText";
import { getItem } from "../utils/encode";
function SingleAuthorPosts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [postCategory, setPostCategory] = useState("");
  const [loader, setLoader] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorProfile, setAuthorProfile] = useState("");
  const { email } = useParams();
  const userEmail =getItem("email");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;
  const isFetching = useRef(false);


  // -------------------------------------------------------
  const fetchPosts = async () => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoader(true);

    try {
      const response = await axiosInstance.get(
        `/blog/posts/${email}?page=${page}&limit=${limit}`,
      );

      const newPosts = response.data.data;

      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      // 🔥 Remove duplicates safely
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const filtered = newPosts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...filtered];
      });
      // console.log("response data", response.data);

      setAuthorName(response.data.authorName);
      setAuthorProfile(response.data.profile);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoader(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loader &&
        hasMore &&
        !isFetching.current
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, loader, hasMore]);
  // -------------------------------------------------------

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
        emailAuthor: userEmail,
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
        emailAuthor: userEmail,
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
      "community"
    ],
    threshold: 0.3, // lower = stricter search
  });
}, [posts]);

  // Filter posts based on search
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

  // console.log("local email", email);
  // console.log("your post",filterdPost)

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

  return (
    <div className="w-full reltive min-h-screen  bg-gray-900  h-auto reltive  ">
      <NavBar />
      <div className="relative min-h-screen   md:py-8">
        <div className="w-full mx-auto mt-7 md:mt-0">
          <h1 className="text-2xl px-2 md:text-3xl mb-3 font-bold text-white w-full mx-auto">
            Posts Page
          </h1>
          {/* Profile Header Card */}
          <div className="flex items-center mx-2 gap-6 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-5 md:p-7 shadow-lg">
            {/* Avatar */}
            <div
              // to={`/viewProfile/${email}`}
              className="relative flex-shrink-0 group"
            >
              <img
                src={
                  authorProfile
                    ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${authorProfile}`
                    : user
                }
                alt="Author Profile"
                className={`w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-2 transition-all duration-300 group-hover:scale-105 ${
                  authorProfile ? "border-teal-400" : "border-gray-500 bg-gray-700"
                }`}
              />

              {/* Online Indicator (modern UI touch) */}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-slate-900 rounded-full"></span>
            </div>

            {/* Author Info */}
            <div className="flex flex-col">
              {/* Name */}
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {authorName || "Unknown Author"}
              </h2>

              {/* Email / Username */}
              <p className="text-sm text-slate-400 mt-1">
                @{email?.split("@")[0]}
              </p>

              {/* Meta Row */}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md">
                  Author
                </span>

                <Link
                  to={`/viewProfile/${email}`}
                  className="text-slate-500 cursor-pointer hover:text-teal-500 transition-colors duration-200"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>

       {/* Search and Filter Section */}
        <div className="w-11/12 mt-9 mx-auto max-w-md flex items-center gap-2 justify-center">
            <div className="w-full flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
              <IoSearchOutline className="text-2xl text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or category"
                value={searchTerm}
                onChange={(e)=>{setSearchTerm(e.target.value)}}
                className="bg-transparent focus:outline-none w-full text-sm text-white placeholder-gray-400"
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
        <div className="w-full relative mx-auto">
          {/* <h1 className="text-center text-white font-bold text-xl mt-2 md:mt-10">
            Domains
          </h1> */}

          {loader && !posts.length > 0 && <PillLoader />}
        </div>

        <div className="flex relative  w-full md:mx-2 flex-wrap justify-center h-auto mx-auto">
          
          

          <div className="md:w-full grid grid-cols-1 w-full mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-10 mt-7 md:mt-10 h-auto">
            {filteredPosts?.map((data, index) => (
              

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
                      onClick={(e) => postLikes(data.authoremail, data._id)}
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

                    {/* <button
                                            onClick={() => addBookMarkPostId(data._id)}
                                            className="text-teal-500"
                                          >
                                            {Array.isArray(bookMarkId) &&
                                            bookMarkId.includes(data._id) ? (
                                              <PiBookmarksSimpleFill className="text-teal-600 text-xs" />
                                            ) : (
                                              <PiBookmarksSimpleLight />
                                            )}
                                          </button> */}
                    <Link
                      to={`/viewpage/${data.authoremail}/${data._id}`}
                      onClick={() => postViews(data.authoremail, data._id)}
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
            ))}
            {/* {loading && <p className="text-center col-span-full py-4">Loading...</p>}
            
              
                    {!hasMore && (
                      <p className="text-center col-span-full py-4 text-gray-500">No more posts</p>
                    )} */}

            {!posts.length > 0 && loader && <BlogSkeleton />}
            {posts.length > 0 && loader && (
              <div className="col-span-full flex justify-center">
              <div className="relative flex items-center justify-center">
                {/* Outer Oval Ring */}
                <div className="w-7 h-7 border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                {/* Inner Glow Pulse */}
                {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
              </div>
            </div>
            )}

            {!hasMore && (
              <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                No more posts
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SingleAuthorPosts;
