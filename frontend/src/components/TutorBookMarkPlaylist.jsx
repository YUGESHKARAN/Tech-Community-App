import React, { useState, useEffect, useRef, useMemo } from "react";
import TutorPlaylistCard from "./TutorPlaylistCard";
import useTutorPlaylist from "../hooks/useTutorPlaylist";
import { Link } from "react-router-dom";
import BookmarkPlaylistCard from "./BookmarkPlaylistCard";
import axiosInstance from "../instances/Axiosinstances";

const TutorBookMarkPlaylist = () => {
  const { tutorPlayList } = useTutorPlaylist();
  const [bookMarPlaylist, setBookMarPlaylist] = useState([]);
  const [bookmakIds, setBookMarkIds] = useState([]);
  const [count, setCount] = useState(1);
  const email = localStorage.getItem("email");
  // console.log("playlist", tutorPlayList);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playlistCategory, setPlaylistCategory] = useState("");

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

  const isFetching = useRef(false);
  const limit = 40;

  // -------------------------------------------------------

  const getBookMarkPlaylist = async () => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/blog/playlist/bookmark/${email}?page=${page}&limit=${limit}`,
      );

      if (response.status === 200) {
        const newPlaylists = response.data.playlists;

        if (!newPlaylists || newPlaylists.length === 0) {
          setHasMore(false);
          return;
        }

        // 🔥 deduplicate by _id
        setBookMarPlaylist((prev) => {
          const existing = new Set(prev.map((p) => p._id));
          const filtered = newPlaylists.filter((p) => !existing.has(p._id));
          return [...prev, ...filtered];
        });

        setBookMarkIds((prev) => [
          ...new Set([...prev, ...response.data.playlistIds]),
        ]);

        setCount(response.data.count);
      }
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    getBookMarkPlaylist();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading &&
        hasMore &&
        !isFetching.current
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    setBookMarPlaylist([]);
    setBookMarkIds([]);
    setPage(1);
    setHasMore(true);
  }, [email]);
  // ----------------------------------------------

  const getUniqueCategories = (tutorPlayList) => {
    return [...new Set(tutorPlayList.map((playlist) => playlist.domain))];
  };

  const filteredBookmarkPlaylist = useMemo(() => {
    let filtered = [...bookMarPlaylist];

    if (playlistCategory !== "") {
      filtered = filtered.filter(
        (playlist) => playlist.domain === playlistCategory,
      );
    }

    return filtered;
  }, [bookMarPlaylist, playlistCategory]);

  // console.log("bookmarked playlist", bookMarPlaylist);
  // console.log("bookmarked count", count);

  return (
    <>
      {bookmakIds?.length > 0 ? (
        <section
          className={`${tutorPlayList?.filter((playlist) => bookmakIds?.includes(playlist._id))?.length > 0 ? "block" : "hidden"}`}
        >
          {/* <h2 className="  text-2xl md:text-4xl font-bold tracking-wide text-gray-200">
            Playlists
          </h2> */}

          {bookMarPlaylist.length > 0 && (
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
                {getUniqueCategories(bookMarPlaylist).map((data, index) => (
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

          <div
            //     className="
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
    2xl:grid-cols-5
    overflow-visible
    space-y-5
    md:space-y-0
    mt-3
  "
          >
            {/* {tutorPlayList
        ?.filter((playlist) => bookmakIds.includes(playlist._id))
        .map((playlist) => (
          <div key={playlist._id}
          //  className="min-w-[200px] sm:min-w-0"
           className="min-w-[150px] sm:min-w-0"
          >
            <BookmarkPlaylistCard
              playlist={playlist}
              onRemove={() => {
                getBookMarkPlaylist();
              }}
            />
          </div>
        ))} */}
            {filteredBookmarkPlaylist?.map((playlist) => (
              <div
                key={playlist._id}
                //  className="min-w-[200px] sm:min-w-0"
                className="min-w-[150px] sm:min-w-0"
              >
                <BookmarkPlaylistCard
                  playlist={playlist}
                  setBookMarPlaylist={setBookMarPlaylist}
                />
              </div>
            ))}
            {loading && (
              <div className="col-span-full flex justify-center ">
                <div className="relative flex items-center justify-center">
                  {/* Outer Oval Ring */}
                  <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                  {/* Inner Glow Pulse */}
                  {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                </div>
              </div>
            )}
            {!hasMore && (
              <p className="text-center col-span-full py-4 text-gray-500">
                No more playlists
              </p>
            )}
          </div>
        </section>
      ) : (
        <p className="text-gray-400 flex justify-center items-center h-56 text-center py-4">
          No playlists bookmarked!
        </p>
      )}
    </>
  );
};

export default TutorBookMarkPlaylist;
