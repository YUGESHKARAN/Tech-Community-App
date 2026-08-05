
// ─────────────────────────────────────────────────────────────────────────────
//  communitySample.js
//
//  Shaped exactly like the getCommunityLandingPage API response per-community
//  object plus the extra fields getDiscussions / getCommunityLeaderboard /
//  getTrendingTags return.
//
//  Swap each section for its real hook when ready:
//    communitySample        → useGetCommunityById(communityId)
//    discussionsSample      → useGetDiscussions(communityId, { category, page })
//    membersSample          → useGetCommunityMembers(communityId)
//    leaderboardSample      → useGetCommunityLeaderboard(communityId, period)
//    trendingTagsSample     → useGetTrendingTags(communityId)
// ─────────────────────────────────────────────────────────────────────────────

export const communitySample = {
  _id: "66f1a2b3c4d5e6f7a8b9c0d1",
  tenantId: "dsu",
  name: "AI/ML",
  slug: "ai-ml",
  tagline: "Connect, collaborate and grow together",
  description:
    "The AI/ML community is the space for machine learning practitioners, researchers, and enthusiasts to share knowledge, ask questions, and showcase projects.",
  memberCount: 14,
  postCount: 8,
  coordinatorsCount: 5,
  weeklyPostCount: 6,
  userRole: "coordinator", // 'coordinator' | 'member' | null
  profiles: [
    { profile: "", name: "Kumaran", email: "kumaranv.set2022@dsuniversity.ac.in" },
    { profile: "", name: "Yugesh Karan", email: "yugeshkaran01@gmail.com" },
    { profile: "", name: "Sibi", email: "ssibi3290@gmail.com" },
    { profile: "", name: "ajayvarsanr", email: "ajayvarsan2020@gmail.com" },
  ],
};

// ── Discussions ───────────────────────────────────────────────────────────────
// Shaped like the getDiscussions paginated response items.
export const discussionsSample = [
  {
    _id: "disc001",
    category: "qa",
    title: "Why does my LoRA fine-tune overfit after 3 epochs?",
    body: "I've been fine-tuning a 7B model using LoRA with r=16, alpha=32. After epoch 3 the validation loss starts climbing but training loss keeps dropping...",
    authorId: { authorName: "haricharan_1133", profile: "", email: "haricharanuggirala1133@gmail.com" },
    tags: [
      { _id: "tag001", name: "fine-tuning", color: "#0d9488" },
      { _id: "tag002", name: "lora", color: "#7c3aed" },
    ],
    isPinned: true,
    isSolved: true,
    solvedReplyId: "reply003",
    upvoteCount: 24,
    replyCount: 12,
    views: Array(48).fill(""),
    hasVoted: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "disc002",
    category: "idea",
    title: "Idea: a shared prompt-eval leaderboard for this community",
    body: "What if we ran a weekly prompt evaluation challenge where everyone submits prompts against the same benchmark...",
    authorId: { authorName: "ajayvarsanr", profile: "", email: "ajayvarsan2020@gmail.com" },
    tags: [{ _id: "tag003", name: "prompting", color: "#ea580c" }],
    isPinned: false,
    isSolved: false,
    solvedReplyId: null,
    upvoteCount: 9,
    replyCount: 5,
    views: Array(21).fill(""),
    hasVoted: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "disc003",
    category: "showcase",
    title: "Show and tell: built a reinforcement learning gridworld from scratch",
    body: "Over the last two weekends I built a minimal RL gridworld in pure NumPy, no gym, no stable-baselines...",
    authorId: { authorName: "Kumaran", profile: "", email: "kumaranv.set2022@dsuniversity.ac.in" },
    tags: [
      { _id: "tag004", name: "reinforcement-learning", color: "#059669" },
      { _id: "tag005", name: "project", color: "#2563eb" },
    ],
    isPinned: false,
    isSolved: false,
    solvedReplyId: null,
    upvoteCount: 31,
    replyCount: 8,
    views: Array(63).fill(""),
    hasVoted: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "disc004",
    category: "qa",
    title: "Best resources for learning transformer architecture in 2025?",
    body: "Looking for up-to-date resources — papers, courses, or blog posts — that explain transformer internals well...",
    authorId: { authorName: "Yugesh Karan", profile: "", email: "yugeshkaran01@gmail.com" },
    tags: [
      { _id: "tag006", name: "transformers", color: "#7c3aed" },
      { _id: "tag007", name: "resources", color: "#888780" },
    ],
    isPinned: false,
    isSolved: false,
    solvedReplyId: null,
    upvoteCount: 6,
    replyCount: 3,
    views: Array(29).fill(""),
    hasVoted: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "disc005",
    category: "announcement",
    title: "Weekly knowledge drop #4 — attention mechanisms deep dive",
    body: "This week's knowledge drop covers multi-head attention, cross-attention, and flash attention optimisations...",
    authorId: { authorName: "Yugesh Karan", profile: "", email: "yugeshkaran01@gmail.com" },
    tags: [{ _id: "tag006", name: "transformers", color: "#7c3aed" }],
    isPinned: false,
    isSolved: false,
    solvedReplyId: null,
    upvoteCount: 18,
    replyCount: 2,
    views: Array(44).fill(""),
    hasVoted: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Members ───────────────────────────────────────────────────────────────────
// Shaped like the CommunityMembership.find({ communityId }) populated result.
export const membersSample = {
  coordinators: [
    {
      authorId: {
        _id: "auth001",
        authorName: "Yugesh Karan",
        email: "yugeshkaran01@gmail.com",
        profile: "",
        postCount: 18,
        followers: ["a", "b", "c"],
        badges: [{ badgeId: "b1" }, { badgeId: "b2" }],
      },
      role: "coordinator",
      joinedAt: "2025-11-02T10:00:00.000Z",
    },
    {
      authorId: {
        _id: "auth002",
        authorName: "haricharan_1133",
        email: "haricharanuggirala1133@gmail.com",
        profile: "",
        postCount: 5,
        followers: ["a", "b"],
        badges: [{ badgeId: "b1" }],
      },
      role: "coordinator",
      joinedAt: "2025-11-02T10:00:00.000Z",
    },
    {
      authorId: {
        _id: "auth003",
        authorName: "Kumaran",
        email: "kumaranv.set2022@dsuniversity.ac.in",
        profile: "",
        postCount: 0,
        followers: ["a"],
        badges: [],
      },
      role: "coordinator",
      joinedAt: "2025-11-02T10:00:00.000Z",
    },
    {
      authorId: {
        _id: "auth004",
        authorName: "Rosinii",
        email: "rosiniisuresh@gmail.com",
        profile: "",
        postCount: 0,
        followers: ["a", "b", "c"],
        badges: [],
      },
      role: "coordinator",
      joinedAt: "2025-12-01T10:00:00.000Z",
    },
    {
      authorId: {
        _id: "auth005",
        authorName: "ajayvarsanr",
        email: "ajayvarsan2020@gmail.com",
        profile: "",
        postCount: 0,
        followers: ["a"],
        badges: [],
      },
      role: "coordinator",
      joinedAt: "2025-12-01T10:00:00.000Z",
    },
  ],
  members: [
    {
      authorId: {
        _id: "auth006",
        authorName: "Karan",
        email: "yugeshkaran001@gmail.com",
        profile: "",
        postCount: 0,
        followers: [],
        badges: [],
      },
      role: "member",
      joinedAt: "2026-01-10T10:00:00.000Z",
    },
  ],
};

// ── Leaderboard ───────────────────────────────────────────────────────────────
// Shaped like getCommunityLeaderboard response.
export const leaderboardSample = {
  period: "weekly",
  leaderboard: [
    { rank: 1, authorName: "Yugesh Karan", email: "yugeshkaran01@gmail.com", profile: "", points: 210 },
    { rank: 2, authorName: "haricharan_1133", email: "haricharanuggirala1133@gmail.com", profile: "", points: 175 },
    { rank: 3, authorName: "ajayvarsanr", email: "ajayvarsan2020@gmail.com", profile: "", points: 140 },
    { rank: 4, authorName: "Kumaran", email: "kumaranv.set2022@dsuniversity.ac.in", profile: "", points: 98 },
    { rank: 5, authorName: "Rosinii", email: "rosiniisuresh@gmail.com", profile: "", points: 72 },
  ],
};

// ── Trending tags ─────────────────────────────────────────────────────────────
// Shaped like getTrendingTags response.
export const trendingTagsSample = {
  tags: [
    { _id: "tag001", name: "fine-tuning", color: "#0d9488", count: 9 },
    { _id: "tag006", name: "transformers", color: "#7c3aed", count: 7 },
    { _id: "tag002", name: "lora", color: "#7c3aed", count: 5 },
    { _id: "tag003", name: "prompting", color: "#ea580c", count: 3 },
    { _id: "tag007", name: "resources", color: "#888780", count: 2 },
  ],
};

// ── Feed posts ────────────────────────────────────────────────────────────────
// Shaped like the existing Post collection response used in the feed tab.
export const feedPostsSample = [
  {
    _id: "post001",
    title: "Evaluating LLMs using LangSmith",
    description: "A practical guide to setting up evaluation pipelines for large language models using LangSmith's tracing and scoring features.",
    category: "AI/ML",
    image: "",
    likes: ["a", "b", "c", "d"],
    views: Array(24).fill(""),
    messages: Array(6).fill(""),
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: { authorName: "Yugesh Karan", profile: "", email: "yugeshkaran01@gmail.com" },
  },
  {
    _id: "post002",
    title: "Multi-Agent System using LangGraph",
    description: "Building a multi-agent orchestration system with LangGraph, covering state machines, conditional edges, and agent handoffs.",
    category: "AI/ML",
    image: "",
    likes: ["a", "b", "c"],
    views: Array(18).fill(""),
    messages: Array(3).fill(""),
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: { authorName: "Yugesh Karan", profile: "", email: "yugeshkaran01@gmail.com" },
  },
  {
    _id: "post003",
    title: "Supervised Machine Learning",
    description: "Machine learning technique that uses labeled datasets to train algorithms to recognize patterns and predict outcomes.",
    category: "AI/ML",
    image: "",
    likes: ["a", "b", "c"],
    views: Array(14).fill(""),
    messages: Array(4).fill(""),
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: { authorName: "haricharan_1133", profile: "", email: "haricharanuggirala1133@gmail.com" },
  },
  {
    _id: "post004",
    title: "Unsupervised Learning",
    description: "A machine learning technique that uses algorithms to analyze and discover patterns in unlabeled datasets.",
    category: "AI/ML",
    image: "",
    likes: ["a", "b", "c", "d"],
    views: Array(16).fill(""),
    messages: Array(4).fill(""),
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: { authorName: "haricharan_1133", profile: "", email: "haricharanuggirala1133@gmail.com" },
  },
  {
    _id: "post005",
    title: "Reinforcement Learning",
    description: "RL is a machine learning technique that trains software to make decisions to maximize cumulative rewards.",
    category: "AI/ML",
    image: "",
    likes: ["a", "b", "c", "d"],
    views: Array(20).fill(""),
    messages: Array(4).fill(""),
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: { authorName: "haricharan_1133", profile: "", email: "haricharanuggirala1133@gmail.com" },
  },
  {
    _id: "post006",
    title: "Computer Vision",
    description: "Computer vision is a field of AI that uses machine learning and neural networks to interpret visual data.",
    category: "AI/ML",
    image: "",
    likes: ["a", "b", "c"],
    views: Array(22).fill(""),
    messages: Array(6).fill(""),
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: { authorName: "haricharan_1133", profile: "", email: "haricharanuggirala1133@gmail.com" },
  },
];