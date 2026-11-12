import { fmtDay, seatsLeft, xpLabel } from "../../utils/event/eventUtils";

const DEFAULT_TEAM = { min: 2, max: 4 };

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-right text-sm text-zinc-100">{value}</dd>
    </div>
  );
}

/** Dates, venue, participation, XP and seats for the detail page's right-hand card. */
export default function EventKeyInfo({ event }) {
  const s = event.schedule;
  const isTeam = event.participation.type === "team";
  const size = event.participation.teamSize || DEFAULT_TEAM;
  const seats = seatsLeft(event);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#13161b] p-5">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Key info</h3>
      <dl className="divide-y divide-white/[0.07]">
        <Row label="Starts" value={fmtDay(s.eventStartsAt)} />
        <Row label="Ends" value={fmtDay(s.eventEndsAt)} />
        <Row label="Registration closes" value={fmtDay(s.registrationClosesAt)} />
        <Row label="Venue" value={event.venue || "To be announced"} />
        <Row label="Participation" value={isTeam ? `Team of ${size.min}–${size.max}` : "Individual"} />
        <Row label="XP reward" value={<span className="text-emerald-400">{xpLabel(event)}</span>} />
        {seats !== null && (
          <Row label="Seats left" value={`${seats} of ${event.capacity.maxParticipants}`} />
        )}
      </dl>
    </div>
  );
}