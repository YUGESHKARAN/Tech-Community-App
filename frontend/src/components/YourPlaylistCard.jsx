import React, { useState, useEffect } from "react";
import user from "../images/user.png";
import { CgPlayList } from "react-icons/cg";
import { MdDelete, MdEdit, MdOutlinePlaylistPlay } from "react-icons/md";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import axiosInstance from "../instances/Axiosinstances";
import toast from "../components/toaster/Toast"
import { Link } from "react-router-dom";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoRemoveOutline } from "react-icons/io5";
import highlightText from "../hooks/highlightText";
const YourPlaylistCard = ({ playlist, onRemove, onDelete,setPlaylistCategory, debouncedSearch }) => {
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false)

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
      if (response.status === 200) {
       setBookMarkId((prev) => {
          if (prev.includes(_id)) {
            // toast.success("bookmark removed successfully");
            return prev.filter((id) => id !== _id);
          } else {
            return [...prev, _id];
          }
        });
      }
    } catch (err) {
      console.log("error", err.message);
      // toast.error("unable to bookmark");
    }
  };

//   const deletePlaylist = async (id) => {
//   const confirmDelete = window.confirm(
//     "Are you sure you want to delete this playlist?"
//   );
//   if (!confirmDelete) return;

//   try {
//     const response = await axiosInstance.delete(
//       `/blog/playlist/delete/${id}`
//     );

//     if (response.status === 200) {
//       // toast.success("playlist deleted successfully");
//      if(onDelete) onDelete(id); // refresh list
//     }
//   } catch (err) {
//     console.log("error", err.message);
//     // toast.error("unable to delete playlist");
//   }
// };

  const deletePlaylist = async (id) => {
  setShowConfirm(true);
    setLoading(true);
  try {
    const response = await axiosInstance.delete(
      `/blog/playlist/delete/${id}`
    );

    if (response.status === 200) {
        toast.success('Deleted', 'Playlist deleted successfully')
     if(onDelete) onDelete(id); // refresh list

    }
  } catch (err) {
    console.log("error", err.message);
 
  }
  finally{
    setShowConfirm(false)
    setLoading(false)
  }
  
};

return (
    <div className="relative  w-full mt-4 max-w-sm">
      {/* STACK LAYER 3 (BACK) */}
      <div
        className="absolute bottom-2 left-3 w-[95%] h-full 
        bg-zinc-600 rounded-xl border border-zinc-700 
         z-0"
      />

      {/* STACK LAYER 2 (MIDDLE) */}
      <div
        className="absolute bottom-1 left-1.5 w-[97%] h-full 
        bg-zinc-700 rounded-xl border border-zinc-800 
         z-10"
      />

      {/* MAIN CARD */}
      <div
        className="relative z-20 bg-gray-900 rounded-xl 
        border border-zinc-900 overflow-hidden 
         transition-transform duration-300 hover:-translate-y-1"
      >
        {/* Thumbnail */}
        {/* <Link to={`/viewplaylist/${_id}`}> */}
        <div className="cursor-pointer rounded-xl relative h-48 md:h-44 bg-zinc-800">
          <Link to={`/viewplaylist/${_id}`}>
            {thumbnail ? (
              <img
                src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${thumbnail}`}
                alt={title}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                No Thumbnail
              </div>
            )}
          </Link>
          {/* Delete Playlist */}
          <span
            onClick={() => {
              // deletePlaylist(_id);
               setShowConfirm(true);
            }}
            // className="absolute top-2 cursor-pointer right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded"
            className="absolute top-3 cursor-pointer right-3   md:text-xl  text-2xl font-medium  rounded"
          >
            {/* Del */}
            <IoRemoveOutline  className="bg-red-500 rounded-full text-white" />
          </span>

          {/* Playlist Badge */}
          <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded">
            Playlist
            {/* {domain} */}
          </span>

          {/* Lessons count */}
          <span className="absolute bottom-2 right-2 bg-black/80 text-white flex items-center gap-0.5 text-xs px-2 py-1 rounded">
            <MdOutlinePlaylistPlay className="text-sm" /> {post_ids.length}
          </span>
        </div>
        {/* </Link> */}

        {/* Content */}
        <div className="space-y-2 mt-2 md:mt-4 px-2 ">
          <h3 className="text-base md:text-sm text-slate-200 terminate font-medium line-clamp-1">
            {/* {title} */}
             {highlightText(title, debouncedSearch)}
          </h3>

          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-3">
              {/* <span className="inline-block text-xs md:text-xs bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-lg">
                {domain}
              </span> */}

              <div className="flex -space-x-2">
                              
                              {collaborators.length>0 && collaborators.slice(0, 3).map((collab) => (
                                <img
                                  key={collab._id}
                                  src={
                                    collab.profile
                                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collab.profile}`
                                      : user
                                  }
                                  alt={collab.name}
                                  className="h-6 w-6 rounded-full border-2 border-teal-600 bg-white"
                                />
                              ))}
                              <img
                                src={
                                  profile
                                    ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`
                                    : user
                                }
                                // alt={collab.name}
                                className="h-6 w-6 rounded-full border-2 border-teal-600 bg-white"
                              />
                            </div>
              <div
                onClick={() => {
                  addBookMarkPostId(_id);
                }}
                className="cursor-pointer"
              >
                {Array.isArray(bookMarkId) && bookMarkId.includes(_id) ? (
                  <PiBookmarksSimpleFill className="text-teal-500 text-base cursor-pointer" />
                ) : (
                  <PiBookmarksSimpleLight className="text-teal-500 text-base cursor-pointer" />
                )}
              </div>
              <Link to={`/editPlaylist/${_id}`}>
                <MdEdit className="text-sm text-teal-500 cursor-pointer" />
              </Link>
            </div>

            <span 
            onClick={()=>{setPlaylistCategory(domain)}}
            className="inline-block text-[10px] md:text-xs cursor-pointer  bg-emerald-600/20 text-emerald-400 px-2 py-1  rounded">
                {/* {domain} */}
                {highlightText(domain, debouncedSearch)}
             
              </span>

            {/* <div className="flex -space-x-2">
                
                {collaborators.length>0 && collaborators.slice(0, 3).map((collab) => (
                  <img
                    key={collab._id}
                    src={
                      collab.profile
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collab.profile}`
                        : user
                    }
                    alt={collab.name}
                    className="h-6 w-6 rounded-full border-2 border-teal-600 bg-white"
                  />
                ))}
                  <img
                  src={
                    profile
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`
                      : user
                  }
                  // alt={collab.name}
                  className="h-6 w-6 rounded-full border-2 border-teal-600 bg-white"
                />
              </div> */}
          </div>
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
              Are you sure you want to delete this playlist?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={()=> {deletePlaylist(_id)}}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                disabled={loading}
              >
                {loading ? "Deleting.." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default YourPlaylistCard;
