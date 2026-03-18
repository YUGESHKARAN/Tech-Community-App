
import { useState, useRef, useEffect } from "react";
import axiosInstance from "../instances/Axiosinstances";

const useGetPostsByCategory = (email, domain) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
//   const [limit] = useState(10);
const limit = 30
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const encodedCategory = encodeURIComponent(domain);

  const isFetching = useRef(false);

  // 🔥 Main API Call
  const getPostByCategory = async () => {
    if (!domain){
     setPosts([])
    }
    if (!hasMore || isFetching.current || !domain) return;

    isFetching.current = true;
    setLoading(true);


    try {
      const response = await axiosInstance.get(
        // `/blog/posts/${email}/${encodedCategory}?page=${page}&limit=${limit}`
        `/blog/playlist/${email}/${encodedCategory}?page=${page}&limit=${limit}`
      );

      const data = response.data;

      // ✅ Prevent duplicates
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));

        const newPosts = data.posts.filter(
          (p) => !existingIds.has(p._id)
        );

        return [...prev, ...newPosts];
      });

      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // 🔄 Reset when category changes
//   useEffect(() => {
//     setPosts([]);
//     setPage(1);
//     setHasMore(true);
//   }, [domain, email]);
const fetchInitial = async () => {
  try {
    setLoading(true);

    const response = await axiosInstance.get(
      `/blog/playlist/${email}/${encodeURIComponent(domain)}?page=1&limit=${limit}`
    );

    setPosts(response.data.posts || []);
    setHasMore(response.data.hasMore);
    setPage(2); // next page
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  if (!email || !domain) return;

  // reset
  setPosts([]);
  setPage(1);
  setHasMore(true);
  isFetching.current = false;

  // fetch first page manually
  fetchInitial();
}, [domain, email]);

  // 🚀 Initial fetch
  useEffect(() => {
    getPostByCategory();
  }, [domain, email]);

  // 📜 Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        getPostByCategory();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, page]);

  return {
    posts,
    loading,
    hasMore,
    getPostByCategory,
  };
};

export default useGetPostsByCategory;