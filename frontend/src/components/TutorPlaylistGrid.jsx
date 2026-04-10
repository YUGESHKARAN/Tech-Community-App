import React, { useEffect, useMemo, useState } from "react";
import TutorPlaylistCard from "./TutorPlaylistCard";
import useTutorPlaylist from "../hooks/useTutorPlaylist";
import { IoSearchOutline } from "react-icons/io5";
import Fuse from "fuse.js";
import TutorPlaylist from "../Pages/TutorPlaylist";
import TutorPlaylistGridSkeleton from "./loaders/TutorPlaylistGridSkeleton";
import PillLoader from "./loaders/PillSkeleton";

const TutorPlaylistGrid = () => {
  const { tutorPlayList, playlistCount, loading, hasMore } = useTutorPlaylist();
  const [playlistCategory, setPlaylistCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fuse = useMemo(() => {
    return new Fuse(tutorPlayList, {
      keys: ["title", "domain", "name", "email"],
      threshold: 0.3, // lower = stricter search
    });
  }, [tutorPlayList]);

  const filteredPlaylist = useMemo(() => {
    let filtered = [...tutorPlayList];

    // if (searchTerm.trim() !== "") {
    //   const query = searchTerm.toLowerCase();
    //   filtered = filtered.filter(
    //     (playlist) =>
    //       playlist.title?.toLowerCase().includes(query) ||
    //       playlist.domain?.toLowerCase().includes(query) ||
    //       playlist.name?.toLowerCase().includes(query) ||
    //       playlist.email?.toLowerCase().includes(query),
    //   );
    // }

    if (debouncedSearch.trim() !== "") {
      filtered = fuse.search(debouncedSearch).map((r) => r.item);
    }

    if (playlistCategory !== "") {
      filtered = filtered.filter(
        (playlist) => playlist.domain === playlistCategory,
      );
    }

    return filtered;
  }, [tutorPlayList, searchTerm, playlistCategory, debouncedSearch]);

  const getUniqueCategories = (tutorPlayList) => {
    return [...new Set(tutorPlayList.map((playlist) => playlist.domain))];
  };

  // console.log("playlist", tutorPlayList)
  // console.log("filteredPlaylist", filteredPlaylist);
  return (
    <>
      {/* ================= SEARCH ================= */}
      <div className="flex  w-full md:mx-0 justify-center mt-7">
        <div className="w-full mx-auto max-w-md flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
          <IoSearchOutline className="text-xl text-gray-400" />
          <input
            type="text"
            placeholder="Search playlists, topics, or domains"
            value={searchTerm}
            // onChange={handleSearch}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-400"
          />
        </div>
      </div>

      {loading && !tutorPlayList.length > 0 && <PillLoader />}

     

      {tutorPlayList.length > 0 && (
         <>
        <div
          className={`w-full sticky top-0 z-40
                ${isStickyActive ? "bg-gray-900 " : "bg-transparent"}`}
        >
          <div
            // className="flex md:max-w-5xl md:w-fit mt-10 scrollbar-hide mx-auto items-center justify-start gap-3 mb-5 overflow-x-auto"
            className="flex w-full  md:w-fit md:max-w-7xl  mt-2 py-5 z-50 scrollbar-hide mx-auto items-center justify-start gap-3 md:mb-5 overflow-x-auto"
          >
            {/* All Button */}
            <div
              onClick={() => setPlaylistCategory("")}
              className={`w-fit text-nowrap cursor-pointer rounded-md  text-xs px-3 py-1.5 md:py-2 transition-all duration-200 ${
                playlistCategory === ""
                  ? "bg-emerald-600/20 text-emerald-400"
                  : "bg-gray-800 text-white"
              }`}
            >
              All
            </div>

            {/* Dynamic Categories */}
            {getUniqueCategories(tutorPlayList).map((data, index) => (
              <div
                key={index}
                onClick={() => setPlaylistCategory(data)}
                className={`w-fit text-nowrap cursor-pointer rounded-md  text-xs px-3 py-1.5 md:py-2 transition-all duration-200 ${
                  playlistCategory === data
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "bg-gray-800 text-white"
                }`}
              >
                {data}
              </div>
            ))}
          </div>
        </div>

         <div
          // className="
          //   flex gap-6 overflow-x-auto pb-4
          //   sm:grid sm:grid-cols-2
          //   lg:grid-cols-3
          //   xl:grid-cols-5
          //   sm:overflow-visible
          // "
          className="
     pb-4 gap-5 md:gap-6
    grid grid-cols-1
    md:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-4
    3xl:grid-cols-5
    overflow-visible
    space-y-5
    md:space-y-0
    mt-7
  "
        >
          {filteredPlaylist?.map((playlist) => (
            <div
              key={playlist._id}
              // className="min-w-[200px]  sm:min-w-0 "
              className="min-w-[150px]  sm:min-w-0 "
            >
              <TutorPlaylistCard
                playlist={playlist}
                setPlaylistCategory={setPlaylistCategory}
                debouncedSearch={debouncedSearch}
              />
            </div>
          ))}

          {loading && tutorPlayList?.length > 0 && (
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
              No more playlists
            </p>
          )}

          
        </div>

        </>
      )}

     
      {
        tutorPlayList?.length===0 && !loading && <p className="text-gray-400 flex justify-center items-center h-56 text-center py-4">
          No playlists available!
        </p>
      }
      {  tutorPlayList.length===0 && loading && <TutorPlaylistGridSkeleton />}
    </>
  );
};

export default TutorPlaylistGrid;
