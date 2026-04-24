import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../instances/Axiosinstances';

const useGetDeletionLog = (email) => {
  const [logDetails, setLogDetails] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const limit = 10;

  const fetchDeletionLogs = useCallback(async () => {
    const currentPage = pageRef.current;
    if (!email || isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/blog/admin/deletionLogs/${email}?page=${currentPage}&limit=${limit}`);
      const data = response.data;

      console.log("gethook data", data)

      const total = Number(data.total ?? 0);
      const responseCount = (data.data ?? []).length;
      const totalPages = data.totalPages ?? Math.ceil(total / limit);
      const isLastPage = currentPage >= totalPages || responseCount < limit || responseCount === 0;

      setLogDetails((prev) => (currentPage === 1 ? data.data : [...prev, ...data.data]));
      setTotalLogs(total);
      setHasMore(!isLastPage);
      hasMoreRef.current = !isLastPage;

      if (!isLastPage) {
        pageRef.current += 1;
        setPage(pageRef.current);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch deltion logs');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [email, limit]);

  const loadMore = useCallback(() => {
    if (!isFetchingRef.current && hasMoreRef.current && !loading) {
      fetchDeletionLogs();
    }
  }, [fetchDeletionLogs, loading]);

  useEffect(() => {
    setLogDetails([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setError(null);
    setTotalLogs(0);

    fetchDeletionLogs();
  }, [email, fetchDeletionLogs]);

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

  return { logDetails, setLogDetails, totalLogs, loading, error, hasMore, loadMore };
};

export default useGetDeletionLog;