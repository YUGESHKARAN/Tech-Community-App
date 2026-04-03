import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../instances/Axiosinstances';

const useGetContributors = (email) => {
  const [contributors, setContributors] = useState([]);
  const [totalContributors, setTotalContributors] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const limit = 10;

  const fetchContributors = useCallback(async () => {
    const currentPage = pageRef.current;
    if (!email || isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/blog/analytics/view/contributors/${email}?page=${currentPage}&limit=${limit}`);
      const data = response.data;

      const total = Number(data.totalContributors ?? 0);
      const responseCount = (data.contributors ?? []).length;
      const totalPages = data.totalPages ?? Math.ceil(total / limit);
      const isLastPage = currentPage >= totalPages || responseCount < limit || responseCount === 0;

      setContributors((prev) => (currentPage === 1 ? data.contributors : [...prev, ...data.contributors]));
      setTotalContributors(total);
      setHasMore(!isLastPage);
      hasMoreRef.current = !isLastPage;

      if (!isLastPage) {
        pageRef.current += 1;
        setPage(pageRef.current);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch contributors');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [email, limit]);

  const loadMore = useCallback(() => {
    if (!isFetchingRef.current && hasMoreRef.current && !loading) {
      fetchContributors();
    }
  }, [fetchContributors, loading]);

  useEffect(() => {
    setContributors([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setError(null);
    setTotalContributors(0);

    fetchContributors();
  }, [email, fetchContributors]);

  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && hasMoreRef.current && !loading && !isFetchingRef.current) {
          loadMore();
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [loadMore, loading]);

  return { contributors, totalContributors, loading, error, hasMore, loadMore };
};

export default useGetContributors;