const Match = require("../models/Match");

// @desc    Get match by roomId
// @route   GET /api/matches/:id
// @access  Private
exports.getMatch = async (req, res) => {
  try {
    const match = await Match.findOne({ roomId: req.params.id })
      .populate("player1.userId", "username avatar rating")
      .populate("player2.userId", "username avatar rating")
      .populate("player1.responses.questionId", "text topic subject difficulty")
      .populate("player2.responses.questionId", "text topic subject difficulty");

    if (!match) {
      return res.status(404).json({ success: false, message: "Match not found" });
    }

    res.json({ success: true, data: match });
  } catch (err) {
    console.error("getMatch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user's match history
// @route   GET /api/matches/user/:userId
// @access  Private
exports.getUserMatches = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [{ "player1.userId": userId }, { "player2.userId": userId }],
      status: "completed",
    };

    const matches = await Match.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-player1.responses -player2.responses");

    const total = await Match.countDocuments(query);

    res.json({
      success: true,
      data: matches,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getUserMatches error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get detailed match analytics
// @route   GET /api/matches/:id/analytics
// @access  Private
exports.getMatchAnalytics = async (req, res) => {
  try {
    const match = await Match.findOne({ roomId: req.params.id })
      .populate("player1.responses.questionId", "text topic subject difficulty")
      .populate("player2.responses.questionId", "text topic subject difficulty");

    if (!match) {
      return res.status(404).json({ success: false, message: "Match not found" });
    }

    // Build topic-wise breakdown
    const topicBreakdown = {};
    const p1Responses = match.player1?.responses || [];

    p1Responses.forEach((r) => {
      const q = r.questionId;
      if (!q) return;
      const topic = q.topic || "Unknown";
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { correct: 0, total: 0, avgTime: 0, times: [] };
      }
      topicBreakdown[topic].total++;
      if (r.correct) topicBreakdown[topic].correct++;
      topicBreakdown[topic].times.push(r.responseTime);
    });

    // Compute avg times per topic
    Object.keys(topicBreakdown).forEach((topic) => {
      const t = topicBreakdown[topic];
      t.avgTime = t.times.length > 0
        ? parseFloat((t.times.reduce((a, b) => a + b, 0) / t.times.length).toFixed(1))
        : 0;
      t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
      delete t.times;
    });

    // Time trend data (per-question response times)
    const timeTrend = p1Responses.map((r, i) => ({
      question: i + 1,
      playerTime: r.responseTime,
      correct: r.correct,
    }));

    res.json({
      success: true,
      data: {
        match,
        analytics: {
          topicBreakdown,
          timeTrend,
          player1Summary: {
            score: match.player1.score,
            accuracy: match.player1.accuracy,
            avgTime: match.player1.avgResponseTime,
            fastest: match.player1.fastestResponse,
            slowest: match.player1.slowestResponse,
            streak: match.player1.streak,
            ratingChange: match.player1.ratingAfter - match.player1.ratingBefore,
          },
          player2Summary: {
            score: match.player2.score,
            accuracy: match.player2.accuracy,
            avgTime: match.player2.avgResponseTime,
            fastest: match.player2.fastestResponse,
            slowest: match.player2.slowestResponse,
            streak: match.player2.streak,
            ratingChange: (match.player2.ratingAfter || 0) - (match.player2.ratingBefore || 0),
          },
        },
      },
    });
  } catch (err) {
    console.error("getMatchAnalytics error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
