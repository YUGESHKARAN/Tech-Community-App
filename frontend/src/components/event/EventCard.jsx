import { TbCircleCheck } from "react-icons/tb";
import {
  BADGE_TONES,
  getBadge,
  getCta,
  getFooter,
  themeRevealHint,
  xpLabel,
} from "../../utils/event/eventUtils";

const CTA_STYLES = {
  primary: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
  ghost: "border border-white/10 text-zinc-200 hover:bg-white/5",
  disabled: "bg-white/5 text-zinc-500 cursor-not-allowed",
};

export default function EventCard({ event, now, onOpen }) {
  const badge = getBadge(event);
  const cta = getCta(event);
  const hint = themeRevealHint(event, now);
  const isLive = event.status === "live";
  const isEnded = event.status === "ended";

  return (
    <article
      className={`flex min-w-0 flex-col rounded-lg md:rounded-xl border bg-[#13161b] p-4 transition ${
        isLive ? "border-emerald-500/40" : "border-white/[0.07] hover:border-white/15"
      } ${isEnded ? "opacity-75" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${BADGE_TONES[badge.tone]}`}
        >
          {badge.check && <TbCircleCheck className="text-xs" />}
          {badge.label}
        </span>
        <span className="whitespace-nowrap text-xs font-medium text-emerald-400">{xpLabel(event)}</span>
      </div>

      <h3 className="mt-3 text-sm font-semibold uppercase tracking-tight text-zinc-100 line-clamp-2">
        {event.title}
      </h3>
      <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{event.overview}</p>

      {hint && <p className="mt-2 text-[11px] font-medium text-amber-300/80">{hint}</p>}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-4 mt-4">
        <span className="min-w-0 truncate text-xs text-zinc-500">{getFooter(event, now)}</span>
        <button
          type="button"
          disabled={cta.variant === "disabled"}
          onClick={() => onOpen(event)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${CTA_STYLES[cta.variant]}`}
        >
          {cta.label}
        </button>
      </div>
    </article>
  );
}