import { useEffect, useState } from "react";
import axiosInstance from "../../instances/Axiosinstances";
import { MOCK_EVENTS } from "../../data/mockEvents";

// Flip to false once GET /bytes/manage/events is ready.
const USE_MOCK = true;

/**
 * Loads the events list for the browse page.
 * Returns { events, loading, error }.
 * The shape of `events` is the same for mock and real data.
 */
export default function useEventsBrowse({ limit = 50 } = {}) {
  const [state, setState] = useState({ events: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300)); // simulate latency
        if (!cancelled) setState({ events: MOCK_EVENTS, loading: false, error: null });
        return;
      }

      try {
        const res = await axiosInstance.get("/bytes/manage/events", { params: { limit } });
        if (!cancelled) setState({ events: res.data.events || [], loading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            events: [],
            loading: false,
            error: err?.response?.data?.message || "Could not load events. Please try again.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return state;
}