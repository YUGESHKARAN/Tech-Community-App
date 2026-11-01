require("dotenv").config();

const mongoose = require("mongoose");
const connectToDatabase = require("../db");
const Community = require("../models/communitySchema");
const { Author, Post } = require("../models/blogAuthorSchema");

const DEFAULT_TENANT_ID = "dsu";

const backfillCommunityPostCounts = async () => {
  await connectToDatabase();

  const [communities, postCounts] = await Promise.all([
    Community.find({}, "_id tenantId name slug").lean(),
    Post.aggregate([
      {
        $lookup: {
          from: Author.collection.name,
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          tenantId: {
            $ifNull: [
              "$tenantId",
              { $ifNull: ["$author.tenantId", DEFAULT_TENANT_ID] },
            ],
          },
          category: 1,
        },
      },
      {
        $group: {
          _id: { tenantId: "$tenantId", category: "$category" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const countsByTenantAndCategory = new Map(
    postCounts.map(({ _id, count }) => [
      JSON.stringify([_id.tenantId, _id.category]),
      count,
    ]),
  );

  if (communities.length) {
    await Community.bulkWrite(
      communities.map((community) => {
        const categories = new Set([community.name, community.slug].filter(Boolean));
        const postCount = Array.from(categories).reduce(
          (total, category) =>
            total +
            (countsByTenantAndCategory.get(
              JSON.stringify([community.tenantId, category]),
            ) || 0),
          0,
        );

        return {
          updateOne: {
            filter: { _id: community._id, tenantId: community.tenantId },
            update: { $set: { postCount } },
          },
        };
      }),
    );
  }

  console.log(`Updated postCount for ${communities.length} communities.`);
};

backfillCommunityPostCounts()
  .catch((err) => {
    console.error("Community postCount backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
