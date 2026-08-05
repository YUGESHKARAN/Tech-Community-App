import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../../instances/Axiosinstances";

function useGetAllMembersByDomain(communityId) {
  const [members, setMembers] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const fetchAuthors = useCallback(async () => {
    if (!communityId) return;
    if (fetchingRef.current || loading || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/blog/techCommunity/${communityId}/members?&page=${page}&limit=20`
      );

      const {
        coordinators: newCoordinators = [],
        members: newMembers = [],
        hasMore: nextHasMore,
      } = response.data;

      if (
        newCoordinators.length === 0 &&
        newMembers.length === 0 &&
        page !== 1
      ) {
        setHasMore(false);
      }

      setCoordinators((prev) => [...prev, ...newCoordinators]);
      setMembers((prev) => [...prev, ...newMembers]);
      setHasMore(
        typeof nextHasMore === "boolean"
          ? nextHasMore
          : response.data.page < response.data.totalPages
      );
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [communityId, page, loading, hasMore]);

  useEffect(() => {
    fetchAuthors();
  }, [communityId]);

  useEffect(() => {
    setMembers([]);
    setCoordinators([]);
    setPage(1);
    setHasMore(true);
  }, [communityId]);

  return {
    members,
    coordinators,
    page,
    setPage,
    hasMore,
    loading,
    fetchAuthors
  };
}

export default useGetAllMembersByDomain;