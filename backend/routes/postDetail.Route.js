const express = require("express");
const router = express.Router();
const {Author, Post} = require("../models/blogAuthorSchema");

const multer = require('multer');
const path = require('path');
const authenticateToken = require('../middleware/authMiddleware')
const {
  // getAllPosts,
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
  // getPostsByAuthorsCategory,
  // getUniqueCategoriesByAuthor
  // updateMessage,
  // deleteComment
} = require("../controllers/postDetail.Controller");

const {limiter, readLimiter} = require("../middleware/rateLimitter")

// router.get("/", readLimiter, authenticateToken, getAllPosts);  // used in TechCommunity.jsx
router.get("/:email", readLimiter, authenticateToken,  getSingleAuthorPosts);
router.get("/recommended/:email", readLimiter, authenticateToken,  getRecommendedPosts)

router.get("/:category", readLimiter, authenticateToken, getCategoryPosts);

// handle authors blog post data
const uploadData = multer().fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 10 }, // Allow up to 10 document files
]);


router.get("/bookmarkIds/:email", readLimiter, authenticateToken,getAllBookmarkIds)

router.get("/:email/:postId", readLimiter, authenticateToken, getSinglePost);

router.post("/:email", limiter, authenticateToken,uploadData, addPosts);


router.put("/:email/:postId", limiter, authenticateToken,uploadData,updatePost);
router.get("/getBookmarkPosts/bookmark/:email", readLimiter, authenticateToken,getBookmarkedPosts)
router.post("/bookmarkPosts/:email", limiter, authenticateToken,addPostBookmark)

router.put("/views/:email/:id", limiter, authenticateToken, postView)
router.put("/likes/:email/:id", limiter, authenticateToken, postLikes)

router.delete("/:email/:postId", limiter, authenticateToken,  deletePost);
router.delete("/links/:email/:postId", limiter, authenticateToken,  removePostsLinks);

// router.put("/comment/:email/:postId/:id",limiter, authenticateToken, updateMessage )
// router.delete("/comment/:email/:postId/:id",limiter, authenticateToken, deleteComment )

// router.get("/:email/:category",authenticateToken, getPostsByAuthorsCategory);

// router.get("/categories/:email",authenticateToken, getUniqueCategoriesByAuthor);



module.exports = router;
