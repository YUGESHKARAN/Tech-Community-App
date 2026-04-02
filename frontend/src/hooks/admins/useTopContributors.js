import { useState, useEffect } from "react";
import axiosInstance from "../../instances/Axiosinstances";

const useTopContributors = (email, limit) => {
  const [topContributors, setTopContributors] = useState([]);
  const [contributorsLoading, setContributorsLoading] = useState(true);

  const getTopContributors = async () => {
    try {
      setContributorsLoading(true);
      const response = await axiosInstance.get(`/blog/analytics/view/top-contributors/${email}?limit=${limit}`);

      if (response.status === 200) {
        setTopContributors(response.data.contributors);
      }
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setContributorsLoading(false);
    }
  };

  useEffect(() => {
    getTopContributors();
  }, [email, limit]);

  return { topContributors, contributorsLoading, getTopContributors };
};


export default useTopContributors;