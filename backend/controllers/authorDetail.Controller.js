const Author = require("../models/blogAuthorSchema");
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

const getAllAuthor = async (req, res) => {
  try {
    const authors = await Author.find({});
    res.json(authors);
  } catch (err) {
    res.status("Error" + err);
  }
};

const getAuthorsByRole = async(req,res)=>{
  try{
    const {role} = req.params;
    const authors = await Author.find({role:role});

    res.status(200).json({authors})
  }
  catch(err)
  {
    res.status(500).json({message:err.message})
  }
}

// const getProfile = async (req, res) => {
//   try {
//     const authorsProfile = await Author.find({});

//      const shuffleArray = (arr) => {
//       const a = arr.slice();
//       for (let i = a.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [a[i], a[j]] = [a[j], a[i]];
//       }
//       return a;
//     };

//     const shuffledAuthors = shuffleArray(authorsProfile);


//     const data = shuffledAuthors.map((author) => ({
//       authorName: author.authorname,
//       email: author.email,
//       postCount: author.posts.length,
//       profile: author.profile,
//       followers: author.followers,
//       role: author.role,
//       profileLinks: author.personalLinks,
//       community: author.community,
//     }));
//     res.status(200).json(data);
//   } catch (err) {
//     res.status("Error", err);
//   }
// };


const getProfile = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // console.log("authors page:", page, "limit:", limit);

    // Fetch only required batch
    const authorsProfile = await Author.find({})
      .skip(skip)
      .limit(limit)
      .lean();

    // Shuffle only this batch (not entire DB)
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
    const author = await Author.findOne({ email: req.params.email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    res.json(author);
  } catch (err) {
    res.status("Error" + err);
  }
};

// ----------------------------------------------------------------------

// const getAuthorsByDomain = async (req, res) => {
//   try{
//       let {category} = req.params;
//      console.log("Category received:", category);
//      category = decodeURIComponent(category);
//       const authors = await Author.find({})
//       const filteredAuthors = authors.filter((author) => author.community.includes(category));
      
//       res.status(200).json({filteredAuthors});
//   }
//   catch(err)
//   {

//     console.log("Error fetching authors by domain:", err.message);  
//     res.status(500).json({message:"Server error", error: err.message})
//   }
// }
const getAuthorsByDomain = async (req, res) => {
  try {
    let { category } = req.params;
    let { page = 1, limit = 20 } = req.query;  // ← NEW
  //  console.log("domain page", page, "limit", limit);  
    category = decodeURIComponent(category);

    page = parseInt(page);
    limit = parseInt(limit);

    // Filter directly in MongoDB (more efficient)
    const filteredAuthors = await Author.find({
      community: { $in: [category] }
    })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Author.countDocuments({
      community: { $in: [category] }
    });

    res.status(200).json({
      filteredAuthors,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.log("Error fetching authors by domain:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------------------------------------------------------------

const addAuthor = async (req, res) => {
  const { authorname, password, email, post } = req.body;
  if (!email.endsWith("@dsuniversity.ac.in")) {
    return res.status(400).json({ message: "Use university email" });
  }
  try {
    const authorExist = await Author.findOne({ email });
    if (authorExist) {
      return res.status(400).json({ message: "Author already exist" });
    }

    const newAuthor = new Author({
      authorname,
      password,
      email,
      post,
    });

    await newAuthor.save();
    res.status(201).json({
      message: "Author created successfully",
      newAuthor,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating author", error: err.message });
  }
};

const updateAuthor = async (req, res) => {
  const { authorname, email, role, techcommunity, links } = req.body;
  const profile = req.file ? req.file.originalname : "";
  try {
    const author = await Author.findOne({ email: req.params.email });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    let parsedLinks = author.personalLinks || [];
    // --- Parse links safely ---
    if (links && JSON.parse(links).length > 0) {
      try {
        const parsed = typeof links === "string" ? JSON.parse(links) : links;

        if (Array.isArray(parsed)) {
          incomingLinks = parsed.map((link) => ({
            _id: link.id ? link.id : new mongoose.Types.ObjectId(), // manually create if you want explicit IDs
            title: (link.title || "").trim(),
            url: (link.url || "").trim(),
          }));
        }

        // Replace existing links or add new ones
        incomingLinks.forEach((newLink) => {
          const existingIndex = parsedLinks.findIndex(
            (existing) => existing._id.toString() === newLink._id.toString()
          );

          if (existingIndex !== -1) {
            // Update existing link
            parsedLinks[existingIndex] = newLink;
          } else {
            // Add new link (limit to 5 max)
            if (parsedLinks.length < 5) {
              parsedLinks.push(newLink);
            }
          }
        });

        // Assign updated list
        author.personalLinks = parsedLinks;
        // console.log("Updated Personal Links:", parsedLinks);
      } catch (err) {
        console.error("Failed to parse links:", err);
      }
    }

    // console.log("profile data",req.file)

    // Object.assign(post, { title, image, description, category });
    author.authorname = authorname;
    author.email = email;
    if (role) {
      author.role = role;
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
    data = await author.save();
    res.status(201).json({ message: "author updated successfully", data });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const removePersonalLinks = async (req, res) => {
  try {
    const { authorEmail, linkId } = req.params;

    // console.log("Remove link request:", { authorEmail, linkId });
    if (!authorEmail || !linkId) {
      return res
        .status(400)
        .json({ message: "Author email and link Id are required" });
    }

    const author = await Author.findOne({ email: authorEmail });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const initialLength = author.personalLinks.length;

    author.personalLinks = author.personalLinks.filter(
      (link) => link._id.toString() !== linkId.toString()
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

const updateAPassword = async (req, res) => {
  const { password } = req.body;
  const { email } = req.params; // Email is passed via the URL parameters

  try {
    // Find the author by email
    const author = await Author.findOne({ email });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Update the author's password
    author.password = password;

    // Save the updated author object
    const data = await author.save();

    // Return a success message with status 200
    res.status(200).json({ message: "Password updated successfully", data });
  } catch (err) {
    // Handle server errors
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAuthor = async (req, res) => {
  const { email } = req.params;
  const { password } = req.body;

  // console.log("email",email)
  // console.log("password",password)

  try {
    if (!email) {
      return res.status(400).json({ message: "Author email required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    // Find author first (do NOT delete before verifying password)
    const author = await Author.findOne({ email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Verify password
    const isMatch = await author.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Remove profile from S3 if present (don't fail the whole request if S3 delete errors)
    if (author.profile) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: author.profile,
          })
        );
      } catch (s3Err) {
        console.error("Failed to delete profile from S3:", s3Err);
        // continue with deletion even if S3 delete failed
      }
    }

    // Delete author from DB
    await Author.deleteOne({ email: author.email });

    console.log("author deleted", author.email);
    return res.status(200).json({ message: "Author deleted successfully", author });
  } catch (err) {
    console.error("Error deleting author:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};



const deleteAuthorByAdmin = async (req, res) => {
  try {
    const { authorEmail } = req.params; // Admin's email from params
    const { email, password } = req.body; // Target author email & admin password

    if (!authorEmail) {
      return res.status(400).json({ message: "Admin email required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Author email required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    //  Find admin first
    const admin = await Author.findOne({ email: authorEmail });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    //  Verify role
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "You are not allowed to perform this action" });
    }

    //  Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin password" });
    }

    //  Delete author
    const author = await Author.findOneAndDelete({ email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    //  Remove author profile from S3
    if (author.profile) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: author.profile,
        })
      );
    }

    console.log("Author deleted successfully:", author.email);
    return res.status(200).json({ message: "Author deleted successfully", author });
  } catch (err) {
    console.error("Error deleting author:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


const updateFollowers = async (req, res) => {
  try {
    const { email } = req.params;
    const { emailAuthor } = req.body;

    // console.log("Following request:", { email, emailAuthor });

    if (!email || !emailAuthor) {
      return res.status(400).json({ message: "Both emails are required" });
    }

    const author = await Author.findOne({ email });
    const followerAuthor = await Author.findOne({ email: emailAuthor });

    if (!author || !followerAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Unfollow
    if (author.followers.includes(emailAuthor)) {
      author.followers = author.followers.filter((f) => f !== emailAuthor);
      followerAuthor.following = followerAuthor.following.filter(
        (f) => f !== email
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

    return res.status(200).json({
      message: "Author followed successfully",
      followers: author.followers,
      following: followerAuthor.following,
    });
  } catch (err) {
    console.error("SERVER ERROR:", err); // Add this line
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Author.findOne({ email });
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

// reset password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await Author.findOne({ email });
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
    res.status(500).json({ message: "Error resetting password", error });
  }
};

const notificationAuthor = async (req, res) => {
  const { email } = req.body;
  try {
    const author = await Author.findOne({ email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.json({ notifications: author.notification });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const notificationAuthorDelete = async (req, res) => {
  const { email, notificationId } = req.query; // Expecting `notificationId` to identify which notification to delete.

  try {
    // Find the author by email
    const author = await Author.findOne({ email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Filter out the notification with the given notificationId
    const updatedNotifications = author.notification.filter(
      (notif) => notif._id.toString() !== notificationId
    );

    // If no notification matches the provided ID
    if (updatedNotifications.length === author.notification.length) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Update the author's notifications and save
    author.notification = updatedNotifications;
    await author.save();

    res.json({
      message: "Notification deleted successfully",
      notifications: author.notification,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const notificationAuthorDeleteAll = async (req, res) => {
  const { email } = req.query; // Expecting the author's email in the request body.

  try {
    // Find the author by email
    const author = await Author.findOne({ email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Set the notifications array to empty
    author.notification = [];
    await author.save();

    res.json({
      message: "All notifications deleted successfully",
      notifications: author.notification, // This will now be an empty array
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// const addAnnouncement = async (req, res) => {
//   console.log("announcement route hit");

//   const { user, title, message, links, deliveredTo, email, profile } = req.body;

//   console.log("announcement msg", message);
//   console.log("announcement email", email);

//   try {
//     // Find the author by email
//     const author = await Author.findOne({ email });
//     if (!author) {
//       return res.status(404).json({ message: 'Author not found' });
//     }

//     // Safe parsing of links
//     let parsedLinks = [];
//     try {
//       parsedLinks = links ? JSON.parse(links) : [];
//       if (!Array.isArray(parsedLinks)) {
//         parsedLinks = [];
//       }
//     } catch (e) {
//       parsedLinks = [];
//     }

//     // Create a new announcement object
//     const newAnnouncement = {
//       user,
//       title,
//       message,
//       links: parsedLinks,
//       deliveredTo,
//       profile,
//       authorEmail: email
//     };

//     let filter = {};
//     if (deliveredTo === 'coordinators') {
//       filter.role = { $in: ['coordinator', 'admin'] };
//     }
//     else if (deliveredTo === 'community') {
//       // Match authors with at least one shared community
//       filter.community = { $in: author.community };
//     }
//     // else {
//     //   return res.status(400).json({ message: 'Invalid deliveredTo value' });
//     // }

//     // Find all matching authors
//     const recipients = await Author.find(filter);

//     // Push announcement to each recipient
//     for (const recipient of recipients) {
//       recipient.announcement = recipient.announcement || [];

//       // Validate object before pushing
//       if (typeof newAnnouncement === 'object' && newAnnouncement !== null) {
//         recipient.announcement.push(newAnnouncement);
//         await recipient.save();
//       }
//     }
//     const url = 'https://blog-frontend-teal-ten.vercel.app/announcement';
//     // Extract URLs from parsedLinks (if they are objects with a "url" property)
//     const linkHtml = parsedLinks.length > 0
//       ? `<p>Links:<br>${parsedLinks
//           .map(link => {
//             if (typeof link === "string") {
//               return `<a href="${link}" target="_blank">${link}</a>`;
//             } else if (typeof link === "object" && link.url) {
//               return `<a href="${link.url}" target="_blank">${link.url}</a>`;
//             }
//             return "";
//           })
//           .join("<br>")}</p>`
//       : "";

//     // 📧 Send email to all recipients
//     if (recipients.length > 0) {
//       const emailSubject = `Announcement: ${title}`;
//       const emailHtml = `
//         <h3>New Announcement from ${user}</h3>
//         <p><strong>Title:</strong> ${title}</p>
//         <p>${message}</p>
//          ${linkHtml}
//         <p><a href="${url}">View Announcement</a></p>

//       `;

//       for (const recipient of recipients) {
//         if (recipient.email) {
//           await transporter.sendMail({
//             from: `"${user}" <${process.env.EMAIL_USER}>`,
//             to: recipient.email,
//             subject: emailSubject,
//             html: emailHtml
//           });
//         }
//       }
//     }

//     res.status(201).json({
//       message: 'Announcement added successfully',
//       announcement: newAnnouncement,
//     });
//   } catch (error) {
//     console.error('Error adding announcement:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const addAnnouncement = async (req, res) => {
  console.log("announcement route hit");

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
  const poster = req.file ? req.file.originalname : "";
  try {
    const author = await Author.findOne({ email });
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
    const uniqueFilename = req.file ? `${eventFolder}${uuidv4()}-${req.file.originalname}` : "";

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
        { role: "admin" }
      ];
    }

    // Get recipients
    const recipients = await Author.find(filter).select("email");

    // const recipientEmails = recipients.map(r => r.email).filter(Boolean);

    const recipientEmails = recipients.map((r) => r.email).filter(Boolean); // remove null/undefined
    // .filter((recipientEmail) => recipientEmail !== email); // remove sender email

    // Bulk push announcements to DB
    if (recipientEmails.length > 0) {
      const bulkOps = recipients.map((r) => ({
        updateOne: {
          filter: { email: r.email },
          update: { $push: { announcement: newAnnouncement } },
        },
      }));
      await Author.bulkWrite(bulkOps);
    }

    const announcementUrl =
      process.env.NOTIFICATION_URL || "http://localhost:5173";

    const url = `${announcementUrl}/announcement`;
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

    // Respond immediately
    res.status(201).json({
      message: "Announcement added successfully",
      announcement: newAnnouncement,
      recipients: recipientEmails,
    });

    // Send emails sequentially after response
    const sendEmailsSequentially = async () => {
      console.log(
        `📨 Sending announcement emails to ${recipientEmails.length} recipients...`
      );
      for (const recipient of recipientEmails) {
        try {
          await transporter.sendMail({
            from: `"${user}" <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject: `Announcement: ${title}`,
            html: `
              <h3>New Announcement from ${user}</h3>
              <p><strong>Title:</strong> ${title}</p>
              <p>${message}</p>
              ${linkHtml}
              <p><a href="${url}">View Announcement</a></p>
            `,
          });
          // console.log(` Email sent to: ${recipient}`);
          await new Promise((res) => setTimeout(res, 200)); // Prevent overload
        } catch (err) {
          console.error(
            `❌ Failed to send email to ${recipient}:`,
            err.message
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

// const getAllAnnouncements = async (req, res) => {
//   try {

//     const {email} = req.params;
//     if(!email){
//       return res.status(400).json({message:"email is required"});
//     }

//     const admin = await Author.findOne({email});

//     if(!admin)
//     {
//       return res.status(404).json({message:"admin not found"});
//     }

//     if(admin.role !== 'admin'){
//       // console.log("admin role", admin)
//       return res.status(403).json({message:"access denied"})
//     }


//     // optional query filters: ?deliveredTo=coordinators|community|all
//     const { deliveredTo } = req.query;

//     // fetch authors that have announcements
//     const authors = await Author.find({ "announcement.0": { $exists: true } }).select(
//       "authorname email profile announcement"
//     );

//     // flatten announcements and attach author info
//     const announcements = [];
//     authors.forEach((author) => {
//       (author.announcement || []).forEach((ann) => {
//         const annObj = ann.toObject ? ann.toObject() : ann;
//         announcements.push({
//           ...annObj,
//           authorName: author.authorname,
//           authorEmail: author.email,
//           authorProfile: author.profile,
//         });
//       });
//     });

//     // apply simple deliveredTo filter if provided
//     const filtered = deliveredTo
//       ? announcements.filter((a) => a.deliveredTo === deliveredTo)
//       : announcements;

//     return res.status(200).json({ count: filtered.length, announcement: filtered });
//   } catch (err) {
//     console.error("Error fetching announcements:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

const deleteAnnouncement = async (req, res) => {
  const { announcementId } = req.params;

  try {
    // Find the author who has the announcement and remove it
    const result = await Author.updateOne(
      { "announcement._id": announcementId },
      { $pull: { announcement: { _id: announcementId } } }
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

const updateRole = async (req, res) => {
  const { email, role } = req.body;
  console.log("Update role request received:", req.body);
  try {
    console.log("logged");

    const author = await Author.findOne({ email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    author.role = role;
    await author.save({ validateBeforeSave: false });
    res.status(200).json({ message: "Role updated successfully", author });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating role", error: err.message });
  }
};

const updateTechCommunity = async (req, res) => {
  const { email, techcommunity } = req.body;
  console.log("community called");

  try {
    const author = await Author.findOne({ email });

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

const updateTechCommunityCoordinator = async (req, res) => {
  const { email, techCommunities } = req.body; // techCommunities should be an array of strings
  console.log("communities called", email);

  try {
    const author = await Author.findOne({ email });

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


const deleteAllAnnouncementByAdmin = async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "author email required" });
    }

    const admin = await Author.findOne({ email });
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
          reason: r.status === "rejected" ? r.reason?.message || r.reason : undefined,
        }))
        .filter((r) => r.status === "rejected");
    }

    // Clear all announcements from DB (remove announcements array for authors who have it)
    await Author.updateMany(
      { "announcement.0": { $exists: true } },
      { $set: { announcement: [] } }
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
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = {
  addAuthor,
  getAllAuthor,
  getAuthorsByRole,
  getSingleAuthor,
  updateAuthor,
  updateAPassword,
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
  getAuthorsByDomain
  // getAllAnnouncements
  
};
