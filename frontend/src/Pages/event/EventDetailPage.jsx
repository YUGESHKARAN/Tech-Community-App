import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import useEventDetail from "../../hooks/event/useEventDetail";
import EventsShell from "../../components/event/EventsShell";
import EventActionPanel from "../../components/event/EventActionPanel";
import EventInfo from "../../components/event/EventInfo";
import { CATEGORY_LABEL, fmtDay, getBadge, useNow, xpLabel, BADGE_TONES } from "../../utils/event/eventUtils";
import { DURATION, EASE, fadeUpProps } from "../../utils/event/motion";

const S3 = "https://open-access-blog-image.s3.us-east-1.amazonaws.com/";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const now = useNow();
  const d = useEventDetail(eventId);

  if (d.loading) {
    return (
      <EventsShell>
        <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-8 md:py-8" aria-busy="true">
          <div className="h-56 animate-pulse rounded-2xl bg-white/5 md:h-72" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
          </div>
        </div>
      </EventsShell>
    );
  }

  if (d.error || !d.event) {
    return (
      <EventsShell>
        <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-4 px-4 py-20 text-center text-zinc-100">
          <p role="alert" className="text-sm text-red-300">
            {d.error || "This event could not be found."}
          </p>
          <Link to="/events" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/5">
            Back to events
          </Link>
        </div>
      </EventsShell>
    );
  }

  const { event, partners, me, teamDetail, actions, busy, actionError } = d;
  const isTeam = event.participation.type === "team";
  const teamSize = event.participation.teamSize;
  const badge = getBadge({ ...event, myRegistration: me.registration });

  return (
    <EventsShell>
      <div className="mx-auto w-full max-w-[1200px] min-w-0 px-4 py-6 text-zinc-100 md:px-8 md:py-8">
        <button
          type="button"
          onClick={() => navigate("/events")}
          className="mb-5 text-xs text-zinc-400 hover:text-zinc-200"
        >
          ← Back to events
        </button>

        <motion.header
          {...fadeUpProps}
          className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f1216]"
        >
          {event.coverKey ? (
            <img src={`${S3}${event.coverKey}`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_60%)]"
            />
          )}
          <div className="relative space-y-4 p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
                {CATEGORY_LABEL[event.category]}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${BADGE_TONES[badge.tone]}`}
              >
                {badge.label}
              </span>
            </div>
            <h1 className="break-words text-3xl font-black leading-tight tracking-tight md:text-5xl">
              {event.title}
            </h1>
            {event.tagline && <p className="text-sm text-zinc-300">{event.tagline}</p>}
            <p className="text-sm text-zinc-400">
              {fmtDay(event.schedule.eventStartsAt)} – {fmtDay(event.schedule.eventEndsAt)}
              {" • "}
              {event.venue || "Venue to be announced"}
              {" • "}
              {isTeam ? `Team of ${teamSize.min}–${teamSize.max}` : "Individual"}
              {" • "}
              <span className="text-emerald-400">{xpLabel(event)}</span>
            </p>
          </div>
        </motion.header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <motion.aside
            {...fadeUpProps}
            transition={{ duration: DURATION, ease: EASE, delay: 0.1 }}
            className="order-1 min-w-0 lg:sticky lg:top-6 lg:order-2 lg:self-start"
          >
            <EventActionPanel
              event={event}
              me={me}
              teamDetail={teamDetail}
              actions={actions}
              busy={busy}
              actionError={actionError}
              now={now}
            />
          </motion.aside>

          <motion.div
            {...fadeUpProps}
            transition={{ duration: DURATION, ease: EASE, delay: 0.05 }}
            className="order-2 min-w-0 lg:order-1"
          >
            <EventInfo event={event} partners={partners} now={now} />
          </motion.div>
        </div>
      </div>
    </EventsShell>
  );
}