
const {Author, Post} = require("../models/blogAuthorSchema");
const TutorPlayList = require("../models/tutorPlaylistSchema");

const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const mongoose = require("mongoose");
const _ = require("lodash");

dotenv = require("dotenv");
dotenv.config();


const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const trimmedQuery = query.trim();
    const safeQuery = _.escapeRegExp(trimmedQuery);

    // use both text search (relevance) + regex (partial prefix match)
    // text search finds whole-word matches ranked by relevance
    // regex catches partial matches text search would miss (e.g. "Gen" → "GenAI")
    const searchRegex = new RegExp(safeQuery, 'i');

    const [
      postTextResults,
      postRegexResults,
      playlistTextResults,
      playlistRegexResults,
    ] = await Promise.all([
      // text index search — relevance ranked
      Post.find(
        { $text: { $search: trimmedQuery } },
        { score: { $meta: "textScore" } }
      )
        .select("_id title category image authorId timestamp")
        .sort({ score: { $meta: "textScore" } })
        .limit(5)
        .populate("authorId", "authorname email profile")
        .lean(),

      // regex search — partial prefix match
      Post.find({ title: { $regex: searchRegex } })
        .select("_id title category image authorId timestamp")
        .sort({ timestamp: -1 })
        .limit(5)
        .populate("authorId", "authorname email profile")
        .lean(),

      // text index search for playlists
      TutorPlayList.find(
        { $text: { $search: trimmedQuery } },
        { score: { $meta: "textScore" } }
      )
        .select("_id title domain thumbnail email name")
        .sort({ score: { $meta: "textScore" } })
        .limit(5)
        .lean(),

      // regex search for playlists
      TutorPlayList.find({ title: { $regex: searchRegex } })
        .select("_id title domain thumbnail email name")
        .sort({ _id: -1 })
        .limit(5)
        .lean(),
    ]);

    // merge text + regex results, dedup by _id, keep top 5
    const mergeAndDedup = (textResults, regexResults) => {
      const seen = new Set();
      const merged = [];

      // text results first — higher relevance
      for (const doc of [...textResults, ...regexResults]) {
        const id = doc._id.toString();
        if (!seen.has(id)) {
          seen.add(id);
          merged.push(doc);
        }
        if (merged.length === 5) break;
      }
      return merged;
    };

    const mergedPosts     = mergeAndDedup(postTextResults,     postRegexResults);
    const mergedPlaylists = mergeAndDedup(playlistTextResults, playlistRegexResults);

    // shape post suggestions
    const postSuggestions = mergedPosts.map(post => ({
      _id:         post._id,
      title:       post.title,
      category:    post.category,
      image:       post.image    || "",
      timestamp:   post.timestamp,
      authorName:  post.authorId?.authorname || "",
      authorEmail: post.authorId?.email      || "",
      profile:     post.authorId?.profile    || "",
      type:        "post",
    }));

    // shape playlist suggestions
    const playlistSuggestions = mergedPlaylists.map(playlist => ({
      _id:       playlist._id,
      title:     playlist.title,
      domain:    playlist.domain,
      thumbnail: playlist.thumbnail || "",
      email:     playlist.email,
      name:      playlist.name,
      type:      "playlist",
    }));

    return res.status(200).json({
      query:     trimmedQuery,
      posts:     postSuggestions,
      playlists: playlistSuggestions,
      total:     postSuggestions.length + playlistSuggestions.length,
    });
  } catch (err) {
    console.error("getSearchSuggestions error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = {getSearchSuggestions}