
import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../instances/Axiosinstances";

// const useGetAllAuthorsByDomain = (domain) => {

//     const [coordinators, setCoordinators] = useState([]);
//     const [loading, setLoading] = useState(false);
//      const decodedCategory = decodeURIComponent(domain);
//     const fetchCoordinators = async () => {
//             setLoading(true);
//             // console.log("decodedCategory", decodedCategory);
//         try{

//             const response  = await axiosInstance.get(`/blog/author/getAllAuthorsByDomain/${decodedCategory}`);
//                 // console.log("response", response.data);
//             if (response.status === 200){
//                 setCoordinators(response.data.filteredAuthors);
//             }

//         }
//         catch(err){
//             console.log("error", err.message);
//         }
//         finally{
//             setLoading(false);
//         }
//     }

//     useEffect(()=>{
//         fetchCoordinators()
//     }, [domain]);

//     return {coordinators, loading};
// }

const useGetAllAuthorsByDomain = (domain) => {
  const [coordinators, setCoordinators] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(true);
  const [total,        setTotal]        = useState(0);

  const isFetching = useRef(false);
  const limit = 10;

  const fetchCoordinators = useCallback(async () => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const decodedCategory = decodeURIComponent(domain);
      const response = await axiosInstance.get(
        `/blog/author/getAllAuthorsByDomain/${decodedCategory}`,
        { params: { page, limit } }
      );

      if (response.status === 200) {
        const { filteredAuthors, total, hasMore: more } = response.data;

        if (!filteredAuthors || filteredAuthors.length === 0) {
          setHasMore(false);
          return;
        }

        // deduplicate by email
        setCoordinators(prev => {
          const existingEmails = new Set(prev.map(c => c.email));
          const filtered = filteredAuthors.filter(c => !existingEmails.has(c.email));
          return [...prev, ...filtered];
        });

        setTotal(total);
        setHasMore(more);
      }
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [page, hasMore, domain]);

  // fetch when page changes
  useEffect(() => {
    fetchCoordinators();
  }, [fetchCoordinators]);

  // reset when domain changes
  useEffect(() => {
    setCoordinators([]);
    setPage(1);
    setHasMore(true);
    isFetching.current = false;
  }, [domain]);

  // scroll listener — same pattern as useTutorPlaylist
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        hasMore &&
        !isFetching.current
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return { coordinators, loading, hasMore, total };
};
export default useGetAllAuthorsByDomain;
