import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../../instances/Axiosinstances";

function useGetAllMembersByDomain(communityId) {
  const [members, setMembers] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchingRef = useRef(false);
  const requestVersion = useRef(0);

  const fetchAuthors = useCallback(async () => {
    if (!communityId) return;
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    const version = ++requestVersion.current;
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

      if (version !== requestVersion.current) return;
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
      if (version === requestVersion.current) {
        console.error("Error loading members:", err);
      }
    } finally {
      if (version === requestVersion.current) {
        setLoading(false);
        fetchingRef.current = false;
        setHasFetched(true);
      }
    }
  }, [communityId, page, hasMore]);

  const refreshAuthors = useCallback(async () => {
    const version = ++requestVersion.current;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/blog/techCommunity/${communityId}/members?&page=1&limit=20`
      );
      if (version !== requestVersion.current) return;
      const { coordinators: nextCoordinators = [], members: nextMembers = [], hasMore: nextHasMore } = response.data;
      setCoordinators(nextCoordinators);
      setMembers(nextMembers);
      setPage(1);
      setHasMore(
        typeof nextHasMore === "boolean"
          ? nextHasMore
          : response.data.page < response.data.totalPages
      );
    } finally {
      if (version === requestVersion.current) {
        setLoading(false);
        fetchingRef.current = false;
        setHasFetched(true);
      }
    }
  }, [communityId]);

  useEffect(() => {
    setMembers([]);
    setCoordinators([]);
    setPage(1);
    setHasMore(true);
    setHasFetched(false);
    if (communityId) {
      refreshAuthors().catch((err) => console.error("Error loading members:", err));
    }
    return () => {
      requestVersion.current += 1;
      fetchingRef.current = false;
    };
  }, [communityId, refreshAuthors]);

  return {
    members,
    coordinators,
    page,
    setPage,
    hasMore,
    loading,
    hasFetched,
    fetchAuthors,
    refreshAuthors,
  };
}

export default useGetAllMembersByDomain;