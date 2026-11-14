import { fmtDay, seatsLeft, xpLabel } from "../../utils/event/eventUtils";

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-right text-sm text-zinc-100">{value}</dd>
    </div>
  );
}

/** Right-hand stats card on the detail page: team, prizes, registrations and dates. */
export default function EventStatsCard({ event }) {
  const s = event.schedule;
  const isTeam = event.participation.type === "team";
  const size = event.participation.teamSize;
  const total = (event.prizes || []).reduce(
    (sum, p) => (typeof p.amount === "number" && (!p.currency || p.currency === "INR") ? sum + p.amount : sum),
    0
  );
  const seats = seatsLeft(event);
  const registered = event.counters?.registrationCount ?? 0;

  return (
    <div className="rounded-lg md:rounded-xl border border-white/[0.07] bg-[#13161b] p-5">
      <dl className="divide-y divide-white/[0.07]">
        <Row label="Team size" value={isTeam && size ? `${size.min} – ${size.max} members` : "Individual"} />
        {total > 0 && <Row label="Total prizes" value={`₹${fmt(total)}`} />}
        <Row label="Registrations" value={fmt(registered)} />
        {seats !== null && <Row label="Seats left" value={`${seats} of ${event.capacity.maxParticipants}`} />}
        <Row label="XP reward" value={<span className="text-emerald-400">{xpLabel(event)}</span>} />
        <Row label="Registration closes" value={fmtDay(s.registrationClosesAt)} />
        <Row label="Starts" value={fmtDay(s.eventStartsAt)} />
        <Row label="Ends" value={fmtDay(s.eventEndsAt)} />
        <Row label="Venue" value={event.venue || "To be announced"} />
      </dl>
    </div>
  );
}