/** Top three prizes for the detail page's right-hand card. Renders nothing when there are no prizes. */
export default function EventPrizePool({ prizes = [] }) {
  if (!prizes.length) return null;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#13161b] p-5">
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Prize pool</h3>
      <ul className="space-y-3">
        {prizes.slice(0, 3).map((p) => (
          <li key={p.rank} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-bold text-zinc-200">
              {p.rank}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100">{p.title}</p>
              {p.description && <p className="text-xs text-zinc-500">{p.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}