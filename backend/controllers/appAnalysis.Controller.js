const Author = require("../models/blogAuthorSchema");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const mongoose = require("mongoose");

dotenv = require("dotenv");
dotenv.config();

const getCategoryAnalytics = async (req, res) => {
  try {
    const authors = await Author.find(
      {},
      { role: 1, community: 1, followers: 1, posts: 1 },
    );

    const analyticsMap = {};

    for (const author of authors) {
      // Count posts per category
      for (const post of author.posts) {
        const category = post.category;
        if (!category) continue;

        if (!analyticsMap[category]) {
          analyticsMap[category] = {
            categoryname: category,
            followerscount: 0,
            authorcount: 0,
            postscount: 0,
          };
        }

        analyticsMap[category].postscount += 1;
      }

      // Count coordinators (authorcount) per community/domain
      if (author.role === "coordinator") {
        for (const domain of author.community) {
          if (!analyticsMap[domain]) {
            analyticsMap[domain] = {
              categoryname: domain,
              followerscount: 0,
              authorcount: 0,
              postscount: 0,
            };
          }
          analyticsMap[domain].authorcount += 1;
        }
      }

      // Count students (followerscount) per community/domain
      if (author.role === "student") {
        for (const domain of author.community) {
          if (!analyticsMap[domain]) {
            analyticsMap[domain] = {
              categoryname: domain,
              followerscount: 0,
              authorcount: 0,
              postscount: 0,
            };
          }
          analyticsMap[domain].followerscount += 1;
        }
      }
    }

    const analytics = Object.values(analyticsMap);

    res.status(200).json({ analytics });
  } catch (err) {
    console.error("getCategoryAnalytics error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

const getAppSummary = async (req, res) => {
  const { email } = req.params;
  try {
    const author = await Author.findOne({ email: { $eq: email } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    const role = author.role;
    if (role !== "admin") {
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
      postsAgg,
    ] = await Promise.all([
      Author.countDocuments(),
      Author.countDocuments({ role: "student" }),
      Author.countDocuments({ role: "coordinator" }),
      Author.countDocuments({ role: "admin" }),
      TutorPlayList.countDocuments(),
      Author.aggregate([
        { $project: { postCount: { $size: { $ifNull: ["$posts", []] } } } },
        { $group: { _id: null, totalPosts: { $sum: "$postCount" } } },
      ]),
    ]);

    const totalPosts = postsAgg.length ? postsAgg[0].totalPosts : 0;

    const newThisMonthAgg = await Author.aggregate([
      {
        $addFields: {
          createdAt: { $toDate: "$_id" },
        },
      },
      {
        $match: {
          createdAt: {
            $gte: monthStart,
            $lt: nextMonthStart,
          },
        },
      },
      { $count: "count" },
    ]);

    const newThisMonth = newThisMonthAgg.length ? newThisMonthAgg[0].count : 0;

    const summary = {
      totalUsers,
      students,
      coordinators,
      admins,
      newThisMonth,
      totalPosts,
      totalPlaylists,
    };

    res.status(200).json({ summary });
  } catch (err) {
    console.error("getAppSummary error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

const getMonthlyPostCounts = async (req, res) => {
  const requestEmail = req.params.email;
  const requestedYear = req.query.year ? Number(req.query.year) : null;
  // const requestedYear = 2026;
  // console.log('getMonthlyPostCounts called with email:', requestEmail, 'year:', requestedYear);

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
    return res
      .status(400)
      .json({
        message: "Invalid year parameter. Use a 4-digit year (1970-3000).",
      });
  }

  try {
    const author = await Author.findOne({ email: { $eq: requestEmail } });
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
    let responseYear;

    if (requestedYear) {
      // Mode 1: Specific year requested - return Jan to Dec of that year
      responseYear = requestedYear;
      const yearStart = new Date(requestedYear, 0, 1);
      const yearEnd = new Date(requestedYear, 11, 31, 23, 59, 59);

      aggregation = await Author.aggregate([
        { $unwind: { path: "$posts", preserveNullAndEmptyArrays: false } },
        {
          $match: {
            "posts.timestamp": {
              $gte: yearStart,
              $lte: yearEnd,
            },
          },
        },
        {
          $project: {
            postMonth: { $month: "$posts.timestamp" },
          },
        },
        {
          $group: {
            _id: "$postMonth",
            count: { $sum: 1 },
          },
        },
      ]);
    } else {
      // Mode 2: No year provided - return last 12 months (current month back 11 months)
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
      responseYear = null; // Dynamic range, no fixed year

      aggregation = await Author.aggregate([
        { $unwind: { path: "$posts", preserveNullAndEmptyArrays: false } },
        {
          $match: {
            "posts.timestamp": {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $project: {
            postYear: { $year: "$posts.timestamp" },
            postMonth: { $month: "$posts.timestamp" },
          },
        },
        {
          $group: {
            _id: { year: "$postYear", month: "$postMonth" },
            count: { $sum: 1 },
          },
        },
      ]);
    }

    // Process results
    let monthlyData = [];

    if (requestedYear) {
      // For specific year: fill all 12 months
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
      res.status(200).json({ year: responseYear, monthlyData });
    } else {
      // For last 12 months: build dynamic label
      const monthMap = {};
      for (const doc of aggregation) {
        const key = `${doc._id.year}-${doc._id.month}`;
        monthMap[key] = doc.count;
      }

      // Generate month labels for last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = monthNames[month - 1];
        const key = `${year}-${month}`;
        const count = monthMap[key] || 0;
        monthlyData.push({
          month: `${monthName}'\n${year.toString().slice(-2)}`,
          count,
        });
        // monthlyData.push({ month: monthName, count });
      }
      res.status(200).json({ year: "last12months", monthlyData });
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

    const contributors = await Author.aggregate([
      {
        $match: {
          role: { $in: ["admin", "coordinator"] },
        },
      },
      {
        $addFields: {
          postsCount: { $size: { $ifNull: ["$posts", []] } },
          followerscount: { $size: { $ifNull: ["$followers", []] } },
          followingcount: { $size: { $ifNull: ["$following", []] } },
        },
      },
      {
        $lookup: {
          from: "tutorplaylists",
          let: { authorEmail: "$email" },
          pipeline: [
            { $match: { $expr: { $eq: ["$email", "$$authorEmail"] } } },
            { $count: "count" },
          ],
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
        },
      },
      { $sort: { postsCount: -1, followerscount: -1, followingcount: -1 } },
      { $limit: limit },
    ]);

    res.status(200).json({ contributors });
  } catch (err) {
    console.error("getTopContributors error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all contributors (admin and coordinators) with pagination
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
      role: { $in: ["admin", "coordinator"] },
    })
      .skip(skip)
      .limit(limit)
      .lean();

    // Aggregate playlist counts from TutorPlayList by author email
    const contributorEmails = contributors.map((c) => c.email);
    const playlistCountsByEmail = await TutorPlayList.aggregate([
      { $match: { email: { $in: contributorEmails } } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
    ]).exec();
    const playlistCountMap = playlistCountsByEmail.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Format contributor data
    const formattedContributors = contributors.map((contributor) => ({
      community: contributor.community || [],
      email: contributor.email,
      followerscount: contributor.followers ? contributor.followers.length : 0,
      followingcount: contributor.following ? contributor.following.length : 0,
      name: contributor.authorname,
      personalLinks: contributor.personalLinks || [],
      playlistCount: playlistCountMap[contributor.email] || 0,
      postsCount: contributor.posts ? contributor.posts.length : 0,
      profile: contributor.profile,
      role: contributor.role,
    }));

    // Count total contributors
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


// Get all Students
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
      id :contributor._id.toString(), 
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


// Get only coordinators
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
      role: { $in: ["coordinator"] },
    })
      .skip(skip)
      .limit(limit)
      .lean();

    // Aggregate playlist counts from TutorPlayList by author email
    const contributorEmails = contributors.map((c) => c.email);
    const playlistCountsByEmail = await TutorPlayList.aggregate([
      { $match: { email: { $in: contributorEmails } } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
    ]).exec();
    const playlistCountMap = playlistCountsByEmail.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Format contributor data
    const formattedContributors = contributors.map((contributor) => ({
      community: contributor.community || [],
      email: contributor.email,
      followerscount: contributor.followers ? contributor.followers.length : 0,
      followingcount: contributor.following ? contributor.following.length : 0,
      name: contributor.authorname,
      personalLinks: contributor.personalLinks || [],
      playlistCount: playlistCountMap[contributor.email] || 0,
      postsCount: contributor.posts ? contributor.posts.length : 0,
      profile: contributor.profile,
      role: contributor.role,
      id: contributor._id.toString(),
    }));

    // Count total contributors
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



// Get only Admins
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
      role: { $in: ["admin"] },
    })
      .skip(skip)
      .limit(limit)
      .lean();

    // Aggregate playlist counts from TutorPlayList by author email
    const contributorEmails = contributors.map((c) => c.email);
    const playlistCountsByEmail = await TutorPlayList.aggregate([
      { $match: { email: { $in: contributorEmails } } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
    ]).exec();
    const playlistCountMap = playlistCountsByEmail.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Format contributor data
    const formattedContributors = contributors.map((contributor) => ({
      community: contributor.community || [],
      email: contributor.email,
      followerscount: contributor.followers ? contributor.followers.length : 0,
      followingcount: contributor.following ? contributor.following.length : 0,
      name: contributor.authorname,
      personalLinks: contributor.personalLinks || [],
      playlistCount: playlistCountMap[contributor.email] || 0,
      postsCount: contributor.posts ? contributor.posts.length : 0,
      profile: contributor.profile,
      role: contributor.role,
      id :contributor._id.toString(),
    }));

    // Count total contributors
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
  getAdmins
};
