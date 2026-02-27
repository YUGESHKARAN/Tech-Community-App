import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../instances/Axiosinstances";

function useTutoPlaylistByEmail() {

  const email = localStorage.getItem("email");
  const [tutorPlayListByEmail, setTutorPlayListByEmail] = useState([]);
  const [playlistCountByEmail, setPlaylistCountByEmail] = useState(0);
  const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
  
    const isFetching = useRef(false);
    const limit = 40;  

    // `blog/playlist/coordinator/${email}
  // const getTutorPlayListByEmail = useCallback(async () => {
  //   try {
  //     const response = await axiosInstance.get(`blog/playlist/coordinator/${email}`);

  //     if (response.status === 200 || response.status === 204) {
  //       setTutorPlayListByEmail(response.data.data || []);
  //     }
  //   } catch (err) {
  //     console.error("error", err.message);
  //   }
  // }, []);

    const getTutorPlayListByEmail = useCallback(async () => {
      if (!hasMore || isFetching.current) return;
  
      isFetching.current = true;
      setLoading(true);
  
      try {
        const response = await axiosInstance.get(
          `blog/playlist/coordinator/${email}?page=${page}&limit=${limit}`
        );
  
        if (response.status === 200 || response.status === 204) {
          const newPlaylists = response.data.data;

  
          if (!newPlaylists || newPlaylists.length === 0) {
            setHasMore(false);
            return;
          }
          setPlaylistCountByEmail(response.data.count);
  
          // 🔥 Deduplicate by _id (IMPORTANT)
          setTutorPlayListByEmail(prev => {
            const existingIds = new Set(prev.map(p => p._id));
            const filtered = newPlaylists.filter(
              p => !existingIds.has(p._id)
            );
            return [...prev, ...filtered];
          });
  
        
        }
      } catch (err) {
        console.error("error", err.message);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    }, [page, hasMore]);

  // ✅ Hook must be at top level
  useEffect(() => {
    getTutorPlayListByEmail();
  }, [getTutorPlayListByEmail]);

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

  // console.log("playlistby email count ", playlistCountByEmail);
  return { tutorPlayListByEmail, setTutorPlayListByEmail, getTutorPlayListByEmail, loading, hasMore, playlistCountByEmail };
}

export default useTutoPlaylistByEmail;
