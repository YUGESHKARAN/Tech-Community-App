import { Link } from "react-router-dom";

const BASE = "shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition";
const ENABLED = "bg-emerald-500 text-zinc-950 hover:bg-emerald-400";
const DISABLED = "bg-white/5 text-zinc-500 cursor-not-allowed";

/**
 * Mobile-only bar pinned to the bottom of the screen. Shows the event dates and
 * the main action. `primary` is either { label, to } for a link, or
 * { label, onClick, disabled } for a button.
 */
export default function EventStickyBar({ dateText, primary }) {
  const isLink = Boolean(primary.to);
  const cls = `${BASE} ${primary.disabled ? DISABLED : ENABLED}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f1216]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-xs text-zinc-400">{dateText}</p>
        {isLink ? (
          <Link to={primary.to} className={cls}>
            {primary.label}
          </Link>
        ) : (
          <button type="button" onClick={primary.onClick} disabled={primary.disabled} className={cls}>
            {primary.label}
          </button>
        )}
      </div>
    </div>
  );
}