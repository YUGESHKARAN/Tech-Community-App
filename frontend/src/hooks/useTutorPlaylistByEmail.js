import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../instances/Axiosinstances";

function useTutoPlaylistByEmail() {

    const email = localStorage.getItem("email");
  const [tutorPlayListByEmail, setTutorPlayListByEmail] = useState([]);

  const getTutorPlayListByEmail = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`blog/playlist/coordinator/${email}`);

      if (response.status === 200 || response.status === 204) {
        setTutorPlayListByEmail(response.data.data || []);
      }
    } catch (err) {
      console.error("error", err.message);
    }
  }, []);

  // ✅ Hook must be at top level
  useEffect(() => {
    getTutorPlayListByEmail();
  }, [getTutorPlayListByEmail]);

  return { tutorPlayListByEmail, getTutorPlayListByEmail };
}

export default useTutoPlaylistByEmail;
