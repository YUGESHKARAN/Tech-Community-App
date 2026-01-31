const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllAuthor,
  addAuthor,
  getSingleAuthor,
  getAuthorsByRole,
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
  
} = require("../controllers/authorDetail.Controller");


const authenticateToken = require('../middleware/authMiddleware')
const storage = multer.memoryStorage();

const upload = multer({ storage });

// Public routes
router.post("/", addAuthor); // signup - keep public
router.post('/send-otp', sendOtp);
router.post('/reset-password', resetPassword);

// Protect specific routes
router.get("/", authenticateToken,getAllAuthor);
router.get("/profiles",authenticateToken, getProfile);
router.get("/:email",authenticateToken, getSingleAuthor);
router.get("/getAuthorsByDomain/:category(*)", authenticateToken,getAuthorsByDomain);
router.get("/authoreByRole/:role", authenticateToken,getAuthorsByRole);

router.put("/:email", authenticateToken, upload.single('profile'), updateAuthor);
router.put("/password/:email", authenticateToken, updateAPassword);
router.put("/follow/:email", authenticateToken, updateFollowers);
router.delete("/:email", authenticateToken, deleteAuthor);
router.delete("/deleteByAdmin/:authorEmail", authenticateToken, deleteAuthorByAdmin);

router.get('/notification', authenticateToken, notificationAuthor);
router.delete('/notification/delete', authenticateToken, notificationAuthorDelete);
router.delete('/notification/deleteall', authenticateToken, notificationAuthorDeleteAll);

// Protected admin/control endpoints
// router.get("/getAllAnnouncemnet/:email",authenticateToken, getAllAnnouncements);
router.post("/announcement/add", authenticateToken, upload.single('poster'), addAnnouncement);
router.delete('/announcements/:announcementId', authenticateToken, deleteAnnouncement);
router.delete('/announcementsByAdmin/:email', authenticateToken, deleteAllAnnouncementByAdmin);
router.put("/control/updateRole", authenticateToken, upload.none(), updateRole);
router.put("/control/updateCommunity", authenticateToken, updateTechCommunity);
router.put("/control/coordinatorUpdate", authenticateToken, updateTechCommunityCoordinator);

router.delete("/personalLinks/:authorEmail/links/:linkId", authenticateToken, removePersonalLinks);

module.exports = router;
