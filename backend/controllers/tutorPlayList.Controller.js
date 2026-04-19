const { v4: uuidv4 } = require("uuid");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const Author = require("../models/blogAuthorSchema");
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
//reviewed------------------------------------------------------------
const getRecommendedTutorPlaylist = async (req, res) => {
  try {
    const { email } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);

    const feedCacheKey = `playlistHomeFeed:${email}:full`;

    let allPlaylists = [];

    //1. CHECK FULL FEED CACHE
    const cachedFeed = await redisClient.get(feedCacheKey);

    if (cachedFeed) {
      console.log("Playlist FULL FEED from Redis");
      allPlaylists = JSON.parse(cachedFeed);
    } else {
      console.log("Playlist Cache MISS → Generating from DB");
      const currentAuthor = await Author.findOne({ email });

      if (!currentAuthor) {
        return res.status(404).json({ message: "Author not found" });
      }

      const authorCommunity = currentAuthor.community || [];
      const authorFollowers = currentAuthor.followers || [];

      const followersSet = new Set(authorFollowers);

      //REMOVE skip/limit here → fetch all
      const tutorPlaylists = await TutorPlayList.find({});

      const priorityPlaylist = [];
      const othersPlaylist = [];

      // Split playlists
      for (const playlist of tutorPlaylists) {
        const inFollowing = followersSet.has(playlist.email);
        const inCommunity = authorCommunity.includes(playlist.domain);

        if (inFollowing || inCommunity) {
          priorityPlaylist.push(playlist);
        } else {
          othersPlaylist.push(playlist);
        }
      }

      // Shuffle once
      const shuffle = (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      const recommendedPart = shuffle(priorityPlaylist);
      const remainingPart = shuffle(othersPlaylist);

      allPlaylists = [...recommendedPart, ...remainingPart];

      // Cache FULL FEED
      await redisClient.setEx(
        feedCacheKey,
        300,
        JSON.stringify(allPlaylists)
      );
    }

    // 2. PAGINATION 
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedPlaylists = allPlaylists.slice(startIndex, endIndex);

    // 3. RESPONSE
    const responseData = {
      message: "Recommended playlist",
      page,
      limit,
      total: allPlaylists.length,
      totalPages: Math.ceil(allPlaylists.length / limit),
      hasMore: endIndex < allPlaylists.length,
      data: paginatedPlaylists,
    };

    console.log("Playlist served (cached or sliced)");

    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error in getRecommendedTutorPlaylist:", err);
    res.status(500).json({ message: err.message });
  }
};


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

const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playList = await TutorPlayList.findOne({ _id: playlistId });
    const email = playList.email;
    const domain = playList.domain;

    const author = await Author.findOne({ email: { $eq: email } });

    const playlistPostIds = (playList.post_ids || []).map((id) =>
      id.toString(),
    );

    // build a map of author's posts (filtered by domain) for O(1) lookup
    const postsById = {};
    (author.posts || []).forEach((post) => {
      if (post.category === domain) {
        postsById[String(post._id)] = post;
      }
    });

    // preserve order from playList.post_ids
    const posts = playlistPostIds.map((id) => postsById[id]).filter(Boolean);

    res.status(200).json({ data: playList, posts: posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addTutorPlayList = async (req, res) => {
  try {
    let { postIds, title, domain, email, collaboratorsEmail } = req.body;
    // console.log(req.body);
    if (postIds.length < 1 || !title || !domain || !email) {
      return res.status(400).json({ message: "playlist data required" });
    }

    const user = await Author.findOne({ email: { $eq: email } });
    // console.log("user",user);

    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    const profile = user.profile;
    const name = user.authorname;

    const collaborators = [];

    collaboratorsEmail = Array.isArray(collaboratorsEmail)
      ? collaboratorsEmail
      : [collaboratorsEmail];

    if (collaboratorsEmail && collaboratorsEmail.length > 0) {
      for (const collabEmail of collaboratorsEmail) {
        const normalizedCollabEmail = String(collabEmail).trim().toLowerCase();
        const collabUser = await Author.findOne({
          email: normalizedCollabEmail,
        });
        // if (!collabUser) {
        //   return res.status(404).json({
        //     message: `collaborator with email ${collabEmail} not found`,
        //   });
        // }
        if (collabUser) {
          collaborators.push({
            name: collabUser.authorname,
            email: collabUser.email,
            profile: collabUser.profile,
          });
        }
      }
    }

    const tutorPlaylistFolder = "TutorPlaylist/";

    const uniqueFilename = req.file
      ? `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`
      : "";

    if (req.file) {
      // S3 Integration
      const params = {
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
    }

    const tutorPlaylist = new TutorPlayList({
      post_ids: postIds,
      title,
      name,
      domain,
      thumbnail: req.file ? uniqueFilename : "",
      email,
      profile,
      collaborators: collaborators,
    });

    await tutorPlaylist.save();
    res
      .status(201)
      .json({ message: "Playlist created successfully", data: tutorPlaylist });
  } catch (err) {
    console.log("error", err.message);
    res.status(500).json({ message: err.message });
  }
};

const updateTutorPlayList = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("Updating playlist with id:", id);

    const { postIds, title, domain, collaboratorsEmail } = req.body;

    const playList = await TutorPlayList.findById(id);
    // console.log("Found playlist:", playList);

    if (playList === null) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (title) {
      playList.title = title;
    }
    if (domain) {
      playList.domain = domain;
    }

    const tutorPlaylistFolder = "TutorPlaylist/";

    const uniqueFilename = req.file
      ? `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`
      : "";

    if (req.file) {
      // S3 Integration
      const params = {
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
    }

    if (req.file) {
      // Delete old thumbnail from S3 if it exists
      if (playList.thumbnail) {
        try {
          const deleteParams = {
            Bucket: bucketName,
            Key: playList.thumbnail,
          };
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          console.log("Deleting old thumbnail from S3:", playList.thumbnail);
          await s3.send(deleteCommand);
        } catch (err) {
          console.log("Error deleting old thumbnail from S3:", err);
        }
      }

      // Update to new thumbnail
      playList.thumbnail = uniqueFilename;
    }

    const collaborators = [];

    // Normalize collaboratorsEmail to an array (handles single string input)
    let collaboratorsEmailsArr = collaboratorsEmail;
    if (collaboratorsEmailsArr && !Array.isArray(collaboratorsEmailsArr)) {
      collaboratorsEmailsArr = [collaboratorsEmailsArr];
    }

    if (collaboratorsEmailsArr && collaboratorsEmailsArr.length > 0) {
      for (const collabEmail of collaboratorsEmailsArr) {
        const normalizedCollabEmail = String(collabEmail).trim().toLowerCase();
        const collabUser = await Author.findOne({
          email: normalizedCollabEmail,
        });
        if (!collabUser) {
          return res.status(404).json({
            message: `collaborator with email ${collabEmail} not found`,
          });
        }
        collaborators.push({
          name: collabUser.authorname,
          email: collabUser.email,
          profile: collabUser.profile,
        });
      }
    }

    if (postIds !== undefined) playList.post_ids = postIds;

    // playList.post_ids = postIds;

    playList.collaborators = collaborators;

    await playList.save();
    res
      .status(200)
      .json({ message: "Playlist updated successfully", data: playList });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

const getPostsByAuthorsCategory = async (req, res) => {
  try {
    const { email } = req.params;
    const category = decodeURIComponent(req.params.category);
    let { page = 1, limit = 10 } = req.query;

    // console.log("category", category,"page", page, )

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // ✅ Find author
    const author = await Author.findOne({ email: { $eq: email } });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // ✅ Filter posts by category
    const filteredPosts = author.posts.filter(
      (post) => post.category === category,
    );

    // ✅ Pagination
    const paginatedPosts = filteredPosts.slice(skip, skip + limit);

    return res.status(200).json({
      posts: paginatedPosts,
      currentPage: page,
      totalPages: Math.ceil(filteredPosts.length / limit),
      totalPosts: filteredPosts.length,
      hasMore: skip + limit < filteredPosts.length,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUniqueCategoriesByAuthor = async (req, res) => {
  try {
    const { email } = req.params;

    const author = await Author.findOne({ email: { $eq: email } });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // ✅ Extract unique categories
    const categories = [
      ...new Set(
        author.posts.map((post) => post.category).filter(Boolean), // remove null/undefined
      ),
    ];

    return res.status(200).json({
      categories,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

const getPostsByDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    const decodedDomain = decodeURIComponent(domain);
    let { page = 1, limit = 10 } = req.query;
    // console.log("domain", decodedDomain,"page", page, "limit", limit)

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // ✅ Find all authors
    const authors = await Author.find({});

    if (!authors || authors.length === 0) {
      return res.status(404).json({ message: "No authors found" });
    }

    // ✅ Collect all posts from all authors filtered by domain/category
    const allPosts = [];
    authors.forEach((author) => {
      const postsInDomain = (author.posts || []).filter(
        (post) => post.category === decodedDomain,
      );
      // Add author info to each post for context
      postsInDomain.forEach((post) => {
        allPosts.push({
          ...(post.toObject ? post.toObject() : post),
          authorEmail: author.email,
          authorName: author.authorname,
          profile: author.profile,
        });
      });
    });

    const shuffle = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const allPostsRecommended = shuffle(allPosts);

    // ✅ Pagination
    const paginatedPosts = allPostsRecommended.slice(skip, skip + limit);

    return res.status(200).json({
      posts: paginatedPosts,
      currentPage: page,
      totalPages: Math.ceil(allPostsRecommended.length / limit),
      totalPosts: allPostsRecommended.length,
      hasMore: skip + limit < allPostsRecommended.length,
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
