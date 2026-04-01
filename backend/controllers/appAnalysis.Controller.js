const Author = require("../models/blogAuthorSchema");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const mongoose = require("mongoose");

dotenv = require("dotenv");
dotenv.config();

const getCategoryAnalytics = async (req, res) => {
  try {
    const authors = await Author.find(
      {},
      { role: 1, community: 1, followers: 1, posts: 1 }
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
    const author = await Author.findOne({email: {$eq: email}});
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    const role = author.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [totalUsers, students, coordinators, admins, totalPlaylists, postsAgg] =
      await Promise.all([
        Author.countDocuments(),
        Author.countDocuments({ role: 'student' }),
        Author.countDocuments({ role: 'coordinator' }),
        Author.countDocuments({ role: 'admin' }),
        TutorPlayList.countDocuments(),
        Author.aggregate([
          { $project: { postCount: { $size: { $ifNull: ['$posts', []] } } } },
          { $group: { _id: null, totalPosts: { $sum: '$postCount' } } },
        ]),
      ]);

    const totalPosts = postsAgg.length ? postsAgg[0].totalPosts : 0;

    const newThisMonthAgg = await Author.aggregate([
      {
        $addFields: {
          createdAt: { $toDate: '$_id' },
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
      { $count: 'count' },
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
    console.error('getAppSummary error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategoryAnalytics,
  getAppSummary,
};