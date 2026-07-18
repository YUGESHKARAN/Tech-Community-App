
import { useState, useEffect } from "react";
import axiosInstance from "../../instances/Axiosinstances";

const useGetCommunityStats = () => {
  const [communityStats, setcommunityStats] = useState([]);

  const getCommunityStats = async () => {
    try {
      const response = await axiosInstance.get(`/blog/techCommunity`);
      setcommunityStats(response.data.communities);
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    getCommunityStats();
  }, []);

  return { communityStats, getCommunityStats };
};

export default useGetCommunityStats;
