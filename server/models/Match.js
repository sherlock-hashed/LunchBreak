const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  optionSelected: { type: Number, default: -1 },
  correct: { type: Boolean, default: false },
  responseTime: { type: Number, default: 0 },
}, { _id: false });

const PlayerStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  score: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  avgResponseTime: { type: Number, default: 0 },
  fastestResponse: { type: Number, default: 0 },
  slowestResponse: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  wrong: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  ratingBefore: { type: Number, default: 1200 },
  ratingAfter: { type: Number, default: 1200 },
  responses: [ResponseSchema],
}, { _id: false });

const MatchSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  mode: { type: String, enum: ["blitz", "rapid", "arena", "training"], default: "blitz" },
  subject: { type: String, default: "mixed" },
  duration: { type: Number, default: 60 },
  player1: PlayerStatsSchema,
  player2: PlayerStatsSchema,
  isBot: { type: Boolean, default: false },
  winner: { type: String, enum: ["player1", "player2", "draw", null], default: null },
  xpAwarded: {
    player1: { type: Number, default: 0 },
    player2: { type: Number, default: 0 },
  },
  status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

MatchSchema.index({ "player1.userId": 1, createdAt: -1 });
MatchSchema.index({ "player2.userId": 1, createdAt: -1 });

module.exports = mongoose.model("Match", MatchSchema);
