import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiError, eventsApi } from "../../api/eventsApi";
import { revealProps } from "../../utils/event/motion";

/** Winners table, shown only after results are published. */
export default function EventWinners({ eventId }) {
  const [state, setState] = useState({ rows: [], loading: true, error: null });

  useEffect(() => {
    let alive = true;
    eventsApi
      .getResults(eventId)
      .then((data) => alive && setState({ rows: data.results || [], loading: false, error: null }))
      .catch((err) => alive && setState({ rows: [], loading: false, error: apiError(err) }));
    return () => {
      alive = false;
    };
  }, [eventId]);

  return (
    <motion.section
      id="winners"
      {...revealProps}
      className="scroll-mt-40 rounded-2xl border border-white/[0.07] bg-[#13161b] p-5 md:p-6"
    >
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Winners</h2>

      {state.loading && <div className="h-24 animate-pulse rounded-lg bg-white/5" aria-busy="true" />}

      {!state.loading && state.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}

      {!state.loading && !state.error && state.rows.length === 0 && (
        <p className="text-sm text-zinc-400">Results are being finalised.</p>
      )}

      {!state.loading && !state.error && state.rows.length > 0 && (
        <ul className="divide-y divide-white/[0.07] rounded-lg border border-white/[0.07]">
          {state.rows.map((r) => (
            <li key={r.rank} className="flex items-center gap-4 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-zinc-950">
                {r.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">{r.team || "Team"}</p>
                {r.prizeTitle && <p className="truncate text-xs text-zinc-500">{r.prizeTitle}</p>}
              </div>
              <div className="shrink-0 text-right">
                {typeof r.finalScore === "number" && (
                  <p className="text-sm font-semibold text-zinc-200">{r.finalScore.toFixed(1)}</p>
                )}
                {typeof r.pointsAwarded === "number" && r.pointsAwarded > 0 && (
                  <p className="text-xs text-emerald-400">+{r.pointsAwarded} XP</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}