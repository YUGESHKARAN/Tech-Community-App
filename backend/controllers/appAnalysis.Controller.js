const Author = require("../models/blogAuthorSchema");
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


module.exports = {
  getCategoryAnalytics
}