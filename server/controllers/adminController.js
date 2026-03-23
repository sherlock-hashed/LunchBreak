/**
 * Admin Controller — Stats, user management, admin auth
 */

const User = require("../models/User");
const Match = require("../models/Match");
const jwt = require("jsonwebtoken");

// Hardcoded admin credentials
const ADMIN_EMAIL = "lunchbreak@sm.com";
const ADMIN_PASSWORD = "penthousetapes@calmEE";

/**
 * POST /api/admin/login
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials." });
    }

    // Create a short-lived admin token
    const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, { expiresIn: "4h" });

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * Middleware: verify admin token
 */
const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No admin token." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not an admin." });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired admin token." });
  }
};

/**
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMatches = await Match.countDocuments();

    // Matches by mode
    const matchesByMode = await Match.aggregate([
      { $group: { _id: "$mode", count: { $sum: 1 } } },
    ]);

    // Matches by subject
    const matchesBySubject = await Match.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } },
    ]);

    // Average ELO
    const avgRating = await User.aggregate([
      { $group: { _id: null, avgBlitz: { $avg: "$rating.blitz" }, avgRapid: { $avg: "$rating.rapid" } } },
    ]);

    // Top 5 players by blitz rating
    const topPlayers = await User.find()
      .sort({ "rating.blitz": -1 })
      .limit(5)
      .select("username rating.blitz stats.wins stats.matchesPlayed");

    // Recent matches (last 10)
    const recentMatches = await Match.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("mode subject player1 player2 winner duration createdAt");

    // Matches today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchesToday = await Match.countDocuments({ createdAt: { $gte: today } });

    // New users today
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalMatches,
        matchesToday,
        newUsersToday,
        matchesByMode: matchesByMode.map(m => ({ mode: m._id || "unknown", count: m.count })),
        matchesBySubject: matchesBySubject.map(s => ({ subject: s._id || "unknown", count: s.count })),
        avgRating: avgRating[0] || { avgBlitz: 1200, avgRapid: 1200 },
        topPlayers,
        recentMatches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
};

/**
 * GET /api/admin/users?q=&page=&limit=
 */
const getUsers = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = q
      ? { $or: [{ username: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("username email rating stats.matchesPlayed stats.wins createdAt"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

module.exports = { adminLogin, verifyAdmin, getStats, getUsers };
