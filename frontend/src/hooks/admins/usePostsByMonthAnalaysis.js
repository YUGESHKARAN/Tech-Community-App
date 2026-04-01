import { useEffect, useState } from "react";
import axiosInstance from "../../instances/Axiosinstances";
const usePostsByMonthAnalaysis = (email, year) => {
  const [postsByMonth, setPostsByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const getPostsByMonth = async() => {
    console.log("Fetching posts by month for:", { email, year });   
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/blog/analytics/view/monthly-posts/${email}?year=${year}`,
      );

      if (response.status === 200) {
        // console.log("posts by month response:", response.data); 
        setPostsByMonth(response.data.monthlyData);
      }
    } catch (err) {
      console.log("error fetching posts by month:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPostsByMonth();
  }, [year]);

  return { postsByMonth, loading, getPostsByMonth };
};

export default usePostsByMonthAnalaysis;
