import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { TbAward, TbBuilding, TbCalendarEvent, TbUsers } from "react-icons/tb";
import useEventDetail from "../../hooks/event/useEventDetail";
import EventsShell from "../../components/event/EventsShell";
import EventActionPanel from "../../components/event/EventActionPanel";
import EventInfo from "../../components/event/EventInfo";
import EventStatsCard from "../../components/event/EventStatsCard";
import EventStickyBar from "../../components/event/EventStickyBar";
import EventSectionTabs, { buildSections } from "../../components/event/EventSectionTabs";
import EventWinners from "../../components/event/EventWinners";
import { BADGE_TONES, CATEGORY_LABEL, fmtDay, getBadge, useNow, xpLabel } from "../../utils/event/eventUtils";
import { fadeUpProps } from "../../utils/event/motion";
import { posterUrl } from "../../utils/event/poster";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const d = useEventDetail(eventId);

  if (d.loading) {
    return (
      <EventsShell>
        <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-8 md:py-8" aria-busy="true">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="h-56 animate-pulse rounded-2xl bg-white/5 md:h-72" />
            <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />
          </div>
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
        <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-4 px-4  text-center text-zinc-100">
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

  return (
    <EventsShell>
      <EventDetailContent key={eventId} d={d} />
    </EventsShell>
  );
}

/** Mounted only once the event has loaded, so its hooks run unconditionally. */
function EventDetailContent({ d }) {
  const navigate = useNavigate();
  const now = useNow();
  const { event, partners, me, teamDetail, actions, busy, actionError } = d;
  const s = event.schedule;
  const isTeam = event.participation.type === "team";
  const teamSize = event.participation.teamSize;
  const poster = posterUrl(event);
  const badge = getBadge({ ...event, myRegistration: me.registration });
  const resultsOut = Boolean(event.resultsPublishedAt);
  const dateText = `${fmtDay(s.eventStartsAt)} – ${fmtDay(s.eventEndsAt)}`;

  const sections = buildSections({ event, partners, resultsOut });
  const sectionIds = sections.map((x) => x.id).join(",");
  const [active, setActive] = useState("");

  // On mobile, keep the tab bar directly below the sticky events toolbar.
  const [stickyTop, setStickyTop] = useState(0);
  useEffect(() => {
    const measure = () => {
      const toolbar = document.querySelector("[data-events-mobile-toolbar]");
      setStickyTop(toolbar ? Math.round(toolbar.getBoundingClientRect().height) : 0);
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Scroll-spy: the active tab is the last section whose top has passed the tab bar.
  useEffect(() => {
    const ids = sectionIds ? sectionIds.split(",") : [];
    if (ids.length === 0) return undefined;
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= stickyTop + 180) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds, stickyTop]);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  // Main action, used by the mobile bottom bar. Same rules as the action panel.
  const start = new Date(s.eventStartsAt).getTime();
  const submissionDeadline = new Date(s.submissionDeadlineAt).getTime();
  const canRegister = !me.registration && event.status === "registration_open";
  const canSubmit =
    Boolean(me.team?.isLead) && me.team?.status === "locked" && now >= start && now < submissionDeadline;

  let primary;
  if (canRegister) {
    primary = { label: "Register", onClick: actions.register, disabled: busy };
  } else if (canSubmit) {
    primary = { label: "Submit project", to: `/events/${event._id}/submission` };
  } else if (resultsOut) {
    primary = { label: "View results", to: `/events/${event._id}/results` };
  } else {
    primary = { label: me.registration ? "Registered" : badge.label, disabled: true };
  }

  const gridStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
  backgroundSize: "36px 36px",
  maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
};

  return (
    <div className="mx-auto w-full px-3 p-2 pb-28 lg:pb-2 text-zinc-100">
      {/* <button
        type="button"
        onClick={() => navigate("/events")}
        className="mb-5 text-xs text-zinc-400 hover:text-zinc-200"
      >
        ← Back to events
      </button> */}

      <motion.header
        {...fadeUpProps}
        className="relative overflow-hidden  bg-[#0f1216] grid items-center gap-4 md:gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
      >
        {/* Faint emerald tech grid, fading out towards the bottom-right. */}
         <div aria-hidden className="pointer-events-none absolute inset-0" style={gridStyle} />
        <div className="relative min-w-0 space-y-4">
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
          <h1 className="break-words text-3xl font-black leading-tight tracking-tight md:text-5xl">{event.title}</h1>
          {event.tagline && <p className="text-base text-zinc-300">{event.tagline}</p>}
          <ul className="flex flex-wrap gap-2 text-xs text-zinc-300">
            <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
              <TbCalendarEvent aria-hidden className="text-zinc-400" />
              {dateText}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
              <TbBuilding aria-hidden className="text-zinc-400" />
              {event.venue || "Venue to be announced"}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
              <TbUsers aria-hidden className="text-zinc-400" />
              {isTeam && teamSize ? `Team of ${teamSize.min}–${teamSize.max}` : "Individual"}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-emerald-400">
              <TbAward aria-hidden />
              {xpLabel(event)}
            </li>
          </ul>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-xl md:rounded-2xl border border-white/[0.07] bg-[#13161b]">
          {poster ? (
            <img src={poster} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_60%)] text-sm text-zinc-600"
            >
              Poster coming soon
            </div>
          )}
        </div>
      </motion.header>

      <EventSectionTabs
        sections={sections}
        active={active || sections[0]?.id}
        onJump={jump}
        top={stickyTop}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <aside className="order-1 min-w-0 lg:sticky lg:top-32 lg:order-2 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
          <div className="space-y-4">
            <EventStatsCard event={event} />
            <EventActionPanel
              event={event}
              me={me}
              teamDetail={teamDetail}
              actions={actions}
              busy={busy}
              actionError={actionError}
              now={now}
            />
          </div>
        </aside>

        <div className="order-2 min-w-0 lg:order-1">
          <EventInfo
            event={event}
            partners={partners}
            now={now}
            winnersSlot={resultsOut ? <EventWinners eventId={event._id} /> : null}
          />
        </div>
      </div>

      <EventStickyBar dateText={dateText} primary={primary} />
    </div>
  );
}