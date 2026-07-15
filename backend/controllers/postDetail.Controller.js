const {Author, Post} = require("../models/blogAuthorSchema");

const path = require('path');

const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const mongoose = require("mongoose");
const axios = require("axios");

const sharp = require('sharp');
dotenv = require("dotenv");
dotenv.config();

const redisClient = require("../middleware/redis");
// import nodemailer from "nodemailer";

const nodemailer = require('nodemailer');

const {checkAndAwardBadges} = require("../services/badgeService")
const { enqueuePostNotification } = require("../services/notificationQueue");

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER, // Or your preferred email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

const notificationUrl = process.env.NOTIFICATION_URL || 'http://localhost:5173';

const resolveMessageAuthorProfiles = async (messages = []) => {
  const items = Array.isArray(messages) ? messages : [];
  if (items.length === 0) return [];

  const emailSet = new Set();
  const authorIdSet = new Set();

  for (const message of items) {
    const rawEmail = String(message?.email || '').trim().toLowerCase();
    if (rawEmail) emailSet.add(rawEmail);

    const rawAuthorId = message?.authorId;
    if (rawAuthorId) {
      const idString = rawAuthorId.toString();
      if (idString) authorIdSet.add(idString);
    }
  }

  const authorQueries = [];
  if (emailSet.size > 0) {
    authorQueries.push(
      Author.find({ email: { $in: Array.from(emailSet) } })
        .select('email profile authorname role badges')
        .lean()
    );
  }

  if (authorIdSet.size > 0) {
    authorQueries.push(
      Author.find({ _id: { $in: Array.from(authorIdSet) } })
        .select('email profile authorname role badges')
        .lean()
    );
  }

  const authorDocs = (await Promise.all(authorQueries)).flat();
  const authorByEmail = new Map(
    authorDocs
      .filter((author) => author?.email)
      .map((author) => [String(author.email).trim().toLowerCase(), author])
  );
  const authorById = new Map(
    authorDocs
      .filter((author) => author?._id)
      .map((author) => [author._id.toString(), author])
  );

  return items.map((message) => {
    const email = String(message?.email || '').trim().toLowerCase();
    const authorId = message?.authorId ? message.authorId.toString() : '';
    const author = authorByEmail.get(email) || (authorId ? authorById.get(authorId) : null);

    return {
      ...message,
      // profile: author?.profile || message?.profile || '',
      profile: author?.profile || '',
      user: author?.authorname || message?.user || '',
      authorName: author?.authorname || message?.user || '',
      role: author?.role || message?.role || '',
      badges: Array.isArray(author?.badges) ? author.badges : [],
    };
  });
};

// s3 integration
const { S3Client,PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { link } = require("fs");
require('dotenv').config()


const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;


const s3 = new S3Client({
  credentials:{
    accessKeyId:accessKey,
    secretAccessKey:secretAccessKey,
  },
  region:bucketRegion
})




const FEED_PRIORITY_LIMIT = 200;
const FEED_OTHER_LIMIT    = 300;
const FEED_TTL            = 300;
const FRESH_TTL           = 60;
const FRESH_POST_COUNT    = 10;
const FRESH_LOCK_KEY      = 'postHomeFeed:fresh:rebuilding';

const scorePost = (post) => {
  const ageHours = (Date.now() - new Date(post.timestamp).getTime()) / 36e5;
  const recency  = Math.max(0, 1 - ageHours / 168);
  return (
    recency * 10 +
    (post.likeCount    || 0) * 0.4 +
    (post.viewCount    || 0) * 0.1 +
    (post.commentCount || 0) * 0.5
  );
};

const getRecommendedPosts = async (req, res) => {
  try {
    const { email } = req.params;
    const page  = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const feedCacheKey  = `postHomeFeed:${email}:ids`;
    const freshCacheKey = `postHomeFeed:fresh:ids`;

    // ── 1. FRESH POSTS — shared 60s cache with mutex ──────────
    let freshIds = [];
    const cachedFresh = await redisClient.get(freshCacheKey);

    if (cachedFresh) {
      freshIds = JSON.parse(cachedFresh);
    } else {
      const freshLock = await redisClient.get(FRESH_LOCK_KEY);

      if (freshLock) {
        // another request is rebuilding — wait briefly then use whatever is ready
        await new Promise(r => setTimeout(r, 150));
        const retryFresh = await redisClient.get(freshCacheKey);
        freshIds = retryFresh ? JSON.parse(retryFresh) : [];
      } else {
        // acquire lock — expires in 5s (longer than the query takes)
        await redisClient.setEx(FRESH_LOCK_KEY, 5, '1');
        try {
          const freshDocs = await Post.find({})
            .select("_id")
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

          freshIds = freshDocs.map(p => p._id.toString());

          // jitter ±15s — prevents fresh + personal feed expiring simultaneously
          const jitter = Math.floor(Math.random() * 30);
          await redisClient.setEx(
            freshCacheKey,
            FRESH_TTL + jitter,
            JSON.stringify(freshIds)
          );
        } finally {
          // always release lock even if query fails
          await redisClient.del(FRESH_LOCK_KEY);
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
        .select("following community");

      const followedEmails    = currentAuthor?.following    || [];
      const authorCommunities = currentAuthor?.community    || [];

      const priorityAuthors = await Author.find({
        $or: [
          { email:     { $in: followedEmails    } },
          { community: { $in: authorCommunities } },
        ],
      }).select("_id").lean();

      const priorityAuthorIds   = priorityAuthors.map(
        a => new mongoose.Types.ObjectId(a._id)
      );
      const priorityAuthorIdSet = new Set(
        priorityAuthorIds.map(id => id.toString())
      );

      const [priorityDocs, recentPostDocs] = await Promise.all([
        Post.aggregate([
          { $match: { authorId: { $in: priorityAuthorIds } } },
          { $sort:  { timestamp: -1 } },
          { $limit: FEED_PRIORITY_LIMIT },
          { $project: {
            _id:          1,
            timestamp:    1,
            likeCount:    { $size: { $ifNull: ["$likes",    []] } },
            viewCount:    { $size: { $ifNull: ["$views",    []] } },
            commentCount: { $size: { $ifNull: ["$messages", []] } },
          }},
        ]),

        Post.aggregate([
          { $sort:  { timestamp: -1 } },
          { $limit: FEED_OTHER_LIMIT * 2 },
          { $project: {
            _id:          1,
            authorId:     1,
            timestamp:    1,
            likeCount:    { $size: { $ifNull: ["$likes",    []] } },
            viewCount:    { $size: { $ifNull: ["$views",    []] } },
            commentCount: { $size: { $ifNull: ["$messages", []] } },
          }},
        ]),
      ]);

      const otherDocs = recentPostDocs
        .filter(p => !priorityAuthorIdSet.has(p.authorId?.toString()))
        .slice(0, FEED_OTHER_LIMIT);

      const scoreAndSort = (docs) =>
        docs
          .map(p => ({ id: p._id.toString(), score: scorePost(p) }))
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

      // fix: never cache empty feed — prevents 5-min empty window after TTL
      if (feedIds.length > 0) {
        // jitter ±30s — spreads 10k users across wider expiry window
        const jitter = Math.floor(Math.random() * 60);
        await redisClient.setEx(
          feedCacheKey,
          FEED_TTL + jitter,
          JSON.stringify(feedIds)
        );
      }
    }

    // ── 3. MERGE FRESH + FEED — page 1 only ──────────────────
    const feedIdSet   = new Set(feedIds);
    const newFreshIds = freshIds.filter(id => !feedIdSet.has(id));

    const mergedIds = page === 1
      ? [...newFreshIds.slice(0, FRESH_POST_COUNT), ...feedIds]
      : feedIds;

    // fix: fallback to freshIds if both caches expired simultaneously
    // user sees recent posts instead of empty feed
    const finalIds = mergedIds.length > 0 ? mergedIds : freshIds;

    // ── 4. PAGINATE + HYDRATE ─────────────────────────────────
    const startIndex = (page - 1) * limit;
    const endIndex   = startIndex + limit;
    const pageIds    = finalIds.slice(startIndex, endIndex);

    const pagePosts = pageIds.length > 0
      ? await Post.find({ _id: { $in: pageIds } })
          .populate("authorId", "authorname email profile role community")
          .lean()
      : [];

    // restore $in order
    const postMap      = new Map(pagePosts.map(p => [p._id.toString(), p]));
    const orderedPosts = pageIds
      .map(id => postMap.get(id))
      .filter(Boolean)
      .map(post => ({
        ...post,
        authorName:  post.authorId?.authorname || "",
        authorEmail: post.authorId?.email      || "",
        profile:     post.authorId?.profile    || "",
        role:        post.authorId?.role       || "",
        community:   post.authorId?.community  || [],
        authorId:    post.authorId?._id,
      }));

    res.status(200).json({
      message:    "Recommended posts",
      page,
      limit,
      totalPosts: finalIds.length,
      totalPages: Math.ceil(finalIds.length / limit),
      hasMore:    endIndex < finalIds.length,
      posts:      orderedPosts,
    });
  } catch (err) {
    console.error("Error in getRecommendedPosts:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const getSingleAuthorPosts = async (req, res) => {
  try {
    const { email } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page  = parseInt(page);
    limit = parseInt(limit);

    const author = await Author.findOne({ email: { $eq: email } })
      .select("authorname email profile role community badges");

    if (!author) {
      return res.status(404).json({ message: `author ${email} not found` });
    }

    // query Post collection directly
    const allPosts = await Post.find({ authorId: author._id }).lean();

    const authorPosts = allPosts
      .map((post) => ({
        ...post,
        authorName:  author.authorname,
        authorEmail: author.email,
        profile:     author.profile || "",
        role:        author.role,
        community:   author.community,
        
      }))
      .reverse();

    const startIndex    = (page - 1) * limit;
    const paginatedPosts = authorPosts.slice(startIndex, startIndex + limit);

    res.status(200).json({
      message:    "author posts",
      data:       paginatedPosts,
      authorName: author.authorname,
      profile:    author.profile || "",
      badges:      author.badges || [],
      role:        author.role,
      total:      authorPosts.length,
    });
  } catch (err) {
    console.log("error", err.message);
    res.status(500).json({ message: err.message });
  }
};

const getCategoryPosts = async (req, res) => {
  try {
    const { category } = req.params;

    // fix: query Post collection directly by category — 'posts.category' on Author no longer works
    const posts = await Post.find({ category: { $eq: category } })
      .populate("authorId", "authorname email profile")
      .lean();

    // Shape to match original response exactly
    const categoryPosts = posts.map((post) => ({
      ...post,
      authorname: post.authorId?.authorname || "",
      authoremail: post.authorId?.email     || "",
      profile:     post.authorId?.profile   || "",
      // keep authorId as the ObjectId — don't expose the nested object
      authorId: post.authorId?._id,
    }));

    res.status(200).json({ message: "Category posts", data: categoryPosts });
  } catch (err) {
    // fix: expose err.message
    res.status(500).json({ message: "server error", error: err.message });
  }
};


// reviewed------------------------------------------------------
async function notifyAIIngestion(post, token) {
 try{
   console.log("post to ingest: ", post._id);
   console.log("post authorId: ", post.authorId);
   console.log("post title: ", post.title);
   console.log("post documents: ", post.documents);
   console.log("post description: ", post.description);
   console.log("post category: ", post.category);
   console.log("post authorName: ", post.authorName);
   console.log("post authorEmail: ", post.authorEmail);
 const  res = await axios.post(`${process.env.TECH_ASSISTANT_URL}/ingest`,
   post,
  {
    headers:{
      "Authorization": `Bearer ${token}`
    }
  });
  console.log("AI ingestion notified:", res.data);
 }
 catch(err){
  console.error("Error notifying AI ingestion:", err.message);
 }
}

// reviewed-----------------------------------------------------
async function deleteFromAIIngestion(post_id, token) {
  try{

   const  res = await axios.delete(`${process.env.TECH_ASSISTANT_URL}/delete/${post_id}`,
      {
        headers:{
          "Authorization": `Bearer ${token}`
        }
      }

     );
      console.log("embedding doc deleted successfully:",post_id, res.data);
  }
  // catch(err){
  //   console.error("Error notifying AI deletion:", err.message); 
  // }
    catch (err) {
    console.error("AI deletion error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
  }
}

const addPosts = async (req, res) => {
  const { title, description, category, links } = req.body;

  let imageUrl = '';
  const documentUrls = [];

  try {
    // fix: added $eq operator — consistent with all other controllers
    const author = await Author.findOne({ email: { $eq: req.params.email } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // --- Upload image ---
    if (req.files && req.files.image) {
      const buffer = await sharp(req.files.image[0].buffer)
        .resize({ width: 672, height: 462, fit: 'contain' })
        .toBuffer();
      const uniqueFilename = `${uuidv4()}-${req.files.image[0].originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: req.files.image[0].mimetype,
      }));
      imageUrl = uniqueFilename;
    }

    // --- Upload documents ---
    if (req.files && req.files.document) {
      for (const doc of req.files.document) {
        const uniqueDocName = `${uuidv4()}-${doc.originalname}`;
        await s3.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueDocName,
          Body: doc.buffer,
          ContentType: doc.mimetype,
        }));
        documentUrls.push(uniqueDocName);
      }
    }

    // --- Parse links safely ---
    let parsedLinks = [];
    try {
      parsedLinks = links ? JSON.parse(links) : [];
    } catch {
      parsedLinks = [];
    }

    // fix: create Post document in Post collection — cannot push plain object into [ObjectId] array
    let savedPost;
    try {
      savedPost = await Post.create({
        authorId: author._id,
        title,
        image: imageUrl,
        description,
        category,
        documents: documentUrls,
        links: parsedLinks,
      });

      // push only the ObjectId ref into author.posts
      author.posts.push(savedPost._id);
      await author.save({ validateBeforeSave: false });
    } catch (dbErr) {
      // fix: S3 cleanup if DB write fails — prevent orphaned files
      const cleanup = [];
      if (imageUrl) cleanup.push(
        s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: imageUrl }))
      );
      for (const doc of documentUrls) cleanup.push(
        s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: doc }))
      );
      await Promise.allSettled(cleanup);
      throw dbErr; // re-throw so outer catch returns 500
    }

    const postId = savedPost._id;
    const url = `${notificationUrl}/viewpage/${author.email}/${postId}`;

    // -----------OLD MESSAGE LOGIC- ------------------
//       const communityAuthors = await Author.find({
//       community: { $in: [category] },
//       email: { $ne: author.email },
//     }).select('email');

//     // const followerSet = new Set(author.followers);
//     const followerSet = new Set(
//   author.followers.filter(f => f !== author.email)  // fix: exclude self
// );
//     const communitySet = new Set();
//     for (const a of communityAuthors) {
//       if (!followerSet.has(a.email)) communitySet.add(a.email);
//     }

//     const combinedRecipients = [...followerSet, ...communitySet];
//     const followersSet = [...followerSet];

//     // --- Bulk notifications ---
//     if (combinedRecipients.length > 0) {
//       const bulkNotifications = combinedRecipients.map(email => {
//         const isFollower = followerSet.has(email);
//         const message = isFollower
//           ? `New post from ${author.authorname}: ${title}`
//           : `${author.authorname} from your community posted: ${title}`;
//         return {
//           updateOne: {
//             filter: { email },
//             update: {
//               $push: {
//                 notification: {
//                   postId,
//                   user: author.authorname,
//                   authorEmail: author.email,
//                   message,
//                   url,
//                   profile: author.profile || "",
//                 },
//               },
//             },
//           },
//         };
//       });
//       await Author.bulkWrite(bulkNotifications);
//     }
    // -------------OLD MESSAGE LOGIC ENDS---------------------  


    // ---- NEW SSE MESSAGE LOGIC WITH BULLMQ---------------
    await enqueuePostNotification({
      postId,
      authorEmail: author.email,
      authorName: author.authorname,
      authorProfile: author.profile || "",
      title,
      url,
    });

    // fix: strip sensitive fields — author.save() returns full doc with password
    const { password, otp, otpExpiresAt, ...safeAuthor } = author.toObject();

    // Respond immediately
    res.status(201).json({ message: "Post added successfully", data: safeAuthor });


    // ------------------------Achievements Badge Configuration-------------------------------------------------------

    checkAndAwardBadges(author.email, ['strong_publisher'], {
        eventId:    savedPost._id,
        eventTitle: savedPost.title,
    }).catch(err => console.error("Badge check error:", err.message));

    // ---------------------------------------------------------------------------------------------------------------

    // --- AI ingestion (fire-and-forget after response) ---
    const postDataForAI = {
      ...savedPost.toObject(),
      authorName: author.authorname,
      profile: author.profile || '',
      authorEmail: author.email,
    };
    notifyAIIngestion(postDataForAI, req.token).catch(err => {
      console.error("AI ingestion error:", err.message);
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



const updatePost = async (req, res) => {
  const { email, postId } = req.params;
  const { title, description, category, links } = req.body;

  let newImageUrl      = null;
  let newDocumentUrls  = []; // only NEW uploads — for S3 cleanup on DB fail

  try {
    const author = await Author.findOne({ email: { $eq: email } })
      .select('authorname email profile posts');
    if (!author) {
      return res.status(404).json({ message: "author not found" });
    }

    const post = await Post.findOne({ _id: postId, authorId: author._id });
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    // image upload
    let imageUrl = post.image || '';
    if (req.files && req.files.image) {
      const buffer = await sharp(req.files.image[0].buffer)
        .resize({ width: 672, height: 462, fit: 'contain' })
        .toBuffer();
      const uniqueFilename = `${uuidv4()}-${req.files.image[0].originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket: bucketName, Key: uniqueFilename,
        Body: buffer, ContentType: req.files.image[0].mimetype,
      }));
      imageUrl    = uniqueFilename;
      newImageUrl = uniqueFilename;
    }

    // fix: start with existing documents — preserve old URLs
    // only append new uploads, never replace the whole array
    let documentUrls = [...(post.documents || [])];

    if (req.files && req.files.document) {
      for (const doc of req.files.document) {
        const uniqueDocName = `${uuidv4()}-${doc.originalname}`;
        await s3.send(new PutObjectCommand({
          Bucket: bucketName, Key: uniqueDocName,
          Body: doc.buffer, ContentType: doc.mimetype,
        }));
        documentUrls.push(uniqueDocName);     // append to existing
        newDocumentUrls.push(uniqueDocName);  // track for cleanup only
      }
    }

    // parse links
    let parsedLinks = post.links
      ? post.links.map(l => l.toObject ? l.toObject() : l)
      : [];

    if (links) {
      try {
        const parsed = typeof links === "string" ? JSON.parse(links) : links;

        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((link) => {
            const hasId = link.id && link.id !== "null" && link.id !== null;

            if (hasId) {
              const existingIndex = parsedLinks.findIndex(
                (existing) => existing._id.toString() === link.id.toString()
              );
              if (existingIndex !== -1) {
                parsedLinks[existingIndex] = {
                  ...parsedLinks[existingIndex],
                  title: (link.title || "").trim(),
                  url:   (link.url   || "").trim(),
                };
              }
            } else {
              if (parsedLinks.length < 10) {
                parsedLinks.push({
                  _id:   new mongoose.Types.ObjectId(),
                  title: (link.title || "").trim(),
                  url:   (link.url   || "").trim(),
                });
              }
            }
          });
        }
      } catch (err) {
        console.log("link parse error", err.message);
      }
    }

    post.title       = title;
    post.image       = imageUrl;
    post.description = description;
    post.category    = category;
    post.documents   = documentUrls;  // old + new combined
    post.links       = parsedLinks;

    let savedPost;
    try {
      savedPost = await post.save();
    } catch (dbErr) {
      // S3 cleanup — only remove newly uploaded files, not existing ones
      const cleanup = [];
      if (newImageUrl) cleanup.push(
        s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: newImageUrl }))
      );
      for (const doc of newDocumentUrls) cleanup.push(
        s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: doc }))
      );
      await Promise.allSettled(cleanup);
      throw dbErr;
    }

    res.status(200).json({ message: "Post updated successfully", data: savedPost });

    const updatedToAI = {
      ...savedPost.toObject(),
      authorName:  author.authorname,
      profile:     author.profile || '',
      authorEmail: author.email,
    };
    notifyAIIngestion(updatedToAI, req.token).catch(err => {
      console.error("AI update ingestion error:", err.message);
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const removePostsLinks = async (req, res) => {
  try {
    const { email, postId } = req.params;
    const { linkId } = req.body;

    if (!email || !postId || !linkId) {
      return res.status(400).json({ message: "Author email, postId and link Id are required" });
    }

    const author = await Author.findOne({ email: { $eq: email } }).select('_id');
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // fix: query Post collection directly with ownership check — author.posts.id() broken after normalization
    const post = await Post.findOne({ _id: postId, authorId: author._id });
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    const initialLength = post.links.length;

    post.links = post.links.filter(
      (link) => link._id.toString() !== linkId.toString()
    );

    if (post.links.length === initialLength) {
      return res.status(404).json({ message: "Link not found" });
    }

    // fix: save Post document directly — was author.save() in embedded pattern
    await post.save({ validateBeforeSave: false });

    // response shape kept identical — frontend expects personalLinks key
    res.status(200).json({
      message: "Link removed successfully",
      personalLinks: post.links,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// remove documents
const removePostDocument = async (req, res) => {
  try {
    const { email, postId } = req.params;
    const { documentKey }   = req.body; // S3 key of the document to remove

    if (!email || !postId || !documentKey) {
      return res.status(400).json({
        message: "Author email, postId and documentKey are required",
      });
    }

    const author = await Author.findOne({ email: { $eq: email } }).select('_id');
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const post = await Post.findOne({ _id: postId, authorId: author._id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const initialLength = post.documents.length;

    post.documents = post.documents.filter(doc => doc !== documentKey);

    if (post.documents.length === initialLength) {
      return res.status(404).json({ message: "Document not found in post" });
    }

    await post.save({ validateBeforeSave: false });

    // delete from S3 after DB save succeeds — don't orphan the file
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key:    documentKey,
      }));
    } catch (s3Err) {
      // S3 delete failed but DB is already updated — log and continue
      // file becomes orphaned but post is consistent
      console.error("S3 document delete failed:", s3Err.message);
    }

    res.status(200).json({
      message:   "Document removed successfully",
      documents: post.documents,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { email, postId } = req.params;

    const author = await Author.findOne({ email: { $eq: email } }).select('_id authorname');
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // fix: fetch Post document directly — author.posts is [ObjectId], findIndex always returned -1
    const postToDelete = await Post.findOne({ _id: postId, authorId: author._id });
    if (!postToDelete) {
      return res.status(404).json({ message: "Post not found" });
    }

    // fix: S3 wrapped in try/catch — don't let S3 failure block DB deletion
    if (postToDelete.image) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: postToDelete.image }));
      } catch (s3Err) {
        console.error("Failed to delete post image from S3:", s3Err.message);
      }
    }

    if (postToDelete.documents?.length > 0) {
      try {
        await Promise.all(
          postToDelete.documents.map(doc =>
            s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: doc }))
          )
        );
      } catch (s3Err) {
        console.error("Failed to delete post documents from S3:", s3Err.message);
      }
    }

    // fix: delete from Post collection and pull ref from author.posts
    await Post.deleteOne({ _id: postId });
    await Author.updateOne(
      { _id: author._id },
      { $pull: { posts: postToDelete._id } }
    );

    // Respond immediately
    // fix: return deleted post doc instead of full author doc — avoids password leak
    res.status(200).json({
      message: "Post deleted successfully",
      data: postToDelete,
    });

    // fix: fire-and-forget after response — was blocking before res.json()
    deleteFromAIIngestion(postId, req.token).catch(err => {
      console.error("AI deletion error:", err.message);
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const getSinglePost = async (req, res) => {
  try {
    const { email, postId } = req.params;

    // fix: only fetch fields needed for the response shape
    const author = await Author.findOne({ email: { $eq: email } })
      .select('_id authorname email profile');
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // fix: query Post collection directly with ownership check
    // author.posts.id() is a subdoc method — broken after normalization
    const post = await Post.findOne({ _id: postId, authorId: author._id }).lean();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const normalizedMessages = await resolveMessageAuthorProfiles(post.messages || []);

    // response shape kept identical — same fields as before
    const postWithAuthorDetails = {
      ...post,
      messages: normalizedMessages,
      authorname: author.authorname,
      authoremail: author.email,
      profile: author.profile || '',
    };

    res.status(200).json({
      message: "Single post",
      data: postWithAuthorDetails,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const postView = async (req, res) => {
  try {
    
    const { email, id } = req.params;
    const { emailAuthor } = req.body;

    // fix: select email too — author.email was undefined, causing badge check to silently fail
    const author = await Author.findOne({ email: { $eq: email } }).select('_id email');
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // fix: select title too — needed for eventContext in badge check
    const post = await Post.findOne({ _id: id, authorId: author._id }).select('_id views title');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.views.includes(emailAuthor)) {
      return res.status(200).json({ message: 'Already viewed', views: post.views });
    }

    await Post.updateOne(
      { _id: id },
      { $addToSet: { views: emailAuthor } }
    );

     

    res.status(200).json({
      message: 'View added successfully',
      views:   [...post.views, emailAuthor],
    });

    // author.email now exists — badge check will work correctly
    console.log("post id", post._id);
    console.log("author email", author.email);
    checkAndAwardBadges(author.email, ['pro_contributor'], {
      eventId:  post._id,
      eventTitle: post.title,
    }).catch(err => console.error("Badge check error:", err.message));

  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const postLikes = async (req, res) => {
  try {
    const { email, id } = req.params;
    const { emailAuthor } = req.body;

    // verify author exists — ownership check
    const author = await Author.findOne({ email: { $eq: email } }).select('_id email');
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // fix: find post in Post collection — author.posts.find() on ObjectIds always returned undefined
    const post = await Post.findOne({ _id: id, authorId: author._id }).select('likes');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Unlike
    if (post.likes.includes(emailAuthor)) {
      await Post.updateOne(
        { _id: id },
        { $pull: { likes: emailAuthor } }
      );
      return res.status(200).json({
        message: 'like removed successfully',
        likes: post.likes.filter(like => like !== emailAuthor),
      });
    }

    // Like
    await Post.updateOne(
      { _id: id },
      { $addToSet: { likes: emailAuthor } }
    );

    // fix: was returning views instead of likes on like-added response
    res.status(200).json({
      message: 'like added successfully',
      likes: [...post.likes, emailAuthor],
    });

    // in postLikes controller — after Post.updateOne()
checkAndAwardBadges(author.email, ['impact_creator'], {
  eventId:    id,
  eventTitle: post.title,
}).catch(err => console.error("Badge check error:", err.message));

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// reviewed--------------------------------------------------
const addPostBookmark = async(req,res)=>{
  try{
    const {email} = req.params;
    const {postId} = req.body;
      // console.log("email",email)
    if(!email){
      return res.status(400).json({message:"email required"})
    }
    if(!postId){
      return res.status(400).json({message:"postId required"})
    }

  
    const author = await Author.findOne({ email: { $eq: email }});
  
    if(!author){
      return res.status(404).json({message:"author not found"})
    }

    const bookmarkIndex = (author.postBookmark || []).findIndex(id => id.toString() === postId);
    let message;
    if (bookmarkIndex !== -1) {
      // already bookmarked -> remove
      author.postBookmark.splice(bookmarkIndex, 1);
      message = "Post removed from bookmarks";
    } else {
      // not bookmarked -> add
      author.postBookmark.push(new mongoose.Types.ObjectId(postId));
      message = "Post added to bookmarks";
    }

    await author.save({ validateBeforeSave: false });

    return res.status(200).json({ message, postBookmark: author.postBookmark });
  }
  catch(err){
    res.status(500).json({message:err.message})
    console.log("error", err.message)
  }
}


const getBookmarkedPosts = async (req, res) => {
  try {
    const { email } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const end   = start + limit;

    if (!email) return res.status(400).json({ message: "email required" });

    const author = await Author.findOne({ email: { $eq: email } }).select("postBookmark");
    if (!author) return res.status(404).json({ message: "author not found" });

    const postIds = (author.postBookmark || [])
      .map(id => (id ? id.toString() : null))
      .filter(Boolean);

    if (postIds.length === 0) {
      return res.status(200).json({ message: "No bookmarks", posts: [], postIds: [], count: 0 });
    }

    // fix: query Post collection directly with $in — was scanning all authors and looping a.posts (ObjectIds)
    const postDocs = await Post.find({ _id: { $in: postIds } })
      .populate("authorId", "authorname email profile role community")
      .lean();

    // build a map for O(1) lookup
    const postMap = new Map();
    for (const p of postDocs) {
      postMap.set(p._id.toString(), {
        ...p,
        authorName:  p.authorId?.authorname || "",
        authorEmail: p.authorId?.email      || "",
        profile:     p.authorId?.profile    || "",
        role:        p.authorId?.role       || "",
        community:   p.authorId?.community  || [],
        authorId:    p.authorId?._id,        // keep as ObjectId, not nested object
      });
    }

    // preserve bookmark insertion order, then paginate
    const allBookmarkedPosts = postIds.map(id => postMap.get(id)).filter(Boolean);
    const paginatedPosts     = allBookmarkedPosts.slice(start, end);
    const paginatedPostIds   = paginatedPosts.map(p => p?._id?.toString()).filter(Boolean);

    // response shape identical to before
    return res.status(200).json({
      message: "Bookmarked posts",
      count:   allBookmarkedPosts.length,
      posts:   paginatedPosts,
      postIds: paginatedPostIds,
    });
  } catch (err) {
    console.error("getBookmarkedPosts error:", err);
    return res.status(500).json({ message: "server error", error: err.message });
  }
};

//reviewed-----------------------------------------------------
const getAllBookmarkIds = async (req, res) => {
  try {
    const { email } = req.params;

    const author = await Author.findOne({ email: { $eq: email }}).select("postBookmark");

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const postIds = (author.postBookmark || []).map(id => id.toString());

    res.status(200).json({ postIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getParticipants = async (req, res) => {
  try {
    const { postId } = req.params;
    // console.log("post called");

    if (!postId) {
      return res.status(400).json({ message: "postId required" });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }

    const post = await Post.findById(postId).select("messages").lean();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const normalizedMessages = await resolveMessageAuthorProfiles(post.messages || []);

    const participantMap = new Map();
    for (const message of normalizedMessages) {
      const email = (message?.email || "").trim().toLowerCase();
      if (!email) continue;

      if (!participantMap.has(email)) {
        participantMap.set(email, {
          email,
          profile: message?.profile || "",
          name: message?.user || "",
          badges: [],
        });
      } else {
        const participant = participantMap.get(email);
        if (!participant.profile && message?.profile) participant.profile = message.profile;
        if (!participant.name && message?.user) participant.name = message.user;
      }
    }

    const participantEmails = Array.from(participantMap.keys());
    if (participantEmails.length === 0) {
      return res.status(200).json({ message: "No participants found", count: 0, participants: [] });
    }

    const authors = await Author.find({ email: { $in: participantEmails } })
      .select("email profile authorname role badges")
      .lean();

    const authorByEmail = new Map(authors.map((author) => [author.email.toLowerCase(), author]));

    const participants = participantEmails.map((email) => {
      const author = authorByEmail.get(email);
      const base = participantMap.get(email);
      return {
        email,
        profile: author?.profile || base.profile || "",
        name: author?.authorname || base.name || email,
        badges: Array.isArray(author?.badges) ? author.badges : [],
        role: author?.role,
      };
    });

    return res.status(200).json({ message: "Participants retrieved", count: participants.length, participants });
  } catch (err) {
    console.log("error", err.message);
    res.status(500).json({ message: err.message });
  }
};




module.exports = {
  getSingleAuthorPosts,
  getCategoryPosts,
  addPosts,
  updatePost,
  deletePost,
  getSinglePost,
  postView,
  postLikes,
  getRecommendedPosts,
  addPostBookmark,
  getBookmarkedPosts,
  removePostsLinks,
  getAllBookmarkIds,
  removePostDocument,
  getParticipants,
  // getPostsByAuthorsCategory,
  // getUniqueCategoriesByAuthor
  // updateMessage,
  // deleteComment
 
};
