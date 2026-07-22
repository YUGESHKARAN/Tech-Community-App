import { useState, useEffect } from "react";
import axiosInstance from "../instances/Axiosinstances";

const useGetRecentHistory = (email) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentPlaylists, setRecentPlaylists] = useState([]);
  const [histroyLoader, setHistoryLoader] = useState(false);

  const getRecentHistroy = async () => {
    console.log("client process", email);

    try {
      setHistoryLoader(true);

      const response = await axiosInstance.get(
        `/blog/recentHistory/visited/${email}`,
      );

      if (response.status === 200) {
        setRecentPosts(response.data.posts);
        setRecentPlaylists(response.data.playlists);
      }
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setHistoryLoader(false);
    }
  };

  useEffect(() => {
    getRecentHistroy();
  }, [email]);

  return { recentPosts, recentPlaylists, histroyLoader };
};

export default useGetRecentHistory;
