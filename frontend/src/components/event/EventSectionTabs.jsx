/**
 * The sections a given event shows, in page order. Only sections with content
 * appear, so the tab row matches the page.
 */
export function buildSections({ event, partners = [], resultsOut }) {
  const partnerRows = partners.filter((p) => p.partnerId);
  const links = event.support?.links || [];
  const all = [
    { id: "winners", label: "Winners", show: resultsOut },
    { id: "overview", label: "Overview", show: Boolean(event.overview) },
    { id: "schedule", label: "Schedule", show: true },
    { id: "themes", label: "Themes", show: true },
    { id: "judging", label: "Judging", show: (event.rubric?.length ?? 0) > 0 },
    { id: "prizes", label: "Prizes", show: (event.prizes?.length ?? 0) > 0 },
    { id: "partners", label: "Partners", show: partnerRows.length > 0 },
    { id: "eligibility", label: "Eligibility", show: Boolean(event.eligibility) },
    { id: "rules", label: "Rules", show: Boolean(event.rules) },
    { id: "faqs", label: "FAQs", show: (event.faqs?.length ?? 0) > 0 },
    { id: "support", label: "Support", show: Boolean(event.support?.contactEmail || links.length) },
  ];
  return all.filter((s) => s.show);
}

/**
 * Sticky section tab bar. It sticks `top` px from the top of the viewport
 * (the page measures the navbar's bottom edge for this). The active tab is
 * set by the page's scroll-spy. Render it directly inside the page container,
 * not inside a wrapper, so it can stick for the whole page.
 */
export default function EventSectionTabs({ sections, active, onJump, top = 0 }) {
  return (
    <nav
      aria-label="Event sections"
      style={{ top }}
      className="sticky z-30 mt-1 md:mt-8 -mx-3 border-b md:border-white/[0.08] border-white/[0.07] bg-[#0f1216]/95 backdrop-blur md:-mx-2.5"
    >
      <ul className="flex gap-1 overflow-x-auto px-3 py-3 md:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onJump(s.id)}
                aria-current={on ? "true" : undefined}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  on ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                {s.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}