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
  getBookmarkedPlaylists
} = require("../controllers/tutorPlayList.Controller");
const authenticateToken = require('../middleware/authMiddleware')
const router = express.Router();

router.get("/all",authenticateToken, getAllTutorPlaylist);  
router.get("/:playlistId",authenticateToken, getPlaylistById);  
router.get("/coordinator/:email",authenticateToken, getPlaylistByEmail);
router.get("/bookmark/:email",authenticateToken,getBookmarkedPlaylists)

router.post("/add",authenticateToken,upload.single('thumbnail'), addTutorPlayList);
router.put("/update/:id", authenticateToken, upload.single('thumbnail'), updateTutorPlayList);
router.delete("/delete/:id",authenticateToken, deleteTutorPlayList);

module.exports = router;
