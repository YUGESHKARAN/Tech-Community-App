import axiosInstance from "../instances/Axiosinstances";
import { MOCK_EVENTS } from "../data/mockEvents";

// Flip to false once the /bytes/manage/events endpoints are live.
const USE_MOCK = true;
const BASE = "/bytes/manage/events";

const ME = "me";
const HOUR = 3600000;
const TEAM = { min: 2, max: 4 };
const iso = (t) => new Date(t).toISOString();

/** Reads the message from an axios error, or from a mock error. */
export const apiError = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";

// ── real API ─────────────────────────────────────────────────────────────────

const real = {
  getEvent: async (id) => (await axiosInstance.get(`${BASE}/${id}`)).data,
  getMyStatus: async (id) => (await axiosInstance.get(`${BASE}/${id}/me`)).data,
  getResults: async (id) => (await axiosInstance.get(`${BASE}/${id}/results`)).data,
  register: (id) => axiosInstance.post(`${BASE}/${id}/register`),
  withdraw: (id) => axiosInstance.delete(`${BASE}/${id}/register`),
  createTeam: (id, name) => axiosInstance.post(`${BASE}/${id}/teams`, { name }),
  getTeam: async (teamId) => (await axiosInstance.get(`${BASE}/teams/${teamId}`)).data,
  inviteToTeam: (teamId, email) => axiosInstance.post(`${BASE}/teams/${teamId}/invites`, { email }),
  respondInvite: (inviteId, accept) =>
    axiosInstance.post(`${BASE}/invites/${inviteId}/respond`, { accept }),
  revokeInvite: (inviteId) => axiosInstance.delete(`${BASE}/invites/${inviteId}`),
  leaveTeam: (teamId) => axiosInstance.post(`${BASE}/teams/${teamId}/leave`),
  lockTeam: (teamId) => axiosInstance.post(`${BASE}/teams/${teamId}/lock`),
  disbandTeam: (teamId) => axiosInstance.delete(`${BASE}/teams/${teamId}`),
};

// ── mock backend (in memory, resets on reload) ───────────────────────────────

const wait = () => new Promise((r) => setTimeout(r, 250));

const fail = (status, message) => {
  const err = new Error(message);
  err.response = { status, data: { message } };
  throw err;
};

const db = { regs: {}, teams: {}, invites: [] };
let seeded = false;

const seed = () => {
  if (seeded) return;
  seeded = true;
  for (const ev of MOCK_EVENTS) {
    if (ev.myRegistration) {
      db.regs[ev._id] = {
        status: ev.participation.type === "team" ? "pending_team" : "confirmed",
        role: "participant",
        teamId: null,
      };
    }
  }
  // A team that has invited the current user.
  db.teams.team_kernel = {
    _id: "team_kernel",
    eventId: "ev_build_night",
    name: "Kernel Rats",
    leadId: "ananya",
    status: "forming",
    memberIds: ["ananya"],
    memberNames: { ananya: "Ananya R." },
  };
  db.invites.push({
    _id: "inv_kernel",
    teamId: "team_kernel",
    eventId: "ev_build_night",
    status: "pending",
    invitedBy: "Ananya R.",
    invitedName: "You",
    expiresAt: iso(Date.now() + 40 * HOUR),
  });
};

const MOCK_PARTNERS = [
  { partnerId: { _id: "p1", name: "Bytes Core Engine", website: "https://bytesbase.tech" }, tier: "title", order: 0 },
  { partnerId: { _id: "p2", name: "CloudCredits", website: null }, tier: "gold", order: 1 },
  { partnerId: { _id: "p3", name: "DevTools Co.", website: null }, tier: "community", order: 2 },
];

const findEvent = (id) => {
  const ev = MOCK_EVENTS.find((e) => e._id === id);
  if (!ev) fail(404, "Event not found");
  return ev;
};

const teamSummary = (t) => ({
  _id: t._id,
  name: t.name,
  status: t.status,
  memberCount: t.memberIds.length,
  leadId: t.leadId,
  isLead: t.leadId === ME,
});

/** Adds the fields the detail page needs but the browse mock doesn't have. */
const enrich = (ev) => {
  const end = new Date(ev.schedule.eventEndsAt).getTime();
  const isTeam = ev.participation.type === "team";
  return {
    ...ev,
    overview: ev.overview,
    participation: { ...ev.participation, teamSize: isTeam ? TEAM : { min: 1, max: 1 } },
    schedule: {
      ...ev.schedule,
      teamFormationClosesAt: isTeam ? ev.schedule.registrationClosesAt : null,
      submissionDeadlineAt: iso(end - 2 * HOUR),
      judgingStartsAt: iso(end + 24 * HOUR),
      judgingEndsAt: iso(end + 72 * HOUR),
      resultsPublishAt: iso(end + 96 * HOUR),
    },
    prizes: ev.prizes ?? [
      { rank: 1, title: "Grand prize", description: "Cash award and a mentorship session" },
      { rank: 2, title: "Runner-up", description: "Cloud credits" },
      { rank: 3, title: "Third place", description: "Swag pack" },
    ],
    rubric: [
      { key: "innovation", label: "Innovation", weight: 30 },
      { key: "technical", label: "Technical depth", weight: 30 },
      { key: "impact", label: "Impact", weight: 25 },
      { key: "presentation", label: "Presentation", weight: 15 },
    ],
    rules: ev.rules ?? "Teams must build during the event window. All code must be original or properly licensed.",
    eligibility: ev.eligibility ?? "Open to all enrolled students of the institution.",
    faqs: ev.faqs ?? [
      { question: "Can I join after registering?", answer: "Yes. Accept an invite or create a team before the team formation deadline." },
      { question: "What do I submit?", answer: "A repository link, a demo link, a short summary, and optionally a presentation PDF." },
    ],
    support: ev.support ?? { contactEmail: "events@bytesbase.tech", chatUrl: null, links: [] },
    pointsPolicy: {
      participation: 10,
      submission: 20,
      placeAwards: [
        { rank: 1, points: 100 },
        { rank: 2, points: 70 },
        { rank: 3, points: 50 },
      ],
      defaultWinPoints: 20,
    },
    resultsPublishedAt: ev.status === "ended" ? iso(end + 96 * HOUR) : null,
  };
};

const mockApi = {
  getResults: async (id) => {
    seed();
    await wait();
    const ev = enrich(findEvent(id));
    if (!ev.resultsPublishedAt) fail(404, "Results are not published yet");
    const rows = [
      { rank: 1, team: "Team Nova", finalScore: 91.4, pointsAwarded: 100 },
      { rank: 2, team: "Byte Runners", finalScore: 88.1, pointsAwarded: 70 },
      { rank: 3, team: "Quantum Quill", finalScore: 84.9, pointsAwarded: 50 },
    ];
    return {
      results: rows
        .filter((r) => r.rank <= ev.prizes.length)
        .map((r) => ({ ...r, prizeTitle: ev.prizes.find((p) => p.rank === r.rank)?.title ?? null })),
    };
  },

  getEvent: async (id) => {
    seed();
    await wait();
    return { event: enrich(findEvent(id)), partners: MOCK_PARTNERS };
  },

  getMyStatus: async (id) => {
    seed();
    await wait();
    const ev = findEvent(id);
    const reg = db.regs[id] || null;
    const team = reg?.teamId ? db.teams[reg.teamId] : null;
    const pendingInvites = reg?.teamId
      ? []
      : db.invites
          .filter((i) => i.eventId === id && i.status === "pending" && i.invitedName === "You")
          .map((i) => ({
            _id: i._id,
            teamId: { _id: i.teamId, name: db.teams[i.teamId]?.name },
            invitedBy: { authorname: i.invitedBy },
            expiresAt: i.expiresAt,
          }));
    return {
      status: ev.status,
      registration: reg,
      team: team ? teamSummary(team) : null,
      isOrganizer: false,
      isJudge: false,
      pendingInvites,
    };
  },

  register: async (id) => {
    seed();
    await wait();
    const ev = findEvent(id);
    if (ev.status !== "registration_open") fail(409, "Registration is not open");
    if (db.regs[id]) fail(409, "Already registered for this event");
    const cap = ev.capacity?.maxParticipants;
    if (cap && ev.counters.registrationCount >= cap) fail(409, "Event is full");
    db.regs[id] = {
      status: ev.participation.type === "team" ? "pending_team" : "confirmed",
      role: "participant",
      teamId: null,
    };
    ev.counters.registrationCount += 1;
  },

  withdraw: async (id) => {
    seed();
    await wait();
    const reg = db.regs[id];
    if (!reg) fail(404, "Not registered");
    if (reg.teamId) fail(409, "Leave your team before withdrawing");
    delete db.regs[id];
    findEvent(id).counters.registrationCount -= 1;
  },

  createTeam: async (id, name) => {
    seed();
    await wait();
    const reg = db.regs[id];
    if (!reg) fail(409, "Register for this event first");
    if (reg.teamId) fail(409, "You are already in a team");
    if (!name?.trim()) fail(400, "Team name is required");
    const teamId = `team_${Date.now()}`;
    db.teams[teamId] = {
      _id: teamId,
      eventId: id,
      name: name.trim(),
      leadId: ME,
      status: "forming",
      memberIds: [ME],
      memberNames: {},
    };
    reg.teamId = teamId;
    reg.role = "lead";
  },

  getTeam: async (teamId) => {
    seed();
    await wait();
    const t = db.teams[teamId];
    if (!t) fail(404, "Team not found");
    const isLead = t.leadId === ME;
    const members = t.memberIds.map((m) => ({
      authorId: m,
      authorname: m === ME ? "You" : t.memberNames[m],
      role: m === t.leadId ? "lead" : "participant",
    }));
    const body = { team: teamSummary(t), members };
    if (isLead) {
      body.pendingInvites = db.invites
        .filter((i) => i.teamId === teamId && i.status === "pending")
        .map((i) => ({ _id: i._id, invitedAuthorId: { authorname: i.invitedName } }));
    }
    return body;
  },

  inviteToTeam: async (teamId, email) => {
    seed();
    await wait();
    const t = db.teams[teamId];
    if (!t || t.leadId !== ME) fail(403, "Only the lead can invite");
    if (t.status !== "forming") fail(409, "Team is locked");
    if (t.memberIds.length >= TEAM.max) fail(409, "Team is full");
    if (!email?.trim()) fail(400, "Email is required");
    db.invites.push({
      _id: `inv_${Date.now()}`,
      teamId,
      eventId: t.eventId,
      status: "pending",
      invitedBy: "You",
      invitedName: email.trim(),
      expiresAt: iso(Date.now() + 72 * HOUR),
    });
  },

  respondInvite: async (inviteId, accept) => {
    seed();
    await wait();
    const inv = db.invites.find((i) => i._id === inviteId);
    if (!inv || inv.status !== "pending") fail(404, "Invite not found");
    if (!accept) {
      inv.status = "declined";
      return;
    }
    const reg = db.regs[inv.eventId];
    if (!reg) fail(409, "Register for this event first");
    if (reg.teamId) fail(409, "You are already in a team for this event");
    const t = db.teams[inv.teamId];
    if (!t || t.status !== "forming") fail(409, "Team is locked");
    if (t.memberIds.length >= TEAM.max) fail(409, "Team is full");
    t.memberIds.push(ME);
    reg.teamId = t._id;
    inv.status = "accepted";
    db.invites.forEach((i) => {
      if (i.eventId === inv.eventId && i.status === "pending" && i._id !== inv._id) i.status = "revoked";
    });
  },

  revokeInvite: async (inviteId) => {
    seed();
    await wait();
    const inv = db.invites.find((i) => i._id === inviteId);
    if (!inv || inv.status !== "pending") fail(404, "Invite not found");
    inv.status = "revoked";
  },

  leaveTeam: async (teamId) => {
    seed();
    await wait();
    const t = db.teams[teamId];
    if (!t) fail(404, "Team not found");
    if (t.leadId === ME) fail(409, "The lead must disband the team instead");
    if (t.status !== "forming") fail(409, "Team is locked");
    t.memberIds = t.memberIds.filter((m) => m !== ME);
    const reg = db.regs[t.eventId];
    if (reg) {
      reg.teamId = null;
      reg.role = "participant";
    }
  },

  lockTeam: async (teamId) => {
    seed();
    await wait();
    const t = db.teams[teamId];
    if (!t || t.leadId !== ME) fail(403, "Only the lead can lock the team");
    if (t.status !== "forming") fail(409, "Team is already locked");
    if (t.memberIds.length < TEAM.min) fail(409, `Team needs at least ${TEAM.min} members`);
    t.status = "locked";
    const reg = db.regs[t.eventId];
    if (reg) reg.status = "confirmed";
    db.invites.forEach((i) => {
      if (i.teamId === teamId && i.status === "pending") i.status = "revoked";
    });
  },

  disbandTeam: async (teamId) => {
    seed();
    await wait();
    const t = db.teams[teamId];
    if (!t || t.leadId !== ME) fail(403, "Only the lead can disband");
    if (t.status !== "forming") fail(409, "Locked teams cannot be disbanded");
    delete db.teams[teamId];
    const reg = db.regs[t.eventId];
    if (reg) {
      reg.teamId = null;
      reg.role = "participant";
    }
    db.invites.forEach((i) => {
      if (i.teamId === teamId && i.status === "pending") i.status = "revoked";
    });
  },
};

export const eventsApi = USE_MOCK ? mockApi : real;