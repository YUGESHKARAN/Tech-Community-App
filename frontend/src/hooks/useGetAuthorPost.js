import { useState, useEffect } from "react";
import axiosInstance from "../instances/Axiosinstances";

const useGetAuthorPosts = (email) => {
  const [posts, setPosts] = useState([]);

  const getAuthorPosts = async () => {
    try {
      const response = await axiosInstance.get(`/blog/posts/${email}`);
      setPosts(response.data.data);
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    if (email) getAuthorPosts();
  }, [email]);

  return { posts, getAuthorPosts };
};

export default useGetAuthorPosts;
