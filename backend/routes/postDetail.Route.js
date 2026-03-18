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
  removePostsLinks,
  getAllBookmarkIds,
  getPostsByAuthorsCategory,
  getUniqueCategoriesByAuthor
} = require("../controllers/postDetail.Controller");

// handle authors blog post data
const uploadData = multer().fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 10 }, // Allow up to 10 document files
]);

router.get("/", authenticateToken, getAllPosts);
router.get("/categories/:email",authenticateToken, getUniqueCategoriesByAuthor);
router.get("/:email",authenticateToken,  getSingleAuthorPosts);
router.get("/recommended/:email",authenticateToken, getRecommendedPosts)

router.get("/:category",authenticateToken,  getCategoryPosts);
router.get("/:email/:category",authenticateToken, getPostsByAuthorsCategory);


router.post("/:email",authenticateToken,uploadData, addPosts);

// router.put("/:email/:postId",upload.single('image'), updatePost);

router.put("/:email/:postId",authenticateToken,uploadData,updatePost);
router.get("/getBookmarkPosts/:email",authenticateToken,getBookmarkedPosts)
router.post("/bookmarkPosts/:email",authenticateToken,addPostBookmark)
router.get("/bookmarkIds/:email",authenticateToken,getAllBookmarkIds)

router.get("/:email/:postId",authenticateToken, getSinglePost);
router.put("/views/:email/:id",authenticateToken, postView)
router.put("/likes/:email/:id",authenticateToken, postLikes)

router.delete("/:email/:postId",authenticateToken,  deletePost);
router.delete("/links/:email/:postId",authenticateToken,  removePostsLinks);




module.exports = router;
