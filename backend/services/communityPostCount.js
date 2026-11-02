const Community = require("../models/communitySchema");
const { Post } = require("../models/blogAuthorSchema");
const TutorPlayList = require("../models/tutorPlaylistSchema");

const categoryFilter = (tenantId, category) => ({
  tenantId,
  $or: [{ name: category }, { slug: category }],
});

const adjustCommunityPostCount = async (tenantId, category, amount, options = {}) => {
  if (!tenantId) {
    throw new Error("tenantId is required to update community postCount");
  }
  if (!Number.isInteger(amount) || amount === 0) {
    throw new Error("A non-zero integer postCount adjustment is required");
  }
  if (typeof category !== "string" || !category.trim()) {
    return;
  }

  const filter = categoryFilter(tenantId, category);
  if (amount > 0) {
    return Community.updateMany(
      filter,
      { $inc: { postCount: amount } },
      options.session ? { session: options.session } : {},
    );
  }

  return Community.updateMany(
    filter,
    [
      {
        $set: {
          postCount: {
            $max: [
              0,
              { $subtract: [{ $ifNull: ["$postCount", 0] }, Math.abs(amount)] },
            ],
          },
        },
      },
    ],
    options.session ? { session: options.session } : {},
  );
};

const adjustCommunityPostCounts = async (posts, direction) => {
  if (!Number.isInteger(direction) || direction === 0) {
    throw new Error("A non-zero integer direction is required");
  }

  const counts = new Map();
  for (const post of posts) {
    if (!post?.tenantId || typeof post.category !== "string" || !post.category.trim()) {
      continue;
    }

    const key = JSON.stringify([post.tenantId, post.category]);
    const group = counts.get(key) || {
      tenantId: post.tenantId,
      category: post.category,
      count: 0,
    };
    group.count += 1;
    counts.set(key, group);
  }

  await Promise.all(
    Array.from(counts.values(), ({ tenantId, category, count }) =>
      adjustCommunityPostCount(tenantId, category, count * direction),
    ),
  );
};

const recalculateCommunityPostCountsForPosts = async (posts) => {
  const categoriesByTenant = new Map();
  for (const post of posts) {
    if (!post?.tenantId || typeof post.category !== "string" || !post.category.trim()) {
      continue;
    }

    const categories = categoriesByTenant.get(post.tenantId) || new Set();
    categories.add(post.category);
    categoriesByTenant.set(post.tenantId, categories);
  }

  const communityFilters = [];
  for (const [tenantId, categories] of categoriesByTenant) {
    for (const category of categories) {
      communityFilters.push(
        { tenantId, name: category },
        { tenantId, slug: category },
      );
    }
  }

  if (!communityFilters.length) {
    return;
  }

  const affectedCommunities = await Community.find(
    { $or: communityFilters },
    "_id tenantId name slug",
  ).lean();

  if (!affectedCommunities.length) {
    return;
  }

  const updates = await Promise.all(
    affectedCommunities.map(async (community) => {
      const categories = Array.from(
        new Set([community.name, community.slug].filter(Boolean)),
      );
      const postCount = await Post.countDocuments({
        tenantId: community.tenantId,
        category: { $in: categories },
      });

      return {
        updateOne: {
          filter: { _id: community._id, tenantId: community.tenantId },
          update: { $set: { postCount } },
        },
      };
    }),
  );

  await Community.bulkWrite(updates);
};

const deletePostsAndSyncCommunityPostCounts = async (filter) => {
  const posts = await Post.find(filter).select("_id tenantId category").lean();
  const result = await Post.deleteMany(filter);

  if (result.deletedCount) {
    const postsByTenant = new Map();
    for (const post of posts) {
      const postIds = postsByTenant.get(post.tenantId) || [];
      postIds.push(post._id);
      postsByTenant.set(post.tenantId, postIds);
    }

    await Promise.all(
      Array.from(postsByTenant, ([tenantId, postIds]) =>
        TutorPlayList.updateMany(
          { tenantId, post_ids: { $in: postIds } },
          { $pull: { post_ids: { $in: postIds } } },
        ),
      ),
    );

    if (result.deletedCount === posts.length) {
      await adjustCommunityPostCounts(posts, -1);
    } else {
      await recalculateCommunityPostCountsForPosts(posts);
    }
  }

  return result;
};

module.exports = {
  adjustCommunityPostCount,
  adjustCommunityPostCounts,
  deletePostsAndSyncCommunityPostCounts,
};
