// ─────────────────────────────────────────────────────────────────────────────
//  useActivityGraph
//
//  Fetches contribution heatmap data for a specific year on demand.
//  Returns { contributions, loading, error, fetchYear }.
//
//  API: GET /api/authors/:authorId/contributions?year=YYYY
//  Response: { year, contributions: { "YYYY-MM-DD": pts }, totalCount }
//
//  Pattern (Option B):
//    - Initial load fetches the current year automatically.
//    - Year selector calls fetchYear(year) to swap year data.
//    - Results are cached in contributionCache so switching back to a
//      previously loaded year is instant with no re-fetch.
//
//  Usage:
//    const { contributions, loading, fetchYear } = useActivityGraph(authorId);
//    // on year selector change:
//    fetchYear(2025);

import { useState, useCallback, useEffect } from "react";
import axiosInstance from "../../instances/Axiosinstances";

// ─────────────────────────────────────────────────────────────────────────────
export const useActivityGraph = () => {
  const currentYear = new Date().getFullYear();
 
  const [contributions,     setContributions]     = useState({});
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  // cache: { [year]: { "YYYY-MM-DD": pts } } — avoids re-fetching visited years
  const [contributionCache, setContributionCache] = useState({});
 
  const fetchYear = useCallback(async (year) => {
    // if (!authorId) return;
 
    // cache hit — swap instantly, no network call
    if (contributionCache[year]) {
      setContributions(contributionCache[year]);
      return;
    }
 
    setLoading(true);
    setError(null);
 
    try {
      const res = await axiosInstance.get(
        `/bytes/performanceTrack/contributions?year=${year}`
      );
      const data = res.data.contributions || {};
      setContributions(data);
      setContributionCache((prev) => ({ ...prev, [year]: data }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load contributions");
    } finally {
      setLoading(false);
    }
  }, [currentYear]);
 
  // auto-fetch current year on mount
  
  //   const fetchYear =  async (year) => {
  //   // if (!authorId) return;
 
  //   // cache hit — swap instantly, no network call
  //   // if (contributionCache[year]) {
  //   //   setContributions(contributionCache[year]);
  //   //   return;
  //   // }
 
  //   setLoading(true);
  //   setError(null);
 
  //   try {
  //     const res = await axiosInstance.get(
  //       `/bytes/performanceTrack/contributions?year=${year}`
  //     );
  //     const data = res.data.contributions || {};
  //     setContributions(data);
  //     setContributionCache((prev) => ({ ...prev, [year]: data }));
  //   } catch (err) {
  //     setError(err?.response?.data?.message || "Failed to load contributions");
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  useEffect(() => {
    // if (!authorId) { setLoading(false); return; }
    fetchYear(currentYear);
  }, [currentYear]);
 
  return { contributions, loading, error, fetchYear };
};