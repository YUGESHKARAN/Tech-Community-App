import React, { useState, useEffect, useRef } from "react";
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

  const isFetching = useRef(false);
  const limit = 40;

// -------------------------------------------------------

  // const getBookMarkPlaylist = async () => {
  //   try {
  //     const response = await axiosInstance.get(
  //       `/blog/playlist/bookmark/${email}`
  //     );
  //     if (response.status == 200) {
  //       setBookMarPlaylist(response.data.playlists);
  //       setBookMarkIds(response.data.playlistIds);
  //       setCount(response.data.count);
  //     }
  //   } catch (err) {
  //     console.log("error", err.message);
  //   }
  // };

  // useEffect(() => {
  //   getBookMarkPlaylist();
  // }, []);


  const getBookMarkPlaylist = async () => {
  if (!hasMore || isFetching.current) return;

  isFetching.current = true;
  setLoading(true);

  try {
    const response = await axiosInstance.get(
      `/blog/playlist/bookmark/${email}?page=${page}&limit=${limit}`
    );

    if (response.status === 200) {
      const newPlaylists = response.data.playlists;

      if (!newPlaylists || newPlaylists.length === 0) {
        setHasMore(false);
        return;
      }

      // 🔥 deduplicate by _id
      setBookMarPlaylist(prev => {
        const existing = new Set(prev.map(p => p._id));
        const filtered = newPlaylists.filter(p => !existing.has(p._id));
        return [...prev, ...filtered];
      });

      setBookMarkIds(prev => [
        ...new Set([...prev, ...response.data.playlistIds])
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
}, [page ]);

useEffect(() => {
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200 &&
      !loading &&
      hasMore &&
      !isFetching.current
    ) {
      setPage(prev => prev + 1);
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

  // console.log("bookmarked playlist", bookMarPlaylist);
  // console.log("bookmarked count", count);

  return (
    <>
    {  
  bookmakIds?.length > 0 ?
    <section className={`${tutorPlayList?.filter((playlist) => bookmakIds?.includes(playlist._id))?.length> 0 ? "block" : "hidden"}`}>
          {/* <h2 className="  text-2xl md:text-4xl font-bold tracking-wide text-gray-200">
            Playlists
          </h2> */}


   
  
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
        {bookMarPlaylist?.map((playlist) => (
          <div key={playlist._id}
          //  className="min-w-[200px] sm:min-w-0"
           className="min-w-[150px] sm:min-w-0"
          >
            <BookmarkPlaylistCard
              playlist={playlist}
            
              setBookMarPlaylist = {setBookMarPlaylist}
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
    

   
       </section>
        : <p className="text-gray-400 flex justify-center items-center h-56 text-center py-4">No playlists bookmarked!</p>}
       </>
  );
};

export default TutorBookMarkPlaylist;
