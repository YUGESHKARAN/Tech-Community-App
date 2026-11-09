import EventsShell from "../../components/event/EventsShell";

/**
 * Placeholder for sidebar sections that aren't built yet (My events, Judging,
 * Results, Manage). Each route gets its own title.
 */
export default function EventsSectionPage({ title, description }) {
  return (
    <EventsShell>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Events</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <p className="text-sm text-zinc-300">This section isn't built yet.</p>
          <p className="text-xs text-zinc-500">
            {description || "It will appear here once it is connected to the events API."}
          </p>
        </div>
      </div>
    </EventsShell>
  );
}