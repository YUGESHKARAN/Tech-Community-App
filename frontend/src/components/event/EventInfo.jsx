import { motion } from "framer-motion";
import { TbAward, TbBuilding, TbMail } from "react-icons/tb";
import { themeRevealHint } from "../../utils/event/eventUtils";
import { revealProps } from "../../utils/event/motion";

const TIER_ORDER = ["title", "gold", "silver", "community"];
const TIER_LABEL = {
  title: "Title partner",
  gold: "Gold partner",
  silver: "Silver partner",
  community: "Community partner",
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

const fmtNum = (n) => new Intl.NumberFormat("en-IN").format(n);
const money = (n, currency = "INR") => (currency === "INR" ? `₹${fmtNum(n)}` : `${currency} ${fmtNum(n)}`);
const themeLabel = (t) => (typeof t === "string" ? t : t?.title || t?.name || "");
const safeUrl = (u) => (typeof u === "string" && /^https?:\/\//i.test(u) ? u : null);
const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

// Fades in when it scrolls into view. The scroll margin keeps the heading clear of the sticky tab bar.
function Section({ id, title, children }) {
  return (
    <motion.section
      id={id}
      {...revealProps}
      className="scroll-mt-40 rounded-2xl border border-white/[0.07] bg-[#13161b] p-5 md:p-6"
    >
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{title}</h2>
      {children}
    </motion.section>
  );
}

/**
 * Descriptive content for the event detail page. Each section id matches a
 * tab in buildSections, so the tab row and the page stay in step.
 * `winnersSlot` is rendered first, when results are published.
 */
export default function EventInfo({ event, partners = [], now, winnersSlot = null }) {
  const s = event.schedule;
  const isTeam = event.participation.type === "team";
  const revealed = new Date(s.themeRevealAt).getTime() <= now;
  const themes = (event.themes || []).map(themeLabel).filter(Boolean);

  const timeline = MILESTONES.map(([key, label]) => ({ key, label, at: s[key] }))
    .filter((m) => m.at && (m.key !== "teamFormationClosesAt" || isTeam))
    .sort((a, b) => new Date(a.at) - new Date(b.at));

  const partnerRows = partners
    .filter((p) => p.partnerId)
    .slice()
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));

  const prizes = event.prizes || [];
  const totalPrize = prizes.reduce(
    (sum, p) => (typeof p.amount === "number" && (!p.currency || p.currency === "INR") ? sum + p.amount : sum),
    0
  );

  const rubric = event.rubric || [];
  const links = (event.support?.links || []).map((l) => ({ ...l, href: safeUrl(l.url) })).filter((l) => l.href);
  const email = event.support?.contactEmail;

  return (
    <div className="space-y-6">
      {winnersSlot}

      {event.overview && (
        <Section id="overview" title="Overview">
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{event.overview}</p>
        </Section>
      )}

      <Section id="schedule" title="Schedule">
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

      <Section id="themes" title="Themes">
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

      {rubric.length > 0 && (
        <Section id="judging" title="Judging">
          <ul className="space-y-3">
            {rubric.map((r) => (
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
          {event.pointsPolicy && (
            <div className="mt-5 space-y-1 text-xs text-zinc-400">
              <p>Joining the event earns {event.pointsPolicy.participation} XP.</p>
              <p>Submitting a project earns {event.pointsPolicy.submission} XP.</p>
              {event.pointsPolicy.placeAwards?.length > 0 && (
                <p>
                  Placings earn{" "}
                  {event.pointsPolicy.placeAwards.map((a) => `${a.points} XP for #${a.rank}`).join(", ")}.
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      {prizes.length > 0 && (
        <Section id="prizes" title="Prizes">
          <p className="mb-4 text-sm text-zinc-400">
            {totalPrize > 0 ? `Compete for a ${money(totalPrize)} prize pool.` : "Prizes for the top placings."}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {prizes.map((p) => (
              <li key={p.rank} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0f1216] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                      <TbAward aria-hidden className="text-lg" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">#{p.rank}</p>
                      <p className="truncate text-sm font-semibold text-zinc-100">{p.title}</p>
                    </div>
                  </div>
                  {typeof p.amount === "number" && (
                    <span className="shrink-0 rounded-md bg-amber-400/15 px-2 py-1 text-xs font-semibold text-amber-200">
                      {money(p.amount, p.currency)}
                    </span>
                  )}
                </div>
                {p.description && <p className="text-xs leading-relaxed text-zinc-400">{p.description}</p>}
                {p.sponsor && (
                  <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <TbBuilding aria-hidden />
                    Sponsored by <span className="text-zinc-300">{p.sponsor}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {partnerRows.length > 0 && (
        <Section id="partners" title="Partners">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partnerRows.map((p) => {
              const name = p.partnerId.name;
              const site = safeUrl(p.partnerId.website);
              return (
                <li
                  key={p.partnerId._id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 border-t-2 border-t-emerald-500/60 bg-[#0f1216] p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm font-bold text-zinc-200">
                      {initials(name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-100">{name}</p>
                      <span className="mt-1 inline-block rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                        {TIER_LABEL[p.tier] || p.tier}
                      </span>
                    </div>
                  </div>
                  {site && (
                    <a
                      href={site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Visit website
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {event.eligibility && (
        <Section id="eligibility" title="Eligibility">
          <p className="whitespace-pre-line text-sm text-zinc-300">{event.eligibility}</p>
        </Section>
      )}

      {event.rules && (
        <Section id="rules" title="Rules">
          <p className="whitespace-pre-line text-sm text-zinc-300">{event.rules}</p>
        </Section>
      )}

      {event.faqs?.length > 0 && (
        <Section id="faqs" title="FAQs">
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

      {(email || links.length > 0) && (
        <Section id="support" title="Support">
          <div className="space-y-4">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-sm text-zinc-200 hover:text-emerald-300"
              >
                <TbMail aria-hidden className="text-zinc-400" />
                {email}
              </a>
            )}
            {links.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {links.map((l, i) => (
                  <li key={`${l.href}-${i}`}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-200 hover:bg-white/5"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}