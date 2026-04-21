const { v4: uuidv4 } = require("uuid");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const { Author, Post } = require("../models/blogAuthorSchema");
const mongoose = require("mongoose");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

require("dotenv").config();

const redisClient = require("../middleware/redis");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

// reviewed
// const getAllTutorPlaylist = async (req, res) => {
//   try {
//     const tutorPlaylist = await TutorPlayList.find({ });
//     // if (tutorPlaylist?.length == 0) {
//     //   return res.status(404).json({ message: "Playlist is empty" });
//     // }
//     const count = tutorPlaylist.length;

//     res.status(200).json({message:"all users playlist", data: tutorPlaylist, count:count });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const getAllTutorPlaylist = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     const skip = (page - 1) * limit;

//     console.log("")
//     const tutorPlaylist = await TutorPlayList.find({})
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const count = await TutorPlayList.countDocuments();

//     res.status(200).json({
//       message: "all users playlist",
//       data: tutorPlaylist,
//       count,
//       page,
//       totalPages: Math.ceil(count / limit),
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const getAllTutorPlaylist = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tutorPlaylist = await TutorPlayList.find({}).skip(skip).limit(limit);

    const count = await TutorPlayList.countDocuments();

    // console.log(`playlist page ${page} limit ${limit}`);

    res.status(200).json({
      message: "all users playlist",
      data: tutorPlaylist,
      count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//reviewed------------------------------------------------------------
// Redis cache implemented getRecommendedTutorPlaylist
// const getRecommendedTutorPlaylist = async (req, res) => {
//   try {
//     const { email } = req.params;

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // 1. CHECK CACHE FIRST
//     const cacheKey = `playlist:${email}:page:${page}:limit:${limit}`;

//     if (cachedData) {
//       console.log("Serving from Redis cache");
//       return res.status(200).json(JSON.parse(cachedData));
//     }

//     const currentAuthor = await Author.findOne({ email: { $eq: email } });
//     if (!currentAuthor) {
//       return res.status(404).json({ message: "author not found" });
//     }

//     const authorCommunity = currentAuthor.community || [];
//     const authorFollowers = currentAuthor.followers || [];

//     const authorFollowersSet = new Set(authorFollowers);

//     const tutorPlaylist = await TutorPlayList.find({}).skip(skip).limit(limit);

//     const priorityPlaylist = [];
//     const othersPlaylist = [];

//     for (const playlist of tutorPlaylist) {
//       const inFollowing = authorFollowersSet.has(playlist.email);
//       const inCommunity = authorCommunity.includes(playlist.domain);

//       if (inFollowing || inCommunity) {
//         priorityPlaylist.push(playlist);
//       } else {
//         othersPlaylist.push(playlist);
//       }
//     }

//     const shuffle = (arr) => {
//       const a = arr.slice();
//       for (let i = a.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [a[i], a[j]] = [a[j], a[i]];
//       }
//       return a;
//     };

//     const recommendedPart = shuffle(priorityPlaylist);
//     const remainingPart = shuffle(othersPlaylist);

//     const finalPlaylist = [...recommendedPart, ...remainingPart];

//     const count = await TutorPlayList.countDocuments();

//     // console.log(`recomended playlist page ${page} limit ${limit}`);
//     // console.log("recommended playlist called")

//     const responseData = {
//       message: "recommended playlist",
//       data: finalPlaylist,
//       count,
//     };

//     // 3. STORE IN REDIS (cache for 5 min seconds)
//     await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
//      console.log("ply content Serving from DB and cached to Redis");
//     res.status(200).json(responseData);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const getPlaylistByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;
//     if (!email) return res.status(400).json({ message: "email required" });

//     const tutorPlayList = await TutorPlayList.find({ email });

//     // if (!tutorPlayList || tutorPlayList.length == 0) {
//     //   return res.status(204).json({ message: "Playlist is empty" });
//     // }
//     const playlistCountByEmail = tutorPlayList.length;

//     res.status(200).json({message:"individual user playlist", data: tutorPlayList, count:playlistCountByEmail });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// const getRecommendedTutorPlaylist = async (req, res) => {
//   try {
//     const { email } = req.params;

//     const page = parseInt(req.query.page) || 1;
//     const limit = Math.min(parseInt(req.query.limit) || 10, 30);

//     const feedCacheKey = `playlistHomeFeed:${email}:full`;

//     let allPlaylists = [];

//     //1. CHECK FULL FEED CACHE
//     const cachedFeed = await redisClient.get(feedCacheKey);

//     if (cachedFeed) {
//       console.log("Playlist FULL FEED from Redis");
//       allPlaylists = JSON.parse(cachedFeed);
//     } else {
//       console.log("Playlist Cache MISS → Generating from DB");
//       const currentAuthor = await Author.findOne({ email:{ $eq: email } });

//       if (!currentAuthor) {
//         return res.status(404).json({ message: "Author not found" });
//       }

//       const authorCommunity = currentAuthor.community || [];
//       const authorFollowers = currentAuthor.followers || [];

//       const followersSet = new Set(authorFollowers);

//       //REMOVE skip/limit here → fetch all
//       const tutorPlaylists = await TutorPlayList.find({});

//       const priorityPlaylist = [];
//       const othersPlaylist = [];

//       // Split playlists
//       for (const playlist of tutorPlaylists) {
//         const inFollowing = followersSet.has(playlist.email);
//         const inCommunity = authorCommunity.includes(playlist.domain);

//         if (inFollowing || inCommunity) {
//           priorityPlaylist.push(playlist);
//         } else {
//           othersPlaylist.push(playlist);
//         }
//       }

//       // Shuffle once
//       const shuffle = (arr) => {
//         const a = arr.slice();
//         for (let i = a.length - 1; i > 0; i--) {
//           const j = Math.floor(Math.random() * (i + 1));
//           [a[i], a[j]] = [a[j], a[i]];
//         }
//         return a;
//       };

//       const recommendedPart = shuffle(priorityPlaylist);
//       const remainingPart = shuffle(othersPlaylist);

//       allPlaylists = [...recommendedPart, ...remainingPart];

//       // Cache FULL FEED
//       await redisClient.setEx(
//         feedCacheKey,
//         300,
//         JSON.stringify(allPlaylists)
//       );
//     }

//     // 2. PAGINATION
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;

//     const paginatedPlaylists = allPlaylists.slice(startIndex, endIndex);

//     // 3. RESPONSE
//     const responseData = {
//       message: "Recommended playlist",
//       page,
//       limit,
//       total: allPlaylists.length,
//       totalPages: Math.ceil(allPlaylists.length / limit),
//       hasMore: endIndex < allPlaylists.length,
//       data: paginatedPlaylists,
//     };

//     console.log("Playlist served (cached or sliced)");

//     res.status(200).json(responseData);
//   } catch (err) {
//     console.error("Error in getRecommendedTutorPlaylist:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
const PLAYLIST_PRIORITY_LIMIT = 100;
const PLAYLIST_OTHER_LIMIT    = 200;
const PLAYLIST_FEED_TTL       = 300;
const PLAYLIST_FRESH_TTL      = 60;
const PLAYLIST_FRESH_COUNT    = 5;

const scorePlaylists = (playlist) => {
  const ageHours = (Date.now() -
    new mongoose.Types.ObjectId(playlist._id).getTimestamp()) / 36e5;
  const recency  = Math.max(0, 1 - ageHours / 168);
  // collaboratorCount already computed by aggregate $size — no .length needed
  const collabs  = (playlist.collaboratorCount || 0) * 0.3;
  return recency * 10 + collabs;
};

const getRecommendedTutorPlaylist = async (req, res) => {
  try {
    const { email } = req.params;
    const page  = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);

    const feedCacheKey  = `playlistHomeFeed:${email}:ids`;
    const freshCacheKey = `playlistHomeFeed:fresh:ids`;

    // ── 1. FRESH PLAYLISTS — shared 60s cache ────────────────
    let freshIds = [];
    const cachedFresh = await redisClient.get(freshCacheKey);

    if (cachedFresh) {
      freshIds = JSON.parse(cachedFresh);
    } else {
      // select _id only — no collaborators array fetched
      const freshDocs = await TutorPlayList.find({})
        .select("_id")
        .sort({ _id: -1 })
        .limit(20)
        .lean();

      freshIds = freshDocs.map(p => p._id.toString());
      await redisClient.setEx(freshCacheKey, PLAYLIST_FRESH_TTL, JSON.stringify(freshIds));
    }

    // ── 2. PERSONALISED FEED IDs ──────────────────────────────
    let feedIds = [];
    const cachedIds = await redisClient.get(feedCacheKey);

    if (cachedIds) {
      feedIds = JSON.parse(cachedIds);
    } else {
      const currentAuthor = await Author.findOne({ email: { $eq: email } })
        .select("community following");

      if (!currentAuthor) {
        return res.status(404).json({ message: "Author not found" });
      }

      const authorCommunity = currentAuthor.community || [];
      const authorFollowing  = currentAuthor.following  || [];

      // opt: use aggregate $size for collaboratorCount — same pattern as post feed
      // avoids fetching full collaborators array just to call .length
      const [priorityDocs, recentDocs] = await Promise.all([
        TutorPlayList.aggregate([
          {
            $match: {
              $or: [
                { email:  { $in: authorFollowing  } },
                { domain: { $in: authorCommunity  } },
              ],
            },
          },
          { $sort:  { _id: -1 } },
          { $limit: PLAYLIST_PRIORITY_LIMIT },
          {
            $project: {
              _id:               1,
              email:             1,
              domain:            1,
              collaboratorCount: { $size: { $ifNull: ["$collaborators", []] } },
            },
          },
        ]),

        TutorPlayList.aggregate([
          { $sort:  { _id: -1 } },
          { $limit: PLAYLIST_OTHER_LIMIT * 2 },
          {
            $project: {
              _id:               1,
              email:             1,
              domain:            1,
              collaboratorCount: { $size: { $ifNull: ["$collaborators", []] } },
            },
          },
        ]),
      ]);

      const priorityEmailSet = new Set(authorFollowing);
      const priorityDomainSet = new Set(authorCommunity);
      const priorityIdSet    = new Set(priorityDocs.map(p => p._id.toString()));

      const otherDocs = recentDocs
        .filter(p =>
          !priorityIdSet.has(p._id.toString()) &&
          !priorityEmailSet.has(p.email) &&
          !priorityDomainSet.has(p.domain)
        )
        .slice(0, PLAYLIST_OTHER_LIMIT);

      const scoreAndSort = (docs) =>
        docs
          .map(p => ({ id: p._id.toString(), score: scorePlaylists(p) }))
          .sort((a, b) => b.score - a.score)
          .map(p => p.id);

      const rankedPriorityIds = scoreAndSort(priorityDocs);
      const rankedOtherIds    = scoreAndSort(otherDocs);

      // dedup before caching — prevents duplicate IDs on concurrent misses
      const seen = new Set();
      feedIds = [...rankedPriorityIds, ...rankedOtherIds]
        .filter(id => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });

      await redisClient.setEx(feedCacheKey, PLAYLIST_FEED_TTL, JSON.stringify(feedIds));
    }

    // ── 3. MERGE FRESH + FEED — page 1 only ──────────────────
    const feedIdSet   = new Set(feedIds);
    const newFreshIds = freshIds.filter(id => !feedIdSet.has(id));

    const mergedIds = page === 1
      ? [...newFreshIds.slice(0, PLAYLIST_FRESH_COUNT), ...feedIds]
      : feedIds;

    // ── 4. PAGINATE ON IDs THEN HYDRATE ──────────────────────
    const startIndex = (page - 1) * limit;
    const endIndex   = startIndex + limit;
    const pageIds    = mergedIds.slice(startIndex, endIndex);

    const pagePlaylists = pageIds.length > 0
      ? await TutorPlayList.find({ _id: { $in: pageIds } }).lean()
      : [];

    // restore $in order
    const playlistMap      = new Map(pagePlaylists.map(p => [p._id.toString(), p]));
    const orderedPlaylists = pageIds.map(id => playlistMap.get(id)).filter(Boolean);

    res.status(200).json({
      message:    "Recommended playlist",
      page,
      limit,
      total:      mergedIds.length,
      totalPages: Math.ceil(mergedIds.length / limit),
      hasMore:    endIndex < mergedIds.length,
      data:       orderedPlaylists,
    });
  } catch (err) {
    console.error("Error in getRecommendedTutorPlaylist:", err);
    res.status(500).json({ message: err.message });
  }
};

// reviewed-----------------------------------------------------------
const getPlaylistByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // console.log(`playlist page ${page} limit ${limit}`);
    if (!email) return res.status(400).json({ message: "email required" });

    const tutorPlayList = await TutorPlayList.find({ email })
      .skip(skip)
      .limit(limit);

    // if (!tutorPlayList || tutorPlayList.length == 0) {
    //   return res.status(204).json({ message: "Playlist is empty" });
    // }
    const playlistCountByEmail = tutorPlayList.length;

    res.status(200).json({
      message: "individual user playlist",
      data: tutorPlayList,
      count: playlistCountByEmail,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// old
// const getPlaylistById = async (req, res) => {
//   try {
//     const { playlistId } = req.params;
//     const playList = await TutorPlayList.findOne({ _id: playlistId });
//     const email = playList.email;
//     const domain = playList.domain;

//     const author = await Author.findOne({ email: { $eq: email } });

//     const playlistPostIds = (playList.post_ids || []).map((id) =>
//       id.toString(),
//     );

//     // build a map of author's posts (filtered by domain) for O(1) lookup
//     const postsById = {};
//     (author.posts || []).forEach((post) => {
//       if (post.category === domain) {
//         postsById[String(post._id)] = post;
//       }
//     });

//     // preserve order from playList.post_ids
//     const posts = playlistPostIds.map((id) => postsById[id]).filter(Boolean);

//     res.status(200).json({ data: playList, posts: posts });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// reviewed
const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;

    // fix: null check before accessing fields — was throwing TypeError on missing playlist
    const playList = await TutorPlayList.findOne({ _id: { $eq: playlistId } });
    if (!playList) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const domain = playList.domain;
    const playlistPostIds = (playList.post_ids || []).map((id) =>
      id.toString(),
    );

    if (playlistPostIds.length === 0) {
      return res.status(200).json({ data: playList, posts: [] });
    }

    // fix: query Post collection directly — author.posts is now [ObjectId], forEach was a no-op
    // author fetch removed entirely — no longer needed
    // preserve domain filter as a safety guard (same behaviour as before)
    const postDocs = await Post.find({
      _id: { $in: playlistPostIds },
      category: domain, // same domain filter the original code applied
    }).lean();

    // build map for O(1) lookup — same pattern as original
    const postsById = {};
    for (const post of postDocs) {
      postsById[post._id.toString()] = post;
    }

    // preserve insertion order from playList.post_ids — same as original
    const posts = playlistPostIds.map((id) => postsById[id]).filter(Boolean);

    // response shape identical to before
    res.status(200).json({ data: playList, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// old
// const addTutorPlayList = async (req, res) => {
//   try {
//     let { postIds, title, domain, email, collaboratorsEmail } = req.body;
//     // console.log(req.body);
//     if (postIds.length < 1 || !title || !domain || !email) {
//       return res.status(400).json({ message: "playlist data required" });
//     }

//     const user = await Author.findOne({ email: { $eq: email } });
//     // console.log("user",user);

//     if (!user) {
//       return res.status(404).json({ message: "user not found!" });
//     }

//     const profile = user.profile;
//     const name = user.authorname;

//     const collaborators = [];

//     collaboratorsEmail = Array.isArray(collaboratorsEmail)
//       ? collaboratorsEmail
//       : [collaboratorsEmail];

//     if (collaboratorsEmail && collaboratorsEmail.length > 0) {
//       for (const collabEmail of collaboratorsEmail) {
//         const normalizedCollabEmail = String(collabEmail).trim().toLowerCase();
//         const collabUser = await Author.findOne({
//           email: normalizedCollabEmail,
//         });
//         // if (!collabUser) {
//         //   return res.status(404).json({
//         //     message: `collaborator with email ${collabEmail} not found`,
//         //   });
//         // }
//         if (collabUser) {
//           collaborators.push({
//             name: collabUser.authorname,
//             email: collabUser.email,
//             profile: collabUser.profile,
//           });
//         }
//       }
//     }

//     const tutorPlaylistFolder = "TutorPlaylist/";

//     const uniqueFilename = req.file
//       ? `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`
//       : "";

//     if (req.file) {
//       // S3 Integration
//       const params = {
//         Bucket: bucketName,
//         Key: uniqueFilename,
//         Body: req.file.buffer,
//         ContentType: req.file.mimetype,
//       };

//       const command = new PutObjectCommand(params);
//       await s3.send(command);
//     }

//     const tutorPlaylist = new TutorPlayList({
//       post_ids: postIds,
//       title,
//       name,
//       domain,
//       thumbnail: req.file ? uniqueFilename : "",
//       email,
//       profile,
//       collaborators: collaborators,
//     });

//     await tutorPlaylist.save();
//     res
//       .status(201)
//       .json({ message: "Playlist created successfully", data: tutorPlaylist });
//   } catch (err) {
//     console.log("error", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };
// reviewed-------------------------------------------------------------
const addTutorPlayList = async (req, res) => {
  let uniqueFilename = "";

  try {
    let { postIds, title, domain, email, collaboratorsEmail } = req.body;

    if (!postIds || postIds.length < 1 || !title || !domain || !email) {
      return res.status(400).json({ message: "playlist data required" });
    }

    // fix: validate postIds exist in Post collection before saving
    const existingCount = await Post.countDocuments({ _id: { $in: postIds } });
    if (existingCount !== postIds.length) {
      return res
        .status(400)
        .json({ message: "One or more post IDs are invalid" });
    }

    const user = await Author.findOne({ email: { $eq: email } });
    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    const profile = user.profile;
    const name = user.authorname;

    // fix: single Author.find() instead of N sequential findOne() calls
    collaboratorsEmail = Array.isArray(collaboratorsEmail)
      ? collaboratorsEmail
      : collaboratorsEmail
        ? [collaboratorsEmail]
        : [];

    const collaborators = [];
    if (collaboratorsEmail.length > 0) {
      const normalizedEmails = collaboratorsEmail
        .map((e) => String(e).trim().toLowerCase())
        .filter(Boolean);

      // fix: one DB query instead of N — and added $eq-safe $in
      const collabUsers = await Author.find({
        email: { $in: normalizedEmails },
      }).select("authorname email profile");

      for (const collabUser of collabUsers) {
        collaborators.push({
          name: collabUser.authorname,
          email: collabUser.email,
          profile: collabUser.profile,
        });
      }
    }

    // S3 thumbnail upload
    const tutorPlaylistFolder = "TutorPlaylist/";
    if (req.file) {
      uniqueFilename = `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueFilename,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );
    }

    // fix: wrap DB save in try/catch — clean up S3 if save fails
    let tutorPlaylist;
    try {
      tutorPlaylist = new TutorPlayList({
        post_ids: postIds,
        title,
        name,
        domain,
        thumbnail: uniqueFilename,
        email,
        profile,
        collaborators,
      });
      await tutorPlaylist.save();
    } catch (dbErr) {
      if (uniqueFilename) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: uniqueFilename,
            }),
          );
        } catch (s3Err) {
          console.error("S3 cleanup failed:", s3Err.message);
        }
      }
      throw dbErr;
    }

    res
      .status(201)
      .json({ message: "Playlist created successfully", data: tutorPlaylist });
  } catch (err) {
    console.log("error", err.message);
    res.status(500).json({ message: err.message });
  }
};

// old
// const updateTutorPlayList = async (req, res) => {
//   try {
//     const { id } = req.params;
//     // console.log("Updating playlist with id:", id);

//     const { postIds, title, domain, collaboratorsEmail } = req.body;

//     const playList = await TutorPlayList.findById(id);
//     // console.log("Found playlist:", playList);

//     if (playList === null) {
//       return res.status(404).json({ message: "Playlist not found" });
//     }

//     if (title) {
//       playList.title = title;
//     }
//     if (domain) {
//       playList.domain = domain;
//     }

//     const tutorPlaylistFolder = "TutorPlaylist/";

//     const uniqueFilename = req.file
//       ? `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`
//       : "";

//     if (req.file) {
//       // S3 Integration
//       const params = {
//         Bucket: bucketName,
//         Key: uniqueFilename,
//         Body: req.file.buffer,
//         ContentType: req.file.mimetype,
//       };

//       const command = new PutObjectCommand(params);
//       await s3.send(command);
//     }

//     if (req.file) {
//       // Delete old thumbnail from S3 if it exists
//       if (playList.thumbnail) {
//         try {
//           const deleteParams = {
//             Bucket: bucketName,
//             Key: playList.thumbnail,
//           };
//           const deleteCommand = new DeleteObjectCommand(deleteParams);
//           console.log("Deleting old thumbnail from S3:", playList.thumbnail);
//           await s3.send(deleteCommand);
//         } catch (err) {
//           console.log("Error deleting old thumbnail from S3:", err);
//         }
//       }

//       // Update to new thumbnail
//       playList.thumbnail = uniqueFilename;
//     }

//     const collaborators = [];

//     // Normalize collaboratorsEmail to an array (handles single string input)
//     let collaboratorsEmailsArr = collaboratorsEmail;
//     if (collaboratorsEmailsArr && !Array.isArray(collaboratorsEmailsArr)) {
//       collaboratorsEmailsArr = [collaboratorsEmailsArr];
//     }

//     if (collaboratorsEmailsArr && collaboratorsEmailsArr.length > 0) {
//       for (const collabEmail of collaboratorsEmailsArr) {
//         const normalizedCollabEmail = String(collabEmail).trim().toLowerCase();
//         const collabUser = await Author.findOne({
//           email: normalizedCollabEmail,
//         });
//         if (!collabUser) {
//           return res.status(404).json({
//             message: `collaborator with email ${collabEmail} not found`,
//           });
//         }
//         collaborators.push({
//           name: collabUser.authorname,
//           email: collabUser.email,
//           profile: collabUser.profile,
//         });
//       }
//     }

//     if (postIds !== undefined) playList.post_ids = postIds;

//     // playList.post_ids = postIds;

//     playList.collaborators = collaborators;

//     await playList.save();
//     res
//       .status(200)
//       .json({ message: "Playlist updated successfully", data: playList });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// reviewed--------------------------------------------------------------
const updateTutorPlayList = async (req, res) => {
  let uniqueFilename = "";

  try {
    const { id } = req.params;
    const { postIds, title, domain, collaboratorsEmail } = req.body;

    const playList = await TutorPlayList.findById(id);
    if (!playList) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (title) playList.title = title;
    if (domain) playList.domain = domain;

    // S3 thumbnail upload
    const tutorPlaylistFolder = "TutorPlaylist/";
    if (req.file) {
      uniqueFilename = `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueFilename,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );

      // delete old thumbnail from S3
      if (playList.thumbnail) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: playList.thumbnail,
            }),
          );
        } catch (s3Err) {
          console.error("Error deleting old thumbnail from S3:", s3Err.message);
        }
      }
      playList.thumbnail = uniqueFilename;
    }

    // fix: validate postIds exist in Post collection before updating
    if (postIds !== undefined) {
      const existingCount = await Post.countDocuments({
        _id: { $in: postIds },
      });
      if (existingCount !== postIds.length) {
        // fix: clean up newly uploaded thumbnail if validation fails
        if (uniqueFilename) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: bucketName,
                Key: uniqueFilename,
              }),
            );
          } catch (s3Err) {
            console.error("S3 cleanup failed:", s3Err.message);
          }
        }
        return res
          .status(400)
          .json({ message: "One or more post IDs are invalid" });
      }
      playList.post_ids = postIds;
    }

    // fix: single Author.find() instead of N sequential findOne() calls
    // fix: skip missing collaborators instead of aborting mid-update (was orphaning S3 file)
    const collaborators = [];
    let collaboratorsEmailsArr = Array.isArray(collaboratorsEmail)
      ? collaboratorsEmail
      : collaboratorsEmail
        ? [collaboratorsEmail]
        : [];

    if (collaboratorsEmailsArr.length > 0) {
      const normalizedEmails = collaboratorsEmailsArr
        .map((e) => String(e).trim().toLowerCase())
        .filter(Boolean);

      // fix: one DB query, $eq-safe $in, missing collaborators silently skipped
      const collabUsers = await Author.find({
        email: { $in: normalizedEmails },
      }).select("authorname email profile");

      for (const collabUser of collabUsers) {
        collaborators.push({
          name: collabUser.authorname,
          email: collabUser.email,
          profile: collabUser.profile,
        });
      }
    }

    // intentional: empty array wipes existing collaborators when none provided
    playList.collaborators = collaborators;

    await playList.save();
    res
      .status(200)
      .json({ message: "Playlist updated successfully", data: playList });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// reviewed-------------------------------------------------------------
const deleteTutorPlayList = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorPlayListData = await TutorPlayList.findById(id);

    if (!tutorPlayListData) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (tutorPlayListData.thumbnail) {
      try {
        const deleteParams = {
          Bucket: bucketName,
          Key: tutorPlayListData.thumbnail,
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
      } catch (err) {
        console.log("Error deleting thumbnail from S3:", err);
      }
    }
    const tutorPlayList = await TutorPlayList.findByIdAndDelete(id);
    if (!tutorPlayList) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// reviewed-------------------------------------------------------------
const getBookmarkedPlaylists = async (req, res) => {
  try {
    const { email } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // console.log(`bookmarked playlists page ${page} limit ${limit}`);
    if (!email) return res.status(400).json({ message: "email required" });

    // adjust "postBookmark" to the actual field name on your Author schema if different
    const author = await Author.findOne({ email: { $eq: email } }).select(
      "postBookmark",
    );
    if (!author) return res.status(404).json({ message: "author not found" });

    const playlistIds = (author.postBookmark || [])
      .map((id) => (id ? id.toString() : null))
      .filter(Boolean);

    if (playlistIds.length === 0) {
      return res.status(200).json({ message: "No playlists", playlists: [] });
    }

    const playlists = await TutorPlayList.find({
      _id: { $in: playlistIds },
    }).lean();

    const map = new Map(playlists.map((p) => [p._id.toString(), p]));
    const orderedPlaylists = playlistIds
      .map((id) => map.get(id))
      .filter(Boolean);
    const paginatedPlaylists = orderedPlaylists.slice(skip, skip + limit);

    return res.status(200).json({
      message: "Bookmarked playlists",
      count: orderedPlaylists.length,
      playlists: paginatedPlaylists,
      playlistIds: paginatedPlaylists.map((p) => p._id.toString()),
    });
  } catch (err) {
    console.error("getBookmarkedPlaylists error:", err);
    return res
      .status(500)
      .json({ message: "server error", error: err.message });
  }
};

// old
// const getPostsByAuthorsCategory = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const category = decodeURIComponent(req.params.category);
//     let { page = 1, limit = 10 } = req.query;

//     // console.log("category", category,"page", page, )

//     page = parseInt(page);
//     limit = parseInt(limit);

//     const skip = (page - 1) * limit;

//     // ✅ Find author
//     const author = await Author.findOne({ email: { $eq: email } });

//     if (!author) {
//       return res.status(404).json({ message: "Author not found" });
//     }

//     // ✅ Filter posts by category
//     const filteredPosts = author.posts.filter(
//       (post) => post.category === category,
//     );

//     // ✅ Pagination
//     const paginatedPosts = filteredPosts.slice(skip, skip + limit);

//     return res.status(200).json({
//       posts: paginatedPosts,
//       currentPage: page,
//       totalPages: Math.ceil(filteredPosts.length / limit),
//       totalPosts: filteredPosts.length,
//       hasMore: skip + limit < filteredPosts.length,
//     });
//   } catch (err) {
//     console.error("Error:", err.message);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
//reviewed-------------------------------------------------------------
const getPostsByAuthorsCategory = async (req, res) => {
  try {
    const { email } = req.params;
    const category = decodeURIComponent(req.params.category);
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // only _id needed — used for Post query ownership check
    const author = await Author.findOne({ email: { $eq: email } }).select(
      "_id",
    );
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // fix: query Post collection directly — author.posts.filter() on ObjectIds always returned []
    // push skip/limit into DB instead of in-memory slice
    const [filteredPosts, totalPosts] = await Promise.all([
      Post.find({ authorId: author._id, category: { $eq: category } })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({
        authorId: author._id,
        category: { $eq: category },
      }),
    ]);

    // response shape identical to before
    return res.status(200).json({
      posts: filteredPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: skip + limit < totalPosts,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// old
// const getUniqueCategoriesByAuthor = async (req, res) => {
//   try {
//     const { email } = req.params;

//     const author = await Author.findOne({ email: { $eq: email } });

//     if (!author) {
//       return res.status(404).json({ message: "Author not found" });
//     }

//     // ✅ Extract unique categories
//     const categories = [
//       ...new Set(
//         author.posts.map((post) => post.category).filter(Boolean), // remove null/undefined
//       ),
//     ];

//     return res.status(200).json({
//       categories,
//     });
//   } catch (err) {
//     console.error("Error:", err.message);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
// reviewed------------------------------------------------------------
const getUniqueCategoriesByAuthor = async (req, res) => {
  try {
    const { email } = req.params;

    // only _id needed for the Post query
    const author = await Author.findOne({ email: { $eq: email } }).select(
      "_id",
    );
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // fix: use distinct() on Post collection — author.posts.map() on ObjectIds returned []
    // distinct() returns unique values in one query, no in-memory Set needed
    const categories = await Post.distinct("category", {
      authorId: author._id,
    });

    return res.status(200).json({ categories });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// old
// const getPostsByDomain = async (req, res) => {
//   try {
//     const { domain } = req.params;
//     const decodedDomain = decodeURIComponent(domain);
//     let { page = 1, limit = 10 } = req.query;
//     // console.log("domain", decodedDomain,"page", page, "limit", limit)

//     page = parseInt(page);
//     limit = parseInt(limit);

//     const skip = (page - 1) * limit;

//     // ✅ Find all authors
//     const authors = await Author.find({});

//     if (!authors || authors.length === 0) {
//       return res.status(404).json({ message: "No authors found" });
//     }

//     // ✅ Collect all posts from all authors filtered by domain/category
//     const allPosts = [];
//     authors.forEach((author) => {
//       const postsInDomain = (author.posts || []).filter(
//         (post) => post.category === decodedDomain,
//       );
//       // Add author info to each post for context
//       postsInDomain.forEach((post) => {
//         allPosts.push({
//           ...(post.toObject ? post.toObject() : post),
//           authorEmail: author.email,
//           authorName: author.authorname,
//           profile: author.profile,
//         });
//       });
//     });

//     const shuffle = (arr) => {
//       const a = arr.slice();
//       for (let i = a.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [a[i], a[j]] = [a[j], a[i]];
//       }
//       return a;
//     };

//     const allPostsRecommended = shuffle(allPosts);

//     // ✅ Pagination
//     const paginatedPosts = allPostsRecommended.slice(skip, skip + limit);

//     return res.status(200).json({
//       posts: paginatedPosts,
//       currentPage: page,
//       totalPages: Math.ceil(allPostsRecommended.length / limit),
//       totalPosts: allPostsRecommended.length,
//       hasMore: skip + limit < allPostsRecommended.length,
//     });
//   } catch (err) {
//     console.error("Error:", err.message);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
// reviewed------------------------------------------------------------
const getPostsByDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    const decodedDomain = decodeURIComponent(domain);
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // fix: query Post collection directly by category — was Author.find({}) full scan
    // populate only the author fields needed for the response shape
    const [posts, totalPosts] = await Promise.all([
      Post.find({ category: { $eq: decodedDomain } })
        .populate("authorId", "authorname email profile")
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({ category: { $eq: decodedDomain } }),
    ]);

    // shape each post to match original response exactly
    const shapedPosts = posts.map((post) => ({
      ...post,
      authorEmail: post.authorId?.email || "",
      authorName: post.authorId?.authorname || "",
      profile: post.authorId?.profile || "",
      authorId: post.authorId?._id,
    }));

    // note: shuffle removed — DB-level skip/limit requires stable order for
    // consistent pagination (shuffle causes duplicate/missing posts across pages)
    // if random order is required, consider a seeded shuffle or sort by timestamp

    return res.status(200).json({
      posts: shapedPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: skip + limit < totalPosts,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  addTutorPlayList,
  getAllTutorPlaylist,
  getPlaylistById,
  getPlaylistByEmail,
  updateTutorPlayList,
  deleteTutorPlayList,
  getBookmarkedPlaylists,
  getRecommendedTutorPlaylist,
  getPostsByAuthorsCategory,
  getUniqueCategoriesByAuthor,
  getPostsByDomain,
};
