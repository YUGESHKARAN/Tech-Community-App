
// ─────────────────────────────────────────────────────────────
//  deletionLog.controller.js
// ─────────────────────────────────────────────────────────────
const mongoose  = require('mongoose');
const { Author, Post }  = require('../models/blogAuthorSchema');
const { DeletionLog }   = require('../models/deletionLogSchema');
// const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const { s3, bucketName }      = require('../config/s3');

// s3 integration
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();

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


// ─────────────────────────────────────────────────────────────
//  HELPER — build a full snapshot of an author + their posts
// ─────────────────────────────────────────────────────────────
const buildSnapshot = async (author) => {
  const posts = await Post.find({ authorId: author._id }).lean();
  const authorObj = author.toObject ? author.toObject() : author;

  return {
    author: {
      ...authorObj,
      // strip live ObjectId from _id — snapshot stores it but it
      // is no longer a primary key in this collection
    },
    posts,
  };
};

// ─────────────────────────────────────────────────────────────
//  CREATE LOG — called from deleteAuthor and deleteAuthorByAdmin
//  instead of duplicating logic, both deletion controllers call
//  this helper after verifying auth
// ─────────────────────────────────────────────────────────────
const createDeletionLog = async ({
  authorToDelete,
  deletedBy,        // { email, name, role }
  deletionType,     // 'self' | 'admin_action'
}) => {
  const snapshot = await buildSnapshot(authorToDelete);

  const log = new DeletionLog({
    deletionType,
    deletedBy,
    snapshot,
  });

  await log.save();
  return log;
};

// ─────────────────────────────────────────────────────────────
//  DELETE AUTHOR (self) — replaces old deleteAuthor controller
// ─────────────────────────────────────────────────────────────
const deleteAuthor = async (req, res) => {
  const { email } = req.params;
  const { password } = req.body;
  console.log("deleteAuthor called");

  try {
    if (!email)    return res.status(400).json({ message: "Author email required" });
    if (!password) return res.status(400).json({ message: "Password required" });

    const author = await Author.findOne({ email: { $eq: email } });
    if (!author) return res.status(404).json({ message: "Author not found" });

    const isMatch = await author.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // 1. snapshot + log BEFORE deletion
    const log = await createDeletionLog({
      authorToDelete: author,
      deletedBy: {
        email: author.email,
        name:  author.authorname,
        role:  author.role,
      },
      deletionType: 'self',
    });

    // 2. delete posts from Post collection
    await Post.deleteMany({ authorId: author._id });

    // 3. delete author
    await Author.deleteOne({ email: author.email });

    // 4. S3 profile cleanup (non-blocking)
    if (author.profile) {
      s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: author.profile }))
        .catch(err => console.error("S3 profile delete error:", err.message));
    }

    const { password: _, otp, otpExpiresAt, ...safeAuthor } = author.toObject();

    return res.status(200).json({
      message:   "Author deleted successfully",
      author:    safeAuthor,
      logId:     log._id,   // return logId so user can reference it for restore
    });
  } catch (err) {
    console.error("deleteAuthor error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  DELETE AUTHOR BY ADMIN
// ─────────────────────────────────────────────────────────────
const deleteAuthorByAdmin = async (req, res) => {
  try {
    const { authorEmail } = req.params;       // admin's email
    const { email, password } = req.body;     // target author + admin password

    if (!authorEmail) return res.status(400).json({ message: "Admin email required" });
    if (!email)       return res.status(400).json({ message: "Author email required" });
    if (!password)    return res.status(400).json({ message: "Password required" });

    const admin = await Author.findOne({ email: { $eq: authorEmail } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.role !== 'admin') return res.status(403).json({ message: "Access denied" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid admin password" });

    const author = await Author.findOne({ email: { $eq: email } });
    if (!author) return res.status(404).json({ message: "Author not found" });

    // 1. snapshot + log BEFORE deletion
    const log = await createDeletionLog({
      authorToDelete: author,
      deletedBy: {
        email: admin.email,
        name:  admin.authorname,
        role:  admin.role,
      },
      deletionType: 'admin_action',
    });

    // 2. delete posts
    await Post.deleteMany({ authorId: author._id });

    // 3. delete author
    await Author.deleteOne({ email: author.email });

    // 4. S3 profile cleanup
    if (author.profile) {
      s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: author.profile }))
        .catch(err => console.error("S3 profile delete error:", err.message));
    }

    const { password: _, otp, otpExpiresAt, ...safeAuthor } = author.toObject();

    return res.status(200).json({
      message: "Author deleted successfully",
      author:  safeAuthor,
      logId:   log._id,
    });
  } catch (err) {
    console.error("deleteAuthorByAdmin error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN — list deletion logs (paginated)
// ─────────────────────────────────────────────────────────────
const getDeletionLogs = async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 20;
    const status = req.query.status || 'deleted';  // filter by status
    const skip   = (page - 1) * limit;

    const admin = await Author.findOne({ email: { $eq: adminEmail } }).select('role');
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const [logs, total] = await Promise.all([
      DeletionLog.find({ status })
        .select('-snapshot.author.password -snapshot.author.otp -snapshot.author.otpExpiresAt')
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeletionLog.countDocuments({ status }),
    ]);

    // shape for admin view — summary only, not full snapshot
    const data = logs.map(log => ({
      logId:         log._id,
      status:        log.status,
      deletionType:  log.deletionType,
      deletedAt:     log.deletedAt,
      expiresAt:     log.expiresAt,
      restoredAt:    log.restoredAt,
      restoredBy:    log.restoredBy,
      deletedBy:     log.deletedBy,
      authorEmail:   log.snapshot.author.email,
      authorName:    log.snapshot.author.authorname,
      authorRole:    log.snapshot.author.role,
      postCount:     log.snapshot.posts.length,
    }));

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error("getDeletionLogs error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN — get single log detail (full snapshot)
// ─────────────────────────────────────────────────────────────
const getDeletionLogById = async (req, res) => {
  try {
    const { adminEmail, logId } = req.params;

    const admin = await Author.findOne({ email: { $eq: adminEmail } }).select('role');
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const log = await DeletionLog.findById(logId)
      .select('-snapshot.author.password -snapshot.author.otp -snapshot.author.otpExpiresAt')
      .lean();

    if (!log) return res.status(404).json({ message: "Log not found" });

    return res.status(200).json({ log });
  } catch (err) {
    console.error("getDeletionLogById error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  ROLLBACK — restore a deleted author + their posts
//  accessible by admin OR by the original user (email + OTP verify)
// ─────────────────────────────────────────────────────────────
// const rollbackDeletion = async (req, res) => {
//   try {
//     const { logId }      = req.params;
//     const { restoredBy } = req.body;   // email of person triggering restore

//     if (!restoredBy) {
//       return res.status(400).json({ message: "admin email required" });
//     }

//     // verify restorer exists and has permission
//     const restorer = await Author.findOne({ email: { $eq: restoredBy } }).select('role authorname');
//     if (!restorer) {
//       return res.status(404).json({ message: "Restorer account not found" });
//     }

//     const log = await DeletionLog.findById(logId);
//     if (!log) return res.status(404).json({ message: "Deletion log not found" });

//     // only admin can restore — OR original user if self-deleted
//     const isAdmin = restorer.role === 'admin';
//     // const isSelfRestore = log.deletionType === 'self' &&
//     //                       log.snapshot.author.email === restoredBy;

//     if (!isAdmin) {
//       return res.status(403).json({ message: "Not authorised to restore this account" });
//     }

//     if (log.status !== 'deleted') {
//       return res.status(400).json({
//         message: `Cannot restore — log status is '${log.status}'`,
//       });
//     }

//     // collision check — email may have been re-registered
//     const emailTaken = await Author.findOne({
//       email: { $eq: log.snapshot.author.email },
//     }).select('_id');

//     if (emailTaken) {
//       return res.status(409).json({
//         message: "Cannot restore — email already registered by another account",
//         email: log.snapshot.author.email,
//       });
//     }

//     const { author: authorSnap, posts: postsSnap } = log.snapshot;

//     // restore author — password is already hashed in snapshot, use updateOne
//     // to bypass pre('save') hook (which would double-hash)
//     const restoredAuthor = new Author({
//       ...authorSnap,
//       // clear stale OTP
//       otp:          undefined,
//       otpExpiresAt: undefined,
//     });

//     // save with { validateBeforeSave: false } since snapshot may have
//     // fields that no longer match current schema validators
//     await Author.collection.insertOne(restoredAuthor.toObject());

//     // restore posts — insert all at once preserving original _ids
//     if (postsSnap.length > 0) {
//       await Post.insertMany(postsSnap, { ordered: false });

//       // re-link post IDs on the author document
//       const postIds = postsSnap.map(p => p._id);
//       await Author.updateOne(
//         { email: authorSnap.email },
//         { $set: { posts: postIds } }
//       );
//     }

//     // mark log as restored
//     log.status     = 'restored';
//     log.restoredAt = new Date();
//     log.restoredBy = restoredBy;
//     await log.save();

//     return res.status(200).json({
//       message:       "Account and posts restored successfully",
//       restoredEmail: authorSnap.email,
//       postCount:     postsSnap.length,
//       logId:         log._id,
//     });
//   } catch (err) {
//     console.error("rollbackDeletion error:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

const rollbackDeletion = async (req, res) => {
  try {
    const { logId }      = req.params;
    const { restoredBy } = req.body;

    if (!restoredBy) {
      return res.status(400).json({ message: "restoredBy email required" });
    }

    const restorer = await Author.findOne({ email: { $eq: restoredBy } })
      .select('role authorname');
    if (!restorer) {
      return res.status(404).json({ message: "Restorer account not found" });
    }

    const log = await DeletionLog.findById(logId);
    if (!log) return res.status(404).json({ message: "Deletion log not found" });

    const isAdmin      = restorer.role === 'admin';
    const isSelfRestore = log.deletionType === 'self' &&
                          log.snapshot.author.email === restoredBy;

    if (!isAdmin && !isSelfRestore) {
      return res.status(403).json({ message: "Not authorised to restore this account" });
    }

    if (log.status !== 'deleted') {
      return res.status(400).json({
        message: `Cannot restore — log status is '${log.status}'`,
      });
    }

    // collision check removed — registration and login now block
    // re-use of a deleted email, so by the time we reach here
    // the email is guaranteed to be free

    const { author: authorSnap, posts: postsSnap } = log.snapshot;

    await Author.collection.insertOne({
      ...authorSnap._doc,
      otp:          undefined,
      otpExpiresAt: undefined,
    });

    if (postsSnap.length > 0) {
      await Post.insertMany(postsSnap, { ordered: false });
      const postIds = postsSnap.map(p => p._id);
      await Author.updateOne(
        { email: authorSnap.email },
        { $set: { posts: postIds } }
      );
    }

    log.status     = 'restored';
    log.restoredAt = new Date();
    log.restoredBy = restoredBy;
    await log.save();

    return res.status(200).json({
      message:       "Account and posts restored successfully",
      restoredEmail: authorSnap.email,
      postCount:     postsSnap.length,
      logId:         log._id,
    });
  } catch (err) {
    console.error("rollbackDeletion error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  USER — find their own deletion log by email
//  (used when a user wants to self-restore after deleting account)
// ─────────────────────────────────────────────────────────────
const getMyDeletionLog = async (req, res) => {
  try {
    const { email } = req.params;

    const log = await DeletionLog.findOne({
      'snapshot.author.email': { $eq: email },
      status: 'deleted',
    })
      .select('_id status deletedAt deletionType deletedBy expiresAt snapshot.posts snapshot.author.authorname snapshot.author.email snapshot.author.role')
      .sort({ deletedAt: -1 })
      .lean();

    if (!log) {
      return res.status(404).json({ message: "No deletion record found for this email" });
    }

    return res.status(200).json({
      logId:       log._id,
      status:      log.status,
      deletedAt:   log.deletedAt,
      deletionType:log.deletionType,
      expiresAt:   log.expiresAt,
      authorName:  log.snapshot.author.authorname,
      authorEmail: log.snapshot.author.email,
      postCount:   log.snapshot.posts.length,
    });
  } catch (err) {
    console.error("getMyDeletionLog error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN — manually expire a log (GDPR request)
// ─────────────────────────────────────────────────────────────
const expireDeletionLog = async (req, res) => {
  try {
    const { adminEmail, logId } = req.params;

    const admin = await Author.findOne({ email: { $eq: adminEmail } }).select('role');
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const log = await DeletionLog.findById(logId);
    if (!log) return res.status(404).json({ message: "Log not found" });

    if (log.status === 'restored') {
      return res.status(400).json({ message: "Cannot expire a restored log" });
    }

    log.status    = 'expired';
    log.expiresAt = new Date();  // triggers immediate TTL cleanup on next MongoDB pass
    await log.save();

    return res.status(200).json({ message: "Log marked as expired", logId: log._id });
  } catch (err) {
    console.error("expireDeletionLog error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  deleteAuthor,
  deleteAuthorByAdmin,
  getDeletionLogs,
  getDeletionLogById,
  getMyDeletionLog,
  rollbackDeletion,
  expireDeletionLog,
};