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
import blog1 from "../images/img_not_found.png";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import { BiBookmarkAlt, BiLike, BiSolidLike } from "react-icons/bi";
import axiosInstance from "../instances/Axiosinstances";
import { BsPersonWorkspace } from "react-icons/bs";
import getTimeAgo from "../components/DateCovertion";
import BlogSkeleton from "../components/loaders/BlogSkeleton";
import PillLoader from "../components/loaders/PillSkeleton";

function YourPost() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [postCategory, setPostCategory] = useState("");
  const [loader, setLoader] = useState(false);
  const email = localStorage.getItem("email");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;
  const isFetching = useRef(false);

  const [authorProfile, setAuthorProfile] = useState("");

  // Fetch posts from API
  // const fetchPosts = async () => {
  //   setLoader(true);
  //   try {
  //     const response = await axiosInstance.get(`/blog/posts/${email}`);
  //     // setPosts(
  //     //   response.data.posts.filter((post) => post.authoremail === email)
  //     // );
  //     setPosts(response.data.data);
  //     setAuthorProfile(response.data.profile);
  //   } catch (err) {
  //     console.error("Error fetching posts:", err);
  //   }
  //   setLoader(false);
  // };
  // useEffect(() => {
  //   fetchPosts();
  // }, []);

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

  const postLikes = async (authorEmail, postId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 h-auto reltive  ">
      <NavBar />

      {posts.length > 0 && (
        <h1 className=" text-2xl  w-11/12 flex items-center gap-2 mt-4 mx-auto md:text-3xl font-bold text-white tracking-wide">
          <BsPersonWorkspace />
          <span className="group text-white">
            {" "}
            My Posts
          </span>{" "}
        </h1>
      )}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-4 pb-8">
        {/* <p className="text-lg text-white w-11/12 mx-auto">Posts {posts.length>0 && posts.length}</p> */}

        <div className=" w-11/12  mt-10   h-auto mx-auto">
          {posts.length > 0 && (
         <div className="flex md:max-w-5xl md:w-fit scrollbar-hide mx-auto items-center justify-start gap-3 mb-5 overflow-x-auto">
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

          {loader && !posts.length > 0 && <PillLoader />}

          {/* Search and Filter Section */}
          {posts.length > 0 && (
             <div className="flex justify-center my-10">
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
          )}

          <div className="md:w-full grid grid-cols-1 w-full mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 md:gap-10 mt-7 md:mt-10 h-auto">
            {/* Posts Grid */}
            {
          
              (postCategory === ""
                ? filterdPost
                : posts.filter((post) => post.category === postCategory)
              ).map((data, index) => (
                // <div
                //   key={index}
                //   className="w-full mx-auto md:w-full bg-gray-800  flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300 h-auto md:mb-0 md:mb-0 md:p-4 py-4 md:rounded-xl"
                // >
                //   <div className="flex mb-2 px-4 gap-2 items-center">
                //     <img
                //       src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${authorProfile}`}
                //       className="w-8 max-h-10 object-cover rounded-full border border-gray-600"
                //       alt={data.authorName}
                //     />
                //     <div className="flex flex-col">
                //       <p className="text-sm text-white font-semibold">
                //         {data.authorName}
                //       </p>
                //       <p className="text-xs text-gray-400 font-semibold">
                //         {/* {data.timestamp.slice(0, 10)} */}
                //         {getTimeAgo(data.timestamp)}
                //       </p>
                //     </div>
                //   </div>

                //   <Link
                //     to={`/viewpage/${data.authoremail}/${data._id}`}
                //     onClick={() => postViews(data.authoremail, data._id)}
                //     // className="cursor-pointer flex items-center gap-1  hover:text-blue-300"
                //   >
                //     <img
                //       src={
                //         data.image
                //           ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                //           : blog1
                //       }
                //       className="w-full
                //                 h-44 md:h-36
                //                 object-cover
                //                 hover:opacity-90
                //                 transition"
                //       alt={data.title}
                //       // onClick={() =>
                //       //   handleImageClick(
                //       //     data.image
                //       //       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                //       //       : blog1
                //       //   )
                //       // }
                //     />
                //   </Link>
                //   <div className="min-h-28 h-auto px-4 pt-4">
                //     <h2 className="md:text-xl text-lg text-white line-clamp-1 font-bold">
                //       {data.title}
                //     </h2>
                //     <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                //       {renderTextWithHashtags(data.description)}
                //     </p>
                //   </div>

                //   <div className="flex px-4 justify-between items-center mb-2 ">
                //     <div className="flex gap-3 items-center">
                //       <div className="flex items-center gap-2">
                //         <Link
                //           to={`/viewpage/${data.authoremail}/${data._id}`}
                //           onClick={() => postViews(data.authoremail, data._id)}
                //           className="cursor-pointer flex items-center gap-1  hover:text-blue-300"
                //         >
                //           <IoEye className="text-sm text-blue-400" />
                //           <span className="text-[9px] text-white">
                //             {data.views.length || ""}
                //           </span>
                //         </Link>
                //         <button
                //           type="button"
                //           onClick={(e) =>
                //             postLikes(data.authoremail, data._id, e)
                //           }
                //           className="cursor-pointer flex items-center gap-1 hover:text-blue-300 bg-transparent border-0 disabled:opacity-50"
                //         >
                //           {(data.likes || []).includes(email) ? (
                //             <BiSolidLike className="text-sm text-blue-400" />
                //           ) : (
                //             <BiLike className="text-sm text-blue-400" />
                //           )}
                //           <span className="text-[9px] text-white">
                //             {data.likes && data.likes.length > 0
                //               ? data.likes.length
                //               : ""}
                //           </span>
                //         </button>

                //         <div
                //           to={`/viewpage/${data.authoremail}/${data._id}`}
                //           onClick={() =>
                //             sharePost(data.title, data.authoremail, data._id)
                //           }
                //           className="cursor-pointer flex items-center gap-1  hover:text-blue-300"
                //         >
                //           <IoShareSocial className="text-sm text-blue-400" />
                //         </div>

                //         {data.authoremail === email && (
                //           <Link
                //             to={`/EditPost/${data._id}`}
                //             className="text-pink-400 hover:text-pink-300"
                //           >
                //             <MdEdit className="text-sm" />
                //           </Link>
                //         )}
                //       </div>
                //     </div>
                //     <button
                //       onClick={() => setPostCategory(data.category)}
                //       className="px-2 py-1 rounded-full bg-gray-600 text-gray-300 text-sm md:text-xs font-medium
                //      transition-colors duration-200"
                //     >
                //       {data.category}
                //     </button>
                //   </div>
                // </div>
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
            }

            {!posts.length > 0 && loader && <BlogSkeleton />}
            {posts.length > 0 && loader && (
              <p className="col-span-full py-4 text-gray-500 text-center">
                loading...
              </p>
            )}

            {!hasMore && posts.length>0 && (
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
      <Footer />
    </div>
  );
}



export default YourPost;
