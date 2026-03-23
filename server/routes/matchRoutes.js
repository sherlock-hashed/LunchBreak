const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getMatch,
  getUserMatches,
  getMatchAnalytics,
} = require("../controllers/matchController");

// GET /api/matches/user/:userId — match history
router.get("/user/:userId", protect, getUserMatches);

// GET /api/matches/:id/analytics — detailed analytics
router.get("/:id/analytics", protect, getMatchAnalytics);

// GET /api/matches/:id — single match
router.get("/:id", protect, getMatch);

module.exports = router;
