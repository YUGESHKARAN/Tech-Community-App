import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  IoSearchOutline,
  IoEye,
  IoClose,
  IoShareSocial,
  IoRemoveOutline,
} from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { MagnifyingGlass } from "react-loader-spinner";
import blog1 from "../images/img_not_found2.png";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import { BiBookmarkAlt, BiLike, BiSolidLike } from "react-icons/bi";
import axiosInstance from "../instances/Axiosinstances";
import { BsPersonWorkspace } from "react-icons/bs";
import getTimeAgo from "../components/DateCovertion";
import BlogSkeleton from "../components/loaders/BlogSkeleton";
import PillLoader from "../components/loaders/PillSkeleton";
import Fuse from "fuse.js";
import highlightText from "../hooks/highlightText";

function YourPost() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [postCategory, setPostCategory] = useState("");
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("email");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;
  const isFetching = useRef(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [delPostId, setDelPostId] = useState("")

  const [authorProfile, setAuthorProfile] = useState("");



  // ------------------------------------------------------------------

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

      // setAuthorName(response.data.authorName);
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

  // ----------------------------------------------------------------



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

      if (response.status===200){
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
  //       post.authorName?.toLowerCase().includes(query)
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


  const deletePost = async (PostId) => {
    setShowConfirm(true);
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/blog/posts/${email}/${PostId}`);
      // const response = axiosInstance.delete(`http://localhost:3000/blog/posts/${email}/${PostId}`);
      if (response.status === 200){
          // console.log("deleted response", response);
           // toast.success("post deleted successfully");
          // navigate("/home");
          //  fetchPosts();

          setPosts((prev)=> prev.filter((p)=> p._id!== PostId))
           
      }
    
      
    } catch (err) {
      console.log(err);
    } 
    finally{
      setDelPostId("")
      setShowConfirm(false);
      setLoading(false)
    }
  
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 h-auto reltive  ">
      <NavBar />

      {posts.length > 0 && (
        <h1 className=" text-2xl mt-4 px-2  md:w-full flex items-center gap-2 mx-auto md:text-3xl font-bold text-white tracking-wide">
          <BsPersonWorkspace />
          <span className="group text-white"> My Posts</span>{" "}
        </h1>
      )}
      <div className="min-h-screen  pt-2 pb-8">
        {/* <p className="text-lg text-white w-11/12 mx-auto">Posts {posts.length>0 && posts.length}</p> */}

        <div className=" w-full  mt-10   h-auto mx-auto">
           {/* Search and Filter Section */}
          {posts.length > 0 && (
            <div className="flex justify-center">
              <div className="w-11/12 mx-auto max-w-md flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
                <IoSearchOutline className="text-xl text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, topics, or categories"
                  value={searchTerm}
                  onChange={(e)=>{setSearchTerm(e.target.value)}}
                  className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-400"
                />
              </div>
            </div>
          )}
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

          {loader && !posts.length > 0 && <PillLoader />}

         

          <div className="md:w-full md:px-2 grid grid-cols-1 w-full mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-10 mt-7 md:mt-10 h-auto">
            {/* Posts Grid */}
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
                      className="w-9 h-9 rounded-full bg-white object-cover border border-gray-700"
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

                {/* <Link
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
                                    relative   duration-500  md:hover:scale-[1.05]  md:h-48  object-cover"
                  />

                  
                </Link> */}

                  <div
                  // to={`/viewpage/${data.authoremail}/${data._id}`}
                  // onClick={() => postViews(data.authoremail, data._id)}
                  className="block relative"
                >
                  <Link
                   to={`/viewpage/${data.authoremail}/${data._id}`}
                  onClick={() => postViews(data.authoremail, data._id)}
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
                

                   <span
                            onClick={() => {
                              // deletePost(data._id);
                              setDelPostId(data._id)
                              setShowConfirm(true)
                            }}
                            // // className="absolute top-2 cursor-pointer right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded"
                            className="absolute top-3 cursor-pointer right-3   md:text-xl  text-2xl font-medium  rounded"
                          >
                            {/* Del */}
                            <IoRemoveOutline  className="bg-red-500 rounded-full text-white" />
                          </span>
                </div>
               

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
                      onClick={() => postLikes(data.authoremail, data._id)}
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

                    {data.authoremail === email && (
                      <Link
                        to={`/EditPost/${data._id}`}
                        className="text-teal-400 hover:text-teal-300"
                      >
                        <MdEdit className="text-sm" />
                      </Link>
                    )}
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

            {!posts.length > 0 && loader && <BlogSkeleton />}
            {posts.length > 0 && loader && (
              // <p className="col-span-full py-4 text-gray-500 text-center">
              //   loading...
              // </p>
              <div className="col-span-full flex justify-center">
              <div className="relative flex items-center justify-center">
                {/* Outer Oval Ring */}
                <div className="w-7 h-7 border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                {/* Inner Glow Pulse */}
                {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
              </div>
            </div>
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-center col-span-full py-4 text-gray-500">
                No more posts
              </p>
            )}
          </div>
          {posts.length == 0 && !loader && (
            <div className="flex h-[70vh] flex-col justify-center items-center gap-5 ">
              <span className="text-gray-400 flex justify-center items-center text-center ">
                {" "}
                Your workspace is empty! Start creating your posts.{" "}
              </span>
              <Link
                to="/addPost"
                className="text-sm cursor-pointer hover:bg-green-700 bg-green-600 transition-all duration-400 text-white font-medium rounded-md px-4 p-2"
              >
                + Create New Post
              </Link>
              {/* <span className="text-white/50 md:text-2xl  text-center w-full">
               Else please check your internet connection.{" "}
              </span> */}
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 max-w-sm animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-800">
                Confirm Deletion
              </h2>
            </div>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Are you sure you want to delete this Post?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={()=> {deletePost(delPostId)}}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                disabled={loading}
              >
                {loading ? "Deleting.." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default YourPost;
