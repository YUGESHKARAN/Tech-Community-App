import React, { useEffect, useMemo, useState } from "react";
import useTutorPlaylist from "../hooks/useTutorPlaylist";
import NavBar from "../ui/NavBar";
import { BsPersonWorkspace } from "react-icons/bs";
import YourPlaylistCard from "../components/YourPlaylistCard";
import useTutoPlaylistByEmail from "../hooks/useTutorPlaylistByEmail";
import TutorPlaylistGridSkeleton from "../components/loaders/TutorPlaylistGridSkeleton";
import { Link } from "react-router-dom";
import Footer from "../ui/Footer";
import { IoSearchOutline } from "react-icons/io5";
import Fuse from "fuse.js";

const YourPlaylist = () => {
  const {
    tutorPlayListByEmail,
    setTutorPlayListByEmail,
    getTutorPlayListByEmail,
    loading,
    hasMore,
  } = useTutoPlaylistByEmail();

  const [playlistCategory, setPlaylistCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("") ;
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
  return new Fuse(tutorPlayListByEmail, {
    keys: [
      "title",
      "domain"
    ],
    threshold: 0.3, // lower = stricter search
  });
}, [tutorPlayListByEmail]);

  const filteredPlaylist = useMemo(()=>{

    let filtered = [...tutorPlayListByEmail]
   

    // if(query.trim()!="")
    // {   
    //   const query = searchTerm.toLowerCase()
    //     filtered = filtered.filter(
    //     (playlist)=>
          
    //       playlist.title?.toLowerCase().includes(query) ||
    //       playlist.domain?.toLowerCase().includes(query) ||
    //       playlist.name?.toLowerCase().includes(query) ||
    //       playlist.email?.toLowerCase().includes(query),
    //     )
    // }

     if (debouncedSearch.trim() !== "") {
    filtered = fuse.search(debouncedSearch).map((r) => r.item);
  }

    if(playlistCategory.trim()!== ""){
      filtered = filtered.filter((playlist)=> playlist.domain === playlistCategory)
    }
   
    return filtered

  }, [tutorPlayListByEmail,searchTerm, playlistCategory, debouncedSearch ])

   const getUniqueCategories = (tutorPlayList) => {
    return [...new Set(tutorPlayList.map((playlist) => playlist.domain))];
  };

  //   console.log("tutorPlayListByEmail", tutorPlayListByEmail);
    // console.log("filteredPlaylist", filteredPlaylist);
  return (
    <div className="w-full min-h-screen bg-gray-900 h-auto reltive  ">
      <NavBar />

      <h1 className=" text-2xl w-full px-4 flex items-center gap-2 mt-4 mx-auto md:text-3xl font-semibold text-white tracking-wide">
        <BsPersonWorkspace />
        <span className="group text-white"> My Tutor Playlist</span>{" "}
      </h1>

       {/* ================= SEARCH ================= */}
            <div className="flex  px-3 mx-auto w-full md:mx-0 justify-center mt-7">
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
          
        {tutorPlayListByEmail.length > 0 && (
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
            {getUniqueCategories(tutorPlayListByEmail).map((data, index) => (
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
      )}
      
      <div className="min-h-screen w-full px-3 md:px-4 mt-4 mx-auto bg-gray-900 pb-8">
        {filteredPlaylist.length > 0 && (
          <div
            className="
              pb-4 gap-5 md:gap-6
              grid grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
              overflow-visible
              space-y-5
              md:space-y-0
              mt-7
        "
          >
            {filteredPlaylist?.map((playlist) => (
              <div key={playlist._id} className="md:min-w-[200px] min-w-0">
                <YourPlaylistCard
                  playlist={playlist}
                  onRemove={() => {
                    getTutorPlayListByEmail();
                  }}
                  onDelete={(_id) => {
                    setTutorPlayListByEmail((prev) =>
                      prev.filter((p) => p._id !== _id),
                    );
                  }}

                  setPlaylistCategory = {setPlaylistCategory}
                  debouncedSearch={debouncedSearch}
                  
                />
              </div>
            ))}
            {loading && (
              <p className="text-center py-4 col-span-full text-gray-500">
                loading...
              </p>
            )}
            {!hasMore && (
              <p className="text-center col-span-full py-4 text-gray-500">
                No more playlists
              </p>
            )}
          </div>
        )}

        {!tutorPlayListByEmail?.length > 0 && loading && (
          <TutorPlaylistGridSkeleton />
        )}
        {tutorPlayListByEmail?.length == 0 && !loading && (
          <div className="flex h-[70vh] flex-col justify-center items-center gap-5 ">
            <p className="text-gray-400 flex justify-center items-center text-center ">
              No playlists available!
            </p>
            <Link
              to="/addTutorPlaylist"
              className="text-sm  cursor-pointer hover:bg-green-700 bg-green-600 transition-all duration-400 text-white font-medium rounded-md px-4 p-2"
            >
              + Create New Playlist
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default YourPlaylist;
