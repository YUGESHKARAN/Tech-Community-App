import { useEffect, useState } from "react";
import axiosInstance from "../../instances/Axiosinstances";
import { MOCK_EVENTS } from "../../data/mockEvents";

// Flip to false once GET /bytes/manage/events is live.
const USE_MOCK = true;

/**
 * Loads the events list for the browse page.
 * Returns { events, loading, error }.
 */
export default function useEventsBrowse() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let list;
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 250));
          list = MOCK_EVENTS;
        } else {
          const { data } = await axiosInstance.get("/bytes/manage/events");
          list = Array.isArray(data) ? data : data.events || [];
        }
        if (!cancelled) setEvents(list);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Could not load events. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { events, loading, error };
}