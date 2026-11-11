import { TbCircleCheck } from "react-icons/tb";
import {
  BADGE_TONES,
  getBadge,
  getCta,
  getFooter,
  themeRevealHint,
  xpLabel,
} from "../../utils/event/eventUtils";
import { posterUrl } from "../../utils/event/poster";

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
  const poster = posterUrl(event);

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-lg border bg-[#13161b] transition ${
        isLive ? "border-emerald-500/40" : "border-white/[0.07] hover:border-white/15"
      } ${isEnded ? "opacity-75" : ""}`}
    >
      {/* 16:9 poster, clickable to open the event */}
      <button
        type="button"
        onClick={() => onOpen(event)}
        aria-label={`Open ${event.title}`}
        className="relative block aspect-video w-full overflow-hidden bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {poster && (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </button>

      <div className="flex flex-1 flex-col p-2.5 md:p-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${BADGE_TONES[badge.tone]}`}
          >
            {badge.check && <TbCircleCheck className="text-[10px]" />}
            {badge.label}
          </span>
          <span className="whitespace-nowrap text-[11px] font-medium text-emerald-400">{xpLabel(event)}</span>
        </div>

        <h3 className="mt-2 text-xs font-semibold uppercase tracking-tight text-zinc-100 line-clamp-2 md:text-sm">
          {event.title}
        </h3>
        <p className="mt-1  text-xs text-zinc-400 line-clamp-1 text-wrap overflow-hidden">{event.overview}</p>

        {hint && <p className="mt-1.5 text-[10px] font-medium text-amber-300/80">{hint}</p>}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-2.5 mt-3">
          <span className="min-w-0 truncate text-[11px] text-zinc-500">{getFooter(event, now)}</span>
          <button
            type="button"
            disabled={cta.variant === "disabled"}
            onClick={() => onOpen(event)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${CTA_STYLES[cta.variant]}`}
          >
            {cta.label}
          </button>
        </div>
      </div>
    </article>
  );
}