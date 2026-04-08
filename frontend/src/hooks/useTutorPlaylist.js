import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../instances/Axiosinstances";
import { getItem } from "../utils/encode";

// function useTutorPlaylist() {
//   const [tutorPlayList, setTutorPlayList] = useState([]);
//   const [playlistCount, setPlaylistCount] = useState(0);

//   const getTutorPlayList = useCallback(async () => {
//     try {
//       const response = await axiosInstance.get("blog/playlist/all");

//       if (response.status === 200) {
//         setTutorPlayList(response.data.data);
//         setPlaylistCount(response.data.count);

//       }
//     } catch (err) {
//       console.error("error", err.message);
//     }
//   }, []);

//   // ✅ Hook must be at top level
//   useEffect(() => {
//     getTutorPlayList();
//   }, [getTutorPlayList]);

//   return { tutorPlayList, getTutorPlayList, playlistCount };
// }

function useTutorPlaylist() {
  const [tutorPlayList, setTutorPlayList] = useState([]);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  // const email = localStorage.getItem("email");
  const email = getItem("email");

  const isFetching = useRef(false);
  const limit = 40;

  // console.log("pl email", email)

  const getTutorPlayList = useCallback(async () => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/blog/playlist/recommended/${email}?page=${page}&limit=${limit}`
      );

      if (response.status === 200) {
        const newPlaylists = response.data.data;

        if (!newPlaylists || newPlaylists.length === 0) {
          setHasMore(false);
          return;
        }

        // 🔥 Deduplicate by _id (IMPORTANT)
        setTutorPlayList(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const filtered = newPlaylists.filter(
            p => !existingIds.has(p._id)
          );
          return [...prev, ...filtered];
        });

        setPlaylistCount(response.data.count);
      }
    } catch (err) {
      console.error("error", err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [page, hasMore]);

  // fetch when page changes
  useEffect(() => {
    getTutorPlayList();
  }, [getTutorPlayList]);

  // scroll listener
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

  return {
    tutorPlayList,
    playlistCount,
    loading,
    hasMore
  };
}

export default useTutorPlaylist;
