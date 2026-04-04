
import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../instances/Axiosinstances';

const useGetStudents = (email) => {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const limit = 50;

  const fetchStudents = useCallback(async () => {
    const currentPage = pageRef.current;
    if (!email || isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/blog/analytics/view/users/${email}?page=${currentPage}&limit=${limit}`);
      const data = response.data;

      const total = Number(data.totalStudents ?? 0);
      const responseCount = (data.students ?? []).length;
      const totalPages = data.totalPages ?? Math.ceil(total / limit);
      const isLastPage = currentPage >= totalPages || responseCount < limit || responseCount === 0;

      setStudents((prev) => (currentPage === 1 ? data.students : [...prev, ...data.students]));
      setTotalStudents(total);
      setHasMore(!isLastPage);
      hasMoreRef.current = !isLastPage;

      if (!isLastPage) {
        pageRef.current += 1;
        setPage(pageRef.current);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch students');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [email, limit]);

  const loadMore = useCallback(() => {
    if (!isFetchingRef.current && hasMoreRef.current && !loading) {
      fetchStudents();
    }
  }, [fetchStudents, loading]);

  useEffect(() => {
    setStudents([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setError(null);
    setTotalStudents(0);

    fetchStudents();
  }, [email, fetchStudents]);

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

  return { students, totalStudents, loading, error, hasMore, loadMore, setStudents };
};

export default useGetStudents;