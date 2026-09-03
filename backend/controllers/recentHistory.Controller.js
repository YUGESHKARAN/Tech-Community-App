const { Author, Post } = require("../models/blogAuthorSchema");
// const Community = require('../models/communitySchema');
// const CommunityMembership = require('../models/communityMembershipSchema');

const TutorPlayList = require("../models/tutorPlaylistSchema");
const mongoose = require("mongoose");

const RECENT_LIMIT = 5;

// ── Read history — populated, with dead references filtered out ──
const getRecentHistory = async (req, res) => {
  const { email } = req.params;
  const { tenantId } = req.user || {};

  try {
    if (!tenantId) {
      return res.status(401).json({ message: "tenantId required" });
    }

    const author = await Author.findOne({ email: { $eq: email }, tenantId })
      .select("recentlyViewed")
      .populate({
        path: "recentlyViewed.posts.postId",
        select: "title image category timestamp tenantId",
        match: { tenantId },
      })
      .populate({
        path: "recentlyViewed.playlists.playlistId",
        select: "name thumbnail title domain tenantId",
        match: { tenantId },
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
  const { tenantId } = req.user || {};

  try {
    if (!tenantId) {
      return res.status(401).json({ message: "tenantId required" });
    }

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

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid itemId" });
    }

    const itemModel = itemType === "post" ? Post : TutorPlayList;
    const item = await itemModel.findOne({ _id: itemId, tenantId }).select("_id").lean();
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const historyAuthor = await Author.findOne({ email: { $eq: email }, tenantId })
      .select("_id")
      .lean();
    if (!historyAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    const field =
      itemType === "post" ? "recentlyViewed.posts" : "recentlyViewed.playlists";
    const idKey = itemType === "post" ? "postId" : "playlistId";

    // Step 1 — remove any existing entry for this item, so re-visiting
    // moves it to the front instead of creating a duplicate.
    await Author.updateOne(
      { email: { $eq: email }, tenantId },
      { $pull: { [field]: { [idKey]: itemId } } },
    );

    // Step 2 — insert at the front, then trim to the last 5.
    await Author.updateOne(
      { email: { $eq: email }, tenantId },
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
