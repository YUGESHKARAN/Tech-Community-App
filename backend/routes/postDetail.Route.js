const express = require("express");
const router = express.Router();
const Author = require("../models/blogAuthorSchema");

const multer = require('multer');
const path = require('path');
const authenticateToken = require('../middleware/authMiddleware')
const {
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
  removePostsLinks
} = require("../controllers/postDetail.Controller");

// handle authors blog post data

router.get("/", getAllPosts);
router.get("/:email", getSingleAuthorPosts);
router.get("/recommended/:email",getRecommendedPosts)

router.get("/:category", getCategoryPosts);


// Multer setup for file upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Set the upload folder
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const ext = path.extname(file.originalname); // Get the file extension
//     cb(null, uniqueSuffix+ file.originalname + ext); // Include original extension
//   }
// });
// Configure memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadData = multer().fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 10 }, // Allow up to 10 document files
]);

router.post("/:email",authenticateToken,uploadData, addPosts);

// router.put("/:email/:postId",upload.single('image'), updatePost);

router.put("/:email/:postId",authenticateToken,uploadData,updatePost);
router.get("/getBookmarkPosts/:email",authenticateToken,getBookmarkedPosts)
router.post("/bookmarkPosts/:email",authenticateToken,addPostBookmark)

router.get("/:email/:postId",authenticateToken, getSinglePost);
router.put("/views/:email/:id",authenticateToken, postView)
router.put("/likes/:email/:id",authenticateToken, postLikes)

router.delete("/:email/:postId",authenticateToken,  deletePost);
router.delete("/links/:email/:postId",authenticateToken,  removePostsLinks);




module.exports = router;
