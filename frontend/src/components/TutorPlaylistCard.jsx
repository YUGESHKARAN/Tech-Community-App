import React, { useState, useEffect } from "react";
import user from "../images/user.png";
import { CgPlayList } from "react-icons/cg";
import { MdOutlinePlaylistPlay } from "react-icons/md";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import axiosInstance from "../instances/Axiosinstances";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
const TutorPlaylistCard = ({ playlist }) => {
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
    // e.preventDefault()
    // console.log("bookmark id", bookMarkId)
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
        { postId:_id }
      );
      if (response.status == 200) {
        {
          bookMarkId.includes(_id)
            ? toast.success("Playlist removed from the bookmarks")
            : toast.success("Playlist bookmarked successfully");
        }
        getBookMarkPlaylist();
      }
    } catch (err) {
      console.log("error", err.message);
      toast.error("unable to bookmark");
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
        <Link to={`/viewplaylist/${_id}`}>
        <div className="cursor-pointer relative h-24 md:h-28 bg-zinc-800">
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

          {/* Playlist Badge */}
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded">
            Playlist
          </span>

          {/* Lessons count */}
          <span className="absolute bottom-2 right-2 bg-black/80 text-white flex items-center gap-0.5 text-xs px-2 py-1 rounded">
            <MdOutlinePlaylistPlay className="text-sm" /> {post_ids.length}
          </span>
        </div>
        </Link>

        {/* Content */}
        <div className="md:p-4 p-2 space-y-1 md:space-y-3">
          <h3 className="text-white md:text-base text-sm terminate font-semibold line-clamp-1">
            {title}
          </h3>

          <div className="flex items-center justify-between ">
            {/* <div className="flex items-center gap-2">
              <img
                src={
                  profile
                    ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`
                    : user
                }
                alt={name}
                className="h-8 w-8 rounded-full object-cover bg-white"
              />
              <span className="text-sm text-zinc-300">{name}</span>
            </div> */}
            <div className="flex items-center gap-1">
              <span className="inline-block text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded">
                {domain}
              </span>
              <div
                onClick={() => {
                  addBookMarkPostId(_id);
                }}
              >
                {Array.isArray(bookMarkId) && bookMarkId.includes(_id) ? (
                  <PiBookmarksSimpleFill className="text-teal-500" />
                ) : (
                  <PiBookmarksSimpleLight className="text-teal-500"/>
                )}
              </div>
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
                {collaborators.slice(0, 3).map((collab) => (
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
      
    </div>
  );
};

export default TutorPlaylistCard;
