const express = require("express");
const router = express.Router();
const { adminLogin, verifyAdmin, getStats, getUsers } = require("../controllers/adminController");

// POST /api/admin/login — admin login (hardcoded credentials)
router.post("/login", adminLogin);

// GET /api/admin/stats — dashboard stats (admin only)
router.get("/stats", verifyAdmin, getStats);

// GET /api/admin/users — user list with search (admin only)
router.get("/users", verifyAdmin, getUsers);

module.exports = router;
