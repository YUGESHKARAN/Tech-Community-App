import { useState, useEffect } from "react";
import axiosInstance from "../instances/Axiosinstances";

const useGetAuthorsPostsCategories = (email) => {
  const [categories, setCategories] = useState([]);

  const getCategories = async () => {
    try {
      const response = await axiosInstance.get(
        // `/blog/posts/categories/${email}`,
        `/blog/playlist/categories/playlist/${email}`,
      );

      setCategories(response.data.categories);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getCategories();
  }, [email]);

  return { categories, setCategories };
};



export default useGetAuthorsPostsCategories;
