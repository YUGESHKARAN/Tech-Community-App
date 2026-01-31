import React, { useState, useEffect } from "react";
import user from "../images/user.png";
import { CgPlayList } from "react-icons/cg";
import { MdEdit, MdOutlinePlaylistPlay } from "react-icons/md";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import axiosInstance from "../instances/Axiosinstances";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
const YourPlaylistCard = ({ playlist, onRemove }) => {
  const {
    title,
    domain,
    name,
    thumbnail,
    profile,
    post_ids,
    collaborators,
    _id,
  } = playlist;

  const [bookMarkId, setBookMarkId] = useState([]);
  const email = localStorage.getItem("email");

  const getBookMarkPlaylist = async () => {
    try {
      const response = await axiosInstance.get(
        `/blog/playlist/bookmark/${email}`
      );
      if (response.status == 200) {
        setBookMarkId(response.data.playlistIds);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getBookMarkPlaylist();
  }, []);

  const addBookMarkPostId = async (_id) => {
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
        { postId: _id }
      );
      if (response.status == 200) {
        {
          // const message =
          //   Array.isArray(bookMarkId) && bookMarkId.includes(_id)
          //     ? "Playlist removed from the bookmarks"
          //     : "Playlist bookmarked successfully";
          // toast.success(message);
          getBookMarkPlaylist();
          if (onRemove) {
            onRemove();
          }
        }
      }
    } catch (err) {
      console.log("error", err.message);
      toast.error("unable to bookmark");
    }
  };

  const deletePlaylist = async (e,id) => {
    e.stopPropagation();
    e.preventDefault();
     let confirmDelete = window.confirm(
        "Are you sure you want to delete this playlist?"
      );
      if (!confirmDelete) {
        return;
      }
    try {
     
      const response = await axiosInstance.delete(
        `/blog/playlist/delete/${id}`
      );
      console.log("response", response.status);
      if (response.status == 200 ) {
         
        toast.success("playlist deleted successfully");
         if (onRemove) onRemove();
        
      }
    } catch (err) {
      console.log("error", err.message);
      toast.error("unable to delete playlist");
    }
  };

  return (
    <div className="relative  w-full mt-4 max-w-sm">
      {/* STACK LAYER 3 (BACK) */}
      <div
        className="absolute bottom-2 left-3 w-[95%] h-full 
        bg-zinc-600 rounded-xl border border-zinc-700 
        shadow-md z-0"
      />

      {/* STACK LAYER 2 (MIDDLE) */}
      <div
        className="absolute bottom-1 left-1.5 w-[97%] h-full 
        bg-zinc-700 rounded-xl border border-zinc-800 
        shadow-lg z-10"
      />

      {/* MAIN CARD */}
      <div
        className="relative z-20 bg-zinc-800 rounded-xl 
        border border-zinc-900 overflow-hidden 
        shadow-xl transition-transform duration-300 hover:-translate-y-1"
      >
        {/* Thumbnail */}
        {/* <Link to={`/viewplaylist/${_id}`}> */}
        <div className="cursor-pointer relative h-24 md:h-28 bg-zinc-800">
          <Link to={`/viewplaylist/${_id}`}>
            {thumbnail ? (
              <img
                src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${thumbnail}`}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                No Thumbnail
              </div>
            )}
          </Link>
          {/* Delete Playlist */}
          <span
            onClick={(e) => {
              deletePlaylist(e,_id);
            }}
            className="absolute top-2 cursor-pointer right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded"
          >
            Del
          </span>

          {/* Playlist Badge */}
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded">
            Playlist
          </span>

          {/* Lessons count */}
          <span className="absolute bottom-2 right-2 bg-black/80 text-white flex items-center gap-0.5 text-xs px-2 py-1 rounded">
            <MdOutlinePlaylistPlay className="text-sm" /> {post_ids.length}
          </span>
        </div>
        {/* </Link> */}

        {/* Content */}
        <div className="md:p-4 p-2 space-y-1 md:space-y-3">
          <h3 className="text-white md:text-base text-sm terminate font-semibold line-clamp-1">
            {title}
          </h3>

          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-1">
              <span className="inline-block text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded">
                {domain}
              </span>
              <div
                onClick={() => {
                  addBookMarkPostId(_id);
                }}
                className="cursor-pointer"
              >
                {Array.isArray(bookMarkId) && bookMarkId.includes(_id) ? (
                  <PiBookmarksSimpleFill className="text-teal-500" />
                ) : (
                  <PiBookmarksSimpleLight className="text-teal-500" />
                )}
              </div>
              <Link to={`/editPlaylist/${_id}`}>
                <MdEdit className="text-sm text-teal-500 cursor-pointer" />
              </Link>
            </div>

            {collaborators?.length > 0 && (
              <div className="flex -space-x-2">
                <img
                  src={
                    profile
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`
                      : user
                  }
                  // alt={collab.name}
                  className="h-4 md:h-7 w-4 md:w-7 rounded-full border-2 border-teal-600 bg-white"
                />
                {collaborators.slice(0, 2).map((collab) => (
                  <img
                    key={collab._id}
                    src={
                      collab.profile
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collab.profile}`
                        : user
                    }
                    alt={collab.name}
                    className="h-4 md:h-7 w-4 md:w-7 rounded-full border-2 border-teal-600 bg-white"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default YourPlaylistCard;
