import { useEffect, useState } from "react";
import axiosInstance from "../../instances/Axiosinstances";

const useCommunities = (authorId) => {
  
  const [communityNames, setCommunityNames] = useState([]);
  const [communitiesloading, setCommunitiesLoading] = useState(false);

  const getCommunityNames = async () => {
    try {
      setCommunitiesLoading(true)
      const res = await axiosInstance.get("/blog/techCommunity/all");

      if (res.status === 200) {
        setCommunityNames(res.data.communities);
      }
    } catch (err) {
      console.log("error getting community names", err.message);
    } finally {
        setCommunitiesLoading(false)
    }
  };

  useEffect(()=>{
    getCommunityNames()
  },[authorId])

  return {communityNames, communitiesloading, getCommunityNames}
};


export default useCommunities

// import { useCallback, useEffect, useRef, useState } from "react";
// import axiosInstance from "../../instances/Axiosinstances";

// const useCommunities = () => {
//   const [communityNames, setCommunityNames] = useState([]);
//   const [communitiesloading, setCommunitiesLoading] = useState(false);
//   const requestStarted = useRef(false);

//   const getCommunityNames = useCallback(async (force = false) => {
//     if (requestStarted.current && !force) {
//       return;
//     }

//     requestStarted.current = true;

//     try {
//       setCommunitiesLoading(true);
//       const res = await axiosInstance.get("/blog/techCommunity/all");

//       if (res.status === 200) {
//         setCommunityNames(res.data.communities);
//       }
//     } catch (err) {
//       requestStarted.current = false;
//       console.log("error getting community names", err.message);
//     } finally {
//       setCommunitiesLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     getCommunityNames();
//   }, [getCommunityNames]);

//   return { communityNames, communitiesloading, getCommunityNames };
// };


// export default useCommunities