import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TbMenu2, TbX } from "react-icons/tb";
import NavBar from "../../ui/NavBar";
import Footer from "../../ui/Footer";
import EventSidebar from "./EventSidebar";
import { DURATION, EASE, fadeUpProps } from "../../utils/event/motion";

/**
 * Layout for every events page. It uses the app's existing NavBar and Footer
 * around the events sidebar. On desktop the sidebar sits beside the page. On
 * mobile it opens as a drawer from the menu button.
 */
export default function EventsShell({ children }) {
  const [open, setOpen] = useState(false);

  // Close on Escape, and stop the page behind the drawer from scrolling.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1216] text-zinc-100">
      <NavBar />

      <div className="flex min-w-0 flex-1">
        {/* desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-white/[0.07] lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto p-4">
            <EventSidebar />
          </div>
        </aside>

        {/* mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="drawer"
              className="fixed inset-0 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION }}
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/60"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: DURATION, ease: EASE }}
                className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-white/10 bg-[#0f1216] p-4 shadow-2xl"
              >
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-white/10 p-1.5 text-zinc-200 hover:bg-white/5"
                  >
                    <TbX size={14} />
                  </button>
                </div>
                <EventSidebar onNavigate={() => setOpen(false)} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* mobile toolbar */}
                 <div
            data-events-mobile-toolbar
            className="sticky top-0 z-30 flex items-center gap-3 bg-[#0f1216]/95 px-4 py-2 backdrop-blur lg:hidden"
          >
            <button
              type="button"
              aria-label="Open events menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="rounded-md border border-white/10 p-1.5 text-zinc-200 hover:bg-white/5"
            >
              <TbMenu2 size={12} />
            </button>
            <span className="text-sm font-semibold">Events</span>
          </div>

          <motion.main className="min-w-0 flex-1" {...fadeUpProps}>
            {children}
          </motion.main>
        </div>
      </div>

      <Footer />
    </div>
  );
}