import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../instances/Axiosinstances";

function useTutorPlaylist() {
  const [tutorPlayList, setTutorPlayList] = useState([]);
  const [playlistCount, setPlaylistCount] = useState(0);

  const getTutorPlayList = useCallback(async () => {
    try {
      const response = await axiosInstance.get("blog/playlist/all");

      if (response.status === 200) {
        setTutorPlayList(response.data.data);
        setPlaylistCount(response.data.count);

      }
    } catch (err) {
      console.error("error", err.message);
    }
  }, []);

  // ✅ Hook must be at top level
  useEffect(() => {
    getTutorPlayList();
  }, [getTutorPlayList]);

  return { tutorPlayList, getTutorPlayList, playlistCount };
}

export default useTutorPlaylist;
