const { v4: uuidv4 } = require("uuid");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const { Author, Post } = require("../models/blogAuthorSchema");
const mongoose = require("mongoose");

require('dotenv').config();

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

require("dotenv").config();

const redisClient = require("../middleware/redis");
const { checkAndAwardBadges } = require("../services/badgeService");

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

const notificationUrl = process.env.NOTIFICATION_URL || "http://localhost:5173";
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

// const PLAYLIST_PRIORITY_LIMIT = 100;
// const PLAYLIST_OTHER_LIMIT    = 200;
// const PLAYLIST_FEED_TTL       = 300;
// const PLAYLIST_FRESH_TTL      = 60;
// const PLAYLIST_FRESH_COUNT    = 5;

// const scorePlaylists = (playlist) => {
//   const ageHours = (Date.now() -
//     new mongoose.Types.ObjectId(playlist._id).getTimestamp()) / 36e5;
//   const recency  = Math.max(0, 1 - ageHours / 168);
//   // collaboratorCount already computed by aggregate $size — no .length needed
//   const collabs  = (playlist.collaboratorCount || 0) * 0.3;
//   return recency * 10 + collabs;
// };

// const getRecommendedTutorPlaylist = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const page  = parseInt(req.query.page) || 1;
//     const limit = Math.min(parseInt(req.query.limit) || 10, 30);

//     const feedCacheKey  = `playlistHomeFeed:${email}:ids`;
//     const freshCacheKey = `playlistHomeFeed:fresh:ids`;

//     // ── 1. FRESH PLAYLISTS — shared 60s cache ────────────────
//     let freshIds = [];
//     const cachedFresh = await redisClient.get(freshCacheKey);

//     if (cachedFresh) {
//       freshIds = JSON.parse(cachedFresh);
//     } else {
//       // select _id only — no collaborators array fetched
//       const freshDocs = await TutorPlayList.find({})
//         .select("_id")
//         .sort({ _id: -1 })
//         .limit(20)
//         .lean();

//       freshIds = freshDocs.map(p => p._id.toString());
//       await redisClient.setEx(freshCacheKey, PLAYLIST_FRESH_TTL, JSON.stringify(freshIds));
//     }

//     // ── 2. PERSONALISED FEED IDs ──────────────────────────────
//     let feedIds = [];
//     const cachedIds = await redisClient.get(feedCacheKey);

//     if (cachedIds) {
//       feedIds = JSON.parse(cachedIds);
//     } else {
//       const currentAuthor = await Author.findOne({ email: { $eq: email } })
//         .select("community following");

//       if (!currentAuthor) {
//         return res.status(404).json({ message: "Author not found" });
//       }

//       const authorCommunity = currentAuthor.community || [];
//       const authorFollowing  = currentAuthor.following  || [];

//       // opt: use aggregate $size for collaboratorCount — same pattern as post feed
//       // avoids fetching full collaborators array just to call .length
//       const [priorityDocs, recentDocs] = await Promise.all([
//         TutorPlayList.aggregate([
//           {
//             $match: {
//               $or: [
//                 { email:  { $in: authorFollowing  } },
//                 { domain: { $in: authorCommunity  } },
//               ],
//             },
//           },
//           { $sort:  { _id: -1 } },
//           { $limit: PLAYLIST_PRIORITY_LIMIT },
//           {
//             $project: {
//               _id:               1,
//               email:             1,
//               domain:            1,
//               collaboratorCount: { $size: { $ifNull: ["$collaborators", []] } },
//             },
//           },
//         ]),

//         TutorPlayList.aggregate([
//           { $sort:  { _id: -1 } },
//           { $limit: PLAYLIST_OTHER_LIMIT * 2 },
//           {
//             $project: {
//               _id:               1,
//               email:             1,
//               domain:            1,
//               collaboratorCount: { $size: { $ifNull: ["$collaborators", []] } },
//             },
//           },
//         ]),
//       ]);

//       const priorityEmailSet = new Set(authorFollowing);
//       const priorityDomainSet = new Set(authorCommunity);
//       const priorityIdSet    = new Set(priorityDocs.map(p => p._id.toString()));

//       const otherDocs = recentDocs
//         .filter(p =>
//           !priorityIdSet.has(p._id.toString()) &&
//           !priorityEmailSet.has(p.email) &&
//           !priorityDomainSet.has(p.domain)
//         )
//         .slice(0, PLAYLIST_OTHER_LIMIT);

//       const scoreAndSort = (docs) =>
//         docs
//           .map(p => ({ id: p._id.toString(), score: scorePlaylists(p) }))
//           .sort((a, b) => b.score - a.score)
//           .map(p => p.id);

//       const rankedPriorityIds = scoreAndSort(priorityDocs);
//       const rankedOtherIds    = scoreAndSort(otherDocs);

//       // dedup before caching — prevents duplicate IDs on concurrent misses
//       const seen = new Set();
//       feedIds = [...rankedPriorityIds, ...rankedOtherIds]
//         .filter(id => {
//           if (seen.has(id)) return false;
//           seen.add(id);
//           return true;
//         });

//       await redisClient.setEx(feedCacheKey, PLAYLIST_FEED_TTL, JSON.stringify(feedIds));
//     }

//     // ── 3. MERGE FRESH + FEED — page 1 only ──────────────────
//     const feedIdSet   = new Set(feedIds);
//     const newFreshIds = freshIds.filter(id => !feedIdSet.has(id));

//     const mergedIds = page === 1
//       ? [...newFreshIds.slice(0, PLAYLIST_FRESH_COUNT), ...feedIds]
//       : feedIds;

//     // ── 4. PAGINATE ON IDs THEN HYDRATE ──────────────────────
//     const startIndex = (page - 1) * limit;
//     const endIndex   = startIndex + limit;
//     const pageIds    = mergedIds.slice(startIndex, endIndex);

//     const pagePlaylists = pageIds.length > 0
//       ? await TutorPlayList.find({ _id: { $in: pageIds } }).lean()
//       : [];

//     // restore $in order
//     const playlistMap      = new Map(pagePlaylists.map(p => [p._id.toString(), p]));
//     const orderedPlaylists = pageIds.map(id => playlistMap.get(id)).filter(Boolean);

//     res.status(200).json({
//       message:    "Recommended playlist",
//       page,
//       limit,
//       total:      mergedIds.length,
//       totalPages: Math.ceil(mergedIds.length / limit),
//       hasMore:    endIndex < mergedIds.length,
//       data:       orderedPlaylists,
//     });
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
const PLAYLIST_FRESH_LOCK_KEY = 'playlistHomeFeed:fresh:rebuilding';

const scorePlaylists = (playlist) => {
  const ageHours = (Date.now() -
    new mongoose.Types.ObjectId(playlist._id).getTimestamp()) / 36e5;
  const recency = Math.max(0, 1 - ageHours / 168);
  const collabs = (playlist.collaboratorCount || 0) * 0.3;
  return recency * 10 + collabs;
};

const getRecommendedTutorPlaylist = async (req, res) => {
  try {
    const { email } = req.params;
    const page  = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);

    const feedCacheKey  = `playlistHomeFeed:${email}:ids`;
    const freshCacheKey = `playlistHomeFeed:fresh:ids`;

    // ── 1. FRESH PLAYLISTS — shared 60s cache with mutex ─────
    let freshIds = [];
    const cachedFresh = await redisClient.get(freshCacheKey);

    if (cachedFresh) {
      freshIds = JSON.parse(cachedFresh);
    } else {
      const freshLock = await redisClient.get(PLAYLIST_FRESH_LOCK_KEY);

      if (freshLock) {
        // another request is rebuilding — wait briefly then use whatever is ready
        await new Promise(r => setTimeout(r, 150));
        const retryFresh = await redisClient.get(freshCacheKey);
        freshIds = retryFresh ? JSON.parse(retryFresh) : [];
      } else {
        // acquire lock — expires in 5s
        await redisClient.setEx(PLAYLIST_FRESH_LOCK_KEY, 5, '1');
        try {
          const freshDocs = await TutorPlayList.find({})
            .select("_id")
            .sort({ _id: -1 })
            .limit(20)
            .lean();

          freshIds = freshDocs.map(p => p._id.toString());

          // jitter ±15s — prevents fresh + personal feed expiring simultaneously
          const jitter = Math.floor(Math.random() * 30);
          await redisClient.setEx(
            freshCacheKey,
            PLAYLIST_FRESH_TTL + jitter,
            JSON.stringify(freshIds)
          );
        } finally {
          // always release lock even if query fails
          await redisClient.del(PLAYLIST_FRESH_LOCK_KEY);
        }
      }
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

      const priorityEmailSet  = new Set(authorFollowing);
      const priorityDomainSet = new Set(authorCommunity);
      const priorityIdSet     = new Set(priorityDocs.map(p => p._id.toString()));

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

      const seen = new Set();
      feedIds = [...rankedPriorityIds, ...rankedOtherIds]
        .filter(id => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });

      // fix: never cache empty feed — prevents empty window after TTL
      if (feedIds.length > 0) {
        // jitter ±30s — spreads users across wider expiry window
        const jitter = Math.floor(Math.random() * 60);
        await redisClient.setEx(
          feedCacheKey,
          PLAYLIST_FEED_TTL + jitter,
          JSON.stringify(feedIds)
        );
      }
    }

    // ── 3. MERGE FRESH + FEED — page 1 only ──────────────────
    const feedIdSet   = new Set(feedIds);
    const newFreshIds = freshIds.filter(id => !feedIdSet.has(id));

    const mergedIds = page === 1
      ? [...newFreshIds.slice(0, PLAYLIST_FRESH_COUNT), ...feedIds]
      : feedIds;

    // fix: fallback to freshIds if both caches expired simultaneously
    const finalIds = mergedIds.length > 0 ? mergedIds : freshIds;

    // ── 4. PAGINATE ON IDs THEN HYDRATE ──────────────────────
    const startIndex = (page - 1) * limit;
    const endIndex   = startIndex + limit;
    const pageIds    = finalIds.slice(startIndex, endIndex);

    const pagePlaylists = pageIds.length > 0
      ? await TutorPlayList.find({ _id: { $in: pageIds } }).lean()
      : [];

    const playlistMap      = new Map(pagePlaylists.map(p => [p._id.toString(), p]));
    const orderedPlaylists = pageIds.map(id => playlistMap.get(id)).filter(Boolean);

    res.status(200).json({
      message:    "Recommended playlist",
      page,
      limit,
      total:      finalIds.length,
      totalPages: Math.ceil(finalIds.length / limit),
      hasMore:    endIndex < finalIds.length,
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
      // category: domain, // same domain filter the original code applied
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


// reviewed-------------------------------------------------------------
// const addTutorPlayList = async (req, res) => {
//   let uniqueFilename = "";

//   try {
//     let { postIds, title, domain, email, collaboratorsEmail } = req.body;

//     if (!postIds || postIds.length < 1 || !title || !domain || !email) {
//       return res.status(400).json({ message: "playlist data required" });
//     }

//     // fix: validate postIds exist in Post collection before saving
//     const existingCount = await Post.countDocuments({ _id: { $in: postIds } });
//     if (existingCount !== postIds.length) {
//       return res
//         .status(400)
//         .json({ message: "One or more post IDs are invalid" });
//     }

//     const user = await Author.findOne({ email: { $eq: email } });
//     if (!user) {
//       return res.status(404).json({ message: "user not found!" });
//     }

//     const profile = user.profile;
//     const name = user.authorname;

//     // fix: single Author.find() instead of N sequential findOne() calls
//     collaboratorsEmail = Array.isArray(collaboratorsEmail)
//       ? collaboratorsEmail
//       : collaboratorsEmail
//         ? [collaboratorsEmail]
//         : [];

//     const collaborators = [];
//     if (collaboratorsEmail.length > 0) {
//       const normalizedEmails = collaboratorsEmail
//         .map((e) => String(e).trim().toLowerCase())
//         .filter(Boolean);

//       // fix: one DB query instead of N — and added $eq-safe $in
//       const collabUsers = await Author.find({
//         email: { $in: normalizedEmails },
//       }).select("authorname email profile");

//       for (const collabUser of collabUsers) {
//         collaborators.push({
//           name: collabUser.authorname,
//           email: collabUser.email,
//           profile: collabUser.profile,
//         });
//       }
//     }

//     // S3 thumbnail upload
//     const tutorPlaylistFolder = "TutorPlaylist/";
//     if (req.file) {
//       uniqueFilename = `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`;
//       await s3.send(
//         new PutObjectCommand({
//           Bucket: bucketName,
//           Key: uniqueFilename,
//           Body: req.file.buffer,
//           ContentType: req.file.mimetype,
//         }),
//       );
//     }

//     // fix: wrap DB save in try/catch — clean up S3 if save fails
//     let tutorPlaylist;
//     try {
//       tutorPlaylist = new TutorPlayList({
//         post_ids: postIds,
//         title,
//         name,
//         domain,
//         thumbnail: uniqueFilename,
//         email,
//         profile,
//         collaborators,
//       });
//       await tutorPlaylist.save();
//     } catch (dbErr) {
//       if (uniqueFilename) {
//         try {
//           await s3.send(
//             new DeleteObjectCommand({
//               Bucket: bucketName,
//               Key: uniqueFilename,
//             }),
//           );
//         } catch (s3Err) {
//           console.error("S3 cleanup failed:", s3Err.message);
//         }
//       }
//       throw dbErr;
//     }
  
//     const playlistId = tutorPlaylist._id
//     const url = `${notificationUrl}/viewplaylist/${playlistId}`;
//     const newNotification = {
//     user: name,
//     authorEmail: email,
//     message: ``,
//     url,
//     profile,
//   };

//     res
//       .status(201)
//       .json({ message: "Playlist created successfully", data: tutorPlaylist });
//   } catch (err) {
//     console.log("error", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };
const addTutorPlayList = async (req, res) => {
  let uniqueFilename = "";

  try {
    let { postIds, title, domain, email, collaboratorsEmail } = req.body;

    if (!postIds || postIds.length < 1 || !title || !domain || !email) {
      return res.status(400).json({ message: "playlist data required" });
    }

    const existingCount = await Post.countDocuments({ _id: { $in: postIds } });
    if (existingCount !== postIds.length) {
      return res.status(400).json({ message: "One or more post IDs are invalid" });
    }

    const user = await Author.findOne({ email: { $eq: email } });
    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    const profile = user.profile;
    const name    = user.authorname;

    collaboratorsEmail = Array.isArray(collaboratorsEmail)
      ? collaboratorsEmail
      : collaboratorsEmail ? [collaboratorsEmail] : [];

    const collaborators  = [];
    let   collabUsers    = [];

    if (collaboratorsEmail.length > 0) {
      const normalizedEmails = collaboratorsEmail
        .map(e => String(e).trim().toLowerCase())
        .filter(Boolean)
        .filter(e => e !== email); // exclude playlist creator from collaborators

      collabUsers = await Author.find({
        email: { $in: normalizedEmails },
      }).select("authorname email profile");

      for (const collabUser of collabUsers) {
        collaborators.push({
          name:    collabUser.authorname,
          email:   collabUser.email,
          profile: collabUser.profile,
        });
      }
    }

    // S3 thumbnail upload
    const tutorPlaylistFolder = "TutorPlaylist/";
    if (req.file) {
      uniqueFilename = `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket:      bucketName,
        Key:         uniqueFilename,
        Body:        req.file.buffer,
        ContentType: req.file.mimetype,
      }));
    }

    let tutorPlaylist;
    try {
      tutorPlaylist = new TutorPlayList({
        post_ids:      postIds,
        title,
        name,
        domain,
        thumbnail:     uniqueFilename,
        email,
        profile,
        collaborators,
      });
      await tutorPlaylist.save();
    } catch (dbErr) {
      if (uniqueFilename) {
        try {
          await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: uniqueFilename }));
        } catch (s3Err) {
          console.error("S3 cleanup failed:", s3Err.message);
        }
      }
      throw dbErr;
    }

    const playlistId = tutorPlaylist._id;
    const url        = `${notificationUrl}/viewplaylist/${playlistId}`;

    // respond immediately before sending notifications
    res.status(201).json({ message: "Playlist created successfully", data: tutorPlaylist });

    // in addTutorPlayList — for each collaborator
    for (const collabUser of collabUsers) {
      checkAndAwardBadges(collabUser.email, ['collaborator'], {
        eventId:    tutorPlaylist._id,
        eventTitle: tutorPlaylist.title,
      }).catch(err => console.error("Badge check error:", err.message));
    }

    // ── send notifications to collaborators (fire-and-forget) ─
    if (collabUsers.length > 0) {
      const notificationMessage = `${name} added you as a collaborator on the playlist "${title}" in the ${domain} domain.`;

      const bulkOps = collabUsers.map(collabUser => ({
        updateOne: {
          filter: { email: collabUser.email },
          update: {
            $push: {
              notification: {
                _id:         new mongoose.Types.ObjectId(),
                user:        name,
                authorEmail: email,
                message:     notificationMessage,
                profile:     profile || "",
                url,
                postId:      new mongoose.Types.ObjectId(), // placeholder
                timestamp:   new Date(),
              },
            },
          },
        },
      }));

      Author.bulkWrite(bulkOps).catch(err => {
        console.error("Collaborator notification bulkWrite failed:", err.message);
      });
    }

  } catch (err) {
    console.log("error", err.message);
    res.status(500).json({ message: err.message });
  }
};



// reviewed
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
//reviewed-------------------------------------------------------------

const getPostsByAuthorsCategory = async (req, res) => {
  try {
    const { email } = req.params;
    const category  = decodeURIComponent(req.params.category);
    let { page = 1, limit = 10 } = req.query;

    page  = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const author = await Author.findOne({ email: { $eq: email } }).select("_id");
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // fix: when category is "all" omit the category filter entirely
    const isAll   = !category || category === "All";
    const filter  = isAll
      ? { authorId: author._id }
      : { authorId: author._id, category: { $eq: category } };

    const [filteredPosts, totalPosts] = await Promise.all([
      Post.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      posts:       filteredPosts,
      currentPage: page,
      totalPages:  Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore:     skip + limit < totalPosts,
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
