import { useState, useEffect } from "react";
import axiosInstance from "../instances/Axiosinstances";

const useGetCommunityAnalytics = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCommunityAnalytics = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        "/blog/analytics/view/techDomain",
      );
      // console.log("analytics", response.data);
      setCommunities(response.data.analytics);
    } catch (err) {
      console.log("error", err.message);
    }
    finally{
        setLoading(false)
    }
  };

  useEffect(() => {
    getCommunityAnalytics();
  }, []);

  return { communities, setCommunities, loading, getCommunityAnalytics };
};

export default useGetCommunityAnalytics;
