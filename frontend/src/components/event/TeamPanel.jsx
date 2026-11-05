import { useState } from "react";
import { TbCrown } from "react-icons/tb";

const BTN_PRIMARY =
  "rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-zinc-500 disabled:cursor-not-allowed";
const BTN_GHOST =
  "rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed";
const BTN_DANGER =
  "rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed";
const INPUT =
  "min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0f1216] px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none";

/**
 * Team section of the action panel, for team events where the user is registered.
 *
 *   no team yet     → create a team, or accept or decline invites
 *   team, lead      → invite members, revoke invites, lock, disband
 *   team, member    → view members, leave while the team is forming
 */
export default function TeamPanel({ event, me, teamDetail, actions, busy }) {
  const size = event.participation.teamSize || { min: 2, max: 4 };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#13161b] p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Team</h3>
      {me.team ? (
        <TeamDetails team={me.team} teamDetail={teamDetail} size={size} actions={actions} busy={busy} />
      ) : (
        <NoTeam invites={me.pendingInvites || []} actions={actions} busy={busy} />
      )}
    </div>
  );
}

function NoTeam({ invites, actions, busy }) {
  const [name, setName] = useState("");

  return (
    <div className="mt-4 space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          actions.createTeam(name.trim());
          setName("");
        }}
      >
        <label htmlFor="team-name" className="text-xs text-zinc-400">
          Create a team
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="team-name"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className={INPUT}
          />
          <button type="submit" disabled={busy || !name.trim()} className={BTN_PRIMARY}>
            Create
          </button>
        </div>
      </form>

      {invites.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400">Invitations</p>
          <ul className="mt-2 space-y-2">
            {invites.map((inv) => (
              <li
                key={inv._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.07] p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-100">{inv.teamId?.name}</p>
                  <p className="text-xs text-zinc-500">from {inv.invitedBy?.authorname}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={busy} onClick={() => actions.respondInvite(inv._id, true)} className={BTN_PRIMARY}>
                    Accept
                  </button>
                  <button type="button" disabled={busy} onClick={() => actions.respondInvite(inv._id, false)} className={BTN_GHOST}>
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TeamDetails({ team, teamDetail, size, actions, busy }) {
  const [email, setEmail] = useState("");
  const members = teamDetail?.members || [];
  const pending = teamDetail?.pendingInvites || [];
  const forming = team.status === "forming";
  const full = team.memberCount >= size.max;
  const canLock = team.isLead && forming && team.memberCount >= size.min;

  return (
    <div className="mt-4 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate font-semibold text-zinc-100">{team.name}</p>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {team.status} · {team.memberCount}/{size.max}
        </span>
      </div>

      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.authorId} className="flex items-center gap-2 text-sm text-zinc-200">
            {m.role === "lead" && <TbCrown className="text-amber-300" aria-label="Team lead" />}
            <span className="truncate">{m.authorname}</span>
          </li>
        ))}
      </ul>

      {team.isLead && forming && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              actions.inviteToTeam(email.trim());
              setEmail("");
            }}
          >
            <label htmlFor="invite-email" className="text-xs text-zinc-400">
              Invite by university email
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dsuniversity.ac.in"
                disabled={full}
                className={INPUT}
              />
              <button type="submit" disabled={busy || full || !email.trim()} className={BTN_GHOST}>
                Invite
              </button>
            </div>
            {full && <p className="mt-2 text-xs text-zinc-500">The team is full.</p>}
          </form>

          {pending.length > 0 && (
            <ul className="space-y-2">
              {pending.map((inv) => (
                <li key={inv._id} className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                  <span className="truncate">Pending: {inv.invitedAuthorId?.authorname}</span>
                  <button type="button" disabled={busy} onClick={() => actions.revokeInvite(inv._id)} className="shrink-0 text-zinc-300 hover:text-white disabled:opacity-40">
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || !canLock} onClick={actions.lockTeam} className={BTN_PRIMARY}>
              Lock team
            </button>
            <button type="button" disabled={busy} onClick={actions.disbandTeam} className={BTN_DANGER}>
              Disband
            </button>
          </div>
          {!canLock && (
            <p className="text-xs text-zinc-500">Locking needs at least {size.min} members.</p>
          )}
        </>
      )}

      {!team.isLead && forming && (
        <button type="button" disabled={busy} onClick={actions.leaveTeam} className={BTN_GHOST}>
          Leave team
        </button>
      )}

      {!forming && (
        <p className="text-xs text-zinc-500">
          The team is locked. Its lead submits the project once the event starts.
        </p>
      )}
    </div>
  );
}