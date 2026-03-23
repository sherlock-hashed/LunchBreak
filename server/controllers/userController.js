const User = require("../models/User");
const Match = require("../models/Match");

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user profile (self only)
// @route   PUT /api/users/:id
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this profile" });
    }

    const allowed = ["name", "username", "bio", "college", "country", "socials"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle nested socials
    if (req.body.socials) {
      const allowedSocials = ["github", "linkedin", "instagram"];
      updates.socials = {};
      allowedSocials.forEach((s) => {
        if (req.body.socials[s] !== undefined) {
          updates.socials[s] = req.body.socials[s];
        }
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("updateProfile error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Username already taken" });
    }
    // Return Mongoose validation errors with field-specific messages
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Search users by username or college
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const regex = new RegExp(q.trim(), "i");
    const users = await User.find({
      $or: [{ username: regex }, { college: regex }, { name: regex }],
    })
      .limit(15)
      .select("name username avatar college rating stats xp");

    res.json({ success: true, data: users });
  } catch (err) {
    console.error("searchUsers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get public profile (view-only, no sensitive data)
// @route   GET /api/users/public/:id
// @access  Private
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name username avatar bio college country socials rating stats xp peakRating");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("getPublicProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const mode = req.query.mode || "blitz";

    // Determine sort field based on mode
    const sortField = mode === "overall" ? "xp" : mode === "rapid" ? "rating.rapid" : mode === "arena" ? "rating.arena" : "rating.blitz";

    const users = await User.find({ "stats.matchesPlayed": { $gt: 0 } })
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .select("name username avatar rating stats xp");

    const total = await User.countDocuments({ "stats.matchesPlayed": { $gt: 0 } });

    // Add rank numbers
    const leaderboard = users.map((u, i) => ({
      rank: skip + i + 1,
      _id: u._id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      rating: u.rating,
      stats: u.stats,
      xp: u.xp,
      winRate: u.stats.matchesPlayed > 0
        ? Math.round((u.stats.wins / u.stats.matchesPlayed) * 100)
        : 0,
    }));

    res.json({
      success: true,
      data: leaderboard,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getLeaderboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get subject-wise stats for a user
// @route   GET /api/users/:id/stats
// @access  Private
exports.getSubjectStats = async (req, res) => {
  try {
    const userId = req.params.id;
    const userObjectId = require("mongoose").Types.ObjectId.createFromHexString(userId);

    // Aggregate match data by subject
    const subjectStats = await Match.aggregate([
      {
        $match: {
          $or: [
            { "player1.userId": userObjectId },
            { "player2.userId": userObjectId },
          ],
          status: "completed",
        },
      },
      {
        // Project a unified "playerData" field so we don't have to duplicate logic
        $project: {
          subject: 1,
          winner: 1,
          playerData: {
            $cond: [
              { $eq: ["$player1.userId", userObjectId] },
              "$player1",
              "$player2",
            ]
          },
          isPlayer1: { $eq: ["$player1.userId", userObjectId] }
        }
      },
      {
        $group: {
          _id: "$subject",
          totalMatches: { $sum: 1 },
          wins: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $and: [{ $eq: ["$winner", "player1"] }, { $eq: ["$isPlayer1", true] }] },
                    { $and: [{ $eq: ["$winner", "player2"] }, { $eq: ["$isPlayer1", false] }] }
                  ]
                },
                1, 0
              ]
            },
          },
          totalScore: { $sum: "$playerData.score" },
          totalCorrect: { $sum: "$playerData.correct" },
          totalWrong: { $sum: "$playerData.wrong" },
          avgAccuracy: { $avg: "$playerData.accuracy" },
          avgResponseTime: { $avg: "$playerData.avgResponseTime" },
        },
      },
      { $sort: { totalMatches: -1 } },
    ]);

    // Format the response
    const stats = subjectStats.map((s) => ({
      subject: s._id || "mixed",
      matches: s.totalMatches,
      wins: s.wins,
      losses: s.totalMatches - s.wins,
      winRate: s.totalMatches > 0 ? Math.round((s.wins / s.totalMatches) * 100) : 0,
      avgScore: s.totalMatches > 0 ? Math.round(s.totalScore / s.totalMatches) : 0,
      accuracy: Math.round(s.avgAccuracy || 0),
      avgTime: parseFloat((s.avgResponseTime || 0).toFixed(1)),
      totalCorrect: s.totalCorrect,
      totalWrong: s.totalWrong,
    }));

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error("getSubjectStats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get skill radar data for a user
// @route   GET /api/users/:id/radar
// @access  Private
exports.getSkillRadar = async (req, res) => {
  try {
    const userId = req.params.id;
    const userObjectId = require("mongoose").Types.ObjectId.createFromHexString(userId);

    // Get all responses from user's matches grouped by topic
    const topicStats = await Match.aggregate([
      {
        $match: {
          $or: [
            { "player1.userId": userObjectId },
            { "player2.userId": userObjectId },
          ],
          status: "completed",
        },
      },
      {
        $project: {
          responses: {
            $cond: [
              { $eq: ["$player1.userId", userObjectId] },
              "$player1.responses",
              "$player2.responses",
            ]
          }
        }
      },
      { $unwind: "$responses" },
      {
        $lookup: {
          from: "questions",
          localField: "responses.questionId",
          foreignField: "_id",
          as: "question",
        },
      },
      { $unwind: { path: "$question", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$question.subject",
          correct: { $sum: { $cond: ["$responses.correct", 1, 0] } },
          total: { $sum: 1 },
          avgTime: { $avg: "$responses.responseTime" },
        },
      },
    ]);

    // Build radar data with defaults
    const subjects = ["OS", "DBMS", "CN", "OOPs"];
    const radar = subjects.map((subj) => {
      const stat = topicStats.find((s) => s._id === subj);
      if (stat && stat.total > 0) {
        return {
          subject: subj,
          accuracy: Math.round((stat.correct / stat.total) * 100),
          speed: Math.max(0, Math.round(100 - (stat.avgTime || 0) * 10)),
          total: stat.total,
        };
      }
      return { subject: subj, accuracy: 50, speed: 50, total: 0 };
    });

    res.json({ success: true, data: radar });
  } catch (err) {
    console.error("getSkillRadar error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
