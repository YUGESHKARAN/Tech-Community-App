import { useState, useEffect } from "react";
import axiosInstance from "../instances/Axiosinstances";

const useAuthorCommunity = (email) => {
  const [authorCommunity, setAuthorCommunity] = useState([]);

  const getAuthorCommunity = async () => {
    try {
      const response = await axiosInstance.get(`/blog/author/${email}`);
      setAuthorCommunity(response.data.community);
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    if (email) getAuthorCommunity();
  }, [email]);

  return { authorCommunity,setAuthorCommunity,  getAuthorCommunity };
};

export default useAuthorCommunity;
