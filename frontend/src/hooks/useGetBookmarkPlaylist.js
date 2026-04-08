
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../instances/Axiosinstances";

const useGetBookmarkPlaylist = (email) => {

      const [bookMarPlaylist, setBookMarPlaylist] = useState([]);
      const [bookmakIds, setBookMarkIds] = useState([]);
      const [count, setCount] = useState(1);
    //   const email = localStorage.getItem("email");
      // console.log("playlist", tutorPlayList);
      const [page, setPage] = useState(1);
      const [hasMore, setHasMore] = useState(true);
      const [loading, setLoading] = useState(false);
      const isFetching = useRef(false);
      const limit = 40;

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

    
    return {bookMarPlaylist, loading, hasMore, bookmakIds, setBookMarPlaylist}
}

export default useGetBookmarkPlaylist;