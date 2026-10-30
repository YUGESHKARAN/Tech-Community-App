
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const RANGE_OPTIONS = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
];

export const AUDIENCE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "all", label: "All users" },
  { value: "coordinators", label: "Coordinators" },
  { value: "community", label: "Community" },
];

const VALID_RANGES = RANGE_OPTIONS.map((r) => r.value);
const VALID_AUDIENCES = ["all", "coordinators", "community"];
const FILTER_KEYS = ["q", "range", "from", "to", "aud", "pub", "poster", "links"];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// "YYYY-MM-DD" -> local Date (start or end of that day)
const parseLocalDate = (value, endOfDay = false) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const d = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const hasPoster = (a) => !!a.poster && a.poster !== "undefined";
const hasLinks = (a) => Array.isArray(a.links) && a.links.length > 0;
const publisherKey = (a) => a.authorEmail || a.user;
const timeOf = (a) => {
  const t = Date.parse(a.timestamp);
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Client-side announcement filtering. The URL query string is the source of
 * truth, so a filtered view survives refresh and can be shared.
 *
 * Params: q, range (today|7d|30d|custom), from, to (YYYY-MM-DD),
 *         sort (oldest), aud (all|coordinators|community),
 *         pub (comma-separated publisher keys), poster=1, links=1
 */
export default function useAnnouncementFilters(items) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const range = params.get("range");
    const aud = params.get("aud");
    return {
      q: params.get("q") || "",
      range: VALID_RANGES.includes(range) ? range : "all",
      from: params.get("from") || "",
      to: params.get("to") || "",
      sort: params.get("sort") === "oldest" ? "oldest" : "newest",
      audience: VALID_AUDIENCES.includes(aud) ? aud : "",
      publishers: (params.get("pub") || "").split(",").filter(Boolean),
      poster: params.get("poster") === "1",
      links: params.get("links") === "1",
    };
  }, [params]);

  const setFilters = useCallback(
    (patch) => {
      // Read the live URL so debounced callers never write stale params.
      const next = new URLSearchParams(window.location.search);
      const put = (key, value, keep) =>
        keep ? next.set(key, value) : next.delete(key);

      if ("q" in patch) put("q", patch.q.trim(), patch.q.trim());
      if ("range" in patch) {
        put("range", patch.range, patch.range !== "all");
        if (patch.range !== "custom") {
          next.delete("from");
          next.delete("to");
        }
      }
      if ("from" in patch) put("from", patch.from, patch.from);
      if ("to" in patch) put("to", patch.to, patch.to);
      if ("sort" in patch) put("sort", patch.sort, patch.sort === "oldest");
      if ("audience" in patch) put("aud", patch.audience, patch.audience);
      if ("publishers" in patch)
        put("pub", patch.publishers.join(","), patch.publishers.length > 0);
      if ("poster" in patch) put("poster", "1", patch.poster);
      if ("links" in patch) put("links", "1", patch.links);

      setParams(next, { replace: true });
    },
    [setParams],
  );

  /* Search box: local state, debounced into the URL */
  const [queryInput, setQueryInput] = useState(filters.q);

  useEffect(() => {
    const t = setTimeout(() => {
      if (queryInput.trim() !== filters.q) setFilters({ q: queryInput });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  // Keep the box in sync with back/forward navigation and "clear all"
  useEffect(() => {
    setQueryInput((prev) => (prev.trim() === filters.q ? prev : filters.q));
  }, [filters.q]);

  const clearAll = useCallback(() => {
    const next = new URLSearchParams(window.location.search);
    FILTER_KEYS.forEach((k) => next.delete(k));
    setParams(next, { replace: true });
    setQueryInput("");
  }, [setParams]);

  /* Publisher options, built from the data */
  const publishers = useMemo(() => {
    const map = new Map();
    items.forEach((a) => {
      const key = publisherKey(a);
      if (!key) return;
      const entry = map.get(key) || { key, name: a.user || key, count: 0 };
      entry.count += 1;
      map.set(key, entry);
    });
    return [...map.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }, [items]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const today = startOfDay(new Date());
    let from = null;
    let to = null;

    if (filters.range === "today") {
      from = today;
    } else if (filters.range === "7d") {
      from = new Date(today);
      from.setDate(from.getDate() - 6);
    } else if (filters.range === "30d") {
      from = new Date(today);
      from.setDate(from.getDate() - 29);
    } else if (filters.range === "custom") {
      from = parseLocalDate(filters.from);
      to = parseLocalDate(filters.to, true);
    }

    const out = items
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => {
        if (q) {
          const hay = `${a.title || ""} ${a.message || ""} ${a.user || ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        const t = timeOf(a);
        if (from && t < from.getTime()) return false;
        if (to && t > to.getTime()) return false;
        if (filters.audience && a.deliveredTo !== filters.audience) return false;
        if (
          filters.publishers.length > 0 &&
          !filters.publishers.includes(publisherKey(a))
        )
          return false;
        if (filters.poster && !hasPoster(a)) return false;
        if (filters.links && !hasLinks(a)) return false;
        return true;
      });

    // Sort by timestamp; ties keep the original newest-last array order.
    out.sort((x, y) => {
      const d = timeOf(y.a) - timeOf(x.a) || y.i - x.i;
      return filters.sort === "oldest" ? -d : d;
    });

    return out.map(({ a }) => a);
  }, [items, filters]);

  const rangeActive =
    filters.range !== "all" &&
    (filters.range !== "custom" || !!filters.from || !!filters.to);

  const activeCount =
    (filters.q.trim() ? 1 : 0) +
    (rangeActive ? 1 : 0) +
    (filters.audience ? 1 : 0) +
    (filters.publishers.length > 0 ? 1 : 0) +
    (filters.poster ? 1 : 0) +
    (filters.links ? 1 : 0);

  return {
    filters,
    setFilters,
    clearAll,
    activeCount,
    filtered,
    publishers,
    queryInput,
    setQueryInput,
  };
}