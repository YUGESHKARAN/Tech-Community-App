
import { useState, useEffect } from "react";
import axiosInstance from "../../instances/Axiosinstances";

const useGetCommunityStats = () => {
  const [communityStats, setcommunityStats] = useState([]);
  const [statsLoader, setStatsLoader] = useState(false)

  const getCommunityStats = async () => {
    try {
      setStatsLoader(true)
      const response = await axiosInstance.get(`/blog/techCommunity`);
      setcommunityStats(response.data.communities);
    } catch (err) {
      console.log("error", err);
    }
    finally{
      setStatsLoader(false)
    }
  };

  useEffect(() => {
    getCommunityStats();
  }, []);

  return { communityStats, statsLoader, setcommunityStats, getCommunityStats };
};

export default useGetCommunityStats;
