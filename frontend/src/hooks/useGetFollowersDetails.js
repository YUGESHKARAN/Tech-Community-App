import { useState, useEffect } from "react";
import axiosInstance from "../instances/Axiosinstances";
import toast from "../components/toaster/Toast";

const useGetFollowersDetails = (email)=> {

  const [followersDetails, setFollowersDetails] = useState([]);
  const [followingDetails, setFollowingDetails] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);

  const getFollowersDetails = async () => {

    try {
      setFollowLoading(true)
      const response = await axiosInstance.get(
        `/blog/author/getFollowDetails/${email}`,
      );
      if (response.status === 200) {
        // console.log("follower details", response.data);
        setFollowersDetails(response.data.followers);
        setFollowingDetails(response.data.following);
      }
    } catch (err) {
      console.log("error", err.message);
      toast.error("Error", "Error getting follower/following details");
    }
    finally{
      setFollowLoading(false);
    }
  };

  useState(() => {
    getFollowersDetails();
  }, []);

  return {followersDetails, followingDetails, followLoading}
}

export default useGetFollowersDetails ;