const { test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { Post } = require("../models/blogAuthorSchema");
const Community = require("../models/communitySchema");
const CommunityMembership = require("../models/communityMembershipSchema");
const Discussion = require("../models/communityDiscussions/discussionsSchema");
const DiscussionReply = require("../models/communityDiscussions/discussionsReplySchema");
const { getCommunityLandingPage } = require("./techCommunity.Controller");

test("landing data includes tenant-scoped weekly discussion and reply activity", async (t) => {
  const id = new mongoose.Types.ObjectId();
  const emptyId = new mongoose.Types.ObjectId();
  const latest = new Date("2026-01-01T00:00:00Z");
  const tenantId = "tenant";
  t.mock.method(Community, "find", async () => [
    { _id: id, name: "One", toObject: () => ({ _id: id, name: "One" }) },
    { _id: emptyId, name: "Empty", toObject: () => ({ _id: emptyId, name: "Empty" }) },
  ]);
  t.mock.method(CommunityMembership, "find", async () => []);
  t.mock.method(CommunityMembership, "aggregate", async () => []);
  t.mock.method(Post, "aggregate", async () => [{ _id: "One", weeklyPostCount: 2 }]);
  let discussionPipeline;
  let replyPipeline;
  t.mock.method(Discussion, "aggregate", async (pipeline) => {
    discussionPipeline = pipeline;
    return [{ _id: id, count: 4, weeklyDiscussionCount: 2, latestDiscussionAt: latest }];
  });
  t.mock.method(DiscussionReply, "aggregate", async (pipeline) => {
    replyPipeline = pipeline;
    return [{ _id: id, count: 3 }];
  });
  let body;
  const res = { status() { return this; }, json(value) { body = value; } };
  await getCommunityLandingPage({ user: { tenantId, authorId: "author" } }, res);

  assert.equal(discussionPipeline[0].$match.tenantId, tenantId);
  assert.deepEqual(discussionPipeline[0].$match.communityId.$in, [id, emptyId]);
  assert.equal(replyPipeline[0].$match.tenantId, tenantId);
  assert.deepEqual(replyPipeline[0].$match.communityId.$in, [id, emptyId]);
  assert.ok(replyPipeline[0].$match.createdAt.$gte instanceof Date);
  assert.equal(discussionPipeline[1].$group.weeklyDiscussionCount.$sum.$cond[0].$gte[1].getTime(), replyPipeline[0].$match.createdAt.$gte.getTime());
  assert.equal(body.communities[0].discussionCount, 4);
  assert.equal(body.communities[0].weeklyDiscussionCount, 2);
  assert.equal(body.communities[0].weeklyReplyCount, 3);
  assert.equal(body.communities[0].latestDiscussionAt, latest);
  assert.equal(body.communities[1].weeklyDiscussionCount, 0);
  assert.equal(body.communities[1].weeklyReplyCount, 0);
  assert.equal(body.communities[1].latestDiscussionAt, null);
});
