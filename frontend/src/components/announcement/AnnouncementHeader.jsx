import React, { useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import formatCount from "../../utils/NumberConversion";

const EASE = [0.22, 1, 0.36, 1];

/* Inline figure: "3 Inbox". Markup stays a valid dt/dd pair; the row is
   reversed visually so the number leads. */
function Stat({ label, value, divided }) {
  return (
    <div
      className={`flex flex-row-reverse items-baseline justify-end gap-1.5 ${
        divided ? "md:border-l border-white/10 pl-5" : ""
      }`}
    >
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="md:text-sm text-xs font-semibold tabular-nums leading-none text-white">
        {value}
      </dd>
    </div>
  );
}

/**
 * Announcements header.
 * Desktop: title + role on the left, figures and actions on the right.
 * Mobile: title and actions on the first line, figures on the second.
 * `children` (search / filter bar) sits below a hairline divider.
 */
function AnnouncementHeader({
  role,
  announcements = [],
  onClearAll,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* Close the menu on outside click / Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const total = announcements.length;

  /* Announcements from the last 7 calendar days (incl. today) */
  const lastWeek = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return announcements.filter((a) => {
      const t = Date.parse(a.timestamp);
      return !Number.isNaN(t) && t >= start.getTime();
    }).length;
  }, [announcements]);

  const canClearAll = total > 1 && typeof onClearAll === "function";

  return (
    <section
      aria-label="Announcements overview"
      className="rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 md:px-5 md:py-4"
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 md:gap-x-6 gap-y-2 md:gap-y-3 md:grid-cols-[1fr_auto_auto]">
        {/* Title + role */}
        <div className="order-1 flex min-w-0 items-center md:justify-start justify-between gap-2.5">
          <h2 className="truncate text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-semibold">
            
           Overview
          </h2>
          {role && (
            <span className="shrink-0 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] capitalize text-slate-300">
              {role}
            </span>
          )}
        </div>

        {/* Figures */}
        <dl className="order-3 col-span-2 flex items-baseline gap-5 md:order-2 md:col-span-1">
          <Stat label="in inbox" value={formatCount(total)} />
          <Stat label="last 7 days" value={formatCount(lastWeek)} />
          
        </dl>
        

        {/* Actions */}
        <div className="order-2 flex items-center justify-end md:order-3">
          {canClearAll && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className="flex md:h-8 h-7 w-8 md:w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
              >
                <HiOutlineDotsHorizontal className="text-lg" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    className="absolute right-0 top-full z-20 mt-1.5 w-48 md:w-56 rounded-lg border border-white/[0.08] bg-[#0d1017] p-1 shadow-xl shadow-black/40"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onClearAll();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 md:py-2 text-left text-[11px] md:text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    >
                      <RiDeleteBin6Line className="md:text-sm text-xs" />
                      Clear all announcements
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Search + filters */}
      {children && (
        <div className="mt-3.5 ">
          {children}
        </div>
      )}
    </section>
  );
}

export default AnnouncementHeader;