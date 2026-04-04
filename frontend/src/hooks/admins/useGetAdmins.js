


import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../instances/Axiosinstances';

const useGetAdmins = (email) => {
  const [admins, setAdmins] = useState([]);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const limit = 20;

  const fetchAdmins = useCallback(async () => {
    const currentPage = pageRef.current;
    if (!email || isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/blog/analytics/view/admins/${email}?page=${currentPage}&limit=${limit}`);
      const data = response.data;

      const total = Number(data.totalAdmins ?? 0);
      const responseCount = (data.admins ?? []).length;
      const totalPages = data.totalPages ?? Math.ceil(total / limit);
      const isLastPage = currentPage >= totalPages || responseCount < limit || responseCount === 0;

      setAdmins((prev) => (currentPage === 1 ? data.admins : [...prev, ...data.admins]));
      setTotalAdmins(total);
      setHasMore(!isLastPage);
      hasMoreRef.current = !isLastPage;

      if (!isLastPage) {
        pageRef.current += 1;
        setPage(pageRef.current);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch admins');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [email, limit]);

  const loadMore = useCallback(() => {
    if (!isFetchingRef.current && hasMoreRef.current && !loading) {
      fetchAdmins();
    }
  }, [fetchAdmins, loading]);

  useEffect(() => {
    setAdmins([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setError(null);
    setTotalAdmins(0);

    fetchAdmins();
  }, [email, fetchAdmins]);

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

  return { admins, totalAdmins, loading, hasMore, loadMore, setAdmins };
};

export default useGetAdmins;