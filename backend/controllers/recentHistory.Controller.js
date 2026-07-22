const { Author, Post } = require("../models/blogAuthorSchema");
// const Community = require('../models/communitySchema');
// const CommunityMembership = require('../models/communityMembershipSchema');

const TutorPlayList = require("../models/tutorPlaylistSchema");
const mongoose = require("mongoose");

const RECENT_LIMIT = 5;

// ── Read history — populated, with dead references filtered out ──
const getRecentHistory = async (req, res) => {
  const { email } = req.params;

  try {
    const author = await Author.findOne({ email: { $eq: email } })
      .select("recentlyViewed")
      .populate({
        path: "recentlyViewed.posts.postId",
        select: "title image category timestamp",
      })
      .populate({
        path: "recentlyViewed.playlists.playlistId",
        select: "name thumbnail title domain", // adjust to whatever fields TutorPlayList actually has
      })
      .lean();

    if (!author) return res.status(404).json({ message: "Author not found" });

    const posts = (author.recentlyViewed?.posts || [])
      .filter((entry) => entry.postId) // drop entries whose post was deleted
      .map((entry) => ({
        ...entry.postId,
        authorEmail: entry.authorEmail,
        authorName: entry.authorName,
        viewedAt: entry.viewedAt,
      }));

    const playlists = (author.recentlyViewed?.playlists || [])
      .filter((entry) => entry.playlistId)
      .map((entry) => ({
        ...entry.playlistId,
        authorEmail: entry.authorEmail,
        authorName: entry.authorName,
        viewedAt: entry.viewedAt,
      }));

    res.status(200).json({ posts, playlists });
  } catch (err) {
    console.error("getRecentHistory error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Track a view — call this whenever a user opens a post or playlist ──
const trackRecentView = async (req, res) => {
  const { email, authorEmail, authorName, itemType, itemId } = req.body; // itemType: 'post' | 'playlist'

  try {
    if (!email || !itemType || !itemId || !authorEmail || !authorName) {
      return res
        .status(400)
        .json({
          message:
            "email, itemType, itemId, authorName and authorEmail are required",
        });
    }
    if (!["post", "playlist"].includes(itemType)) {
      return res
        .status(400)
        .json({ message: "itemType must be 'post' or 'playlist'" });
    }

    const field =
      itemType === "post" ? "recentlyViewed.posts" : "recentlyViewed.playlists";
    const idKey = itemType === "post" ? "postId" : "playlistId";

    // Step 1 — remove any existing entry for this item, so re-visiting
    // moves it to the front instead of creating a duplicate.
    await Author.updateOne(
      { email: { $eq: email } },
      { $pull: { [field]: { [idKey]: itemId } } },
    );

    // Step 2 — insert at the front, then trim to the last 5.
    await Author.updateOne(
      { email: { $eq: email } },
      {
        $push: {
          [field]: {
            $each: [
              {
                authorEmail,
                authorName,
                [idKey]: itemId,
                viewedAt: new Date(),
              },
            ],
            $position: 0,
            $slice: RECENT_LIMIT,
          },
        },
      },
    );

    res.status(200).json({ message: "Recent view tracked" });
  } catch (err) {
    console.error("trackRecentView error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { trackRecentView, getRecentHistory };
