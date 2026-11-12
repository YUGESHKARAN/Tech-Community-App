// Mock data in the same shape as GET /bytes/manage/events and GET /bytes/manage/events/:id.
// Delete this file once the real endpoints are wired in.
// Dates are offset from "now" so the mock always shows live, upcoming, and past states.
// Events whose themes are not yet revealed have themes: [] and a future themeRevealAt,
// matching what the API returns to participants.
// Text is written to read like real event content. Contact details are placeholders.

const at = (hours) => new Date(Date.now() + hours * 3600000).toISOString();

export const MOCK_EVENTS = [
  {
    _id: "ev_hack_sprint",
    slug: "hack-sprint-2",
    title: "Hack Sprint 2.0",
    tagline: "36 hours. One team. One working prototype.",
    category: "hackathon",
    status: "registration_open",
    featured: true,
    organizer: "ACM Student Chapter",
    venue: "Main Auditorium",
    overview:
      "Hack Sprint 2.0 is a 36-hour buildathon for student teams. Teams of two to four design and build a working prototype around autonomous agent systems and infrastructure, then present it to a panel of judges.\n\nYou will get mentor office hours through the event, free cloud credits for the build, and a shared space for teams to work on through the night.",
    themes: [], // hidden until the reveal time
    rules:
      "Teams must be formed before the team formation deadline. All code must be written during the event window, and any open-source libraries used must be properly licensed and credited in the repository README.",
    eligibility: "Open to currently enrolled students. Each team needs between two and four members from the same institution.",
    faqs: [
      {
        question: "Do I need a team before I register?",
        answer: "No. Register first, then create a team or accept an invitation before the team formation deadline.",
      },
      {
        question: "What should I bring?",
        answer: "A laptop, a charger, and your student ID for check-in. Food and drinks are provided.",
      },
    ],
    prizes: [
      { rank: 1, title: "Grand prize", description: "Cash award and a mentorship session with an industry partner", amount: 125000, currency: "INR", sponsor: "Bytes Core Engine" },
      { rank: 2, title: "Runner-up", description: "Cloud credits for the next three months", amount: 75000, currency: "INR", sponsor: "CloudCredits" },
      { rank: 3, title: "Third place", description: "Swag pack and a featured spot on the chapter blog", amount: 25000, currency: "INR", sponsor: "DevTools Co." },
    ],
    xpReward: 500,
    participation: { type: "team" },
    capacity: { maxParticipants: 200 },
    counters: { registrationCount: 158 },
    myRegistration: null,
    schedule: {
      registrationOpensAt: at(-72),
      registrationClosesAt: at(20),
      eventStartsAt: at(30),
      eventEndsAt: at(66),
      themeRevealAt: at(24),
    },
  },
  {
    _id: "ev_code_clash",
    slug: "code-clash-14",
    title: "Code Clash #14",
    tagline: "Weekly contest. Live leaderboard. Ninety minutes.",
    category: "innovation_challenge",
    status: "live",
    featured: true,
    organizer: "Algorithms Club",
    venue: "Online",
    overview:
      "Code Clash is a weekly live contest. You solve a set of routing and graph problems against the clock, and your score updates on the leaderboard as you submit.\n\nThe problems range from shortest-path variants to network flow. Easier problems are worth fewer points, so attempt the ones you can solve first.",
    themes: ["Graphs", "Algorithms"],
    rules:
      "Individual entries only. Solutions must be written during the contest window. Using AI tools to generate solutions is not allowed.",
    eligibility: "Open to all students. No prior registration beyond the event page is needed while the contest is running.",
    faqs: [
      {
        question: "Which languages can I use?",
        answer: "Python, C++, Java, and JavaScript. The judge shows the supported versions on the submission page.",
      },
      {
        question: "Can I join late?",
        answer: "Yes, until the contest closes. Your score counts from the moment you submit your first correct answer.",
      },
    ],
    prizes: [
      { rank: 1, title: "Weekly champion", description: "Bonus XP and a spot on the monthly leaderboard" },
      { rank: 2, title: "Runner-up", description: "Bonus XP" },
      { rank: 3, title: "Third place", description: "Bonus XP" },
    ],
    xpReward: 250,
    participation: { type: "individual" },
    capacity: { maxParticipants: null },
    counters: { registrationCount: 148 },
    myRegistration: "confirmed",
    schedule: {
      registrationOpensAt: at(-96),
      registrationClosesAt: at(-1),
      eventStartsAt: at(-0.3),
      eventEndsAt: at(1.7),
      themeRevealAt: at(-96),
    },
  },
  {
    _id: "ev_build_night",
    slug: "build-night-systems",
    title: "Build Night: Systems",
    tagline: "Hands-on systems workshop in Rust",
    category: "hackathon",
    status: "registration_open",
    featured: true,
    organizer: "Systems Lab",
    venue: "Hardware Lab",
    overview:
      "Build Night is a hands-on evening workshop on systems programming. Teams work through kernel primitives and concurrency in Rust, building small components that run on real hardware.\n\nNo systems background is required. Mentors are available at every table, and the workshop ends with a short demo round.",
    themes: ["Rust", "Concurrency"],
    rules:
      "Teams of two or three. Use the lab machines or your own laptop with the provided toolchain. Projects should be finished and demonstrated before the workshop closes.",
    eligibility: "Open to students in their second year or above, or anyone with a basic programming background.",
    faqs: [
      {
        question: "Do I need Rust installed?",
        answer: "No. The lab machines have the toolchain set up. If you bring a laptop, install it from the workshop checklist beforehand.",
      },
      {
        question: "Is food provided?",
        answer: "Yes. Dinner is served at the start of the session.",
      },
    ],
    prizes: [
      { rank: 1, title: "Best build", description: "Hardware kit and a mentorship session" },
      { rank: 2, title: "Best explanation", description: "Book voucher" },
    ],
    xpReward: 200,
    participation: { type: "team" },
    capacity: { maxParticipants: 80 },
    counters: { registrationCount: 64 },
    myRegistration: "confirmed",
    schedule: {
      registrationOpensAt: at(-48),
      registrationClosesAt: at(40),
      eventStartsAt: at(52.3),
      eventEndsAt: at(60),
      themeRevealAt: at(-48),
    },
  },
  {
    _id: "ev_prompt_lab",
    slug: "prompt-lab-llm",
    title: "Prompt Lab LLM Workshop",
    tagline: "Measure what your language model actually does",
    category: "innovation_challenge",
    status: "registration_open",
    featured: false,
    organizer: "AI/ML Society",
    venue: "Online",
    overview:
      "Prompt Lab is a practical workshop on evaluating large language models. You will build a small evaluation suite, compare prompts and models on a shared benchmark, and run a simple fine-tuning loop.\n\nBy the end you will have a repeatable evaluation pipeline you can reuse on your own projects.",
    themes: ["LLMs", "Evaluation"],
    rules:
      "Individual participation. You may use any model API you have access to. Share your evaluation notebook at the end of the session.",
    eligibility: "Open to students with basic Python. Familiarity with machine learning is helpful but not required.",
    faqs: [
      {
        question: "Will API costs be covered?",
        answer: "A shared credit pool covers the benchmark runs. You are responsible for any extra calls you make.",
      },
      {
        question: "Is the workshop recorded?",
        answer: "Yes. Recordings are shared with registered participants after the session.",
      },
    ],
    prizes: [
      { rank: 1, title: "Best evaluation", description: "API credits and XP bonus" },
      { rank: 2, title: "Most useful benchmark", description: "API credits" },
    ],
    xpReward: 150,
    participation: { type: "individual" },
    capacity: { maxParticipants: 120 },
    counters: { registrationCount: 90 },
    myRegistration: null,
    schedule: {
      registrationOpensAt: at(-24),
      registrationClosesAt: at(110),
      eventStartsAt: at(120),
      eventEndsAt: at(123),
      themeRevealAt: at(-24),
    },
  },
  {
    _id: "ev_zk_devcon",
    slug: "zero-knowledge-dev-con",
    title: "Zero-Knowledge Dev Con",
    tagline: "A full day on proofs, rollups and privacy",
    category: "startup_challenge",
    status: "registration_open",
    featured: false,
    organizer: "Security Guild",
    venue: "Hall B",
    overview:
      "Zero-Knowledge Dev Con is a day of talks and small team challenges on cryptographic proof systems. Sessions cover SNARKs, how rollups use proofs to scale, and how privacy-preserving designs are built.\n\nThe afternoon challenge asks teams to design a small proof-based product idea and pitch it to the panel.",
    themes: [], // hidden until the reveal time
    rules:
      "Teams of two to four. Challenge entries must be original. Any cryptographic libraries used must be named in the pitch deck.",
    eligibility: "Open to students with a background in computer science, mathematics, or a related field.",
    faqs: [
      {
        question: "Do I need prior cryptography knowledge?",
        answer: "Basic discrete maths helps. The morning sessions are written for students new to the topic.",
      },
      {
        question: "Is there a dress code?",
        answer: "No. Come as you are.",
      },
    ],
    prizes: [
      { rank: 1, title: "Grand prize", description: "Cash award and an invitation to a partner research lab" },
      { rank: 2, title: "Runner-up", description: "Conference ticket" },
    ],
    xpReward: 400,
    participation: { type: "team" },
    capacity: { maxParticipants: 100 },
    counters: { registrationCount: 40 },
    myRegistration: null,
    schedule: {
      registrationOpensAt: at(-24),
      registrationClosesAt: at(380),
      eventStartsAt: at(408),
      eventEndsAt: at(416),
      themeRevealAt: at(200),
    },
  },
  {
    _id: "ev_open_source_day",
    slug: "open-source-day-8",
    title: "Open Source Day #08",
    tagline: "Community contributions across university projects",
    category: "startup_challenge",
    status: "ended",
    featured: false,
    organizer: "OSS Collective",
    venue: "Online",
    overview:
      "Open Source Day brings students together to contribute to university-owned open-source projects. Contributors picked up issues, reviewed pull requests, and improved documentation across the core repositories.\n\nThe event closed with 42 merged pull requests and a short showcase of the most useful changes.",
    themes: ["Open source"],
    rules:
      "Contributions must be made to the listed repositories during the event window. Each pull request needs a linked issue.",
    eligibility: "Open to all students. No prior open-source experience is needed.",
    faqs: [
      {
        question: "Can I still contribute?",
        answer: "The event has ended, but the project repositories accept contributions year-round.",
      },
    ],
    prizes: [
      { rank: 1, title: "Top contributor", description: "Bonus XP and a project maintainer badge" },
      { rank: 2, title: "Best documentation", description: "Bonus XP" },
    ],
    xpReward: 300,
    participation: { type: "individual" },
    capacity: { maxParticipants: null },
    counters: { registrationCount: 214 },
    myRegistration: "confirmed",
    schedule: {
      registrationOpensAt: at(-400),
      registrationClosesAt: at(-300),
      eventStartsAt: at(-290),
      eventEndsAt: at(-48),
      themeRevealAt: at(-400),
    },
  },
  {
    _id: "ev_algorithms_sprint",
    slug: "algorithms-sprint-3",
    title: "Algorithms Sprint #03",
    tagline: "Dynamic programming, one problem at a time",
    category: "innovation_challenge",
    status: "registration_open",
    featured: false,
    organizer: "Algorithms Club",
    venue: "Online",
    overview:
      "Algorithms Sprint is a three-hour problem-solving session on dynamic programming and string automata. Problems are ordered from warm-up to hard, and the leaderboard updates as you solve each one.\n\nA short tutorial at the start covers the patterns you will need.",
    themes: ["Dynamic programming"],
    rules:
      "Individual entries. Solutions must be your own. Problem statements are shared at the start of the sprint.",
    eligibility: "Open to all students with a basic knowledge of data structures.",
    faqs: [
      {
        question: "Do I need to finish every problem?",
        answer: "No. Points are awarded per problem, so solving the easier ones still counts.",
      },
      {
        question: "Will there be hints?",
        answer: "Yes. Each problem has a hint, and using one lowers the points you earn for it.",
      },
    ],
    prizes: [
      { rank: 1, title: "Sprint champion", description: "Bonus XP and a trophy" },
      { rank: 2, title: "Runner-up", description: "Bonus XP" },
    ],
    xpReward: 150,
    participation: { type: "individual" },
    capacity: { maxParticipants: null },
    counters: { registrationCount: 12 },
    myRegistration: null,
    schedule: {
      registrationOpensAt: at(-24),
      registrationClosesAt: at(260),
      eventStartsAt: at(288),
      eventEndsAt: at(292),
      themeRevealAt: at(-24),
    },
  },
  {
    _id: "ev_winter_idea_sprint",
    slug: "winter-idea-sprint",
    title: "Winter Idea Sprint",
    tagline: "Pitch your idea. Get judged by founders.",
    category: "startup_challenge",
    status: "judging",
    featured: false,
    organizer: "Startup Cell",
    venue: "Online",
    overview:
      "Winter Idea Sprint asked teams to build a startup concept and pitch it to a panel of founders and investors. Submissions are being scored this week, and the results will be published once judging closes.",
    themes: ["Startups"],
    rules:
      "Teams of two to four. Pitch decks must be submitted before the deadline. Judges score against the published rubric.",
    eligibility: "Open to all enrolled students.",
    faqs: [
      {
        question: "When will results be published?",
        answer: "Results are published after judging closes, on the date shown in the schedule.",
      },
    ],
    prizes: [
      { rank: 1, title: "Grand prize", description: "Seed grant and a mentorship programme" },
      { rank: 2, title: "Runner-up", description: "Cloud credits" },
    ],
    xpReward: 350,
    participation: { type: "team" },
    capacity: { maxParticipants: null },
    counters: { registrationCount: 120 },
    myRegistration: null,
    schedule: {
      registrationOpensAt: at(-500),
      registrationClosesAt: at(-400),
      eventStartsAt: at(-380),
      eventEndsAt: at(-120),
      themeRevealAt: at(-500),
    },
  },
  {
    _id: "ev_data_duel",
    slug: "data-duel-2",
    title: "Data Duel #02",
    tagline: "Engineer the features. Beat the hidden model.",
    category: "innovation_challenge",
    status: "registration_closed",
    featured: false,
    organizer: "Data Science Club",
    venue: "Online",
    overview:
      "Data Duel gives teams a tabular dataset with the target hidden. You build features, train models, and submit predictions. The best score on the private split wins.\n\nThe starter notebook covers loading, cleaning and a baseline model.",
    themes: ["Data science"],
    rules:
      "Individual entries only. Submissions are limited to five per day. Pretrained external models are allowed if licensed for research use.",
    eligibility: "Open to students with basic Python and pandas.",
    faqs: [
      {
        question: "Can I still join?",
        answer: "Registration is closed, but the starter notebook stays public for practice.",
      },
    ],
    prizes: [
      { rank: 1, title: "Top score", description: "Bonus XP and a data science book set" },
      { rank: 2, title: "Most creative features", description: "Bonus XP" },
    ],
    xpReward: 180,
    participation: { type: "individual" },
    capacity: { maxParticipants: 60 },
    counters: { registrationCount: 60 },
    myRegistration: null,
    schedule: {
      registrationOpensAt: at(-120),
      registrationClosesAt: at(-2),
      eventStartsAt: at(10),
      eventEndsAt: at(14),
      themeRevealAt: at(-120),
    },
  },
];