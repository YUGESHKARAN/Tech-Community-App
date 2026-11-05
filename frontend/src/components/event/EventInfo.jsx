import { themeRevealHint } from "../../utils/event/eventUtils";

const TIER_ORDER = ["title", "gold", "silver", "community"];
const TIER_LABEL = {
  title: "Title partner",
  gold: "Gold partners",
  silver: "Silver partners",
  community: "Community partners",
};

// Milestones shown in the timeline. Entries whose value is null are skipped.
const MILESTONES = [
  ["themeRevealAt", "Themes revealed"],
  ["registrationOpensAt", "Registration opens"],
  ["registrationClosesAt", "Registration closes"],
  ["teamFormationClosesAt", "Team formation closes"],
  ["eventStartsAt", "Event starts"],
  ["submissionDeadlineAt", "Submissions due"],
  ["judgingStartsAt", "Judging starts"],
  ["judgingEndsAt", "Judging ends"],
  ["resultsPublishAt", "Results published"],
];

const fmtDateTime = (t) =>
  new Date(t).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

const themeLabel = (t) => (typeof t === "string" ? t : t?.title || t?.name || "");

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#13161b] p-5 md:p-6">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Descriptive content for the event detail page: about, schedule, themes,
 * prizes, scoring, rules, FAQs, partners and support.
 */
export default function EventInfo({ event, partners = [], now }) {
  const s = event.schedule;
  const isTeam = event.participation.type === "team";
  const revealed = new Date(s.themeRevealAt).getTime() <= now;
  const themes = (event.themes || []).map(themeLabel).filter(Boolean);

  const timeline = MILESTONES.map(([key, label]) => ({ key, label, at: s[key] }))
    .filter((m) => m.at && (m.key !== "teamFormationClosesAt" || isTeam))
    .sort((a, b) => new Date(a.at) - new Date(b.at));

  const partnersByTier = TIER_ORDER.map((tier) => ({
    tier,
    items: partners.filter((p) => p.tier === tier && p.partnerId),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <Section title="About">
        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{event.overview}</p>
      </Section>

      <Section title="Schedule">
        <ol className="relative space-y-4 border-l border-white/10 pl-5">
          {timeline.map((m) => {
            const passed = new Date(m.at).getTime() <= now;
            return (
              <li key={m.key} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ${
                    passed ? "bg-emerald-400" : "bg-white/20"
                  }`}
                />
                <p className={`text-sm ${passed ? "text-zinc-400" : "text-zinc-100"}`}>{m.label}</p>
                <p className="text-xs text-zinc-500">{fmtDateTime(m.at)}</p>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section title="Themes">
        {revealed && themes.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <li key={t} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                {t}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-200">{themeRevealHint(event, now)}</p>
            <p className="mt-1 text-xs text-zinc-500">Reveal time: {fmtDateTime(s.themeRevealAt)}</p>
          </div>
        )}
      </Section>

      {event.prizes?.length > 0 && (
        <Section title="Prizes">
          <ul className="space-y-3">
            {event.prizes.map((p) => (
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
        </Section>
      )}

      {(event.rubric?.length > 0 || event.pointsPolicy) && (
        <Section title="Scoring">
          {event.rubric?.length > 0 && (
            <ul className="space-y-3">
              {event.rubric.map((r) => (
                <li key={r.key}>
                  <div className="mb-1 flex justify-between text-xs text-zinc-300">
                    <span>{r.label}</span>
                    <span className="text-zinc-500">{r.weight}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${r.weight}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {event.pointsPolicy && (
            <div className="mt-5 space-y-1 text-xs text-zinc-400">
              <p>Joining the event earns {event.pointsPolicy.participation} XP.</p>
              <p>Submitting a project earns {event.pointsPolicy.submission} XP.</p>
              {event.pointsPolicy.placeAwards?.length > 0 && (
                <p>
                  Placings earn{" "}
                  {event.pointsPolicy.placeAwards
                    .map((a) => `${a.points} XP for #${a.rank}`)
                    .join(", ")}
                  .
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      {event.eligibility && (
        <Section title="Eligibility">
          <p className="whitespace-pre-line text-sm text-zinc-300">{event.eligibility}</p>
        </Section>
      )}

      {event.rules && (
        <Section title="Rules">
          <p className="whitespace-pre-line text-sm text-zinc-300">{event.rules}</p>
        </Section>
      )}

      {event.faqs?.length > 0 && (
        <Section title="FAQ">
          <div className="divide-y divide-white/[0.07]">
            {event.faqs.map((f, i) => (
              <details key={i} className="group py-3 first:pt-0 last:pb-0">
                <summary className="cursor-pointer list-none text-sm font-medium text-zinc-100 marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.question}
                    <span aria-hidden className="text-zinc-500 transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-2 text-sm text-zinc-400">{f.answer}</p>
              </details>
            ))}
          </div>
        </Section>
      )}

      {partnersByTier.length > 0 && (
        <Section title="Partners">
          <div className="space-y-5">
            {partnersByTier.map((g) => (
              <div key={g.tier}>
                <p className="mb-2 text-xs text-zinc-500">{TIER_LABEL[g.tier]}</p>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((p) => (
                    <li key={p.partnerId._id}>
                      {p.partnerId.website ? (
                        <a
                          href={p.partnerId.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
                        >
                          {p.partnerId.name}
                        </a>
                      ) : (
                        <span className="inline-block rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200">
                          {p.partnerId.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {event.support?.contactEmail && (
        <Section title="Support">
          <p className="text-sm text-zinc-300">
            Questions about this event?{" "}
            <a href={`mailto:${event.support.contactEmail}`} className="text-emerald-400 hover:underline">
              {event.support.contactEmail}
            </a>
          </p>
        </Section>
      )}
    </div>
  );
}