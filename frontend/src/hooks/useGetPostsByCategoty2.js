import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../instances/Axiosinstances";

function useGetPostsByCategory(category) {
  const [categoryPosts, setCategoryPosts] = useState([]);

  const getCategoryPosts = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`blog/posts/${category}`);

      if (response.status === 200) {
        setCategoryPosts(response.data.data);
      }
    } catch (err) {
      console.error("error", err.message);
    }
  }, []);

  // ✅ Hook must be at top level
  useEffect(() => {
    getCategoryPosts();
  }, [getCategoryPosts]);

  return { categoryPosts, getCategoryPosts };
}

export default useGetPostsByCategory;
