const Author = require("../models/blogAuthorSchema");

const path = require('path');

const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const mongoose = require("mongoose");

const sharp = require('sharp');
dotenv = require("dotenv");
dotenv.config();

const redisClient = require("../middleware/redis");
// import nodemailer from "nodemailer";

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER, // Or your preferred email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

const notificationUrl = process.env.NOTIFICATION_URL || 'http://localhost:5173';

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



const getAllPosts = async (req, res) => {
  try {
    const authors = await Author.find({}); // fetch all authors
    const allPosts =  authors.flatMap((author) => author.posts.map((post)=>({
      ...post.toObject(), //Conver post to a plain object
      authorname: author.authorname,
      authoremail: author.email,
      profie:author.profile||'',
      role:author.role, 
      community:author.community,
      
    }))); // extract posts alone

       // Calculate category counts
     const categoryCounts = authors.flatMap((author) =>
      author.posts.map((post) => post.category)
    ).reduce((counts, category) => {
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});
    

    const count = Object.keys(categoryCounts).length

    res.status(200).json({ message: "All posts", posts: allPosts,count});
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};


// ...existing code...
// const getRecommendedPosts = async (req, res) => {
//   try {
//     const { email } = req.params;

//     let followedEmails = [];
//     let authorCommunities = [];
//     if (email) {
//       const currentAuthor = await Author.findOne({ email }).select('following community');
//       if (currentAuthor) {
//         followedEmails = Array.isArray(currentAuthor.following) ? currentAuthor.following : [];
//         authorCommunities = Array.isArray(currentAuthor.community) ? currentAuthor.community : [];
//       }
//     }

//     // Fetch only needed authors
//     const allAuthors = await Author.find({}).select('email authorname profile role community posts');

//     // Split authors into priority (followed OR same community) and others
//     const followedSet = new Set(followedEmails);
//     const priorityAuthors = [];
//     const otherAuthors = [];

//     for (const a of allAuthors) {
//       const inFollowing = followedSet.has(a.email);
//       const inCommunity = Array.isArray(a.community) && a.community.some(c => authorCommunities.includes(c));
//       if (inFollowing || inCommunity) priorityAuthors.push(a);
//       else otherAuthors.push(a);
//     }

//     // Helper to flatten posts in reverse (newest first). Prefer createdAt if available.
//     const flattenReverse = (authorsArray) => authorsArray.flatMap(author => {
//       const posts = Array.isArray(author.posts) ? author.posts.slice() : [];
//       const sorted = posts[0] && posts[0].createdAt
//         ? posts.slice().sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
//         : posts.slice().reverse();

//       return sorted.map(post => ({
//         ...post.toObject(),
//         authorname: author.authorname,
//         authoremail: author.email,
//         profile: author.profile || '',
//         role: author.role,
//         community: author.community,
//       }));
//     });

//     // Priority posts first (followed OR community), then others — both in reverse/newest-first order
//     const postsFromPriority = flattenReverse(priorityAuthors);
//     const postsFromOthers = flattenReverse(otherAuthors);
//     // const allPosts = [...postsFromPriority, ...postsFromOthers];
//      // Shuffle arrays individually (Fisher–Yates) without mutating originals
//     const shuffleArray = (arr) => {
//       const a = arr.slice();
//       for (let i = a.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [a[i], a[j]] = [a[j], a[i]];
//       }
//       return a;
//     };

//     const shuffledPriority = shuffleArray(postsFromPriority);
//     const shuffledOthers = shuffleArray(postsFromOthers);
  
//     const allPosts = [...shuffledPriority, ...shuffledOthers];

//     // category counts (unchanged)
//     const categoryCounts = allAuthors.flatMap((author) =>
//       author.posts.map((post) => post.category)
//     ).reduce((counts, category) => {
//       counts[category] = (counts[category] || 0) + 1;
//       return counts;
//     }, {});
//     const count = Object.keys(categoryCounts).length;

//     res.status(200).json({ message: "All posts", posts: allPosts, count });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "server error", error: err.message });
//   }
// };

const getRecommendedPosts = async (req, res) => {
  try {
    const { email } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    // console.log("page",page, "limit",limit)
    const cacheKey = `feed:${email}:page:${page}:limit:${limit}`;

    // 1. CHECK CACHE FIRST
    // const cachedData = await redisClient.get(cacheKey);

    // if (cachedData) {
    //   console.log("Serving from Redis cache");
    //   return res.status(200).json(JSON.parse(cachedData));
    // }

    // 2. IF NOT IN CACHE → FETCH FROM DB
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let followedEmails = [];
    let authorCommunities = [];

    const currentAuthor = await Author.findOne({ email })
      .select("following community");

    if (currentAuthor) {
      followedEmails = currentAuthor.following || [];
      authorCommunities = currentAuthor.community || [];
    }

    const allAuthors = await Author.find({})
      .select("email authorname profile role community posts");

    const followedSet = new Set(followedEmails);

    const priorityAuthors = [];
    const otherAuthors = [];

    for (const author of allAuthors) {
      const inFollowing = followedSet.has(author.email);
      const inCommunity =
        Array.isArray(author.community) &&
        author.community.some((c) => authorCommunities.includes(c));

      if (inFollowing || inCommunity) priorityAuthors.push(author);
      else otherAuthors.push(author);
    }

    const flattenPosts = (authors) =>
      authors.flatMap((author) => {
        const posts = Array.isArray(author.posts) ? author.posts : [];

        const sorted = posts[0]?.createdAt
          ? posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : posts.reverse();

        return sorted.map((post) => ({
          ...post.toObject(),
          authorname: author.authorname,
          authoremail: author.email,
          profile: author.profile || "",
          role: author.role,
          community: author.community,
        }));
      });

    const shuffle = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const priorityPosts = shuffle(flattenPosts(priorityAuthors));
    const otherPosts = shuffle(flattenPosts(otherAuthors));

    const allPosts = [...priorityPosts, ...otherPosts];

    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    const responseData = {
      message: "Recommended posts",
      page,
      limit,
      totalPosts: allPosts.length,
      totalPages: Math.ceil(allPosts.length / limit),
      posts: paginatedPosts,
    };

    // 3. STORE IN REDIS (cache for 60 seconds)
    // await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));

    console.log("Serving from DB and cached to Redis");
    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ...existing code...



const getSingleAuthorPosts = async(req,res)=>{
  try{

    const {email} = req.params;

    const author = await Author.findOne({email});
    if(!author){
      return res.status(404).json({message:`author ${email} not found`});
    }

    const authorPosts = author.posts.flatMap((post)=>({
      ...post.toObject(),
      authorName: author.authorname,
      authoremail: author.email,
      profile:author.profile || '',
      role:author.role,
      community:author.community,
    })).reverse()

    res.status(200).json({message:"author posts",data:authorPosts,authorName:author.authorname, profile:author.profile || ''} )

  }
  catch(err){
    res.status(500).json({message:err.message})
  }
}



const getCategoryPosts = async (req, res) => {
  try {
    // const authors = await Author.find({}); // fetch all authors
    const {category} = req.params;
    const authors = await Author.find({
      'posts.category': category
    });
     // Flatten posts from authors and filter by category
     const categoryPosts = authors.flatMap((author) =>
      author.posts
        .filter((post) => post.category === category)
        .map((post) => ({
          ...post.toObject(), // Convert post to a plain object
          authorname: author.authorname,
          authoremail: author.email,
          profile:author.profile || '',
          
        }))
    );
    res
      .status(200)
      .json({ message: "Category posts", data: categoryPosts });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const axios = require("axios");

async function notifyAIIngestion(post) {
 try{
   console.log("post to ingest", post)
  res = await axios.post(`${process.env.TECH_ASSISTANT_URL}/ingest`, post);
  console.log("AI ingestion notified:", res.data);
 }
 catch(err){
  console.error("Error notifying AI ingestion:", err.message);
 }
}

async function deleteFromAIIngestion(post_id) {
  try{

     res = await axios.delete(`${process.env.TECH_ASSISTANT_URL}/delete/${post_id}`);
  }
  catch(err){
    console.error("Error notifying AI deletion:", err.message); 
  }
}


const addPosts = async (req, res) => {
  const { title, description, category, links } = req.body;

  try {
    const author = await Author.findOne({ email: req.params.email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // --- Upload image ---
    let imageUrl = '';
    if (req.files && req.files.image) {
      const buffer = await sharp(req.files.image[0].buffer)
        .resize({ width: 672, height: 462, fit: 'contain' })
        .toBuffer();

       const uniqueFilename = `${uuidv4()}-${req.files.image[0].originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: req.files.image[0].mimetype
      }));

      imageUrl = uniqueFilename;
    }

    // --- Upload documents ---
    const documentUrls = [];
    if (req.files && req.files.document) {
      for (const doc of req.files.document) {
        const uniqueDocName = `${uuidv4()}-${doc.originalname}`;
        await s3.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueDocName,
          Body: doc.buffer,
          ContentType: doc.mimetype
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

    // --- Create post ---
    const postId = new mongoose.Types.ObjectId();
    let postData = {
      _id: postId,
      title,
      image: imageUrl,
      description,
      category,
      documents: documentUrls,
      links: parsedLinks
    }
    author.posts.push(postData);

    const url = `${notificationUrl}/viewpage/${author.email}/${postId}`;

    // --- Find community authors (excluding self) ---
    const communityAuthors = await Author.find({
      // community: { $in: author.community },
      community: { $in: [category] },
      email: { $ne: author.email }
    }).select('email');

    const followerSet = new Set(author.followers);
    const communitySet = new Set();

    for (const a of communityAuthors) {
      if (!followerSet.has(a.email)) {
        communitySet.add(a.email);
      }
    }

    // --- Combined recipients (followers + non-following community members) ---
    const combinedRecipients = [...followerSet, ...communitySet];
    const followersSet = [...followerSet]

    // --- Bulk notifications ---
    if (combinedRecipients.length > 0) {
      const bulkNotifications = combinedRecipients.map(email => {
        const isFollower = followerSet.has(email);
        const message = isFollower
          ? `New post from ${author.authorname}: ${title}`
          : `${author.authorname} from your community posted: ${title}`;

        return {
          updateOne: {
            filter: { email },
            update: {
              $push: {
                notification: {
                  postId,
                  user: author.authorname,
                  authorEmail: author.email,
                  message,
                  url,
                  profile: author.profile || ""
                }
              }
            }
          }
        };
      });
      await Author.bulkWrite(bulkNotifications);
    }

    // --- Save post ---
    const data = await author.save();
     
    

    // ✅ Respond immediately (non-blocking email sending)
    res.status(201).json({ message: "Post added successfully", data });
   
    postData['authorName'] = author.authorname;
    postData['profile'] = author.profile || '';
    postData['authorEmail'] = author.email;

    await notifyAIIngestion(postData).catch(err => {
      console.error("AI ingestion error:", err.message);
    }); 

    // --- Send emails in background ---
    if (followersSet.length > 0) {
      const sendEmailsSequentially = async (recipients, subject, html) => {
        for (const recipient of recipients) {
          try {
            await transporter.sendMail({
              from: `"${author.authorname}" <${process.env.EMAIL_USER}>`,
              to: recipient,
              subject,
              html
            });
            console.log(`📧 Email sent to ${recipient}`);
            await new Promise(res => setTimeout(res, 200)); // short delay
          } catch (err) {
            console.error(`❌ Failed to send email to ${recipient}:`, err.message);
          }
          
        }
         console.log("📬 All emails processed.");
      };

      sendEmailsSequentially(
        followersSet,
        `New post from ${author.authorname}`,
        `
          <h3>${author.authorname} has posted a new blog!</h3>
          <p><strong>Title:</strong> ${title}</p>
          <p>${description}</p>
          <p><a href="${url}">Click here to view the post</a></p>
        `
      );
    }

  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const updatePost = async (req, res) => {
  const { email, postId } = req.params;
  const { title, description, category,links } = req.body;
  console.log("new changes", req.body)

  
  try {
    const author = await Author.findOne({ email });

    if (!author) {
      return res.status(404).json({ message: "author not found" });
    }

    const post = author.posts.id(postId);

    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    // Handle image upload
    let imageUrl = post.image ||[];
    if (req.files && req.files.image) {
      const buffer = await sharp(req.files.image[0].buffer)
        .resize({ width: 672, height: 462, fit: 'contain' })
        .toBuffer();
      
        const uniqueFilename = `${uuidv4()}-${req.files.image[0].originalname}`;

      const params = {
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: req.files.image[0].mimetype
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
      imageUrl = uniqueFilename;
    }

    // console.log("image",imageUrl)

    // Handle document uploads
    let documentUrls =post.documents || [];
    if (req.files && req.files.document) {
      documentUrls = [];
      for (const doc of req.files.document) {
         const uniqueDocName = `${uuidv4()}-${doc.originalname}`;
        const params = {
          Bucket: bucketName,
          Key: uniqueDocName,
          Body: doc.buffer,
          ContentType: doc.mimetype
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);
        documentUrls.push(uniqueDocName);
      }
    }

let parsedLinks = post.links || [];
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

      
        // console.log("Updated Personal Links:", parsedLinks);
      } catch (err) {
        console.error("Failed to parse links:", err);
      }
    }
// console.log("links",parsedLinks)
    // Update post details
  Object.assign(post, { 
      title, 
      image: imageUrl, 
      description, 
      category,
      documents: documentUrls,
      links:parsedLinks
    });

    const updatedPost = await author.save();

    res.status(200).json({ 
      message: "Post updated successfully", 
      data: updatedPost 
    });

    const updated = updatedPost.posts.id(postId);

    let updatedToAI = {...updated.toObject(), authorName: author.authorname, profile: author.profile || '', authorEmail: author.email};
 


    // console.log("updated post for AI", updatedToAI)

     await notifyAIIngestion(updatedToAI).catch(err => {
      console.error("AI update ingestion error:", err.message);
    }); 
  } catch (err) {
    console.error(err.errors); 
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

const removePostsLinks = async (req, res) => {
  try {
    const { email, postId } = req.params;
    const { linkId } = req.body;


    // console.log("Remove link request:", { authorEmail, linkId });
    if (!email || !postId || !linkId) {
      return res
        .status(400)
        .json({ message: "Author email, postId and link Id are required" });
    }

    const author = await Author.findOne({ email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }


    const post = author.posts.id(postId);

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

    await author.save({ validateBeforeSave: false });
    res.status(200).json({
      message: "Link removed successfully",
      personalLinks: post.links,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const deletePost = async (req, res) => {   
  try {
    const { email, postId } = req.params;

    const author = await Author.findOne({ email });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const postIndex = author.posts.findIndex(
      (post) => post._id.toString() === postId
    );

    const postToDelete = author.posts[postIndex];

    // Delete image from S3
    if (postToDelete.image) {
      await s3.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: postToDelete.image
      }));
    }

    // Delete documents from S3 (including PDFs)
    if (postToDelete.documents && postToDelete.documents.length > 0) {
      const documentDeletePromises = postToDelete.documents.map(doc => 
        s3.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: doc
        }))
      );
      await Promise.all(documentDeletePromises);
    }

    // Remove the post from the posts array
    author.posts.splice(postIndex, 1);

    // Save the updated author document
    const updatedAuthor = await author.save();

    res.status(200).json({
      message: "Post deleted successfully",
      data: updatedAuthor,
    });

    //  console.log("deleted post from pinecone", postId)

     await deleteFromAIIngestion(postId).catch(err => {
      console.error("AI update ingestion error:", err.message);
    }); 


  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const getSinglePost = async(req,res) =>{
  try {
   const { email, postId } = req.params;

     // Find the author by email
     const author = await Author.findOne({ email });
     if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

     // Find the post by ID within the posts array
     const post = author.posts.id(postId);

     if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

   // Convert post to a plain object and include author details
   const postWithAuthorDetails = {
    ...post.toObject(),
    authorname: author.authorname,
    authoremail: author.email,
    profile: author.profile || '', // Default to an empty string if profile is missing
  };

    // Return the posts along with author details
    res.status(200).json({
      message: "Single post",
      data: postWithAuthorDetails,
    });
  }
  catch (err) {
    // Handle errors and send an appropriate response
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

const postView = async (req, res) => {
  try {
    const { email, id } = req.params; // Retrieve email and post ID from URL params
    const { emailAuthor } = req.body; // Retrieve emailAuthor from the body

    // Find the author by email
    const author = await Author.findOne({ email });

    // If author doesn't exist, send a 404 error
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Find the specific post by ID in the author's posts array
    const post = author.posts.find(post => post._id.toString() === id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the emailAuthor is already in the views array of the post
    if (post.views.includes(emailAuthor)) {
      return 
    }

    // Add the emailAuthor to the views array
    post.views.push(emailAuthor);

    // Save the updated author document with the post's updated views array
    await author.save({ validateBeforeSave: false });

    // Respond with success and the updated views array
    return res.status(200).json({
      message: 'View added successfully',
      views: post.views,
    });
  } catch (err) {
    // If there is a server error, return a 500 error
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const postLikes = async (req, res) => {
  try {
    const { email, id } = req.params; // Retrieve email and post ID from URL params
    const { emailAuthor } = req.body; // Retrieve emailAuthor from the body

    // Find the author by email
    const author = await Author.findOne({ email });

    // If author doesn't exist, send a 404 error
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Find the specific post by ID in the author's posts array
    const post = author.posts.find(post => post._id.toString() === id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the emailAuthor is already in the views array of the post
    if (post.likes.includes(emailAuthor)) {
      post.likes = post.likes.filter(like => like !== emailAuthor);
      // await author.save({ validateBeforeSave: false });
      // await followerAuthor.save({ validateBeforeSave: false });
      await author.save({ validateBeforeSave: false });
      return res.status(200).json({
        message: 'like removed successfully',
        likes: post.likes,
      });
    }

    // Add the emailAuthor to the views array
    post.likes.push(emailAuthor);

    // Save the updated author document with the post's updated views array
    await author.save({ validateBeforeSave: false });

    // Respond with success and the updated views array
    return res.status(200).json({
      message: 'like added successfully',
      views: post.views,
    });
  } catch (err) {
    // If there is a server error, return a 500 error
    console.log(err)
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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

  
    const author = await Author.findOne({email});
  
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


// const getBookmarkedPosts = async (req, res) => {
//   try {
//     const { email } = req.params;
//     if (!email) return res.status(400).json({ message: "email required" });

//     // fetch only bookmark ids (ensure field is returned)
//     const author = await Author.findOne({ email }).select("postBookmark");
//     if (!author) return res.status(404).json({ message: "author not found" });

//     // normalize bookmark ids to strings
//     const postIds = (author.postBookmark || [])
//       .map((id) => (id ? id.toString() : null))
//       .filter(Boolean);

//     if (postIds.length === 0) {
//       return res.status(200).json({ message: "No bookmarks", posts: [] });
//     }

//     // Fetch all authors that have posts (avoid relying on Mongo $in casting issues)
//     const authorsWithPosts = await Author.find({ "posts.0": { $exists: true } })
//       .select("authorname email profile role community posts");

//     // Build map postId -> postWithAuthorDetails by scanning posts in JS
//     const postMap = new Map();
//     for (const a of authorsWithPosts) {
//       for (const p of a.posts || []) {
//         const pid = p._id && p._id.toString();
//         if (pid && postIds.includes(pid) && !postMap.has(pid)) {
//           postMap.set(pid, {
//             ...p.toObject(),
//             authorname: a.authorname,
//             authoremail: a.email,
//             profile: a.profile || "",
//             role: a.role,
//             community: a.community,
//           });
//         }
//       }
//     }

//     // preserve bookmark order
//     const bookmarkedPosts = postIds.map((id) => postMap.get(id)).filter(Boolean);
//     const bookmarkedPostIds = bookmarkedPosts.map(p => (p && p._id) ? p._id.toString() : null).filter(Boolean);
    

//     return res.status(200).json({
//       message: "Bookmarked posts",
//       count: bookmarkedPosts.length,
//       posts: bookmarkedPosts,
//       postIds:bookmarkedPostIds
//     });
//   } catch (err) {
//     console.error("getBookmarkedPosts error:", err);
//     return res.status(500).json({ message: "server error", error: err.message });
//   }
// };
const getBookmarkedPosts = async (req, res) => {
  try {
    const { email } = req.params;

    // pagination inputs
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    // console.log("bookmark page:", page, "limit:", limit);

    if (!email) return res.status(400).json({ message: "email required" });

    const author = await Author.findOne({ email }).select("postBookmark");
    if (!author) return res.status(404).json({ message: "author not found" });

    const postIds = (author.postBookmark || [])
      .map((id) => (id ? id.toString() : null))
      .filter(Boolean);

    if (postIds.length === 0) {
      return res.status(200).json({
        message: "No bookmarks",
        posts: [],
        postIds: [],
        count: 0,
      });
    }

    const authorsWithPosts = await Author.find({ "posts.0": { $exists: true } })
      .select("authorname email profile role community posts");

    const postMap = new Map();

    for (const a of authorsWithPosts) {
      for (const p of a.posts || []) {
        const pid = p._id && p._id.toString();
        if (pid && postIds.includes(pid) && !postMap.has(pid)) {
          postMap.set(pid, {
            ...p.toObject(),
            authorname: a.authorname,
            authoremail: a.email,
            profile: a.profile || "",
            role: a.role,
            community: a.community,
          });
        }
      }
    }

    // preserve order FIRST
    const allBookmarkedPosts = postIds
      .map((id) => postMap.get(id))
      .filter(Boolean);

    // THEN apply pagination
    const paginatedPosts = allBookmarkedPosts.slice(start, end);

    const paginatedPostIds = paginatedPosts
      .map((p) => p?._id?.toString())
      .filter(Boolean);

    return res.status(200).json({
      message: "Bookmarked posts",
      count: allBookmarkedPosts.length, // unchanged meaning
      posts: paginatedPosts,
      postIds: paginatedPostIds,
    });
  } catch (err) {
    console.error("getBookmarkedPosts error:", err);
    return res.status(500).json({ message: "server error", error: err.message });
  }
};

// GET /blog/posts/bookmarkIds/:email
const getAllBookmarkIds = async (req, res) => {
  try {
    const { email } = req.params;

    const author = await Author.findOne({ email }).select("postBookmark");

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const postIds = (author.postBookmark || []).map(id => id.toString());

    res.status(200).json({ postIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





module.exports = {
  getAllPosts,
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
  getAllBookmarkIds
 
};
