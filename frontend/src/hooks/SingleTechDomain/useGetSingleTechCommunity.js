import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../instances/Axiosinstances";

const useGetSingleTechCommunity = (communityId) => {
  const [communityDetails, setDetails] = useState([]);
  const [commLoading, setCommLoading] = useState(false);
  const requestVersion = useRef(0);

  const setCommunityDetails = (community) => {
    requestVersion.current += 1;
    setDetails(community);
    setCommLoading(false);
  };

  const getCommunitDetails = async () => {
    const version = ++requestVersion.current;
    try {
      setCommLoading(true);
      const res = await axiosInstance.get(`/blog/techCommunity/${communityId}`);

      if (res.status === 200 && version === requestVersion.current) {
        setDetails(res.data.community);
      }
    } catch (err) {
      if (version === requestVersion.current) console.log("error", err.message);
    } finally {
      if (version === requestVersion.current) setCommLoading(false);
    }
  };

  useEffect(() => {
    getCommunitDetails();
    return () => {
      requestVersion.current += 1;
    };
  }, [communityId]);

  return { communityDetails, setCommunityDetails, commLoading, getCommunitDetails };
};

export default useGetSingleTechCommunity;
