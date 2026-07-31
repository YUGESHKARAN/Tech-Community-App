import React, { useState, useEffect, useContext } from "react";
import { MdHistory } from "react-icons/md";
import useGetRecentHistory from "../hooks/useGetRecentHistory";
import { getItem } from "../utils/encode";
import logNotFound from "../assets/log_not_found.png";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { IoIosSearch } from "react-icons/io";
import { GlobalStateContext } from "../GlobalStateContext";
import { useNavigate } from "react-router-dom";

function RecentVisit({ parentClass = "", titleClass = "", childClass = "" }) {

  const userEmail = getItem("email");
  const navigate = useNavigate();

   const { searchTerm, setSearchTerm, inputValue, setInputValue } =
      useContext(GlobalStateContext);
  
  const { recentPosts, recentPlaylists, histroyLoader } =
    useGetRecentHistory(userEmail);

     const handlePostClick = (post) => {
    setSearchTerm("");
    setInputValue("");
    navigate(`/viewpage/${post.authorEmail}/${post._id}`);
    setOpen(false);
  };

  const handlePlaylistClick = (playlist) => {
    setSearchTerm("");
    setInputValue("");

    navigate(`/viewplaylist/${playlist._id}`);
    setOpen(false);
  };
  
  return (
    <div
      // className='flex flex-col   border-t border-neutral-700   pt-3 min-h-0'

      className={twMerge(
        clsx(
          `
      flex flex-col   border-t border-neutral-700   pt-3 min-h-0
          `,
          parentClass,
        ),
      )}
    >
      <p
        //   className="text-gray-400 py-1 font-medium flex items-center gap-1 text-xs px-4 "
        className={twMerge(
          clsx(
            `
      text-gray-400 py-1 font-medium flex items-center gap-1 text-xs px-4 
          `,
            titleClass,
          ),
        )}
      >
        Recent Visits <MdHistory className="text-xs text-gray-500" />
      </p>
      <div
        // className="overflow-y-auto pb-4 overflow-x-hidden scrollbar-hide"
        className={twMerge(
          clsx(
            `
      overflow-y-auto pb-4 overflow-x-hidden scrollbar-hide"
          `,
            childClass,
          ),
        )}
      >
        {!histroyLoader &&
          (recentPosts.length > 0 || recentPlaylists?.length > 0) && (
            <>
              {/* Post suggestions */}
              {recentPosts.length > 0 && (
                <div>
                  <p className="px-4 pt-2  text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                    Posts
                  </p>
                  <div className="w-full flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide">
                    {recentPosts.map((post) => (
                      <button
                        key={post._id}
                        onClick={() => handlePostClick(post)}
                        className="
                                    w-full flex items-center gap-2 px-4 py-2.5
                                    hover:bg-white/5 transition-colors duration-150
                                    text-left group
                                  "
                      >
                        {/* thumbnail */}
                        <div className="w-7 h-7 rounded-md bg-gray-800 shrink-0 overflow-hidden">
                          {post.image ? (
                            <img
                              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${post.image}`}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IoIosSearch className="text-gray-600 text-sm" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 items-center min-w-0">
                          <p className="text-xs text-white truncate  transition-colors">
                            {post.title}
                            {/* {highlightText(post.title, searchTerm)} */}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {post.category} · {post.authorName}
                          </p>
                        </div>

                        <span className="text-[10px] text-emerald-400 shrink-0 bg-gray-900 border border-neutral-800 px-2 py-0.5 rounded-full">
                          post
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Playlist suggestions */}
              {recentPlaylists.length > 0 && (
                <div>
                  <p className="px-4 pt-2  text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                    Playlists
                  </p>
                  <div className="w-full flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide">
                    {recentPlaylists.map((playlist) => (
                      <button
                        key={playlist._id}
                        onClick={() => handlePlaylistClick(playlist)}
                        className="
                                    w-full flex items-center gap-2 px-4 py-2.5
                                    hover:bg-white/5 transition-colors duration-150
                                    text-left group
                                  "
                      >
                        {/* thumbnail */}
                        <div className="w-7 h-7 rounded-md bg-gray-800 shrink-0 overflow-hidden">
                          {playlist.thumbnail ? (
                            <img
                              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlist.thumbnail}`}
                              alt={playlist.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IoIosSearch className="text-gray-600 text-sm" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 items-center min-w-0">
                          <p className="text-xs text-white truncate  transition-colors">
                            {playlist.title}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {playlist.domain} · {playlist.name}
                          </p>
                        </div>

                        <span className="text-[10px] text-emerald-400 shrink-0 bg-gray-900 border border-neutral-800 px-2 py-0.5 rounded-full">
                          playlist
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        {histroyLoader && (
          <div className="w-full items-center h-40 flex justify-center">
            <div className="relative flex items-center justify-center">
              {/* Outer Oval Ring */}
              <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

              {/* Inner Glow Pulse */}
              {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
            </div>
          </div>
        )}

        {!histroyLoader &&
          recentPlaylists.length === 0 &&
          recentPosts.length === 0 && (
            <div className="px-4 py-4 text-sm h-52 flex items-center justify-center text-gray-500 text-center">
              <div className="flex gap-0 flex-col ">
                <img
                  src={logNotFound}
                  alt=""
                  className=" object-cover mx-auto  w-32 h-32"
                />
                <p className="text-center text-gray-500 text-sm mt-0">
                  {" "}
                  No recent visits !
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default RecentVisit;
