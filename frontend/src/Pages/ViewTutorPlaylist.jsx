import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../instances/Axiosinstances";
import NavBar from "../ui/NavBar";
import user from "../images/user.png";
import blog1 from "../images/img_not_found2.png";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import { IoClose, IoShareSocial } from "react-icons/io5";
import { MdArrowDropDown } from "react-icons/md";
import { IoMdArrowDropup } from "react-icons/io";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import PlaylistDetailSkeleton from "../components/loaders/PlaylistDetailSkeleton";
import Footer from "../ui/Footer";
import { getItem } from "../utils/encode";

function ViewTutorPlaylist() {
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  const { playlistId } = useParams();
  const [playlistData, setPlaylistData] = useState({});
  const [playlistPosts, setPlaylistPosts] = useState([]);
  const [showContributors, setShowContributors] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  // console.log("playlist Id", playlistId);

  const getTutorPlaylist = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/blog/playlist/${playlistId}`);
      if (response.status === 200) {
        setPlaylistData(response.data.data);
        setPlaylistPosts(response.data.posts);
      }
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTutorPlaylist();
  }, [playlistId]);

  // console.log("playlist data", playlistData);
  // console.log("playlist Posts", playlistPosts);

  const [playlistbookMarkId, setPlaylistBookMarkId] = useState([]);
  const [bookMarkId, setBookMarkId] = useState([]);

  const getBookMarkPlaylist = async () => {
    try {
      const response = await axiosInstance.get(
        `/blog/playlist/bookmark/${email}`,
      );
      if (response.status == 200) {
        setPlaylistBookMarkId(response.data.playlistIds);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  const getBookMarkPosts = async () => {
    try {
      const response = await axiosInstance.get(
        `/blog/posts/getBookmarkPosts/bookmark/${email}`,
      );
      if (response.status == 200) {
        setBookMarkId(response.data.postIds);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getBookMarkPlaylist();
    getBookMarkPosts();
  }, []);

  const addBookMarkPostIdPlaylist = async (_id) => {
    // e.preventDefault()
    console.log("bookmark id", _id);
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
        { postId: _id },
      );
      if (response.status === 200) {
          setPlaylistBookMarkId((prev) => {
          if (prev.includes(_id)) {
            // toast.success("bookmark removed successfully");
            return prev.filter((id) => id !== _id);
          } else {
            // toast.success("post bookmarked successfully");
            return [...prev, _id];
          }
        });
      }
    } catch (err) {
      console.log("error", err.message);
      // toast.error("unable to bookmark");
    }
  };

    const addBookMarkPostId = async (_id) => {
    // e.preventDefault()
    // console.log("bookmark id", _id);
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
        { postId: _id },
      );
      if (response.status === 200) {
          setBookMarkId((prev) => {
          if (prev.includes(_id)) {
            // toast.success("bookmark removed successfully");
            return prev.filter((id) => id !== _id);
          } else {
            // toast.success("post bookmarked successfully");
            return [...prev, _id];
          }
        });
      }
    } catch (err) {
      console.log("error", err.message);
      // toast.error("unable to bookmark");
    }
  };

  // share playlist with social media
  const sharePlayList = async (title, id) => {
    try {
      const data = {
        title: title,
        text: title,
        url: `${window.location.origin}/viewplaylist/${id}`,
      };
      const response = await navigator.share(data);
      // console.log("post shared successfully", response);
    } catch (err) {
      console.log("error sharing post", err);
    }
  };

  // share playlist with social media
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

  const postLikes = async (authorEmail, postId) => {
    // e.preventDefault();
    try {
       const response =  await axiosInstance.put(`/blog/posts/likes/${authorEmail}/${postId}`, {
        emailAuthor: email,
      });

      if (response.status === 200){
          setPlaylistPosts((prevPosts) =>
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

      // getTutorPlaylist();
    } catch (err) {
      console.error("Error updating views:", err);
    }
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

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // console.log("playlist data", playlistData);
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />

      <div className="w-full mx-auto px-2 min-h-screen md:h-auto md:px-8 py-6">
        <h1 className="text-3xl w-full mb-7 mx-auto hidden md:block font-semibold">
          {loading ? "Loading Playlist..." : playlistData?.title}
        </h1>
        {!loading && (
          <div className="grid w-full mx-auto md:h-screen grid-cols-1 lg:grid-cols-2 lg:gap-8 gap-6">
            {/* LEFT PANEL (Banner + Info) */}
            <div className="lg:col-span-1 md:hidden  p-2 md:sticky top-4 self-start  md:p-0 space-y-4">
              {/* Banner */}
              <div className="relative rounded-xl   overflow-hidden bg-black border border-gray-700">
                <img
                  src={
                    playlistData.thumbnail
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.thumbnail}`
                      : blog1
                  }
                  onClick={() =>
                    handleImageClick(
                      playlistData.thumbnail
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.thumbnail}`
                        : blog1,
                    )
                  }
                  alt="Playlist Banner"
                  className="w-full h-48 md:h-[60vh]  object-cover md:object-contain"
                />
              </div>

              {/* Playlist Info */}
              <div className="space-y-2">
                <h1 className="text-xl md:hidden font-semibold">
                  {playlistData.title}
                </h1>
                <div className="flex relative justify-between items-center ">
                  {/* left content */}
                  <div className="flex flex-col items-start gap-2">
                    {/* Author */}

                    <div className="">
                      <h1 className="font-semibold flex items-center gap-1 mb-1 md:text-base text-gray-300 text-sm ">
                        Contributors
                        <span
                          onClick={() => {
                            setShowContributors(!showContributors);
                          }}
                          className=" cursor-pointer  "
                        >
                          {!showContributors ? (
                            <MdArrowDropDown className="text-xl" />
                          ) : (
                            <IoMdArrowDropup className="text-xl" />
                          )}
                        </span>
                      </h1>

                      {/* Contributors profile */}
                      <div
                        className={`${
                          !showContributors ? "flex -space-x-2" : "hidden "
                        } cursor-pointer `}
                        onClick={() => {
                          setShowContributors(!showContributors);
                        }}
                      >
                        <img
                          src={
                            playlistData.profile
                              ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.profile}`
                              : user
                          }
                          // alt={collab.name}
                          className="h-6 md:h-7 w-6 md:w-7 rounded-full border-2 border-teal-600 bg-white"
                        />
                        {playlistData?.collaborators?.map((collab) => (
                          <img
                            key={collab._id}
                            src={
                              collab.profile
                                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collab.profile}`
                                : user
                            }
                            alt={collab.name}
                            className="h-6 md:h-7 w-6 md:w-7 rounded-full border-2 border-teal-600 bg-white"
                          />
                        ))}
                      </div>

                      {/* Contributors details */}
                      <div
                        className={`${
                          showContributors
                            ? " w-full flex flex-col justify-center gap-1"
                            : "hidden "
                        } `}
                      >
                        <Link
                          to={`/viewProfile/${playlistData.email}`}
                          className="flex hover:bg-gray-400/20 items-center cursor-pointer gap-2  text-gray-400 text-xs p-1 rounded-md"
                        >
                          <img
                            src={
                              playlistData.profile
                                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.profile}`
                                : user
                            }
                            alt=""
                            className="h-6 md:h-7 w-6 md:w-7 bg-white  rounded-full object-cover border border-green-400"
                          />
                          {playlistData.name}{" "}
                          <span className="text-gray-200">(Author)</span>
                        </Link>
                        {playlistData?.collaborators?.map((data, index) => (
                          <Link
                            to={`/viewProfile/${data.email}`}
                            key={index}
                            className="flex hover:bg-gray-400/20 items-center cursor-pointer gap-2  text-gray-400 text-xs p-1 rounded-md"
                          >
                            <img
                              src={
                                data.profile
                                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
                                  : user
                              }
                              alt=""
                              className="h-6 md:h-7 w-6 md:w-7 bg-white  rounded-full object-cover border border-green-400"
                            />
                            {data.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* right content */}
                  <div className=" absolute top-0 right-0 flex flex-col items-start gap-2">
                    <p className="text-sm text-gray-400">
                      Playlist • {playlistData?.post_ids?.length}
                    </p>

                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => {
                          addBookMarkPostIdPlaylist(playlistData._id);
                        }}
                        className="cursor-pointer flex items-center md:text-xl gap-1 text-teal-300 hover:text-teal-300"
                      >
                        {Array.isArray(playlistbookMarkId) &&
                        playlistbookMarkId.includes(playlistData._id) ? (
                          <PiBookmarksSimpleFill className="text-teal-500" />
                        ) : (
                          <PiBookmarksSimpleLight />
                        )}
                      </div>

                      <div
                        onClick={() =>
                          sharePlayList(playlistData.title, playlistData._id)
                        }
                        className="cursor-pointer flex items-center gap-1 hover:text-teal-300"
                      >
                        <IoShareSocial className="md:text-xl text-teal-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
           
             {/* LEFT PANEL (Banner + Info) */}
            <div className="lg:col-span-1 hidden md:block md:sticky top-6 self-start space-y-4">
              {/* HERO BANNER */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-xl group">
                <img
                  src={
                    playlistData.thumbnail
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.thumbnail}`
                      : blog1
                  }
                  onClick={() =>
                    handleImageClick(
                      playlistData.thumbnail
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.thumbnail}`
                        : blog1,
                    )
                  }
                  alt="Playlist Banner"
                  className="w-full h-[260px] md:h-[50vh] cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div 
                 onClick={() =>
                    handleImageClick(
                      playlistData.thumbnail
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.thumbnail}`
                        : blog1,
                    )
                  }
                className="absolute inset-0 bg-gradient-to-t cursor-pointer from-black via-black/10 to-transparent" />

                {/* Title + Meta */}
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <h1 className="text-xl md:text-2xl font-semibold text-white leading-snug">
                    {playlistData.title}
                  </h1>

                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-gray-300">
                      Playlist • {playlistData?.post_ids?.length} posts
                    </p>

                    {/* <div className="flex items-center gap-3">
                    
                      <button
                        onClick={() => addBookMarkPostIdPlaylist(playlistData._id)}
                        className="text-teal-400 hover:text-teal-300 transition"
                      >
                        {Array.isArray(playlistbookMarkId) &&
                        playlistbookMarkId.includes(playlistData._id) ? (
                          <PiBookmarksSimpleFill className="text-xl" />
                        ) : (
                          <PiBookmarksSimpleLight className="text-xl" />
                        )}
                      </button>

                     
                      <button
                        onClick={() =>
                          sharePlayList(playlistData.title, playlistData._id)
                        }
                        className="text-teal-400 hover:text-teal-300 transition"
                      >
                        <IoShareSocial className="text-xl" />
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* CONTRIBUTORS CARD */}
              <div className="flex p-4 relative border border-neutral-700/70 rounded-lg  justify-between items-center ">
                  {/* left content */}
                  <div className="flex flex-col items-start gap-2">
                    {/* Author */}

                    <div className="">
                      <h1 className="font-semibold flex items-center gap-1 mb-1 md:text-base text-gray-300 text-sm ">
                        Contributors
                        <span
                          onClick={() => {
                            setShowContributors(!showContributors);
                          }}
                          className=" cursor-pointer  "
                        >
                          {!showContributors ? (
                            <MdArrowDropDown className="text-xl" />
                          ) : (
                            <IoMdArrowDropup className="text-xl" />
                          )}
                        </span>
                      </h1>

                      {/* Contributors profile */}
                      <div
                        className={`${
                          !showContributors ? "flex -space-x-2" : "hidden "
                        } cursor-pointer `}
                        onClick={() => {
                          setShowContributors(!showContributors);
                        }}
                      >
                        
                        {playlistData?.collaborators?.map((collab) => (
                          <img
                            key={collab._id}
                            src={
                              collab.profile
                                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collab.profile}`
                                : user
                            }
                            alt={collab.name}
                            className="h-6 md:h-7 w-6 md:w-7 rounded-full border-2 border-teal-600 bg-gray-400"
                          />
                        ))}
                        <img
                          src={
                            playlistData.profile
                              ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.profile}`
                              : user
                          }
                          // alt={collab.name}
                          className="h-6 md:h-7 w-6 md:w-7 rounded-full border-2 border-teal-600 bg-gray-400"
                        />
                      </div>

                      {/* Contributors details */}
                      <div
                        className={`${
                          showContributors
                            ? " w-full flex flex-col justify-center gap-1"
                            : "hidden "
                        } `}
                      >
                        <Link
                          to={`/viewProfile/${playlistData.email}`}
                          className="flex hover:bg-gray-400/20 items-center cursor-pointer gap-2  text-gray-400 text-xs p-1 rounded-md"
                        >
                          <img
                            src={
                              playlistData.profile
                                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.profile}`
                                : user
                            }
                            alt=""
                            className="h-6 md:h-7 w-6 md:w-7 bg-gray-400  rounded-full object-cover border border-teal-600"
                          />
                          {playlistData.name}{" "}
                          <span className="text-gray-200">(Author)</span>
                        </Link>
                        {playlistData?.collaborators?.map((data, index) => (
                          <Link
                            to={`/viewProfile/${data.email}`}
                            key={index}
                            className="flex hover:bg-gray-400/20 items-center cursor-pointer gap-2  text-gray-400 text-xs p-1 rounded-md"
                          >
                            <img
                              src={
                                data.profile
                                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
                                  : user
                              }
                              alt=""
                              className="h-6 md:h-7 w-6 md:w-7 bg-gray-400  rounded-full object-cover border border-teal-600"
                            />
                            {data.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* right content */}
                  <div className=" absolute top-4 right-4 flex flex-col items-start gap-2">
                    {/* <p className="text-sm text-gray-400">
                      Playlist • {playlistData?.post_ids?.length}
                    </p> */}

                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => {
                          addBookMarkPostIdPlaylist(playlistData._id);
                        }}
                        className="cursor-pointer flex items-center md:text-xl gap-1 text-teal-300 hover:text-teal-300"
                      >
                        {Array.isArray(playlistbookMarkId) &&
                        playlistbookMarkId.includes(playlistData._id) ? (
                          <PiBookmarksSimpleFill className="text-teal-500" />
                        ) : (
                          <PiBookmarksSimpleLight />
                        )}
                      </div>

                      <div
                        onClick={() =>
                          sharePlayList(playlistData.title, playlistData._id)
                        }
                        className="cursor-pointer flex items-center gap-1 hover:text-teal-300"
                      >
                        <IoShareSocial className="md:text-xl text-teal-400" />
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* RIGHT PANEL (Playlist Posts) */}
            <div className="lg:col-span-1 md:overflow-y-scroll mt-0 scrollbar-hide space-y-2 md:space-y-2">
              {playlistPosts.map((post, index) => (
                <div
                  key={post._id}
                  className="flex gap-4  p-2  bg-gray-900 rounded-lg border md:border-neutral-800 border-neutral-800 transition"
                >
                  {/* Video Thumbnail */}
                  <Link
                    // to={`/viewpage/playlist/${playlistData.email}/${post._id}`}
                    to={`/viewpage/${playlistData.email}/${post._id}`}
                    onClick={() => postViews(playlistData.email, post._id)}
                    className="relative w-48 h-20 md:min-w-0 md:h-24 rounded-md overflow-hidden"
                  >
                    <img
                      // src={post.thumbnail}
                      src={
                        post.image
                          ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${post.image}`
                          : blog1
                      }
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </span>
                  </Link>

                  {/* Video Info */}
                  <div className="flex flex-col w-11/12 md:w-11/12 justify-between">
                    <Link 
                    // to={`/viewpage/playlist/${playlistData.email}/${post._id}`}
                    to={`/viewpage/${playlistData.email}/${post._id}`}
                    onClick={() => postViews(playlistData.email, post._id)}
                    className="text-sm font-medium line-clamp-2">
                      {post.title}
                    </Link>
                      <Link
                    // to={`/viewpage/playlist/${playlistData.email}/${post._id}`}
                    to={`/viewpage/${playlistData.email}/${post._id}`}
                    onClick={() => postViews(playlistData.email, post._id)}
                    className="md:text-xs text-xs text-gray-300 line-clamp-1 md:line-clamp-2">
                      {/* {post.description?.slice(0, 50)}... */}
                      {post.description}
                    </Link>

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        Views {post.views?.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) =>
                            postLikes(playlistData.email, post._id, e)
                          }
                          className="cursor-pointer flex items-center gap-1 hover:text-teal-300 bg-transparent border-0 disabled:opacity-50"
                        >
                          {(post.likes || []).includes(email) ? (
                            <BiSolidLike className="text-sm text-teal-400" />
                          ) : (
                            <BiLike className="text-sm text-teal-400" />
                          )}
                          <span className="text-[9px] text-white">
                            {post.likes && post.likes.length > 0
                              ? post.likes.length
                              : ""}
                          </span>
                        </button>

                        <div
                          onClick={() =>
                            sharePost(post.title, playlistData.email, post._id)
                          }
                          className="cursor-pointer flex items-center gap-1 hover:text-teal-300"
                        >
                          <IoShareSocial className="text-sm text-teal-400" />
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            onClick={() => {
                              addBookMarkPostId(post._id);
                            }}
                            className="cursor-pointer flex items-center gap-1 text-teal-300 hover:text-teal-300"
                          >
                            {Array.isArray(bookMarkId) &&
                            bookMarkId.includes(post._id) ? (
                              <PiBookmarksSimpleFill className="text-teal-500" />
                            ) : (
                              <PiBookmarksSimpleLight />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {loading && <PlaylistDetailSkeleton />}
      </div>
      <ToastContainer />

      {/* Image Modal */}
      {/* {selectedImage && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                <img
                  src={selectedImage}
                  className="max-w-5xl md:h-96 object-contain w-11/12"
                  alt="Preview"
                />
                <IoClose
                  onClick={handleCloseModal}
                  className="absolute top-6 right-6 text-white text-2xl cursor-pointer"
                />
              </div>
            )} */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          {/* Modal Container */}
          <div className="relative max-w-6xl w-full flex items-center justify-center">
            {/* Image */}
            <img
              src={selectedImage}
              alt="Preview"
              className="
          max-h-[80vh]
          w-auto
          rounded-2xl
          shadow-2xl
          border border-gray-700
          object-contain
          transition-transform duration-300
         
        "
            />

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="
          absolute
          md:-top-4
          md:-right-4
          -top-3
          -right-3
          md:w-10
          md:h-10
          h-8
          w-8
          flex
          items-center
          justify-center
          rounded-full
          bg-gray-900
          border border-gray-700
          text-white
          shadow-lg
          md:hover:bg-red-500
          transition-all
        "
            >
              <IoClose className="text-sm" />
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default ViewTutorPlaylist;

  // //Contributors section
  // <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-4 space-y-3">

  //   <div className="flex items-center justify-between">

  //     <h2 className="text-sm text-gray-300 font-semibold flex items-center gap-1">
  //       Contributors
  //     </h2>

  //     <button
  //       onClick={() => setShowContributors(!showContributors)}
  //       className="text-gray-400 hover:text-white transition"
  //     >
  //       {showContributors ? (
  //         <IoMdArrowDropup className="text-xl" />
  //       ) : (
  //         <MdArrowDropDown className="text-xl" />
  //       )}
  //     </button>

  //   </div>

  //   {/* Avatar Stack */}
  //   {!showContributors && (
  //     <div
  //       className="flex -space-x-3 cursor-pointer"
  //       onClick={() => setShowContributors(true)}
  //     >
  //       <img
  //         src={
  //           playlistData.profile
  //             ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.profile}`
  //             : user
  //         }
  //         className="w-8 h-8 rounded-full border-2 border-teal-500 object-cover bg-white"
  //       />

  //       {playlistData?.collaborators?.map((collab) => (
  //         <img
  //           key={collab._id}
  //           src={
  //             collab.profile
  //               ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collab.profile}`
  //               : user
  //           }
  //           className="w-8 h-8 rounded-full border-2 border-teal-500 object-cover bg-white"
  //         />
  //       ))}
  //     </div>
  //   )}

  //   {/* Contributor List */}
  //   {showContributors && (
  //     <div className="space-y-2">

  //       <Link
  //         to={`/viewProfile/${playlistData.email}`}
  //         className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition"
  //       >
  //         <img
  //           src={
  //             playlistData.profile
  //               ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.profile}`
  //               : user
  //           }
  //           className="w-8 h-8 rounded-full object-cover border border-teal-400 bg-white"
  //         />
  //         <span className="text-sm text-gray-200">
  //           {playlistData.name} <span className="text-gray-400">(Author)</span>
  //         </span>
  //       </Link>

  //       {playlistData?.collaborators?.map((data) => (
  //         <Link
  //           key={data._id}
  //           to={`/viewProfile/${data.email}`}
  //           className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition"
  //         >
  //           <img
  //             src={
  //               data.profile
  //                 ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
  //                 : user
  //             }
  //             className="w-8 h-8 rounded-full object-cover border border-teal-400 bg-white"
  //           />
  //           <span className="text-sm text-gray-300">{data.name}</span>
  //         </Link>
  //       ))}

  //     </div>
  //   )}

  // </div>