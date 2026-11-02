const express = require("express");
const router = express.Router();

// Controller filenames follow the project's *.Controller.js convention.
const eventCtrl      = require("../controllers/events/event.Controller");
const teamCtrl       = require("../controllers/events/team.Controller");
const submissionCtrl = require("../controllers/events/submission.Controller");
const judgingCtrl    = require("../controllers/events/judging.Controller");
const manageCtrl     = require("../controllers/events/eventManage.Controller");
const partnerCtrl    = require("../controllers/events/partner.Controller");
const mediaCtrl      = require("../controllers/events/media.Controller");

const { limiter, readLimiter } = require("../middleware/rateLimitter");
const authenticateToken        = require("../middleware/authMiddleware");
const requireAdmin             = require("../middleware/requireAdmin");

// Judge routes accept either a judge session (x-judge-session header, issued by
// /judge/redeem) or a normal logged-in user. When the header is present the
// JWT check is skipped, and the controller verifies the judge session in Redis.
const judgeOrAuth = (req, res, next) =>
  req.headers["x-judge-session"]
    ? next()
    : authenticateToken(req, res, next);

// Mounted at /bytes/manage, so full paths are /bytes/manage/events/...

// ── events ───────────────────────────────────────────────────────────────────
router.get("/events", readLimiter, authenticateToken, eventCtrl.listEvents);
router.post("/events", limiter, authenticateToken, requireAdmin, eventCtrl.createEvent);
router.get("/events/me/invites", readLimiter, authenticateToken, manageCtrl.listMyInvites);
router.get("/events/teams/:teamId", readLimiter, authenticateToken, manageCtrl.getTeam);
router.get("/events/:eventId", readLimiter, authenticateToken, eventCtrl.getEvent);
router.patch("/events/:eventId", limiter, authenticateToken, eventCtrl.updateEvent);
router.get("/events/:eventId/me", readLimiter, authenticateToken, manageCtrl.getMyEventStatus);
router.post("/events/:eventId/cancel", limiter, authenticateToken, eventCtrl.cancelEvent);

// ── organizers ───────────────────────────────────────────────────────────────
router.post("/events/:eventId/organizers", limiter, authenticateToken, eventCtrl.addOrganizer);
router.delete("/events/:eventId/organizers/:authorId", limiter, authenticateToken, eventCtrl.removeOrganizer);

// ── registration ─────────────────────────────────────────────────────────────
router.post("/events/:eventId/register", limiter, authenticateToken, teamCtrl.registerForEvent);
router.delete("/events/:eventId/register", limiter, authenticateToken, teamCtrl.withdrawRegistration);

// ── teams and invites ────────────────────────────────────────────────────────
router.post("/events/:eventId/teams", limiter, authenticateToken, teamCtrl.createTeam);
router.post("/events/teams/:teamId/invites", limiter, authenticateToken, teamCtrl.inviteToTeam);
router.post("/events/teams/:teamId/lock", limiter, authenticateToken, teamCtrl.lockTeam);
router.post("/events/teams/:teamId/leave", limiter, authenticateToken, teamCtrl.leaveTeam);
router.delete("/events/teams/:teamId", limiter, authenticateToken, teamCtrl.disbandTeam);
router.post("/events/invites/:inviteId/respond", limiter, authenticateToken, teamCtrl.respondToInvite);
router.delete("/events/invites/:inviteId", limiter, authenticateToken, teamCtrl.revokeInvite);

// ── submissions ──────────────────────────────────────────────────────────────
router.get("/events/:eventId/submission", readLimiter, authenticateToken, submissionCtrl.getMySubmission);
router.put("/events/:eventId/submission", limiter, authenticateToken, submissionCtrl.upsertSubmission);
router.get("/events/:eventId/submissions", readLimiter, authenticateToken, manageCtrl.listSubmissions);

// ── judging ──────────────────────────────────────────────────────────────────
router.get("/events/:eventId/judges", readLimiter, authenticateToken, manageCtrl.listJudges);
router.post("/events/:eventId/judges", limiter, authenticateToken, judgingCtrl.addJudge);
router.delete("/events/:eventId/judges/:judgeId", limiter, authenticateToken, manageCtrl.revokeJudge);
router.post("/events/judge/redeem", limiter, judgingCtrl.redeemJudgeToken); // public, token-gated
router.get("/events/:eventId/judging/queue", readLimiter, judgeOrAuth, judgingCtrl.judgingQueue);
router.post(
  "/events/:eventId/judging/submissions/:submissionId/score",
  limiter,
  judgeOrAuth,
  judgingCtrl.submitJudgement
);

// ── results ──────────────────────────────────────────────────────────────────
router.post("/events/:eventId/results/publish", limiter, authenticateToken, judgingCtrl.publishResults);
router.get("/events/:eventId/results", readLimiter, authenticateToken, judgingCtrl.getResults);

// ── partners ─────────────────────────────────────────────────────────────────
router.get("/partners", readLimiter, authenticateToken, partnerCtrl.listPartners);
router.post("/partners", limiter, authenticateToken, requireAdmin, partnerCtrl.createPartner);
router.patch("/partners/:partnerId", limiter, authenticateToken, requireAdmin, partnerCtrl.updatePartner);
router.delete("/partners/:partnerId", limiter, authenticateToken, requireAdmin, partnerCtrl.deactivatePartner);

router.post("/events/:eventId/partners", limiter, authenticateToken, partnerCtrl.attachPartner);
router.patch("/events/:eventId/partners/:partnerId", limiter, authenticateToken, partnerCtrl.updateEventPartner);
router.delete("/events/:eventId/partners/:partnerId", limiter, authenticateToken, partnerCtrl.detachPartner);

// ── media and uploads ────────────────────────────────────────────────────────
router.post("/events/:eventId/uploads", limiter, authenticateToken, mediaCtrl.createUpload);
router.get("/events/:eventId/media", readLimiter, authenticateToken, mediaCtrl.listMedia);
router.post("/events/:eventId/media/:mediaId/confirm", limiter, authenticateToken, mediaCtrl.confirmMedia);
router.patch("/events/:eventId/media/:mediaId", limiter, authenticateToken, mediaCtrl.updateMedia);
router.delete("/events/:eventId/media/:mediaId", limiter, authenticateToken, mediaCtrl.deleteMedia);

module.exports = router;