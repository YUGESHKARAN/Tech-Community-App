import { test } from "node:test";
import assert from "node:assert/strict";
import { filterCommunities } from "./filterCommunities.js";

const communities = [
  { _id: "quiet", createdAt: "2026-01-03T00:00:00Z", weeklyPostCount: 0 },
  { _id: "replies", createdAt: "2026-01-01T00:00:00Z", weeklyReplyCount: 5 },
  { _id: "discussions", createdAt: "2026-01-02T00:00:00Z", latestDiscussionAt: "2026-03-01T00:00:00Z", weeklyDiscussionCount: 3 },
  { _id: "posts", createdAt: "2026-02-01T00:00:00Z", weeklyPostCount: 2, weeklyDiscussionCount: 2 },
];

test("trending ranks weekly posts and newly created discussions, excluding reply-only communities", () => {
  assert.deepEqual(filterCommunities(communities, "trending").map((c) => c._id), ["posts", "discussions"]);
  assert.deepEqual(communities.map((c) => c._id), ["quiet", "replies", "discussions", "posts"]);
});

test("most active includes weekly replies and retains communities without activity", () => {
  assert.deepEqual(filterCommunities(communities, "active").map((c) => c._id), ["replies", "posts", "discussions", "quiet"]);
});

test("newest uses the later of community creation and latest discussion, handling missing dates", () => {
  assert.deepEqual(filterCommunities(communities, "newest").map((c) => c._id), ["discussions", "posts", "quiet", "replies"]);
  const withOlderDiscussion = [
    { _id: "new-community", createdAt: "2026-04-01", latestDiscussionAt: "2026-01-01" },
    { _id: "missing-dates" },
    { _id: "discussion", createdAt: "invalid", latestDiscussionAt: "2026-03-01" },
  ];
  assert.deepEqual(filterCommunities(withOlderDiscussion, "newest").map((c) => c._id), ["new-community", "discussion", "missing-dates"]);
});
