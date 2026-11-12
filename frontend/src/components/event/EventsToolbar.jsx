import { useState } from "react";
import { TbArrowsSort, TbCheck, TbChevronDown, TbFilter } from "react-icons/tb";
import { DATE_OPTIONS, PARTICIPATION_OPTIONS, STATUS_OPTIONS } from "../../utils/event/browse";

const pill = (active) =>
  `shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
    active
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
      : "border-white/10 text-zinc-300 hover:bg-white/5"
  }`;

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Category tabs, sort button, filter button and the filter panel. Sorting
 * cycles on each click. Filters apply as soon as they are picked.
 */
export default function EventsToolbar({
  tabs,
  counts,
  tab,
  onTab,
  sorts,
  sortIndex,
  onCycleSort,
  shown,
  filters,
  onFiltersChange,
  filterCount,
  panelOpen,
  onTogglePanel,
  onResetFilters,
}) {
  const sort = sorts[sortIndex];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#13161b] p-3 md:p-4">
      <div className="flex items gap-3 justify-between flex-row flex-wrap items-center md:gap-2">
        {/* Mobile: the category is a dropdown. */}
        <TabSelect tabs={tabs} tab={tab} onTab={onTab} />

        {/* Desktop: category pills. */}
        <div className="hidden min-w-0 gap-2 overflow-x-auto md:flex md:flex-1">

          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={tab === t.key}
              onClick={() => onTab(t.key)}
              className={pill(tab === t.key)}
            >
              {t.label}
              <span className="ml-1.5 text-zinc-500">{counts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 md:ml-0">
          <button
            type="button"
            onClick={onCycleSort}
            aria-label={`Sort: ${sort.label}. Click to change.`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
          >
            <TbArrowsSort aria-hidden />
            {sort.label}
          </button>
          <button
            type="button"
            aria-expanded={panelOpen}
            onClick={onTogglePanel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
          >
            <TbFilter aria-hidden />
            Filters
            {filterCount > 0 && (
              <span className="rounded bg-emerald-500 px-1.5 text-[10px] font-semibold text-zinc-950">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{plural(shown, "program")}</span>
        {filterCount > 0 && (
          <button type="button" onClick={onResetFilters} className="text-emerald-400 hover:underline">
            Reset filters
          </button>
        )}
      </div>

      {panelOpen && (
        <div className="mt-4 grid gap-5 border-t border-white/[0.07] pt-4 md:grid-cols-3">
          <FilterGroup
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(v) => onFiltersChange({ ...filters, status: v })}
          />
          <FilterGroup
            label="Participation"
            options={PARTICIPATION_OPTIONS}
            value={filters.participation}
            onChange={(v) => onFiltersChange({ ...filters, participation: v })}
          />
          <FilterGroup
            label="Date"
            options={DATE_OPTIONS}
            value={filters.date}
            onChange={(v) => onFiltersChange({ ...filters, date: v })}
          />
        </div>
      )}
    </div>
  );
}

/** Mobile category picker: a button showing the current category, with a list below it. */
function TabSelect({ tabs, tab, onTab }) {
  const [open, setOpen] = useState(false);
  const current = tabs.find((t) => t.key === tab) ?? tabs[0];
  const pick = (key) => {
    onTab(key);
    setOpen(false);
  };

  return (
    <div className="relative md:hidden">
      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-10 cursor-default"
        />
      )}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative z-20 flex w-full items-center text-xs md:text-sm justify-between rounded-lg border border-white/10 bg-[#0f1216] px-3 py-2.5 text-sm text-zinc-100"
      >
        {current.label}
        <TbChevronDown
          aria-hidden
          className={`text-zinc-400 ml-1 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Category"
          className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#13161b] py-1 shadow-xl"
        >
          {tabs.map((t) => {
            const active = t.key === current.key;
            return (
              <li key={t.key} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => pick(t.key)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs md:text-sm ${
                    active ? "bg-white/5 text-emerald-300" : "text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  {t.label}
                  {active && <TbCheck aria-hidden className="text-emerald-400" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={value === o.key}
            onClick={() => onChange(o.key)}
            className={pill(value === o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}