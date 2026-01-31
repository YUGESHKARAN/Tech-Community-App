import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../instances/Axiosinstances";
import NavBar from "../ui/NavBar";
import user from "../images/user.png";
import blog1 from "../images/img_not_found.png";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import { IoShareSocial } from "react-icons/io5";
import { MdArrowDropDown } from "react-icons/md";
import { IoMdArrowDropup } from "react-icons/io";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
function ViewTutorPlaylist() {
  const email = localStorage.getItem("email");
  const { playlistId } = useParams();
  const [playlistData, setPlaylistData] = useState({});
  const [playlistPosts, setPlaylistPosts] = useState([]);
  const [showContributors, setShowContributors] = useState(false);
  // console.log("playlist Id", playlistId);

  const getTutorPlaylist = async () => {
    try {
      const response = await axiosInstance.get(`/blog/playlist/${playlistId}`);
      if (response.status === 200) {
        setPlaylistData(response.data.data);
        setPlaylistPosts(response.data.posts);
      }
    } catch (err) {
      console.log("error", err.message);
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
        `/blog/playlist/bookmark/${email}`
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
        `/blog/posts/getBookmarkPosts/${email}`
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

  const addBookMarkPostId = async (_id) => {
    // e.preventDefault()
    console.log("bookmark id", playlistbookMarkId);
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
        { postId: _id }
      );
      if (response.status == 200) {
        {
          playlistbookMarkId.includes(_id)
            ? toast.success("bookmark removed successfully")
            : toast.success("post bookmarked successfully");
        }
        getBookMarkPlaylist();
        getBookMarkPosts();
        // getTutorPlaylist();
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
      await axiosInstance.put(`/blog/posts/likes/${authorEmail}/${postId}`, {
        emailAuthor: email,
      });

      getTutorPlaylist();
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid w-full md:w-11/12 mx-auto md:h-screen grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL (Banner + Info) */}
          <div className="lg:col-span-1 p-2 md:p-0 space-y-4">
            {/* Banner */}
            <div className="relative rounded-xl overflow-hidden border border-gray-700">
              <img
                src={
                  playlistData.thumbnail
                    ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.thumbnail}`
                    : blog1
                }
                alt="Playlist Banner"
                className="w-full h-72 md:h-96 object-cover"
              />
            </div>

            {/* Playlist Info */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold">{playlistData.title}</h1>
              <div className="flex relative justify-between items-center ">
                {/* left content */}
                <div className="flex flex-col items-start gap-2">
                  {/* Author */}
                  {/* <p className="text-sm flex items-center gap-1 text-gray-400">
                    <img
                      src={
                        playlistData.profile
                          ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlistData.profile}`
                          : user
                      }
                      className="rounded-full w-6 h-6 object-cover"
                      alt=""
                    />
                    by {playlistData.name}
                  </p> */}

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
                        addBookMarkPostId(playlistData._id);
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

          {/* RIGHT PANEL (Playlist Posts) */} 
          <div className="lg:col-span-1 md:overflow-y-scroll mt-4 md:mt-0 scrollbar-hide space-y-4">
            {playlistPosts.map((post, index) => (
              <div
                key={post._id}
                className="flex gap-4 md:p-2 p-2 md:bg-white/5 rounded-lg hover:bg-white/10 transition"
              >
                {/* Video Thumbnail */}
                <Link
                  // to={`/viewpage/playlist/${playlistData.email}/${post._id}`}
                  to={`/viewpage/${playlistData.email}/${post._id}`}
                  onClick={() => postViews(playlistData.email, post._id)}
                  className="relative w-32 h-20 md:min-w-0 md:h-24 rounded-sm overflow-hidden"
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
                <div className="flex flex-col w-full md:w-11/12 justify-between">
                  <h3 className="text-sm font-medium line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="md:text-sm text-xs text-gray-300 line-clamp-1 md:line-clamp-2">
                    {post.description?.slice(0, 50)}...
                  </p>

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
      </div>
      <ToastContainer />
    </div>
  );
}

export default ViewTutorPlaylist;
