import { useState, useEffect } from "react";
import axiosInstance from "../../instances/Axiosinstances";

const useTopContributors = (email, limit, filter) => {
  const [topContributors, setTopContributors] = useState([]);
  const [topContributorsLoading, setTopContributorsLoading] = useState(true);

  const getTopContributors = async () => {
    try {
      setTopContributorsLoading(true);
      const response = await axiosInstance.get(`/blog/analytics/view/top-contributors/${email}?limit=${limit}&filter=${filter}`);

      if (response.status === 200) {
        setTopContributors(response.data.contributors);
      }
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setTopContributorsLoading(false);
    }
  };

  useEffect(() => {
    getTopContributors();
  }, [email, limit, filter]);

  return { topContributors, topContributorsLoading, getTopContributors };
};


export default useTopContributors;