const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  // getAllAuthor,
  addAuthor,
  getSingleAuthor,
  // getAuthorsByRole,
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
  getAuthorsByDomain,
  sendRegistrationOTP,
  getAllAuthorsByDomain
  // getAllAnnouncements
  
} = require("../controllers/authorDetail.Controller");

const {limiter, readLimiter} = require("../middleware/rateLimitter")

const authenticateToken = require('../middleware/authMiddleware')
const storage = multer.memoryStorage();

const upload = multer({ storage });

// Public routes
router.post("/", limiter, addAuthor); // signup - keep public
router.post("/verify-otp", limiter, sendRegistrationOTP);
router.post('/send-otp', limiter, sendOtp);
router.post('/reset-password', limiter, resetPassword);

// Protect specific routes
// router.get("/", readLimiter, authenticateToken,getAllAuthor);   // used in TechCommunity.jsx
router.get("/profiles", readLimiter, authenticateToken, getProfile);
router.get("/:email", readLimiter, authenticateToken, getSingleAuthor);
router.get("/getAuthorsByDomain/:category(*)", readLimiter, authenticateToken,getAuthorsByDomain);
router.get("/getAllAuthorsByDomain/:category(*)", readLimiter, authenticateToken,getAllAuthorsByDomain);
// router.get("/authoreByRole/:role", readLimiter, authenticateToken,getAuthorsByRole);

router.put("/:email", limiter, authenticateToken, upload.single('profile'), updateAuthor);
router.put("/password/:email", limiter, authenticateToken, updateAPassword);
router.put("/follow/:email", limiter, authenticateToken, updateFollowers);
router.delete("/:email", limiter, authenticateToken, deleteAuthor);
router.delete("/deleteByAdmin/:authorEmail", limiter, authenticateToken, deleteAuthorByAdmin);

router.get('/notification', authenticateToken, notificationAuthor);
router.delete('/notification/delete', limiter, authenticateToken, notificationAuthorDelete);
router.delete('/notification/deleteall', limiter, authenticateToken, notificationAuthorDeleteAll);

// Protected admin/control endpoints
// router.get("/getAllAnnouncemnet/:email",limiter, authenticateToken, getAllAnnouncements);
router.post("/announcement/add", limiter, authenticateToken, upload.single('poster'), addAnnouncement);
router.delete('/announcements/:announcementId', limiter, authenticateToken, deleteAnnouncement);
router.delete('/announcementsByAdmin/:email', limiter, authenticateToken, deleteAllAnnouncementByAdmin);
router.put("/control/updateRole", limiter, authenticateToken, upload.none(), updateRole);
router.put("/control/updateCommunity", limiter, authenticateToken, updateTechCommunity);
router.put("/control/coordinatorUpdate", limiter, authenticateToken, updateTechCommunityCoordinator);

router.delete("/personalLinks/:authorEmail/links/:linkId", limiter, authenticateToken, removePersonalLinks);

module.exports = router;
