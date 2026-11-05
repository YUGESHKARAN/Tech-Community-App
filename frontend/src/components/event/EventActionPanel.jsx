import { Link } from "react-router-dom";
import TeamPanel from "./TeamPanel";
import { BADGE_TONES, fmtDay, getBadge } from "../../utils/event/eventUtils";

const BTN_PRIMARY =
  "w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-zinc-500 disabled:cursor-not-allowed";
const BTN_GHOST =
  "w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed";
const LINK =
  "flex items-center justify-between rounded-lg border border-white/[0.07] px-3 py-2.5 text-sm text-zinc-200 hover:border-white/15 hover:bg-white/[0.03]";

const STATUS_LINE = {
  upcoming: (e) => `Registration opens ${fmtDay(e.schedule.registrationOpensAt)}`,
  registration_open: () => "Registration is open",
  registration_closed: () => "Registration is closed",
  live: () => "The event is live",
  judging: () => "Judging in progress",
  ended: () => "The event has ended",
  cancelled: () => "This event was cancelled",
};

/**
 * Sidebar on the event detail page. Shows the user's status, registration
 * controls, the team panel for team events, and links to the next step.
 */
export default function EventActionPanel({ event, me, teamDetail, actions, busy, actionError, now }) {
  const isTeam = event.participation.type === "team";
  const reg = me.registration;
  const team = me.team;
  const s = event.schedule;
  const start = new Date(s.eventStartsAt).getTime();
  const submissionDeadline = new Date(s.submissionDeadlineAt).getTime();

  const badge = getBadge({ ...event, myRegistration: reg });
  const canRegister = !reg && event.status === "registration_open";
  const canWithdraw = Boolean(reg) && !team && now < start;
  const canSubmit =
    Boolean(team?.isLead) && team?.status === "locked" && now >= start && now < submissionDeadline;
  const showJudging = me.isOrganizer || (me.isJudge && event.status === "judging");
  const resultsOut = Boolean(event.resultsPublishedAt);

  const statusText = reg
    ? isTeam
      ? team
        ? `${team.name} · ${team.status}`
        : "Registered · no team yet"
      : "You're registered"
    : STATUS_LINE[event.status]?.(event) || "";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.07] bg-[#13161b] p-5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${BADGE_TONES[badge.tone]}`}
        >
          {badge.label}
        </span>
        <p className="mt-3 text-sm text-zinc-300">{statusText}</p>

        {canRegister && (
          <>
            <button type="button" disabled={busy} onClick={actions.register} className={`mt-4 ${BTN_PRIMARY}`}>
              Register
            </button>
            {isTeam && (
              <p className="mt-2 text-xs text-zinc-500">
                This is a team event. You'll create or join a team after registering.
              </p>
            )}
          </>
        )}

        {canWithdraw && (
          <button type="button" disabled={busy} onClick={actions.withdraw} className={`mt-3 ${BTN_GHOST}`}>
            Withdraw registration
          </button>
        )}

        {actionError && (
          <p role="alert" className="mt-3 text-xs text-red-400">
            {actionError}
          </p>
        )}
      </div>

      {reg && isTeam && (
        <TeamPanel event={event} me={me} teamDetail={teamDetail} actions={actions} busy={busy} />
      )}

      {(canSubmit || showJudging || resultsOut || me.isOrganizer) && (
        <div className="space-y-2 rounded-2xl border border-white/[0.07] bg-[#13161b] p-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Next steps</h3>
          {canSubmit && (
            <Link to={`/events/${event._id}/submission`} className={LINK}>
              Submit project <span aria-hidden>→</span>
            </Link>
          )}
          {showJudging && (
            <Link to={`/events/${event._id}/judging`} className={LINK}>
              Judging console <span aria-hidden>→</span>
            </Link>
          )}
          {resultsOut && (
            <Link to={`/events/${event._id}/results`} className={LINK}>
              View results <span aria-hidden>→</span>
            </Link>
          )}
          {me.isOrganizer && (
            <Link to={`/manage/events/${event._id}`} className={LINK}>
              Manage event <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}