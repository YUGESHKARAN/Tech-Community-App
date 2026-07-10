const { Author, Post } = require("../models/blogAuthorSchema");
const mongoose = require("mongoose");
// s3 integration
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
// import nodemailer from "nodemailer";

const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const { json } = require("body-parser");
const { ReturnDocument } = require("mongodb");

const notificationUrl = process.env.NOTIFICATION_URL || "http://localhost:5173";
const { resolveTenantFromEmail } = require("../utils/resolveTenant");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER, // Or your preferred email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

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

// ----------------------------------------------------------------------

const { sendOTPEmail } = require("../utils/emailService");
const { saveOTP, verifyOTP } = require("../utils/otpStore");
const { DeletionLog } = require("../models/deletionLogSchema");
const { checkAndAwardBadges } = require("../services/badgeService");

// ─── Step 1: Validate form data & send OTP ───────────────────────────────────
// reviewed----------------------------------------------
const sendRegistrationOTP = async (req, res) => {
  const { authorname, email, password } = req.body;
  // console.log("email", email);
  const user = await Author.findOne({ email: { $eq: email } }).select(
    "password authorname email role profile",
  );

  if (!user) {
    // fix: check deletion log before returning generic "Invalid Email"
    const deletionRecord = await DeletionLog.findOne({
      "snapshot.author.email": { $eq: email },
      status: "deleted",
    })
      .select("_id deletionType")
      .lean();

    // console.log("deletionRecord:", deletionRecord);

    if (deletionRecord) {
      let message =
        "This account has already been deleted. Contact admin to restore your account";

      if (deletionRecord.deletionType === "admin_action") {
        message =
          "This account has been already deleted by admin. Contact admin to restore your account.";
      } else {
        message =
          "This account has already been self deleted. Contact admin to restore your account.";
      }

      return res.status(403).json({
        message: message,
        canRestore: true,
        deletionType: deletionRecord.deletionType,
      });
    }
  }

  if (!email.endsWith("@dsuniversity.ac.in")) {
    return res.status(400).json({ message: "Use University Email" });
  }

  //   let tenant;
  // try {
  //   tenant = await resolveTenantFromEmail(email);
  // } catch (err) {
  //   return res.status(400).json({
  //     message: "Your institution is not registered on BytesBase.",
  //   });
  // }

  if (!authorname || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const authorExist = await Author.findOne({ email: { $eq: email } });
    if (authorExist) {
      return res.status(400).json({ message: "Author already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    await saveOTP(email, otp);
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your university email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
    console.log("registration error", err.message);
  }
};

// ─── Step 2: Verify OTP & create account ─────────────────────────────────────

// reviewed----------------------------------------------
const addAuthor = async (req, res) => {
  const { authorname, password, email, otp } = req.body;

  if (!email.endsWith("@dsuniversity.ac.in")) {
    return res.status(400).json({ message: "Use University Email" });
  }
  //  let tenant;
  // try {
  //   tenant = await resolveTenantFromEmail(email);
  // } catch (err) {
  //   return res.status(400).json({
  //     message: "Your institution is not registered on BytesBase.",
  //   });
  // }

  const { valid, reason } = await verifyOTP(email, otp);
  if (!valid) {
    return res.status(400).json({ message: reason });
  }

  // ── welcome content ───────────────────────────────────────
  const adminUser = "Admin";
  const adminEmail = "21aid145@dsuniversity.ac.in";
  const welcomeTitle = "Welcome to Bytes Base - Tech Community Platform 🎉";
  const welcomeMsg = `Hi ${authorname}, Welcome on-board! Your account has been successfully created, and you are now ready to explore the platform.\n
        Get started by setting up your profile, joining tech communities that match your interests, and connecting with fellow contributors. You can explore recommended content on your home feed, participate in post's discussions, and stay updated through notifications and announcements.\n
        We're glad to have you here and look forward to your active participation.`;

  // If you need assistance at any point, refer to the user guide available within the platform. \n

  const url = `${notificationUrl}/announcement`;

  const newAnnouncement = {
    user: adminUser,
    title: welcomeTitle,
    message: welcomeMsg,
    authorEmail: adminEmail,
    deliveredTo: "all",
  };

  const newNotification = {
    user: adminUser,
    authorEmail: adminEmail,
    message: `Hi ${authorname}, Welcome to the Tech Community platform 🎉! Your account is ready now.`,
    url,
  };

  try {
    const authorExist = await Author.findOne({ email: { $eq: email } });
    if (authorExist) {
      return res.status(400).json({ message: "Author already exists" });
    }

    const newAuthor = new Author({
      authorname,
      password,
      email,
      announcement: [newAnnouncement],
      notification: [newNotification],
    });
    await newAuthor.save();

    res.status(201).json({ message: "Author created successfully", newAuthor });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating author", error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // posts is now [ObjectId] refs — .length still gives correct count, no populate needed
    const authorsProfile = await Author.find({})
      .select("-password -otp -otpExpiresAt")
      .skip(skip)
      .limit(limit)
      .lean();

    const shuffleArray = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const shuffledAuthors = shuffleArray(authorsProfile);

    const data = shuffledAuthors.map((author) => ({
      authorName: author.authorname,
      email: author.email,
      postCount: author.posts?.length || 0,
      profile: author.profile,
      followers: author.followers,
      role: author.role,
      profileLinks: author.personalLinks,
      community: author.community,
      badges: author?.badges || [],
    }));

    const total = await Author.countDocuments();

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getSingleAuthor = async (req, res) => {
  try {
    const { email } = req.params;

    const author = await Author.findOne({ email: { $eq: email } })
      .select("-password -otp -otpExpiresAt")
      .populate("posts"); // returns full post documents, not raw IDs

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.status(200).json(author);
  } catch (err) {
    console.error("Error fetching author:", err);
    res
      .status(500)
      .json({ message: "Error fetching author", error: err.message });
  }
};

const getFollowersFollowing = async (req, res) => {
  try {
    const { email } = req.params;
    console.log("getFollowersFollowing triggered!");
    if (!email) {
      return res.status(400).json({ message: "Author email required" });
    }

    const author = await Author.findOne({ email: { $eq: email } })
      .select("followers following")
      .lean();
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const followerEmails = Array.isArray(author.followers)
      ? author.followers
      : [];
    const followingEmails = Array.isArray(author.following)
      ? author.following
      : [];

    const uniqueEmails = Array.from(
      new Set(
        [...followerEmails, ...followingEmails].map((e) =>
          (e || "").trim().toLowerCase(),
        ),
      ),
    ).filter((email) => email);

    const authors =
      uniqueEmails.length > 0
        ? await Author.find({ email: { $in: uniqueEmails } })
            .select("email profile authorname role badges")
            .lean()
        : [];

    const authorByEmail = new Map(
      authors.map((authorDoc) => [authorDoc.email.toLowerCase(), authorDoc]),
    );

    const formatDetails = (emails) =>
      emails.map((itemEmail) => {
        const normalizedEmail = (itemEmail || "").trim().toLowerCase();
        const authorDoc = authorByEmail.get(normalizedEmail);
        return {
          email: normalizedEmail || itemEmail,
          profile: authorDoc?.profile || "",
          name: authorDoc?.authorname || itemEmail || normalizedEmail,
          badges: Array.isArray(authorDoc?.badges) ? authorDoc.badges : [],
          role: authorDoc?.role || null,
        };
      });

    return res.status(200).json({
      message: "Followers and following retrieved successfully",
      followers: formatDetails(followerEmails),
      following: formatDetails(followingEmails),
    });
  } catch (err) {
    console.error("Error fetching followers/following:", err);
    return res.status(500).json({
      message: "Error fetching followers and following",
      error: err.message,
    });
  }
};

// reviewed----------------------------------------------
const getAuthorsByDomain = async (req, res) => {
  try {
    let { category } = req.params;
    let { page = 1, limit = 20 } = req.query; // ← NEW
    //  console.log("domain page", page, "limit", limit);
    category = decodeURIComponent(category);

    page = parseInt(page);
    limit = parseInt(limit);

    // Filter directly in MongoDB (more efficient)
    const filteredAuthors = await Author.find({
      community: { $in: [category] },
    })
      .skip((page - 1) * limit)
      .limit(limit);

    const shuffleArray = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const shuffledAuthors = shuffleArray(filteredAuthors);

    const data = shuffledAuthors.map((author) => ({
      authorName: author.authorname,
      email: author.email,
      postCount: author.posts?.length || 0,
      profile: author.profile,
      followers: author.followers,
      role: author.role,
      profileLinks: author.personalLinks,
      community: author.community,
      badges: author.badges || [],
    }));

    const total = await Author.countDocuments({
      community: { $in: [category] },
    });

    res.status(200).json({
      filteredAuthors: data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.log("Error fetching authors by domain:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllAuthorsByDomain = async (req, res) => {
  try {
    let { category } = req.params;
    category = decodeURIComponent(category);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log("hook colaborator page", page);
    console.log("category", category);
    const isAll = !category || category === "All";

    const filter = isAll
      ? { role: { $in: ["admin", "coordinator"] } }
      : {
          community: { $in: [category] },
          role: { $in: ["admin", "coordinator"] },
        };

    const countFilter = isAll
      ? { role: { $in: ["admin", "coordinator"] } }
      : { community: { $in: [category] } };

    const [filteredAuthors, total] = await Promise.all([
      Author.find(filter, "authorname email profile")
        .skip(skip)
        .limit(limit)
        .lean(),
      Author.countDocuments(countFilter),
    ]);

    res.status(200).json({
      filteredAuthors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    });
  } catch (err) {
    console.log("Error fetching authors by domain:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateAuthor = async (req, res) => {
  // console.log("updateAuthor called");
  const { authorname, email, role, techcommunity, links, bio } = req.body;

  // fix: generate S3 key in same format used when profile was first uploaded
  // Option A — no folder prefix (flat): "uuid-originalname.jpg"
  const isNewProfile = req.file ? `${uuidv4()}-${req.file.originalname}` : null;

  // Option B — with folder prefix: "Profiles/uuid-originalname.jpg"
  // const profileFolder = "Profiles/";
  // const profile = req.file ? `${profileFolder}${uuidv4()}-${req.file.originalname}` : null;

  try {
    const author = await Author.findOne({ email: { $eq: req.params.email } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    let parsedLinks = author.personalLinks || [];
    if (links && JSON.parse(links).length > 0) {
      try {
        const parsed = typeof links === "string" ? JSON.parse(links) : links;
        if (Array.isArray(parsed)) {
          let incomingLinks = parsed.map((link) => ({
            _id: link.id ? link.id : new mongoose.Types.ObjectId(),
            title: (link.title || "").trim(),
            url: (link.url || "").trim(),
          }));
          incomingLinks.forEach((newLink) => {
            const existingIndex = parsedLinks.findIndex(
              (existing) => existing._id.toString() === newLink._id.toString(),
            );
            if (existingIndex !== -1) {
              parsedLinks[existingIndex] = newLink;
            } else {
              if (parsedLinks.length < 5) parsedLinks.push(newLink);
            }
          });
          author.personalLinks = parsedLinks;
        }
      } catch (err) {
        console.error("Failed to parse links:", err);
      }
    }

    author.authorname = authorname;
    author.email = email;
    author.bio = bio;

    if (isNewProfile) {
      const profile = author.profile || `${uuidv4()}-${req.file.originalname}`;
      // delete old profile from S3 if one existed
      if (author.profile) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: author.profile,
            }),
          );
        } catch (s3Err) {
          console.error("Failed to delete old profile from S3:", s3Err.message);
        }
      }

      // upload new profile to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: profile,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );

      author.profile = profile;
    }

    if (role) author.role = role;

    if (techcommunity) {
      const index = author.community.indexOf(techcommunity);
      if (index === -1) {
        author.community.push(techcommunity);
      } else {
        author.community.splice(index, 1);
      }
    }

    const saved = await author.save();
    const { password, otp, otpExpiresAt, ...safeData } = saved.toObject();

    res
      .status(201)
      .json({ message: "author updated successfully", data: safeData });
  } catch (err) {
    console.log("error", err.message);
    res.status(500).json({ message: "server error", error: err.message });
  }
};

//reviewed----------------------------------------------
const removePersonalLinks = async (req, res) => {
  try {
    const { authorEmail, linkId } = req.params;

    // console.log("Remove link request:", { authorEmail, linkId });
    if (!authorEmail || !linkId) {
      return res
        .status(400)
        .json({ message: "Author email and link Id are required" });
    }

    const author = await Author.findOne({ email: { $eq: authorEmail } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const initialLength = author.personalLinks.length;

    author.personalLinks = author.personalLinks.filter(
      (link) => link._id.toString() !== linkId.toString(),
    );
    if (author.personalLinks.length === initialLength) {
      return res.status(404).json({ message: "Link not found" });
    }

    await author.save();
    res.status(200).json({
      message: "Link removed successfully",
      personalLinks: author.personalLinks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAuthor = async (req, res) => {
  const { email } = req.params;
  const { password } = req.body;

  try {
    if (!email)
      return res.status(400).json({ message: "Author email required" });
    if (!password)
      return res.status(400).json({ message: "Password required" });

    const author = await Author.findOne({ email: { $eq: email } });
    if (!author) return res.status(404).json({ message: "Author not found" });

    const isMatch = await author.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // Remove profile from S3 if present
    if (author.profile) {
      try {
        await s3.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: author.profile }),
        );
      } catch (s3Err) {
        console.error("Failed to delete profile from S3:", s3Err);
      }
    }

    // fix: delete all posts belonging to this author (were orphaned before)
    await Post.deleteMany({ authorId: author._id });

    await Author.deleteOne({ email: author.email });

    // fix: strip sensitive fields before responding
    const { password: _, otp, otpExpiresAt, ...safeAuthor } = author.toObject();

    console.log("author deleted", author.email);
    return res
      .status(200)
      .json({ message: "Author deleted successfully", author: safeAuthor });
  } catch (err) {
    console.error("Error deleting author:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const deleteAuthorByAdmin = async (req, res) => {
  try {
    const { authorEmail } = req.params;
    const { email, password } = req.body;

    if (!authorEmail)
      return res.status(400).json({ message: "Admin email required" });
    if (!email)
      return res.status(400).json({ message: "Author email required" });
    if (!password)
      return res.status(400).json({ message: "Password required" });

    const admin = await Author.findOne({ email: { $eq: authorEmail } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not allowed to perform this action" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid admin password" });

    const author = await Author.findOneAndDelete({ email: { $eq: email } });
    if (!author) return res.status(404).json({ message: "Author not found" });

    // fix: delete all posts belonging to this author (were orphaned before)
    await Post.deleteMany({ authorId: author._id });

    // fix: S3 now wrapped in try/catch — author is already deleted, don't crash on S3 failure
    if (author.profile) {
      try {
        await s3.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: author.profile }),
        );
      } catch (s3Err) {
        console.error("Failed to delete author profile from S3:", s3Err);
      }
    }

    // fix: strip sensitive fields before responding
    const { password: _, otp, otpExpiresAt, ...safeAuthor } = author.toObject();

    console.log("Author deleted successfully:", author.email);
    return res
      .status(200)
      .json({ message: "Author deleted successfully", author: safeAuthor });
  } catch (err) {
    console.error("Error deleting author:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// reviewd-------------------------------------------------------------------
const updateFollowers = async (req, res) => {
  try {
    const { email } = req.params;
    const { emailAuthor } = req.body;

    // console.log("Following request:", { email, emailAuthor });

    if (!email || !emailAuthor) {
      return res.status(400).json({ message: "Both emails are required" });
    }

    // fix: prevent self-follow
    if (email === emailAuthor) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const author = await Author.findOne({ email: { $eq: email } });
    const followerAuthor = await Author.findOne({
      email: { $eq: emailAuthor },
    });

    if (!author || !followerAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Unfollow
    if (author.followers.includes(emailAuthor)) {
      author.followers = author.followers.filter((f) => f !== emailAuthor);
      followerAuthor.following = followerAuthor.following.filter(
        (f) => f !== email,
      );

      // await author.save();
      // await followerAuthor.save();
      await author.save({ validateBeforeSave: false });
      await followerAuthor.save({ validateBeforeSave: false });

      return res.status(200).json({
        message: "Unfollowed successfully",
        followers: author.followers,
        following: followerAuthor.following,
      });
    }

    // Follow
    author.followers.push(emailAuthor);
    followerAuthor.following.push(email);

    // await author.save();
    // await followerAuthor.save();
    await author.save({ validateBeforeSave: false });
    await followerAuthor.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Author followed successfully",
      followers: author.followers,
      following: followerAuthor.following,
    });

    // in updateFollowers controller — after both saves
    checkAndAwardBadges(email, ["community_builder"], {
      eventTitle: "Followers milestone",
    }).catch((err) => console.error("Badge check error:", err.message));
  } catch (err) {
    console.error("SERVER ERROR:", err); // Add this line
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// reviewd-------------------------------------------------------------------
const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Author.findOne({ email: { $eq: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_PROVIDER,
      auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // Replace with your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_PROVIDER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendOtp:", error); // log it to the backend console

    // Avoid returning raw error object
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message || "Internal Server Error",
    });
  }
};

// reviewed-----------------------------------------------------------------------
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await Author.findOne({ email: { $eq: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is valid
    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password
    user.password = newPassword; // Hash the password in real implementations
    user.otp = null; // Clear OTP
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

// reviewed-----------------------------------------------------------------------
const notificationAuthor = async (req, res) => {
  const { email } = req.params;
  try {
    const author = await Author.findOne({ email: { $eq: email } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // console.log("message queues called!")

    res.json({
      notifications: author.notification,
      announcements: author.announcement,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// reviewed-----------------------------------------------------------------------
const notificationAuthorDelete = async (req, res) => {
  const { email, notificationId } = req.query; // Expecting `notificationId` to identify which notification to delete.

  try {
    // Find the author by email
    const author = await Author.findOne({ email: { $eq: email } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Filter out the notification with the given notificationId
    const updatedNotifications = author.notification.filter(
      (notif) => notif._id.toString() !== notificationId,
    );

    // If no notification matches the provided ID
    if (updatedNotifications.length === author.notification.length) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Update the author's notifications and save
    author.notification = updatedNotifications;
    await author.save();

    res.status(200).json({
      message: "Notification deleted successfully",
      notifications: author.notification,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// reviewed-----------------------------------------------------------------------
const notificationAuthorDeleteAll = async (req, res) => {
  const { email } = req.query; // Expecting the author's email in the request body.

  try {
    // Find the author by email
    const author = await Author.findOne({ email: { $eq: email } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Set the notifications array to empty
    author.notification = [];
    await author.save();

    res.status(200).json({
      message: "All notifications deleted successfully",
      notifications: author.notification, // This will now be an empty array
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addAnnouncement = async (req, res) => {
  // console.log("announcement route hit");

  const {
    user,
    title,
    message,
    links,
    deliveredTo,
    techCommName,
    email,
    profile,
  } = req.body;
  // const poster = req.file ? req.file.originalname : "";
  try {
    const author = await Author.findOne({ email: { $eq: email } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    let selectedCommunities = [];
    if (deliveredTo === "community" && techCommName) {
      try {
        selectedCommunities =
          typeof techCommName === "string"
            ? JSON.parse(techCommName)
            : techCommName;
        if (!Array.isArray(selectedCommunities)) {
          selectedCommunities = [];
        }
      } catch (e) {
        selectedCommunities = [];
      }
    }
    const eventFolder = "Events/";
    // const uniqueFilename = `${eventFolder}${uuidv4()}-${poster}`;
    const uniqueFilename = req.file
      ? `${eventFolder}${uuidv4()}-${req.file.originalname}`
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

    // Safe parsing of links
    let parsedLinks = [];
    try {
      parsedLinks = links ? JSON.parse(links) : [];
      if (!Array.isArray(parsedLinks)) parsedLinks = [];
    } catch {
      parsedLinks = [];
    }

    const announcementUrl =
      process.env.NOTIFICATION_URL || "http://localhost:5173";

    const url = `${announcementUrl}/announcement`;

    const newAnnouncement = {
      user,
      title,
      message,
      links: parsedLinks,
      deliveredTo,
      profile,
      authorEmail: email,
      poster: uniqueFilename,
    };

    // fix: author.authorname — authorname was undefined before
    const newNotification = {
      user,
      authorEmail: email,
      profile: profile || "",
      message: `New announcement: "${title}"`,
      url,
    };

    // let filter = {};
    // if (deliveredTo === "coordinators") {
    //   filter.role = { $in: ["coordinator"] };
    // } else if (deliveredTo === "community") {
    //   // filter.community = { $in: author.community };
    //   filter.community = { $in: selectedCommunities };
    // }

    let filter = {};
    if (deliveredTo === "coordinators") {
      // send to coordinators AND admins
      filter.role = { $in: ["coordinator", "admin"] };
    } else if (deliveredTo === "community") {
      // send to members of selected communities OR admins
      filter.$or = [
        { community: { $in: selectedCommunities } },
        { role: "admin" },
      ];
    }

    // Get recipients
    const recipients = await Author.find(filter).select("email");

    // const recipientEmails = recipients.map(r => r.email).filter(Boolean);

    // const recipientEmails = recipients.map((r) => r.email).filter(Boolean); // remove null/undefined
    // .filter((recipientEmail) => recipientEmail !== email); // remove sender email

    const recipientEmails = recipients
      .map((r) => r.email)
      .filter(Boolean)
      .filter((recipientEmail) => recipientEmail !== email); // fix: exclude sender

    // Bulk  push both announcement AND notification in one bulkWrite
    if (recipients.length > 0) {
      const bulkOps = recipients.map((r) => ({
        updateOne: {
          filter: { email: r.email },
          update: { $push: { announcement: newAnnouncement } },
        },
      }));
      await Author.bulkWrite(bulkOps);
    }

    // Push notification only to recipients excluding sender
    if (recipientEmails.length > 0) {
      const bulkOps = recipientEmails.map((email) => ({
        updateOne: {
          filter: { email },
          update: {
            $push: { notification: newNotification },
          },
        },
      }));

      await Author.bulkWrite(bulkOps);
    }
    // push both announcement AND notification in one bulkWrite
    // if (recipientEmails.length > 0) {
    //   const bulkOps = recipientEmails.map(recipientEmail => ({
    //     updateOne: {
    //       filter: { email: recipientEmail },
    //       update: {
    //         $push: {
    //           announcement: newAnnouncement,
    //           notification: newNotification,
    //         },
    //       },
    //     },
    //   }));
    //   await Author.bulkWrite(bulkOps);
    // }

    const linkHtml =
      parsedLinks.length > 0
        ? `<p>Links:<br>${parsedLinks
            .map((link) => {
              if (typeof link === "string") {
                return `<a href="${link}" target="_blank">${link}</a>`;
              } else if (typeof link === "object" && link.url) {
                return `<a href="${link.url}" target="_blank">${link.url}</a>`;
              }
              return "";
            })
            .join("<br>")}</p>`
        : "";

    // console.log("recipientsEmail", recipientEmails);
    // console.log("recipients", recipients)
    // Respond immediately
    res.status(201).json({
      message: "Announcement added successfully",
      announcement: newAnnouncement,
      recipients: recipientEmails,
    });

    // Send emails sequentially after response
    const sendEmailsSequentially = async () => {
      console.log(
        `📨 Sending announcement emails to ${recipientEmails.length} recipients...`,
      );
      for (const recipient of recipientEmails) {
        try {
          const escapeHtml = (value) =>
            String(value ?? "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;");

          const safeUser = escapeHtml(user);
          const safeTitle = escapeHtml(title);
          const safeMessage = escapeHtml(message);
          const safeUrl = escapeHtml(url);
          const safeLinkHtml = Array.isArray(parsedLinks)
            ? parsedLinks
                .map((link) => {
                  if (typeof link === "string") {
                    const safeLink = escapeHtml(link);
                    return `<p><a href="${safeLink}" target="_blank" rel="noopener noreferrer">${safeLink}</a></p>`;
                  }
                  if (link && typeof link === "object") {
                    const href = escapeHtml(link.url || link.href || "");
                    const text = escapeHtml(link.label || link.text || href);
                    return `<p><a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a></p>`;
                  }
                  return "";
                })
                .join("")
            : "";

          await transporter.sendMail({
            from: `"${user}" <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject: `Announcement: ${title}`,
            html: `
              <h3>New Announcement from ${safeUser}</h3>
              <p><strong>Title:</strong> ${safeTitle}</p>
              <p>${safeMessage}</p>
              ${safeLinkHtml}
              <p><a href="${safeUrl}">View Announcement</a></p>
            `,
          });
          // console.log(` Email sent to: ${recipient}`);
          await new Promise((res) => setTimeout(res, 200)); // Prevent overload
        } catch (err) {
          console.error(
            `❌ Failed to send email to ${recipient}:`,
            err.message,
          );
        }
      }
      console.log("📬 All announcement emails processed.");
    };

    sendEmailsSequentially();
  } catch (error) {
    console.error("Error adding announcement:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// reviewed-----------------------------------------------------------------------
const deleteAnnouncement = async (req, res) => {
  const { announcementId } = req.params;

  try {
    // Find the author who has the announcement and remove it
    const result = await Author.updateOne(
      { "announcement._id": announcementId },
      { $pull: { announcement: { _id: announcementId } } },
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete announcement", error: err.message });
  }
};

// reviewed-----------------------------------------------------------------------
const updateRole = async (req, res) => {
  const { email } = req.params;
  // console.log('params email', email);
  const { userEmail, role } = req.body;
  // console.log("Update role request received:", req.body);

  try {
    // console.log("logged");

    const admin = await Author.findOne({ email: { $eq: email } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not allowed to perform this action" });
    }

    const author = await Author.findOne({ email: { $eq: userEmail } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // ── Role Update content ───────────────────────────────────────
    const adminUser = admin.authorname;
    const adminEmail = admin.email;
    const roleTitle = "🛡️ Author Permissions Updated";

    const coordinatorMsg = `Hi ${author.authorname},

        Your role has been updated to **Coordinator**.

        Now you have access to a dedicated workspace where you can create and manage your posts and playlists content. In addition, you have access to publish campaign, event, and community-related announcements through the Announcement section. 
        
        One time **Logout** and **Login** is required to access the Coordinator interface.
       
        We’re excited to have you contribute to building and growing the community.`;

    const adminMsg = `Hi ${author.authorname},

        Your role has been successfully updated to **Admin**.

        Now you have full administrative access to manage and oversee the platform, including:
        - Access to the Admin Dashboard with key platform trends, post insights and contributor performance analytics.
        - Full user management and control capabilities.
        - Access to user deletion logs and deleted account rollback controls.
        - Permission to manage and update user roles and communities.

        One time **Logout** and **Login** is required to access the Admin interface.
        `;

    const studentMsg = `
        Hi ${author.authorname},
        Your role has been changed to **Student**. For more details contanct admin.
        `;

    const url = `${notificationUrl}/announcement`;

    const roleMessage =
      role == "coordinator"
        ? coordinatorMsg
        : role === "admin"
          ? adminMsg
          : studentMsg;

    const newAnnouncement = {
      user: adminUser,
      title: roleTitle,
      message: roleMessage,
      authorEmail: adminEmail,
      deliveredTo: "all",
    };

    const newNotification = {
      user: adminUser,
      authorEmail: adminEmail,
      message: `Hi ${author.authorname}, Your role has been updated to ${role}.`,
      url,
    };

    author.role = role;
    author.announcement.push(newAnnouncement);
    author.notification.push(newNotification);

    await author.save({ validateBeforeSave: false });
    res.status(200).json({ message: "Role updated successfully", author });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating role", error: err.message });
  }
};

// reviewed-----------------------------------------------------------------------
const updateTechCommunity = async (req, res) => {
  const { email, techcommunity } = req.body;
  // console.log("community called");

  try {
    const author = await Author.findOne({ email: { $eq: email } });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Toggle community membership
    if (techcommunity) {
      const index = author.community.indexOf(techcommunity);
      if (index === -1) {
        author.community.push(techcommunity); // Add if not exists
      } else {
        author.community.splice(index, 1); // Remove if exists
      }
    }

    author.email = email;
    data = await author.save({ validateBeforeSave: false });
    res.status(201).json({ message: "author updated successfully", data });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

// reviewed-----------------------------------------------------------------------
const updateTechCommunityCoordinator = async (req, res) => {
  const { email, techCommunities } = req.body; // techCommunities should be an array of strings
  console.log("communities called", email);

  try {
    const author = await Author.findOne({ email: { $eq: email } });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    if (Array.isArray(techCommunities)) {
      // Replace all existing communities with the new ones
      author.community = techCommunities;
    }

    const data = await author.save({ validateBeforeSave: false });
    res.status(201).json({ message: "Author updated successfully", data });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAllAnnouncements = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "author email required" });
    }

    const author = await Author.findOne({ email: { $eq: email } });

    if (!author) {
      return res.status(404).json({ message: "author not found!" });
    }

    author.announcement = [];
    await author.save();

    res.status(200).json({ message: "All announcements deleted !" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// reviewed-----------------------------------------------------------------------
const deleteAllAnnouncementByAdmin = async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "author email required" });
    }

    const admin = await Author.findOne({ email: { $eq: email } });
    if (!admin) {
      return res.status(404).json({ message: "Author not found" });
    }

    // await the password check
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Author not allowed" });
    }

    // Collect all poster keys from announcements
    const authorsWithAnnouncements = await Author.find({
      "announcement.0": { $exists: true },
    }).select("announcement");

    const keys = [];
    authorsWithAnnouncements.forEach((a) => {
      (a.announcement || []).forEach((ann) => {
        if (ann && ann.poster) keys.push(ann.poster);
      });
    });

    const uniqueKeys = [...new Set(keys)];

    // Delete S3 objects only if we have keys, but always clear announcements in DB
    let successCount = 0;
    let failed = [];

    if (uniqueKeys.length > 0) {
      const deletePromises = uniqueKeys.map((Key) => {
        const params = { Bucket: bucketName, Key };
        const cmd = new DeleteObjectCommand(params);
        return s3.send(cmd);
      });

      const results = await Promise.allSettled(deletePromises);
      successCount = results.filter((r) => r.status === "fulfilled").length;
      failed = results
        .map((r, i) => ({
          status: r.status,
          key: uniqueKeys[i],
          reason:
            r.status === "rejected" ? r.reason?.message || r.reason : undefined,
        }))
        .filter((r) => r.status === "rejected");
    }

    // Clear all announcements from DB (remove announcements array for authors who have it)
    await Author.updateMany(
      { "announcement.0": { $exists: true } },
      { $set: { announcement: [] } },
    );

    return res.status(200).json({
      message: "All announcements deleted (and images removed when present)",
      totalImagesFound: uniqueKeys.length,
      imagesDeleted: successCount,
      imageDeleteFailures: failed,
      announcementsCleared: true,
    });
  } catch (err) {
    console.error("Error deleting all announcements:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  addAuthor,
  sendRegistrationOTP,
  // getAllAuthor,
  // getAuthorsByRole,
  getSingleAuthor,
  getFollowersFollowing,
  updateAuthor,
  // updateAPassword,
  deleteAuthor,
  getProfile,
  updateFollowers,
  sendOtp,
  resetPassword,
  notificationAuthor,
  notificationAuthorDelete,
  notificationAuthorDeleteAll,
  addAnnouncement,
  deleteAnnouncement,
  updateRole,
  updateTechCommunity,
  updateTechCommunityCoordinator,
  removePersonalLinks,
  deleteAuthorByAdmin,
  deleteAllAnnouncementByAdmin,
  getAuthorsByDomain,
  getAllAuthorsByDomain,
  deleteAllAnnouncements,
  // getAllAnnouncements
};
