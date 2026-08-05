import { useEffect, useState } from "react";
import axiosInstance from "../../instances/Axiosinstances";

const useGetSingleTechCommunity = (communityId) => {
  const [communityDetails, setCommunityDetails] = useState([]);
  const [commLoading, setCommLoading] = useState(false);

  const getCommunitDetails = async () => {
    try {
      setCommLoading(true);
      const res = await axiosInstance.get(`/blog/techCommunity/${communityId}`);

      if (res.status === 200) {
        setCommunityDetails(res.data.community);
      }
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setCommLoading(false);
    }
  };

  useEffect(() => {
    getCommunitDetails();
  }, [communityId]);

  return { communityDetails, commLoading, getCommunitDetails };
};

export default useGetSingleTechCommunity;
