const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllAuthor,
  addAuthor,
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
  
} = require("../controllers/authorDetail.Controller");


const authenticateToken = require('../middleware/authMiddleware')
const storage = multer.memoryStorage();

const upload = multer({ storage });

//handle author data: name, email, password

// router.get("/", getAllAuthor);
// router.get("/profiles",getProfile);
// router.get("/:email", getSingleAuthor);

// // // Multer setup for file upload
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, 'uploads/'); // Set the upload folder
// //   },
// //   filename: (req, file, cb) => {
// //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //     const ext = path.extname(file.originalname); // Get the file extension
// //     cb(null, uniqueSuffix+ file.originalname + ext); // Include original extension
// //   }
// // });
// // Configure memory storage

// router.put("/:email",upload.single('profile'), updateAuthor);
// router.put("/password/:email", updateAPassword);

// router.post("/", addAuthor);

// router.put("/follow/:email",updateFollowers);

// router.delete("/:email", deleteAuthor);
// router.post('/send-otp', sendOtp);
// router.post('/reset-password', resetPassword);
// router.get('/notification',notificationAuthor);
// router.delete('/notification/delete',notificationAuthorDelete);
// router.delete('/notification/deleteall',notificationAuthorDeleteAll);


// router.post("/announcement/add",upload.none(),addAnnouncement);
// router.delete('/announcements/:announcementId', deleteAnnouncement);
// router.put("/control/updateRole",upload.none(),updateRole);
// router.put("/control/updateCommunity",updateTechCommunity);
// router.put("/control/coordinatorUpdate",updateTechCommunityCoordinator);

// router.delete("/personalLinks/:authorEmail/links/:linkId", removePersonalLinks);


// Public routes

router.post("/", addAuthor); // signup - keep public
router.post('/send-otp', sendOtp);
router.post('/reset-password', resetPassword);

// Protect specific routes
router.get("/", authenticateToken,getAllAuthor);
router.get("/profiles",authenticateToken, getProfile);
router.get("/:email",authenticateToken, getSingleAuthor);
router.get("/getAuthorsByDomain/:category(*)", authenticateToken,getAuthorsByDomain);

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
