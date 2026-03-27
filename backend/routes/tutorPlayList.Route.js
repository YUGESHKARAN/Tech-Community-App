const express = require("express");
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage});
const {
  addTutorPlayList,
  getAllTutorPlaylist,
  getPlaylistById,
  getPlaylistByEmail,
  updateTutorPlayList,
  deleteTutorPlayList,
  getBookmarkedPlaylists,
  getRecommendedTutorPlaylist,
    getPostsByAuthorsCategory,
  getUniqueCategoriesByAuthor
} = require("../controllers/tutorPlayList.Controller");
const authenticateToken = require('../middleware/authMiddleware')
const router = express.Router();

const {limiter, readLimiter}  = require("../middleware/rateLimitter")
// router.get("/all",authenticateToken, getAllTutorPlaylist);  
router.get("/recommended/:email",readLimiter, authenticateToken, getRecommendedTutorPlaylist);



router.get("/:playlistId", readLimiter, authenticateToken, getPlaylistById);  
router.get("/coordinator/:email", readLimiter, authenticateToken, getPlaylistByEmail);
router.get("/bookmark/:email", readLimiter, authenticateToken,getBookmarkedPlaylists)

router.post("/add", limiter, authenticateToken,upload.single('thumbnail'), addTutorPlayList);
router.put("/update/:id", authenticateToken, upload.single('thumbnail'), updateTutorPlayList);
router.delete("/delete/:id", limiter, authenticateToken, deleteTutorPlayList);

router.get("/:email/:category", limiter, authenticateToken, getPostsByAuthorsCategory);
router.get("/categories/playlist/:email", limiter, authenticateToken, getUniqueCategoriesByAuthor);

module.exports = router;
