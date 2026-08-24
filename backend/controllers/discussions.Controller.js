const mongoose = require("mongoose");
const Discussion = require("../models/communityDiscussions/discussionsSchema");
const DiscussionReply = require("../models/communityDiscussions/discussionsReplySchema");
const Upvote = require("../models/communityDiscussions/upvoteSchema");
const {
  CommunityTag,
  CommunitySettings,
} = require("../models/communityDiscussions/communityTagAndSettingsSchema");
const CommunityMembership = require("../models/communityMembershipSchema");
const { Author } = require("../models/blogAuthorSchema");
const Community = require("../models/communitySchema");
const { Post } = require("../models/blogAuthorSchema");
const { trackActivity, getTodayIST } = require("../services/trackActivity");
// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const COORDINATOR_ROLES = ["coordinator", "admin", "director"];

/**
 * Resolves the current user's role within a specific community.
 * Returns 'coordinator' | 'member' | null (null = not a member).
 */
const getUserCommunityRole = async (tenantId, communityId, authorId) => {
  const membership = await CommunityMembership.findOne(
    { tenantId, communityId, authorId },
    "role",
  ).lean();
  return membership?.role || null;
};

/**
 * Resolves the global Author role for cases where admin/director
 * privileges override community-level checks.
 */
const getGlobalRole = async (authorId) => {
  const author = await Author.findById(authorId, "role").lean();
  return author?.role || null;
};

/**
 * Batch-resolves which discussion/reply IDs the current user has upvoted.
 * Returns a Set of targetId strings.
 */
const getUpvotedSet = async (targetIds, authorId) => {
  const votes = await Upvote.find(
    { targetId: { $in: targetIds }, authorId },
    "targetId",
  ).lean();
  return new Set(votes.map((v) => v.targetId.toString()));
};

const normalizeDiscussionTags = async (tenantId, communityId, tags) => {
  if (!Array.isArray(tags)) return [];

  const normalizedTagIds = [];
  const seenTagIds = new Set();

  for (const rawTag of tags) {
    if (!rawTag) continue;

    if (mongoose.Types.ObjectId.isValid(rawTag)) {
      const objectId = new mongoose.Types.ObjectId(rawTag);
      const key = objectId.toString();
      if (!seenTagIds.has(key)) {
        seenTagIds.add(key);
        normalizedTagIds.push(objectId);
      }
      continue;
    }

    const tagName = String(rawTag).trim();
    if (!tagName) continue;

    const existingTag = await CommunityTag.findOne({
      tenantId,
      communityId,
      name: tagName,
    }).lean();

    if (existingTag) {
      const key = existingTag._id.toString();
      if (!seenTagIds.has(key)) {
        seenTagIds.add(key);
        normalizedTagIds.push(existingTag._id);
      }
    }
  }

  return normalizedTagIds;
};

// ─────────────────────────────────────────────────────────────────────────────
//  GROUP 1 — COMMUNITY SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/communities/:communityId/settings
 * Returns the settings doc for a community. Creates it with defaults
 * if it doesn't exist yet (idempotent).
 */
const getSettings = async (req, res) => {
  const { communityId } = req.params;
  const { tenantId } = req.user;

  try {
    const settings = await CommunitySettings.findOneAndUpdate(
      { tenantId, communityId },
      { $setOnInsert: { tenantId, communityId, whoCanPost: "coordinator" } },
      { upsert: true, new: true, runValidators: false },
    ).lean();

    res.status(200).json({ settings });
  } catch (err) {
    console.error("getSettings error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/communities/:communityId/settings/whoCanPost
 * Admin or coordinator can toggle who is allowed to create discussions.
 * body: { whoCanPost: 'coordinator' | 'member' }
 */
const updateWhoCanPost = async (req, res) => {
  const { communityId } = req.params;
  const { tenantId, authorId } = req.user;
  const { whoCanPost } = req.body;

  try {
    if (!["coordinator", "member"].includes(whoCanPost)) {
      return res
        .status(400)
        .json({ message: "whoCanPost must be 'coordinator' or 'member'" });
    }

    const globalRole = await getGlobalRole(authorId);
    const communityRole = await getUserCommunityRole(
      tenantId,
      communityId,
      authorId,
    );

    const canModify =
      ["admin", "director"].includes(globalRole) ||
      communityRole === "coordinator";

    if (!canModify) {
      return res.status(403).json({
        message: "Only coordinators or admins can change this setting",
      });
    }

    const settings = await CommunitySettings.findOneAndUpdate(
      { tenantId, communityId },
      { $set: { whoCanPost } },
      { upsert: true, new: true, runValidators: false },
    ).lean();

    res.status(200).json({ message: "Setting updated", settings });
  } catch (err) {
    console.error("updateWhoCanPost error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GROUP 1 — COMMUNITY TAGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/communities/:communityId/tags
 * Coordinator-only. Creates a new community-scoped tag (label).
 * body: { name, color }
 */
const createTag = async (req, res) => {
  const { communityId } = req.params;
  const { tenantId, authorId } = req.user;
  const { name, color } = req.body;
  // console.log("createTag called", req.body, tenantId, authorId);

  try {
    if (!name || !color) {
      return res.status(400).json({ message: "name and color are required" });
    }

    const communityRole = await getUserCommunityRole(
      tenantId,
      communityId,
      authorId,
    );
    // console.log("communityRole", communityRole)
    if (communityRole !== "coordinator") {
      return res
        .status(403)
        .json({ message: "Only coordinators can create tags" });
    }

    const tag = await CommunityTag.create({
      tenantId,
      communityId,
      name: name.trim(),
      color,
      createdBy: authorId,
    });

    res.status(201).json({ message: "Tag created", tag });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "A tag with this name already exists in this community",
      });
    }
    console.error("createTag error:", err.message);
    // console.log('createTag error:', err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/communities/:communityId/tags
 * Returns all tags for a community. Public — any user can read tags
 * so they can filter discussions by tag without being a member.
 */
const getTags = async (req, res) => {
  // console.log("getTags called");
  const { communityId } = req.params;
  const { tenantId } = req.user;

  try {
    const tags = await CommunityTag.find({ tenantId, communityId })
      .sort({ name: 1 })
      .lean();

    res.status(200).json({ tags });
  } catch (err) {
    console.error("getTags error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/communities/:communityId/tags/:tagId
 * Coordinator-only. Update tag name and/or color.
 * body: { name?, color? }
 */
const updateTag = async (req, res) => {
  const { communityId, tagId } = req.params;
  const { tenantId, authorId } = req.user;
  const { name, color } = req.body;

  try {
    const communityRole = await getUserCommunityRole(
      tenantId,
      communityId,
      authorId,
    );
    if (communityRole !== "coordinator") {
      return res
        .status(403)
        .json({ message: "Only coordinators can update tags" });
    }

    const update = {};
    if (name) update.name = name.trim();
    if (color) update.color = color;

    const tag = await CommunityTag.findOneAndUpdate(
      { _id: tagId, tenantId, communityId },
      { $set: update },
      { new: true, runValidators: true },
    ).lean();

    if (!tag) return res.status(404).json({ message: "Tag not found" });

    res.status(200).json({ message: "Tag updated", tag });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "A tag with this name already exists" });
    }
    console.error("updateTag error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/communities/:communityId/tags/:tagId
 * Coordinator-only. Deletes the tag and removes it from all discussions
 * in this community that reference it.
 */
const deleteTag = async (req, res) => {
  const { communityId, tagId } = req.params;
  const { tenantId, authorId } = req.user;

  try {
    const communityRole = await getUserCommunityRole(
      tenantId,
      communityId,
      authorId,
    );
    if (communityRole !== "coordinator") {
      return res
        .status(403)
        .json({ message: "Only coordinators can delete tags" });
    }

    const tag = await CommunityTag.findOneAndDelete({
      _id: tagId,
      tenantId,
      communityId,
    });
    if (!tag) return res.status(404).json({ message: "Tag not found" });

    // remove this tag from all discussions that referenced it
    await Discussion.updateMany(
      { tenantId, communityId, tags: tagId },
      { $pull: { tags: tagId } },
    );

    res.status(200).json({ message: "Tag deleted" });
  } catch (err) {
    console.error("deleteTag error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GROUP 2 — DISCUSSION CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/communities/:communityId/discussions
 * Creates a new discussion thread.
 * Permission: determined by CommunitySettings.whoCanPost:
 *   'coordinator' → only coordinators
 *   'member'      → any community member
 * body: { category, title, body, linkedPostId?, tags? }
 */
const createDiscussion = async (req, res) => {
  const { communityId } = req.params;
  const { tenantId, authorId } = req.user;
  const { category, title, body, linkedPostId, tags } = req.body;
  //  console.log("req.body", req.body)
  try {
    if (!category || !title || !body) {
      return res
        .status(400)
        .json({ message: "category, title, and body are required" });
    }

    // resolve permission from settings
    const [settings, communityRole] = await Promise.all([
      CommunitySettings.findOne({ tenantId, communityId }, "whoCanPost").lean(),
      getUserCommunityRole(tenantId, communityId, authorId),
    ]);

    const requiredRole = settings?.whoCanPost || "coordinator";

    const canPost =
      communityRole === "coordinator" ||
      (requiredRole === "member" && communityRole === "member");

    if (!canPost) {
      return res.status(403).json({
        message:
          requiredRole === "coordinator"
            ? "Only coordinators can start discussions in this community"
            : "You must be a member of this community to start a discussion",
      });
    }

    const normalizedTags = await normalizeDiscussionTags(
      tenantId,
      communityId,
      tags,
    );

    const discussion = await Discussion.create({
      tenantId,
      communityId,
      authorId,
      category,
      title: title.trim(),
      body: body.trim(),
      linkedPostId: linkedPostId || null,
      tags: normalizedTags,
    });

    res.status(201).json({ message: "Discussion created", discussion });

    // ----------------- performance tracker (create discussion) ------------------------------
    trackActivity({
      authorId: authorId, // from req.user
      tenantId: tenantId,
      date: getTodayIST(),
      event: {
        type: "discussion",
        targetId: discussion._id,
        communityId: discussion.communityId,
        discussionId: null, // discussion IS the top-level — no parent
        title: discussion.title,
        communityName: settings?.communityName || null, // or fetch community.name
        pts: 3,
      },
    }).catch((err) =>
      console.error("trackActivity (discussion) error:", err.message),
    );

    // -----------------------------------------------------------------------------------------
  } catch (err) {
    console.error("createDiscussion error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/communities/:communityId/discussions
 * Paginated discussion feed. Pinned threads always float to the top
 * within the result set regardless of page number.
 * query: { page?, limit?, category?, isSolved?, tag?, search? }
 */

// const getDiscussions = async (req, res) => {
//   const { communityId } = req.params;
//   const { tenantId, authorId } = req.user;
//   const {
//     page = 1,
//     limit = 20,
//     category,
//     isSolved,
//     tag,
//     search,
//   } = req.query;

//   const skip = (Number(page) - 1) * Number(limit);

//   try {
//     const filter = { tenantId, communityId };
//     if (category) filter.category = category;
//     if (isSolved !== undefined) filter.isSolved = isSolved === 'true';
//     if (tag) filter.tags = new mongoose.Types.ObjectId(tag);
//     if (search) filter.$text = { $search: search };

//     const [discussions, total] = await Promise.all([
//       Discussion.find(filter)
//         .sort({ isPinned: -1, createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit))
//         .populate('authorId', 'authorname profile email')
//         .populate('tags', 'name color')
//         .lean(),
//       Discussion.countDocuments(filter),
//     ]);

//     // batch-resolve upvote status for current user
//     const discussionIds = discussions.map((d) => d._id);
//     const upvotedSet = await getUpvotedSet(discussionIds, authorId);

//     const result = discussions.map((d) => ({
//       ...d,
//       hasVoted: upvotedSet.has(d._id.toString()),
//     }));

//     res.status(200).json({
//       discussions: result,
//       total,
//       page: Number(page),
//       totalPages: Math.ceil(total / Number(limit)),
//       hasMore: skip + discussions.length < total,
//     });
//   } catch (err) {
//     console.error('getDiscussions error:', err.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const getDiscussions = async (req, res) => {
  const { communityId } = req.params;
  const { tenantId, authorId } = req.user;
  const { page = 1, limit = 20, category, isSolved, tag, search } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  try {
    const filter = { tenantId, communityId };
    if (category) filter.category = category;
    if (isSolved !== undefined) filter.isSolved = isSolved === "true";
    if (tag) filter.tags = new mongoose.Types.ObjectId(tag);
    if (search) filter.$text = { $search: search };

    const [discussions, total] = await Promise.all([
      Discussion.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("authorId", "authorname profile email")
        .populate("tags", "name color")
        // .populate('linkedPostId', 'image title description') // add this
        .populate({
          path: "linkedPostId",
          select: "image title description authorId",
          populate: {
            path: "authorId",
            select: "email authorname",
          },
        })
        .lean(),
      Discussion.countDocuments(filter),
    ]);

    const discussionIds = discussions.map((d) => d._id);
    const upvotedSet = await getUpvotedSet(discussionIds, authorId);

    const result = discussions.map((d) => ({
      ...d,
      hasVoted: upvotedSet.has(d._id.toString()),
      // shape linkedPost the same way getDiscussionById does
      // linkedPostId: d.linkedPostId
      //   ? {
      //       _id:         d.linkedPostId._id,
      //       title:       d.linkedPostId.title,
      //       description: d.linkedPostId.description,
      //       thumbnail:   d.linkedPostId.image || null,
      //     }
      //   : null,
      linkedPostId: d.linkedPostId
        ? {
            _id: d.linkedPostId._id,
            title: d.linkedPostId.title,
            description: d.linkedPostId.description,
            thumbnail: d.linkedPostId.image || null,
            author: {
              email: d.linkedPostId.authorId?.email || null,
              authorname: d.linkedPostId.authorId?.authorname || null,
            },
          }
        : null,
    }));

    res.status(200).json({
      discussions: result,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      hasMore: skip + discussions.length < total,
    });
  } catch (err) {
    console.error("getDiscussions error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/communities/:communityId/discussions/:discussionId
 * Single discussion thread + first page of top-level replies +
 * nested replies for those top-level replies — everything needed
 * to paint the initial thread view in one round-trip.
 * Subsequent reply pages use getReplies (infinite scroll).
 */

const getDiscussionById = async (req, res) => {
  const { communityId, discussionId } = req.params;
  const { tenantId, authorId } = req.user; // fix: was req.user.authorId
  const { replyPage = 1, replyLimit = 10 } = req.query;

  const skip = (Number(replyPage) - 1) * Number(replyLimit);

  // console.log("get discussions called")

  try {
    // increment view count atomically if this user hasn't viewed before
    const updated = await Discussion.findOneAndUpdate(
      {
        _id: discussionId,
        tenantId,
        communityId,
        views: { $ne: req.user.email },
      },
      { $addToSet: { views: req.user.email } },
      { new: true },
    )
      .populate("authorId", "authorname profile email badges")
      .populate("tags", "name color")
      // .populate('linkedPostId', 'image title description')  // thumbnail comes from here
      .populate({
        path: "linkedPostId",
        select: "image title description authorId",
        populate: {
          path: "authorId",
          select: "email authorname",
        },
      })
      .populate("solvedReplyId", "body authorId")
      .lean();

    // already viewed — fetch without updating
    const thread =
      updated ||
      (await Discussion.findOne({ _id: discussionId, tenantId, communityId })
        .populate("authorId", "authorname profile email badges")
        .populate("tags", "name color")
        // .populate('linkedPostId', 'image title description')
        .populate({
          path: "linkedPostId",
          select: "image title description authorId",
          populate: {
            path: "authorId",
            select: "email authorname",
          },
        })
        .populate("solvedReplyId", "body authorId")
        .lean());

    if (!thread)
      return res.status(404).json({ message: "Discussion not found" });

    const [topLevelReplies, totalReplies] = await Promise.all([
      DiscussionReply.find(
        { tenantId, discussionId, parentReplyId: null },
        null,
        { skip, limit: Number(replyLimit), sort: { createdAt: 1 } },
      )
        .populate("authorId", "authorname profile email badges")
        .lean(),
      DiscussionReply.countDocuments({
        tenantId,
        discussionId,
        parentReplyId: null,
      }),
    ]);

    const topLevelIds = topLevelReplies.map((r) => r._id);

    const nestedReplies = await DiscussionReply.find({
      tenantId,
      parentReplyId: { $in: topLevelIds },
    })
      .populate("authorId", "authorname profile email badges")
      .lean();

    const nestedByParent = {};
    for (const reply of nestedReplies) {
      const key = reply.parentReplyId.toString();
      nestedByParent[key] = nestedByParent[key] || [];
      nestedByParent[key].push(reply);
    }

    const allIds = [
      thread._id,
      ...topLevelIds,
      ...nestedReplies.map((r) => r._id),
    ];
    const upvotedSet = await getUpvotedSet(allIds, authorId); // fix: authorId now correct

    const repliesWithMeta = topLevelReplies.map((r) => ({
      ...r,
      hasVoted: upvotedSet.has(r._id.toString()),
      nestedReplies: (nestedByParent[r._id.toString()] || []).map((nr) => ({
        ...nr,
        hasVoted: upvotedSet.has(nr._id.toString()),
      })),
    }));

    // shape linkedPost cleanly — null if no post was linked
    // const linkedPost = thread.linkedPostId
    //   ? {
    //       _id:         thread.linkedPostId._id,
    //       title:       thread.linkedPostId.title,
    //       description: thread.linkedPostId.description,
    //       thumbnail:   thread.linkedPostId.image || null,
    //     }
    //   : null;

    const linkedPost = thread.linkedPostId
      ? {
          _id: thread.linkedPostId._id,
          title: thread.linkedPostId.title,
          description: thread.linkedPostId.description,
          thumbnail: thread.linkedPostId.image || null,
          author: {
            email: thread.linkedPostId.authorId?.email || null,
            authorname: thread.linkedPostId.authorId?.authorname || null,
          },
        }
      : null;

    res.status(200).json({
      discussion: {
        ...thread,
        linkedPostId: linkedPost, // replace populated object with clean shape
        hasVoted: upvotedSet.has(thread._id.toString()),
      },
      replies: repliesWithMeta,
      totalReplies,
      replyPage: Number(replyPage),
      replyHasMore: skip + topLevelReplies.length < totalReplies,
    });
  } catch (err) {
    console.error("getDiscussionById error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/communities/:communityId/discussions/:discussionId
 * Update title, body, category, tags, linkedPostId.
 * Only the author or a coordinator can edit.
 */
const updateDiscussion = async (req, res) => {
  const { communityId, discussionId } = req.params;
  const { tenantId, authorId } = req.user;
  const { title, body, category, tags, linkedPostId } = req.body;

  try {
    const [discussion, communityRole] = await Promise.all([
      Discussion.findOne({ _id: discussionId, tenantId, communityId }),
      getUserCommunityRole(tenantId, communityId, authorId),
    ]);

    if (!discussion)
      return res.status(404).json({ message: "Discussion not found" });

    const isAuthor = discussion.authorId.toString() === authorId.toString();
    const isCoordinator = communityRole === "coordinator";

    if (!isAuthor && !isCoordinator) {
      return res
        .status(403)
        .json({ message: "Not authorised to edit this discussion" });
    }

    const update = {};
    if (title) update.title = title.trim();
    if (body) update.body = body.trim();
    if (category) update.category = category;
    if (tags) update.tags = tags;
    if (linkedPostId !== undefined) update.linkedPostId = linkedPostId || null;

    const updated = await Discussion.findByIdAndUpdate(
      discussionId,
      { $set: update },
      { new: true, runValidators: true },
    ).lean();

    res
      .status(200)
      .json({ message: "Discussion updated", discussion: updated });
  } catch (err) {
    console.error("updateDiscussion error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/communities/:communityId/discussions/:discussionId
 * Author or coordinator can delete. Cascades to replies and upvotes.
 */
const deleteDiscussion = async (req, res) => {
  const { communityId, discussionId } = req.params;
  const { tenantId, authorId } = req.user;

  try {
    const [discussion, communityRole] = await Promise.all([
      Discussion.findOne({ _id: discussionId, tenantId, communityId }),
      getUserCommunityRole(tenantId, communityId, authorId),
    ]);

    if (!discussion)
      return res.status(404).json({ message: "Discussion not found" });

    const isAuthor = discussion.authorId.toString() === authorId.toString();
    const isCoordinator = communityRole === "coordinator";

    if (!isAuthor && !isCoordinator) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this discussion" });
    }

    const replyIds = await DiscussionReply.find(
      { tenantId, discussionId },
      "_id",
    )
      .lean()
      .then((docs) => docs.map((d) => d._id));

    await Promise.all([
      Discussion.deleteOne({ _id: discussionId }),
      DiscussionReply.deleteMany({ tenantId, discussionId }),
      Upvote.deleteMany({
        targetId: { $in: [discussionId, ...replyIds] },
      }),
    ]);

    res.status(200).json({ message: "Discussion deleted" });
  } catch (err) {
    console.error("deleteDiscussion error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GROUP 3 — DISCUSSION ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/communities/:communityId/discussions/:discussionId/pin
 * Coordinator-only. Toggles isPinned.
 */
const pinDiscussion = async (req, res) => {
  const { communityId, discussionId } = req.params;
  const { tenantId, authorId } = req.user;

  try {
    const communityRole = await getUserCommunityRole(
      tenantId,
      communityId,
      authorId,
    );
    if (communityRole !== "coordinator") {
      return res
        .status(403)
        .json({ message: "Only coordinators can pin discussions" });
    }

    const discussion = await Discussion.findOne({
      _id: discussionId,
      tenantId,
      communityId,
    });
    if (!discussion)
      return res.status(404).json({ message: "Discussion not found" });

    const updated = await Discussion.findByIdAndUpdate(
      discussionId,
      { $set: { isPinned: !discussion.isPinned } },
      { new: true },
    ).lean();

    res.status(200).json({
      message: updated.isPinned ? "Discussion pinned" : "Discussion unpinned",
      isPinned: updated.isPinned,
    });
  } catch (err) {
    console.error("pinDiscussion error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/communities/:communityId/discussions/:discussionId/solve
 * Marks a discussion as solved and clears it. Only the OP or a
 * coordinator can mark/unmark.
 * body: { solvedReplyId } — pass null to unmark
 */
const markSolved = async (req, res) => {
  const { communityId, discussionId } = req.params;
  const { tenantId, authorId } = req.user;
  const { solvedReplyId } = req.body;

  console.log("\n communityid, discussionId", communityId, discussionId);
  console.log("solved ID", solvedReplyId);

  try {
    const [discussion, communityRole] = await Promise.all([
      Discussion.findOne({ _id: discussionId, tenantId, communityId }),
      getUserCommunityRole(tenantId, communityId, authorId),
    ]);

    if (!discussion)
      return res.status(404).json({ message: "Discussion not found" });

    const isAuthor = discussion.authorId.toString() === authorId.toString();
    const isCoordinator = communityRole === "coordinator";

    if (!isAuthor && !isCoordinator) {
      return res.status(403).json({
        message: "Only the author or a coordinator can mark this as solved",
      });
    }

    const isSolving = Boolean(solvedReplyId);

    const [updated] = await Promise.all([
      Discussion.findByIdAndUpdate(
        discussionId,
        {
          $set: {
            isSolved: isSolving,
            solvedReplyId: solvedReplyId || null,
          },
        },
        { new: true },
      ).lean(),

      isSolving
        ? DiscussionReply.findByIdAndUpdate(
            solvedReplyId,
            { $set: { isAnswer: true } },
            { runValidators: false },
          )
        : // unmark: clear the previous answer flag if there was one
          discussion.solvedReplyId
          ? DiscussionReply.findByIdAndUpdate(
              discussion.solvedReplyId,
              { $set: { isAnswer: false } },
              { runValidators: false },
            )
          : Promise.resolve(),
    ]);

    res.status(200).json({
      message: isSolving ? "Marked as solved" : "Marked as unsolved",
      isSolved: updated.isSolved,
      solvedReplyId: updated.solvedReplyId,
    });
  } catch (err) {
    console.error("markSolved error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/communities/:communityId/discussions/:discussionId/upvote
 * Toggles the current user's discussion upvote.
 * If the author has not upvoted, we add the upvote; otherwise we remove it.
 */
const updateDiscussionUpvote = async (req, res) => {
  const { communityId, discussionId } = req.params;
  const { tenantId, authorId } = req.user;

  try {
    const discussion = await Discussion.findOne(
      { _id: discussionId, tenantId, communityId },
      "_id upvoteCount",
    ).lean();

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const existingUpvote = await Upvote.findOne({
      tenantId,
      targetId: discussionId,
      targetType: "discussion",
      authorId,
    }).lean();

    let action;
    let updated;

    if (existingUpvote) {
      action = "removed";
      await Upvote.deleteOne({ _id: existingUpvote._id });
      updated = await Discussion.findByIdAndUpdate(
        discussionId,
        { $inc: { upvoteCount: -1 } },
        { new: true },
      ).lean();
    } else {
      action = "upvoted";
      await Upvote.create({
        tenantId,
        targetId: discussionId,
        targetType: "discussion",
        authorId,
      });
      updated = await Discussion.findByIdAndUpdate(
        discussionId,
        { $inc: { upvoteCount: 1 } },
        { new: true },
      ).lean();
    }

    if (!updated) {
      return res
        .status(500)
        .json({ message: "Failed to update discussion upvote count" });
    }

    if (updated.upvoteCount < 0) {
      updated = await Discussion.findByIdAndUpdate(
        discussionId,
        { $set: { upvoteCount: 0 } },
        { new: true },
      ).lean();
    }

    return res.status(200).json({
      action,
      upvoteCount: Math.max(0, updated.upvoteCount),
    });
  } catch (err) {
    if (err.code === 11000) {
      const updated = await Discussion.findById(
        discussionId,
        "upvoteCount",
      ).lean();
      return res.status(200).json({
        action: "upvoted",
        upvoteCount: updated?.upvoteCount ?? 0,
      });
    }
    console.error("updateDiscussionUpvote error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GROUP 4 — REPLIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/communities/:communityId/discussions/:discussionId/replies
 * Create a top-level or nested reply.
 * body: { body, parentReplyId? }
 *
 * One-level nesting enforcement: if parentReplyId is provided,
 * the parent must have parentReplyId === null. If the parent
 * itself is a nested reply, we reject with 400.
 */
const createReply = async (req, res) => {
  const { communityId, discussionId } = req.params;
  const { tenantId, authorId } = req.user;
  const { body, parentReplyId } = req.body;

  try {
    if (!body?.trim()) {
      return res.status(400).json({ message: "Reply body is required" });
    }

    // confirm discussion exists
    const discussion = await Discussion.findOne(
      { _id: discussionId, tenantId, communityId },
      "_id",
    ).lean();
    if (!discussion)
      return res.status(404).json({ message: "Discussion not found" });

    // enforce one-level nesting
    if (parentReplyId) {
      const parent = await DiscussionReply.findOne(
        { _id: parentReplyId, tenantId, discussionId },
        "parentReplyId",
      ).lean();
      if (!parent)
        return res.status(404).json({ message: "Parent reply not found" });
      if (parent.parentReplyId !== null) {
        return res.status(400).json({
          message:
            "Only one level of nesting is supported — cannot reply to a nested reply",
        });
      }
    }

    const [reply] = await Promise.all([
      DiscussionReply.create({
        tenantId,
        communityId,
        discussionId,
        authorId,
        body: body.trim(),
        parentReplyId: parentReplyId || null,
      }),
      // increment replyCount only for top-level replies
      !parentReplyId
        ? Discussion.findByIdAndUpdate(discussionId, {
            $inc: { replyCount: 1 },
          })
        : Promise.resolve(),
    ]);

    const populated = await DiscussionReply.findById(reply._id)
      .populate("authorId", "authorName profile email badges")
      .lean();

    res.status(201).json({ message: "Reply created", reply: populated });

    // ---------------performance tracker-------------------------------------
    trackActivity({
      authorId: authorId,
      tenantId: tenantId,
      date: getTodayIST(),
      event: {
        type: "reply",
        targetId: reply._id,
        communityId: reply.communityId, // already on DiscussionReply
        discussionId: reply.discussionId, // already on DiscussionReply
        title: `Replied to: ${discussion.title}`,
        communityName: null, // optional — add if available
        pts: 1,
      },
    }).catch((err) =>
      console.error("trackActivity (reply) error:", err.message),
    );

    // -----------------------------------------------------------------------------
  } catch (err) {
    console.error("createReply error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/communities/:communityId/discussions/:discussionId/replies
 * Paginated top-level replies + their nested replies.
 * Used for infinite scroll after the initial getDiscussionById load.
 * query: { page?, limit? }
 */
const getReplies = async (req, res) => {
  const { communityId, discussionId } = req.params;
  const { tenantId, authorId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  try {
    const [topLevelReplies, total] = await Promise.all([
      DiscussionReply.find(
        { tenantId, discussionId, parentReplyId: null },
        null,
        { skip, limit: Number(limit), sort: { createdAt: 1 } },
      )
        .populate("authorId", "authorname profile email badges")
        .lean(),
      DiscussionReply.countDocuments({
        tenantId,
        discussionId,
        parentReplyId: null,
      }),
    ]);

    const topLevelIds = topLevelReplies.map((r) => r._id);

    const nestedReplies = await DiscussionReply.find({
      tenantId,
      parentReplyId: { $in: topLevelIds },
    })
      .populate("authorId", "authorname profile email badges")
      .lean();

    const nestedByParent = {};
    for (const reply of nestedReplies) {
      const key = reply.parentReplyId.toString();
      nestedByParent[key] = nestedByParent[key] || [];
      nestedByParent[key].push(reply);
    }

    const allIds = [...topLevelIds, ...nestedReplies.map((r) => r._id)];
    const upvotedSet = await getUpvotedSet(allIds, authorId);

    const result = topLevelReplies.map((r) => ({
      ...r,
      hasVoted: upvotedSet.has(r._id.toString()),
      nestedReplies: (nestedByParent[r._id.toString()] || []).map((nr) => ({
        ...nr,
        hasVoted: upvotedSet.has(nr._id.toString()),
      })),
    }));

    res.status(200).json({
      replies: result,
      total,
      page: Number(page),
      hasMore: skip + topLevelReplies.length < total,
    });
  } catch (err) {
    console.error("getReplies error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/communities/:communityId/discussions/:discussionId/replies/:replyId
 * Update reply body. Author-only.
 */
const updateReply = async (req, res) => {
  const { replyId, tenantId: paramTenantId } = req.params;
  const { tenantId, authorId } = req.user;
  const { body } = req.body;

  try {
    if (!body?.trim()) {
      return res.status(400).json({ message: "Reply body is required" });
    }

    const reply = await DiscussionReply.findOneAndUpdate(
      { _id: replyId, tenantId, authorId },
      { $set: { body: body.trim() } },
      { new: true, runValidators: false },
    ).lean();

    if (!reply) {
      return res
        .status(404)
        .json({ message: "Reply not found or not authorised" });
    }

    res.status(200).json({ message: "Reply updated", reply });
  } catch (err) {
    console.error("updateReply error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/communities/:communityId/discussions/:discussionId/replies/:replyId
 * Author or coordinator can delete. Cascades to nested replies and upvotes.
 */
const deleteReply = async (req, res) => {
  const { communityId, discussionId, replyId } = req.params;
  const { tenantId, authorId } = req.user;

  try {
    const [reply, communityRole] = await Promise.all([
      DiscussionReply.findOne({ _id: replyId, tenantId, discussionId }),
      getUserCommunityRole(tenantId, communityId, authorId),
    ]);

    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const isAuthor = reply.authorId.toString() === authorId.toString();
    const isCoordinator = communityRole === "coordinator";

    if (!isAuthor && !isCoordinator) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this reply" });
    }

    const isTopLevel = reply.parentReplyId === null;

    // find nested replies if this is a top-level reply
    const nestedIds = isTopLevel
      ? await DiscussionReply.find({ tenantId, parentReplyId: replyId }, "_id")
          .lean()
          .then((docs) => docs.map((d) => d._id))
      : [];

    await Promise.all([
      DiscussionReply.deleteOne({ _id: replyId }),
      nestedIds.length
        ? DiscussionReply.deleteMany({ _id: { $in: nestedIds } })
        : Promise.resolve(),
      Upvote.deleteMany({ targetId: { $in: [replyId, ...nestedIds] } }),
      // decrement replyCount only for top-level deletions
      isTopLevel
        ? Discussion.findByIdAndUpdate(discussionId, {
            $inc: { replyCount: -1 },
          })
        : Promise.resolve(),
    ]);

    // if this was the accepted answer, unmark the discussion as solved
    if (reply.isAnswer) {
      await Discussion.findByIdAndUpdate(discussionId, {
        $set: { isSolved: false, solvedReplyId: null },
      });
    }

    res.status(200).json({ message: "Reply deleted" });
  } catch (err) {
    console.error("deleteReply error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/communities/:communityId/discussions/:discussionId/replies/:replyId/upvote
 */
// const upvoteReply = async (req, res) => {
//   const { replyId } = req.params;
//   const { tenantId, authorId } = req.user;

//   try {
//     await Upvote.create({
//       tenantId,
//       targetId: replyId,
//       targetType: 'reply',
//       authorId,
//     });

//     const updated = await DiscussionReply.findByIdAndUpdate(
//       replyId,
//       { $inc: { upvoteCount: 1 } },
//       { new: true }
//     ).lean();

//     res.status(200).json({ upvoteCount: updated.upvoteCount });
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(409).json({ message: 'Already upvoted' });
//     }
//     console.error('upvoteReply error:', err.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

/**
 * DELETE /api/communities/:communityId/discussions/:discussionId/replies/:replyId/upvote
 */
// const removeUpvoteReply = async (req, res) => {
//   const { replyId } = req.params;
//   const { authorId } = req.user;

//   try {
//     const result = await Upvote.deleteOne({
//       targetId: replyId,
//       targetType: 'reply',
//       authorId,
//     });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: 'Upvote not found' });
//     }

//     const updated = await DiscussionReply.findByIdAndUpdate(
//       replyId,
//       { $inc: { upvoteCount: -1 } },
//       { new: true }
//     ).lean();

//     res.status(200).json({ upvoteCount: Math.max(0, updated.upvoteCount) });
//   } catch (err) {
//     console.error('removeUpvoteReply error:', err.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const updateUpvoteReply = async (req, res) => {
  const { replyId } = req.params;
  const { tenantId, authorId } = req.user;

  try {
    const existing = await Upvote.findOne({
      targetId: replyId,
      targetType: "reply",
      authorId,
    });

    if (existing) {
      // already upvoted — remove it
      await Upvote.deleteOne({ _id: existing._id });

      const updated = await DiscussionReply.findByIdAndUpdate(
        replyId,
        { $inc: { upvoteCount: -1 } },
        { new: true },
      ).lean();

      return res.status(200).json({
        upvoteCount: Math.max(0, updated.upvoteCount),
        action: "removed",
      });
    }

    // not yet upvoted — add it
    await Upvote.create({
      tenantId,
      targetId: replyId,
      targetType: "reply",
      authorId,
    });

    const updated = await DiscussionReply.findByIdAndUpdate(
      replyId,
      { $inc: { upvoteCount: 1 } },
      { new: true },
    ).lean();

    res.status(200).json({
      upvoteCount: updated.upvoteCount,
      action: "upvoted",
    });
  } catch (err) {
    console.error("toggleUpvoteReply error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/communities/:communityId/discussions/:discussionId/replies/:replyId/answer
 * Shortcut: mark a reply as the accepted answer directly from the reply card.
 * Delegates to markSolved logic internally.
 * OP or coordinator only.
 */
const markAnswer = async (req, res) => {
  req.body.solvedReplyId = req.params.replyId;
  req.params.discussionId = req.params.discussionId;
  return markSolved(req, res);
};

// ─────────────────────────────────────────────────────────────────────────────
//  GROUP 5 — SIDEBAR DATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/communities/:communityId/trending-tags
 * Aggregates the most-used tags across discussions in the last 7 days.
 * Returns top 10 tags with usage count.
 */
const getTrendingTags = async (req, res) => {
  const { communityId } = req.params;
  const { tenantId } = req.user;
  //  console.log("tags called");
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const trending = await Discussion.aggregate([
      {
        $match: {
          tenantId,
          communityId: new mongoose.Types.ObjectId(communityId),
          createdAt: { $gte: oneWeekAgo },
          tags: { $exists: true, $not: { $size: 0 } },
        },
      },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: CommunityTag.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "tag",
        },
      },
      { $unwind: "$tag" },
      {
        $project: {
          _id: "$tag._id",
          name: "$tag.name",
          color: "$tag.color",
          count: 1,
        },
      },
    ]);

    res.status(200).json({ tags: trending });
  } catch (err) {
    console.error("getTrendingTags error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/communities/:communityId/leaderboard
 * Top contributors within this community scoped by period.
 * Points: discussion created = 3, reply created = 1,
 *         discussion upvote received = 2, reply upvote received = 1.
 * query: { period: 'weekly' | 'monthly' | 'allTime' }
 *
 * Note: this is a live aggregation — replace with a precomputed
 * LeaderboardSnapshot read once you move to EC2 and add the
 * scheduled worker.
 */

// const getCommunityLeaderboard = async (req, res) => {
//   const { communityId } = req.params;
//   const { tenantId } = req.user;
//   const { period = 'weekly' } = req.query;

//   // console.log("getCommunityLeaderboard called", communityId, period)

//   const now = new Date();
//   const periodStart = {
//     weekly: new Date(now - 7 * 24 * 60 * 60 * 1000),
//     monthly: new Date(now - 30 * 24 * 60 * 60 * 1000),
//     allTime: new Date(0),
//   }[period] || new Date(now - 7 * 24 * 60 * 60 * 1000);

//   const communityObjectId = new mongoose.Types.ObjectId(communityId);

//   try {
//     const [discussionScores, replyScores] = await Promise.all([
//       Discussion.aggregate([
//         {
//           $match: {
//             tenantId,
//             communityId: communityObjectId,
//             createdAt: { $gte: periodStart },
//           },
//         },
//         {
//           $group: {
//             _id: '$authorId',
//             // 3 pts per discussion created + 2 pts per upvote received
//             points: { $sum: { $add: [3, { $multiply: ['$upvoteCount', 2] }] } },
//           },
//         },
//       ]),
//       DiscussionReply.aggregate([
//         {
//           $match: {
//             tenantId,
//             communityId: communityObjectId,
//             createdAt: { $gte: periodStart },
//           },
//         },
//         {
//           $group: {
//             _id: '$authorId',
//             // 1 pt per reply created + 1 pt per upvote received
//             points: { $sum: { $add: [1, '$upvoteCount'] } },
//           },
//         },
//       ]),
//     ]);

//     // merge scores from both aggregations
//     const scoreMap = {};
//     for (const { _id, points } of [...discussionScores, ...replyScores]) {
//       const key = _id.toString();
//       scoreMap[key] = (scoreMap[key] || 0) + points;
//     }

//     const sorted = Object.entries(scoreMap)
//       .sort(([, a], [, b]) => b - a)
//       .slice(0, 10);

//     const authorIds = sorted.map(([id]) => new mongoose.Types.ObjectId(id));
//     const authors = await Author.find(
//       { _id: { $in: authorIds } },
//       'authorname profile email badges'
//     ).lean();

//     const authorMap = Object.fromEntries(authors.map((a) => [a._id.toString(), a]));

//     const leaderboard = sorted.map(([id, points], index) => ({
//       rank: index + 1,
//       points,
//       ...authorMap[id],
//     }));

//     res.status(200).json({ leaderboard, period });
//   } catch (err) {
//     console.error('getCommunityLeaderboard error:', err.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const getCommunityLeaderboard = async (req, res) => {
  const { communityId } = req.params;
  const { tenantId } = req.user;
  const filter = req.query.filter || "overall";

  const communityObjectId = new mongoose.Types.ObjectId(communityId);

  try {
    // ── build date range — same logic as getTopContributors ──
    let dateRange = null;

    if (filter !== "overall") {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-indexed

      const ranges = {
        current_month: {
          start: new Date(year, month, 1),
          end: new Date(year, month + 1, 1),
        },
        previous_month: {
          start: new Date(year, month - 1, 1),
          end: new Date(year, month, 1),
        },
        two_months_ago: {
          start: new Date(year, month - 2, 1),
          end: new Date(year, month - 1, 1),
        },
      };

      dateRange = ranges[filter] || null;

      if (!dateRange) {
        return res.status(400).json({
          message:
            "Invalid filter. Use: overall | current_month | previous_month | two_months_ago",
        });
      }
    }

    const dateFilter = dateRange
      ? { $gte: dateRange.start, $lt: dateRange.end }
      : null;

    // resolve community name for Post.category match
    const community = await Community.findOne(
      { _id: communityObjectId, tenantId },
      "name",
    ).lean();

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const [discussionScores, replyScores, postScores] = await Promise.all([
      Discussion.aggregate([
        {
          $match: {
            tenantId,
            communityId: communityObjectId,
            ...(dateFilter && { createdAt: dateFilter }),
          },
        },
        {
          $group: {
            _id: "$authorId",
            points: { $sum: { $add: [3, { $multiply: ["$upvoteCount", 2] }] } },
          },
        },
      ]),

      DiscussionReply.aggregate([
        {
          $match: {
            tenantId,
            communityId: communityObjectId,
            ...(dateFilter && { createdAt: dateFilter }),
          },
        },
        {
          $group: {
            _id: "$authorId",
            points: { $sum: { $add: [1, "$upvoteCount"] } },
          },
        },
      ]),

      Post.aggregate([
        {
          $match: {
            tenantId,
            category: community.name,
            ...(dateFilter && { timestamp: dateFilter }),
          },
        },
        {
          $group: {
            _id: "$authorId",
            points: { $sum: 5 },
          },
        },
      ]),
    ]);

    // merge all three score sources
    const scoreMap = {};
    for (const { _id, points } of [
      ...discussionScores,
      ...replyScores,
      ...postScores,
    ]) {
      const key = _id.toString();
      scoreMap[key] = (scoreMap[key] || 0) + points;
    }

    const sorted = Object.entries(scoreMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const authorIds = sorted.map(([id]) => new mongoose.Types.ObjectId(id));
    const authors = await Author.find(
      { _id: { $in: authorIds } },
      "authorname profile email badges",
    ).lean();

    const authorMap = Object.fromEntries(
      authors.map((a) => [a._id.toString(), a]),
    );

    const leaderboard = sorted.map(([id, points], index) => ({
      rank: index + 1,
      points,
      ...authorMap[id],
    }));

    return res.status(200).json({
      leaderboard,
      filter,
      period: dateRange
        ? {
            start: dateRange.start.toISOString().slice(0, 10),
            end: new Date(dateRange.end.getTime() - 1)
              .toISOString()
              .slice(0, 10),
          }
        : null,
    });
  } catch (err) {
    console.error("getCommunityLeaderboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // settings
  getSettings,
  updateWhoCanPost,
  // tags
  createTag,
  getTags,
  updateTag,
  deleteTag,
  // discussion crud
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  updateDiscussionUpvote,
  // discussion actions
  pinDiscussion,
  markSolved,
  // upvoteDiscussion,
  // removeUpvoteDiscussion,
  // replies
  createReply,
  getReplies,
  updateReply,
  deleteReply,
  updateUpvoteReply,
  // upvoteReply,
  // removeUpvoteReply,
  markAnswer,
  // sidebar
  getTrendingTags,
  getCommunityLeaderboard,
};
