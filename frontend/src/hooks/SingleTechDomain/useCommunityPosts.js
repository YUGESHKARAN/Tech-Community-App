import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../instances/Axiosinstances';

const useCommunityPosts = (communityId, initialPage = 1, limit = 5, enabled = true) => {
  const [page, setPage] = useState(initialPage);
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommunityPosts = async (signal, requestedPage = page, append = false) => {
    if (!enabled || !communityId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `/blog/techCommunity/${communityId}/posts?page=${requestedPage}&limit=${limit}`,
        { signal }
      );

      const data = response.data;
      setPosts((prev) =>
        append ? [...prev, ...(data.posts || [])] : data.posts || [],
      );
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(initialPage);
    setPosts([]);
  }, [communityId, initialPage]);

  useEffect(() => {
    const controller = new AbortController();
    const append = page > initialPage;
    fetchCommunityPosts(controller.signal, page, append);
    return () => controller.abort();
  }, [communityId, page, limit, enabled, initialPage]);

  const loadMorePosts = useCallback(() => {
    if (!hasMore || isLoading) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isLoading]);

  return {
    posts,
    totalCount,
    totalPages,
    hasMore,
    isLoading,
    error,
    fetchCommunityPosts,
    loadMorePosts,
    page,
    setPage,
  };
};

export default useCommunityPosts;
