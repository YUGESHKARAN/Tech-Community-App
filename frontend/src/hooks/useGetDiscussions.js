import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "../instances/Axiosinstances";

const DEFAULT_LIMIT = 20;

const buildRequestParams = ({ page, limit, category, isSolved, tag, search }) => {
  const params = { page, limit };
  if (category) params.category = category;
  if (isSolved !== undefined && isSolved !== null) params.isSolved = isSolved;
  if (tag) params.tag = tag;
  if (search) params.search = search;
  return params;
};

function useGetDiscussions(communityId, options = {}) {
  const [discussions, setDiscussions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState(() => ({
    category: options.category || "",
    isSolved: options.isSolved,
    tag: options.tag || "",
    search: options.search || "",
    limit: options.limit || DEFAULT_LIMIT,
  }));

  const fetchingRef = useRef(false);

  const pageRef = useRef(1);

  const fetchDiscussions = useCallback(
    async ({ page: requestedPage, params = {} } = {}) => {
      if (!communityId) return;
      if (fetchingRef.current) return;

      const currentPage = requestedPage ?? pageRef.current;
      if (!currentPage) return;

      fetchingRef.current = true;
      setLoading(true);

      const finalParams = buildRequestParams({
        page: currentPage,
        limit: searchParams.limit,
        category: params.category ?? searchParams.category,
        isSolved: params.isSolved ?? searchParams.isSolved,
        tag: params.tag ?? searchParams.tag,
        search: params.search ?? searchParams.search,
      });

      try {
        const response = await axiosInstance.get(
          `/bytes/discuss/${communityId}/discussions`,
          { params: finalParams }
        );

        const { discussions: newDiscussions = [], total = 0, totalPages = 0, hasMore: responseHasMore } = response.data;

        setDiscussions((prev) =>
          requestedPage === 1 ? newDiscussions : [...prev, ...newDiscussions]
        );
        setTotal(total);
        setTotalPages(totalPages);
        setHasMore(
          typeof responseHasMore === "boolean"
            ? responseHasMore
            : currentPage < totalPages
        );
        setPage(currentPage + 1);
        pageRef.current = currentPage + 1;
      } catch (err) {
        console.error("Error fetching discussions:", err);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [communityId, searchParams]
  );

  const resetDiscussions = useCallback(
    (newOptions = {}) => {
      setDiscussions([]);
      setPage(1);
      setTotal(0);
      setTotalPages(0);
      setHasMore(true);
      setSearchParams((current) => ({
        ...current,
        ...newOptions,
      }));
    },
    []
  );

  useEffect(() => {
    if (!communityId) return;
    setDiscussions([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    fetchingRef.current = false;
    fetchDiscussions({ page: 1 });
  }, [communityId, searchParams, fetchDiscussions]);

  return {
    discussions,
    page,
    total,
    totalPages,
    hasMore,
    loading,
    setDiscussions,
    setPage,
    setHasMore,
    setSearchParams,
    fetchDiscussions,
    resetDiscussions,
  };
}

export default useGetDiscussions;
