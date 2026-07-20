const { Author, Post } = require("../models/blogAuthorSchema");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const Community = require("../models/communitySchema");
const CommunityMembership = require("../models/communityMembershipSchema");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const mongoose = require("mongoose");

dotenv = require("dotenv");
dotenv.config();

// const getCategoryAnalytics = async (req, res) => {
//   try {
//     const [authors, postCounts] = await Promise.all([
//       Author.find({}, { role: 1, community: 1, followers: 1 }),
//       Post.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
//     ]);

//     const analyticsMap = {};

//     // postscount from Post collection — not from author.posts
//     for (const { _id: category, count } of postCounts) {
//       if (!category) continue;
//       analyticsMap[category] = {
//         categoryname: category,
//         followerscount: 0,
//         authorcount: 0,
//         postscount: count,
//       };
//     }

//     // authorcount and followerscount from Author collection — unchanged
//     for (const author of authors) {
//       if (author.role === "coordinator") {
//         for (const domain of author.community) {
//           if (!analyticsMap[domain]) {
//             analyticsMap[domain] = {
//               categoryname: domain,
//               followerscount: 0,
//               authorcount: 0,
//               postscount: 0,
//             };
//           }
//           analyticsMap[domain].authorcount += 1;
//         }
//       }

//       if (author.role === "student") {
//         for (const domain of author.community) {
//           if (!analyticsMap[domain]) {
//             analyticsMap[domain] = {
//               categoryname: domain,
//               followerscount: 0,
//               authorcount: 0,
//               postscount: 0,
//             };
//           }
//           analyticsMap[domain].followerscount += 1;
//         }
//       }
//     }

//     res.status(200).json({ analytics: Object.values(analyticsMap) });
//   } catch (err) {
//     console.error("getCategoryAnalytics error:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

const getCategoryAnalytics = async (req, res) => {
  try {
    // console.log("req.user",req.user)
    // fallback: if token predates tenantId inclusion, look it up from DB
    let tenantId = req.user.tenantId;
    if (!tenantId) {
      const author = await Author.findOne(
        { email: req.user.email },
        'tenantId'
      );
      tenantId = author?.tenantId || 'dsu';
    }

    const [communities, memberships, postCounts] = await Promise.all([
      Community.find({ tenantId }),
      CommunityMembership.aggregate([
        { $match: { tenantId, role: 'coordinator' } },
        { $group: { _id: '$communityId', coordinatorCount: { $sum: 1 } } },
      ]),
      Post.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const coordinatorMap = Object.fromEntries(
      memberships.map((m) => [m._id.toString(), m.coordinatorCount])
    );
    const postCountMap = Object.fromEntries(
      postCounts.map((p) => [p._id, p.count])
    );

    const analytics = communities.map((c) => ({
      categoryname:     c.name,
      followerscount:   c.memberCount,
      authorcount: coordinatorMap[c._id.toString()] || 0,
      postscount:       postCountMap[c.name] || 0,
    }));

    res.status(200).json({ analytics });
  } catch (err) {
    console.error('getCategoryAnalytics error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const getAppSummary = async (req, res) => {
  const { email } = req.params;
  try {
    const author = await Author.findOne({ email: { $eq: email } }).select(
      "role",
    );
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    if (author.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    );

    const [
      totalUsers,
      students,
      coordinators,
      admins,
      totalPlaylists,
      totalPosts, // fix: Post.countDocuments() is the source of truth
    ] = await Promise.all([
      Author.countDocuments(),
      Author.countDocuments({ role: "student" }),
      Author.countDocuments({ role: "coordinator" }),
      Author.countDocuments({ role: "admin" }),
      TutorPlayList.countDocuments(),
      Post.countDocuments(), // fix: was Author.aggregate $size "$posts" — fragile after normalization
    ]);

    // newThisMonth — unchanged, uses ObjectId timestamp trick correctly
    const newThisMonthAgg = await Author.aggregate([
      { $addFields: { createdAt: { $toDate: "$_id" } } },
      { $match: { createdAt: { $gte: monthStart, $lt: nextMonthStart } } },
      { $count: "count" },
    ]);
    const newThisMonth = newThisMonthAgg.length ? newThisMonthAgg[0].count : 0;

    // response shape identical to before
    res.status(200).json({
      summary: {
        totalUsers,
        students,
        coordinators,
        admins,
        newThisMonth,
        totalPosts,
        totalPlaylists,
      },
    });
  } catch (err) {
    console.error("getAppSummary error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

const getMonthlyPostCounts = async (req, res) => {
  const requestEmail = req.params.email;
  const requestedYear = req.query.year ? Number(req.query.year) : null;

  if (!requestEmail) {
    return res
      .status(400)
      .json({ message: "Email is required as path param." });
  }

  if (
    requestedYear &&
    (!Number.isInteger(requestedYear) ||
      requestedYear < 1970 ||
      requestedYear > 3000)
  ) {
    return res.status(400).json({
      message: "Invalid year parameter. Use a 4-digit year (1970-3000).",
    });
  }

  try {
    // fix: .select('role') — only field needed for the admin check
    const author = await Author.findOne({
      email: { $eq: requestEmail },
    }).select("role");
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    if (author.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let aggregation;

    if (requestedYear) {
      // Mode 1: specific year — Jan to Dec
      const yearStart = new Date(requestedYear, 0, 1);
      const yearEnd = new Date(requestedYear, 11, 31, 23, 59, 59);

      // fix: aggregate on Post collection directly — $unwind "$posts" on Author
      // produced bare ObjectIds with no timestamp field, every $match returned nothing
      aggregation = await Post.aggregate([
        { $match: { timestamp: { $gte: yearStart, $lte: yearEnd } } },
        { $group: { _id: { $month: "$timestamp" }, count: { $sum: 1 } } },
      ]);
    } else {
      // Mode 2: last 12 months
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      // fix: same — aggregate on Post collection directly
      aggregation = await Post.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
            },
            count: { $sum: 1 },
          },
        },
      ]);
    }

    // ── Result processing — identical to original ──────────────────────────

    let monthlyData = [];

    if (requestedYear) {
      const monthCounts = Array(12).fill(0);
      for (const doc of aggregation) {
        if (doc._id >= 1 && doc._id <= 12) {
          monthCounts[doc._id - 1] = doc.count;
        }
      }
      monthlyData = monthNames.map((month, index) => ({
        month,
        count: monthCounts[index],
      }));
      return res.status(200).json({ year: requestedYear, monthlyData });
    } else {
      const monthMap = {};
      for (const doc of aggregation) {
        const key = `${doc._id.year}-${doc._id.month}`;
        monthMap[key] = doc.count;
      }

      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = monthNames[month - 1];
        const key = `${year}-${month}`;
        monthlyData.push({
          month: `${monthName}'\n${year.toString().slice(-2)}`,
          count: monthMap[key] || 0,
        });
      }
      return res.status(200).json({ year: "last12months", monthlyData });
    }
  } catch (err) {
    console.error("getMonthlyPostCounts error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

const getTopContributors = async (req, res) => {
  const requestEmail = req.params.email;
  const limitFromClient = Number(req.query.limit);
  const limit =
    Number.isInteger(limitFromClient) && limitFromClient > 0
      ? limitFromClient
      : 10;

  // filter: 'overall' | 'current_month' | 'previous_month' | 'two_months_ago'
  const filter = req.query.filter || "overall";

  if (!requestEmail) {
    return res
      .status(400)
      .json({ message: "Email is required as path param." });
  }

  try {
    const admin = await Author.findOne({ email: { $eq: requestEmail } }).select(
      "role",
    );
    if (!admin) return res.status(404).json({ message: "Author not found" });
    // if (admin.role !== "admin")
    //   return res.status(403).json({ message: "Access denied" });

    // ── build date range from filter ──────────────────────────
    let dateRange = null; // null = no filter = overall

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

    // ── build post match pipeline based on date range ─────────
    const postMatchPipeline = dateRange
      ? [
          {
            $match: {
              $expr: { $eq: ["$authorId", "$$authorId"] },
              timestamp: { $gte: dateRange.start, $lt: dateRange.end },
            },
          },
          { $count: "count" },
        ]
      : [
          { $match: { $expr: { $eq: ["$authorId", "$$authorId"] } } },
          { $count: "count" },
        ];

    // ── build playlist match pipeline based on date range ─────
    // TutorPlayList uses ObjectId timestamp — extract via $toDate on _id
    const playlistMatchPipeline = dateRange
      ? [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$email", "$$authorEmail"] },
                  { $gte: [{ $toDate: "$_id" }, dateRange.start] },
                  { $lt: [{ $toDate: "$_id" }, dateRange.end] },
                ],
              },
            },
          },
          { $count: "count" },
        ]
      : [
          { $match: { $expr: { $eq: ["$email", "$$authorEmail"] } } },
          { $count: "count" },
        ];

    const contributors = await Author.aggregate([
      {
        $match: { role: { $in: ["admin", "coordinator"] } },
      },
      {
        $addFields: {
          followerscount: { $size: { $ifNull: ["$followers", []] } },
          followingcount: { $size: { $ifNull: ["$following", []] } },
        },
      },
      {
        $lookup: {
          from: "posts",
          let: { authorId: "$_id" },
          pipeline: postMatchPipeline,
          as: "postAgg",
        },
      },
      {
        $addFields: {
          postsCount: {
            $ifNull: [{ $arrayElemAt: ["$postAgg.count", 0] }, 0],
          },
        },
      },
      {
        $lookup: {
          from: "tutorplaylists",
          let: { authorEmail: "$email" },
          pipeline: playlistMatchPipeline,
          as: "playlistAgg",
        },
      },
      {
        $addFields: {
          playlistCount: {
            $ifNull: [{ $arrayElemAt: ["$playlistAgg.count", 0] }, 0],
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$authorname",
          email: 1,
          profile: 1,
          community: 1,
          personalLinks: 1,
          postsCount: 1,
          playlistCount: 1,
          followerscount: 1,
          followingcount: 1,
          badges: 1,
        },
      },
      { $sort: { postsCount: -1, followerscount: -1, followingcount: -1 } },
      { $limit: limit },
    ]);

    return res.status(200).json({
      contributors,
      filter,
      // include period metadata so frontend can display the label
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
    console.error("getTopContributors error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

const getContributors = async (req, res) => {
  const requestEmail = req.params.email;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!requestEmail) {
    return res
      .status(400)
      .json({ message: "Email is required as path param." });
  }

  try {
    // fix: added $eq and .select('role')
    const admin = await Author.findOne({ email: { $eq: requestEmail } }).select(
      "role",
    );
    if (!admin) return res.status(404).json({ message: "Author not found" });
    if (admin.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const contributors = await Author.find({
      role: { $in: ["admin", "coordinator"] },
    })
      .select("-password -otp -otpExpiresAt")
      .skip(skip)
      .limit(limit)
      .lean();

    const contributorIds = contributors.map((c) => c._id);
    const contributorEmails = contributors.map((c) => c.email);

    // fix: get true post counts from Post collection — contributor.posts.length
    // counted ObjectId refs which can be stale after failed deletes
    const [playlistCountsByEmail, postCountsByAuthor] = await Promise.all([
      TutorPlayList.aggregate([
        { $match: { email: { $in: contributorEmails } } },
        { $group: { _id: "$email", count: { $sum: 1 } } },
      ]),
      Post.aggregate([
        { $match: { authorId: { $in: contributorIds } } },
        { $group: { _id: "$authorId", count: { $sum: 1 } } },
      ]),
    ]);

    const playlistCountMap = playlistCountsByEmail.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // fix: map by authorId string for O(1) lookup
    const postCountMap = postCountsByAuthor.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const formattedContributors = contributors.map((contributor) => ({
      community: contributor.community || [],
      email: contributor.email,
      followerscount: contributor.followers?.length || 0,
      followingcount: contributor.following?.length || 0,
      name: contributor.authorname,
      personalLinks: contributor.personalLinks || [],
      playlistCount: playlistCountMap[contributor.email] || 0,
      postsCount: postCountMap[contributor._id.toString()] || 0, // fix: from Post collection
      profile: contributor.profile,
      role: contributor.role,
    }));

    const totalContributors = await Author.countDocuments({
      role: { $in: ["admin", "coordinator"] },
    });

    res.status(200).json({
      page,
      limit,
      totalContributors,
      totalPages: Math.ceil(totalContributors / limit),
      contributors: formattedContributors,
    });
  } catch (err) {
    console.error("Error fetching contributors:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//reviewed ----------------------------------------------------------------------------
const getStudents = async (req, res) => {
  const requestEmail = req.params.email;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  if (!requestEmail) {
    return res
      .status(400)
      .json({ message: "Email is required as path param." });
  }
  try {
    const admin = await Author.findOne({ email: requestEmail });
    if (!admin) {
      return res.status(404).json({ message: "Author not found" });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // console.log(`getContributors called by ${requestEmail} with page ${page} and limit ${limit}`);
    // Fetch contributors with roles 'admin' or 'coordinator'
    const contributors = await Author.find({
      role: { $in: ["student"] },
    })
      .skip(skip)
      .limit(limit)
      .lean();

    // Aggregate playlist counts from TutorPlayList by author email
    // const contributorEmails = contributors.map((c) => c.email);
    // const playlistCountsByEmail = await TutorPlayList.aggregate([
    //   { $match: { email: { $in: contributorEmails } } },
    //   { $group: { _id: "$email", count: { $sum: 1 } } },
    // ]).exec();

    // Format contributor data
    const formattedContributors = contributors.map((contributor) => ({
      community: contributor.community || [],
      email: contributor.email,
      followingcount: contributor.following ? contributor.following.length : 0,
      name: contributor.authorname,
      personalLinks: contributor.personalLinks || [],
      profile: contributor.profile,
      role: contributor.role,
      id: contributor._id.toString(),
    }));

    // console.log("Formatted students:", formattedContributors);

    // Count total contributors
    const totalStudents = await Author.countDocuments({
      role: { $in: ["student"] },
    });

    res.status(200).json({
      page,
      limit,
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      students: formattedContributors,
    });
  } catch (err) {
    console.error("Error fetching contributors:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getCoordinators = async (req, res) => {
  const requestEmail = req.params.email;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!requestEmail) {
    return res
      .status(400)
      .json({ message: "Email is required as path param." });
  }

  try {
    // fix: added $eq and .select('role')
    const admin = await Author.findOne({ email: { $eq: requestEmail } }).select(
      "role",
    );
    if (!admin) return res.status(404).json({ message: "Author not found" });
    if (admin.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const contributors = await Author.find({ role: { $in: ["coordinator"] } })
      .skip(skip)
      .limit(limit)
      .lean();

    const contributorIds = contributors.map((c) => c._id);
    const contributorEmails = contributors.map((c) => c.email);

    // fix: run both aggregations in parallel
    const [playlistCountsByEmail, postCountsByAuthor] = await Promise.all([
      TutorPlayList.aggregate([
        { $match: { email: { $in: contributorEmails } } },
        { $group: { _id: "$email", count: { $sum: 1 } } },
      ]),
      // fix: true post count from Post collection — contributor.posts.length counted ObjectId refs
      Post.aggregate([
        { $match: { authorId: { $in: contributorIds } } },
        { $group: { _id: "$authorId", count: { $sum: 1 } } },
      ]),
    ]);

    const playlistCountMap = playlistCountsByEmail.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const postCountMap = postCountsByAuthor.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const formattedContributors = contributors.map((contributor) => ({
      community: contributor.community || [],
      email: contributor.email,
      followerscount: contributor.followers?.length || 0,
      followingcount: contributor.following?.length || 0,
      name: contributor.authorname,
      personalLinks: contributor.personalLinks || [],
      playlistCount: playlistCountMap[contributor.email] || 0,
      postsCount: postCountMap[contributor._id.toString()] || 0, // fix: from Post collection
      profile: contributor.profile,
      role: contributor.role,
      id: contributor._id.toString(),
    }));

    const totalCoordinators = await Author.countDocuments({
      role: { $in: ["coordinator"] },
    });

    res.status(200).json({
      page,
      limit,
      totalCoordinators,
      totalPages: Math.ceil(totalCoordinators / limit),
      coordinators: formattedContributors,
    });
  } catch (err) {
    console.error("Error fetching coordinators:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAdmins = async (req, res) => {
  const requestEmail = req.params.email;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!requestEmail) {
    return res
      .status(400)
      .json({ message: "Email is required as path param." });
  }

  try {
    // fix: added $eq and .select('role')
    const admin = await Author.findOne({ email: { $eq: requestEmail } }).select(
      "role",
    );
    if (!admin) return res.status(404).json({ message: "Author not found" });
    if (admin.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const contributors = await Author.find({ role: { $in: ["admin"] } })
      .skip(skip)
      .limit(limit)
      .lean();

    const contributorIds = contributors.map((c) => c._id);
    const contributorEmails = contributors.map((c) => c.email);

    // fix: run both in parallel + true post count from Post collection
    const [playlistCountsByEmail, postCountsByAuthor] = await Promise.all([
      TutorPlayList.aggregate([
        { $match: { email: { $in: contributorEmails } } },
        { $group: { _id: "$email", count: { $sum: 1 } } },
      ]),
      Post.aggregate([
        { $match: { authorId: { $in: contributorIds } } },
        { $group: { _id: "$authorId", count: { $sum: 1 } } },
      ]),
    ]);

    const playlistCountMap = playlistCountsByEmail.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const postCountMap = postCountsByAuthor.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const formattedContributors = contributors.map((contributor) => ({
      community: contributor.community || [],
      email: contributor.email,
      followerscount: contributor.followers?.length || 0,
      followingcount: contributor.following?.length || 0,
      name: contributor.authorname,
      personalLinks: contributor.personalLinks || [],
      playlistCount: playlistCountMap[contributor.email] || 0,
      postsCount: postCountMap[contributor._id.toString()] || 0,
      profile: contributor.profile,
      role: contributor.role,
      id: contributor._id.toString(),
    }));

    const totalAdmins = await Author.countDocuments({
      role: { $in: ["admin"] },
    });

    res.status(200).json({
      page,
      limit,
      totalAdmins,
      totalPages: Math.ceil(totalAdmins / limit),
      admins: formattedContributors,
    });
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getCategoryAnalytics,
  getAppSummary,
  getMonthlyPostCounts,
  getTopContributors,
  getContributors,
  getStudents,
  getCoordinators,
  getAdmins,
};
