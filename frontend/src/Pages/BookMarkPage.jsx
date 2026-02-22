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
import blog1 from "../images/img_not_found.png";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import { BiBookmarkAlt, BiLike, BiSolidLike } from "react-icons/bi";
import axiosInstance from "../instances/Axiosinstances";
import user from "../images/user.png";
import { useParams } from "react-router-dom";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import { ToastContainer, toast } from "react-toastify";
import TutorBookMarkPlaylist from "../components/TutorBookMarkPlaylist.jsx";
import BlogSkeleton from "../components/loaders/BlogSkeleton.jsx";
import PillLoader from "../components/loaders/PillSkeleton.jsx";
import TutorPlaylistGridSkeleton from "../components/loaders/TutorPlaylistGridSkeleton.jsx";
function BookMarkPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [postCategory, setPostCategory] = useState("");
  const [loader, setLoader] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorProfile, setAuthorProfile] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [bookMarkId, setBookMarkId] = useState([]);
  const { email } = useParams();

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
  //       setAuthorName(response.data.authorName);
  //       setAuthorProfile(response.data.profile);
  //     }
  //   } catch (err) {
  //     console.log("error", err.message);
  //   } finally {
  //     setLoader(false);
  //   }
  // };

const [page, setPage] = useState(1);
const limit = 10;
const [hasMore, setHasMore] = useState(true);
const isFetching = useRef(false);
const [loading, setLoading] = useState(false);

const getBookMarkPosts = async () => {
  if (!hasMore || isFetching.current) return;

  isFetching.current = true;
  setLoading(true);

  try {
    const response = await axiosInstance.get(
      `/blog/posts/getBookmarkPosts/${email}?page=${page}&limit=${limit}`
    );

    if (response.status === 200) {
      const newPosts = response.data.posts;

      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      // Append, don't replace
      setPosts(prev => [...prev, ...newPosts]);

      // Maintain exact same behavior for metadata
      setBookMarkId(prev => [...prev, ...response.data.postIds]);
      setAuthorName(response.data.authorName);
      setAuthorProfile(response.data.profile);

      setPage(prev => prev + 1);
    }

  } catch (err) {
    console.log("error", err.message);
  } finally {
    setLoading(false);
    isFetching.current = false;
  }
};



  // ----------------------------------------------------------------------------------------

  // const addBookMarkPostId = async (e, postId) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axiosInstance.post(
  //       `/blog/posts/bookmarkPosts/${email}`,
  //       { postId }
  //     );
  //     if (response.status == 200) {
  //       {
  //         bookMarkId.includes(postId)
  //           ? toast.success("bookmark removed successfully")
  //           : toast.success("post bookmarked successfully");
  //       }
  //       getBookMarkPosts();
  //     }
  //   } catch (err) {
  //     console.log("error", err.message);
  //     toast.error("unable to bookmark");
  //   }
  // };

  const addBookMarkPostId = async (e, postId) => {
  e.preventDefault();

  try {
    const response = await axiosInstance.post(
      `/blog/posts/bookmarkPosts/${email}`,
      { postId }
    );

    if (response.status === 200) {

      const isBookmarked = bookMarkId.includes(postId);

      // ✅ Toast correct
      if (isBookmarked) {
        toast.success("Bookmark removed successfully");
      } else {
        toast.success("Post bookmarked successfully");
      }

      // ✅ Update bookmark IDs instantly
      setBookMarkId(prev =>
        isBookmarked
          ? prev.filter(id => id !== postId)  // remove
          : [...prev, postId]                 // add
      );

      // ✅ Also update posts list visually if needed
      setPosts(prev =>
        prev.filter(post =>
          isBookmarked ? post._id !== postId : true
        )
      );
    }

  } catch (err) {
    console.log("error", err.message);
    toast.error("Unable to bookmark");
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
            : post
        )
      );
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  // Filter posts based on search
  const filterdPost = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

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
          )
        )}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 h-auto reltive  ">
      <NavBar />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-4">
        <h1 className=" text-2xl mb-4  w-11/12 flex items-center gap-2 mx-auto md:text-3xl font-bold text-white tracking-wide">
          <BiBookmarkAlt />
          <span className="group text-white"> My Bookmarks </span>{" "}
        </h1>
         <div className="w-11/12 mx-auto">
         {/* <TutorBookMarkPlaylist/> */}
          {loading && !posts.length>0? <TutorPlaylistGridSkeleton/>: <TutorBookMarkPlaylist />}
         </div>
         

        <div className="w-11/12 mt-10 mx-auto">
    
         { posts.length>0 && <div className="flex md:max-w-5xl md:w-fit mt-12 scrollbar-hide mx-auto items-center justify-start gap-3 mb-5 overflow-x-auto">
            {/* All Button */}
            <div
              onClick={() => setPostCategory("")}
              className={` text-nowrap cursor-pointer rounded-md text-sm px-3 p-1 md:py-2 transition-all duration-200 ${
                postCategory === ""
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              All
            </div>

            {/* Dynamic Categories */}
            {getUniqueCategories(posts).map((data, index) => (
              <div
                key={index}
                onClick={() => setPostCategory(data)}
                className={` text-nowrap cursor-pointer rounded-md text-sm px-3 py-1 md:py-2 transition-all duration-200 ${
                  postCategory === data
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {data}
              </div>
            ))}
          </div>}

          {loading &&!posts.length>0 && <PillLoader/>}
        </div>

        <div className="flex relative backdrop-blur-md w-11/12 flex-wrap justify-center h-auto mx-auto">
          {/* Search and Filter Section */}
          <div className="w-full flex items-center gap-2 justify-center">
            <div className="md:w-72 w-52 flex border border-gray-600 rounded-xl p-2 bg-gray-800 justify-center gap-2 items-center my-4">
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

          <div className="w-full mx-auto">
            {/* <TutorBookMarkPlaylist /> */}
            {(postCategory === ""
              ? filterdPost
              : posts.filter((post) => post.category === postCategory)
            ).length > 0 && (
              <h2 className="md:pl-4 pl-2 mt-0 md:mt-10  text-2xl md:text-4xl font-bold tracking-wide text-gray-200">
                Posts
              </h2>
            )}
          </div>

          <div className="md:w-full grid grid-cols-1 w-full mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 md:gap-16 mt-7 md:mt-10 h-auto">
            {/* Posts Grid */}
            {
            // loader ? (
            //   <div className="col-span-full flex flex-col items-center justify-center">
            //     <MagnifyingGlass
            //       visible={true}
            //       height="100"
            //       width="100"
            //       ariaLabel="loading"
            //       wrapperStyle={{ marginTop: "20px" }}
            //       wrapperClass="magnifying-glass-wrapper"
            //       glassColor="#4B5563"
            //       color="#60A5FA"
            //     />
            //     <p className="text-sm md:text-lg font-semibold text-gray-400">
            //       Loading Posts...
            //     </p>
            //   </div>
            // ) :
             (
              (postCategory === ""
                ? filterdPost
                : posts.filter((post) => post.category === postCategory)
              ).map((data, index) => (
                <div
                  key={index}
                  className="w-full mx-auto md:w-full bg-gray-800 md:pb-2 flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300 h-auto  md:mb-0 md:p-4 py-4 md:rounded-xl"
                >
                  <div className="flex px-4 mb-2 gap-2 items-center">
                    {data.profile ? (
                      <Link to={`/viewProfile/${data.authoremail}`}>
                        {" "}
                        <img
                          src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`}
                          className="rounded-full border border-white/50 w-10 h-10 mx-auto object-cover"
                          alt=""
                        />
                      </Link>
                    ) : (
                      <Link to={`/viewProfile/${data.authoremail}`}>
                        <img
                          src={user}
                          className="rounded-full w-10 h-10 bg-white border-2 border-black mx-auto object-cover"
                        />
                      </Link>
                    )}
                    <div className="flex flex-col">
                      <p className="text-sm text-white font-semibold">
                        {data.authorname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {/* {data.timestamp.slice(0, 10)} */}
                        {getTimeAgo(data.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/viewpage/${data.authoremail}/${data._id}`}
                    onClick={() => postViews(data.authoremail, data._id)}
                    // className="cursor-pointer flex items-center gap-1 hover:text-blue-300"
                  >
                    <img
                      src={
                        data.image
                          ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                          : blog1
                      }
                      className="w-full
                        h-44 md:h-36
                        object-cover
                        hover:opacity-90
                        transition"
                      alt={data.title}
                    />
                  </Link>
                  <div className="min-h-28 px-4 h-auto pt-4">
                    <h2 className="md:text-xl text-lg text-white font-bold">
                      {data.title && data.title.slice(0, 20)}...
                    </h2>
                    <p className="text-xs text-gray-400 mt-2">
                      {renderTextWithHashtags(data.description.slice(0, 50))}...
                    </p>
                  </div>

                  <div className="flex justify-between px-4 items-center mb-2 ">
                    <div className="flex gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/viewpage/${data.authoremail}/${data._id}`}
                          onClick={() => postViews(data.authoremail, data._id)}
                          className="cursor-pointer flex items-center gap-1  hover:text-blue-300"
                        >
                          <IoEye className="text-sm text-blue-400" />
                          <span className="text-[9px] text-white">
                            {data.views.length || ""}
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) =>
                            postLikes(data.authoremail, data._id, e)
                          }
                          className="cursor-pointer flex items-center gap-1 hover:text-blue-300 bg-transparent border-0 disabled:opacity-50"
                        >
                          {(data.likes || []).includes(email) ? (
                            <BiSolidLike className="text-sm text-blue-400" />
                          ) : (
                            <BiLike className="text-sm text-blue-400" />
                          )}
                          <span className="text-[9px] text-white">
                            {data.likes && data.likes.length > 0
                              ? data.likes.length
                              : ""}
                          </span>
                        </button>

                        <div
                          to={`/viewpage/${data.authoremail}/${data._id}`}
                          onClick={() =>
                            sharePost(data.title, data.authoremail, data._id)
                          }
                          className="cursor-pointer flex items-center gap-1  hover:text-blue-300"
                        >
                          <IoShareSocial className="text-sm text-blue-400" />
                        </div>
                        <div
                          onClick={(e) => {
                            addBookMarkPostId(e, data._id);
                          }}
                          className="cursor-pointer flex items-center gap-1 hover:text-blue-300"
                        >
                          {Array.isArray(bookMarkId) &&
                          bookMarkId.includes(data._id) ? (
                            <PiBookmarksSimpleFill className="text-blue-500" />
                          ) : (
                            <PiBookmarksSimpleLight />
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setPostCategory(data.category)}
                      className="px-2 py-1 rounded-full bg-gray-600 text-gray-300 text-sm md:text-xs font-medium
                     transition-colors duration-200"
                    >
                      {data.category}
                    </button>
                  </div>
                </div>
              ))
            )}
            { !posts.length>0 && loading && <BlogSkeleton/>}
            { posts.length > 0 && loading && <p className="col-span-full py-4 text-gray-500 text-center">loading...</p>}

          </div>

          { !loading && posts.length == 0 && (
            <h1 className="text-white/50 md:text-2xl  text-center w-full">
              Your Bookmark is Empty !
            </h1>
          )}
        </div>

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
        <ToastContainer />
      </div>
      <Footer />
    </div>
  );
}

export default BookMarkPage;
