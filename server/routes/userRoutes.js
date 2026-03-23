const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  getLeaderboard,
  getSubjectStats,
  getSkillRadar,
  searchUsers,
  getPublicProfile,
} = require("../controllers/userController");

// GET /api/users/leaderboard — must come before /:id
router.get("/leaderboard", getLeaderboard);

// GET /api/users/search — search users by username/college
router.get("/search", protect, searchUsers);

// GET /api/users/public/:id — public profile (view-only)
router.get("/public/:id", protect, getPublicProfile);

// GET /api/users/:id
router.get("/:id", protect, getProfile);

// PUT /api/users/:id
router.put("/:id", protect, updateProfile);

// GET /api/users/:id/stats
router.get("/:id/stats", protect, getSubjectStats);

// GET /api/users/:id/radar
router.get("/:id/radar", protect, getSkillRadar);

module.exports = router;
