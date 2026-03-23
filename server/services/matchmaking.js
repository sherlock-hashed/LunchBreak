/**
 * Matchmaking Service — Queue management, ELO-based matching, bot fallback
 */

const { randomUUID: uuidv4 } = require("crypto");
const { getRandomBotName, generateBotElo } = require("./botEngine");
const Question = require("../models/Question");

// In-memory queues: key = `${mode}-${subject}`, value = [{ userId, username, rating, socketId, joinedAt }]
const queues = new Map();

// Timeout tracker for bot fallback
const botFallbackTimers = new Map();

// Server-side cache for authoritative question data (including correct answers)
// Key: roomId, Value: full question array with `correct` field
const pendingMatches = new Map();

// Map client subject IDs (lowercase) to DB enum values (mixed case)
const SUBJECT_MAP = {
  os: "OS",
  dbms: "DBMS",
  cn: "CN",
  oops: "OOPs",
  mixed: "mixed",
};

const BOT_FALLBACK_DELAY = 15000; // 15 seconds

/**
 * Add player to matchmaking queue
 */
const joinQueue = (playerData, io) => {
  const { userId, username, rating, socketId, subject = "mixed", mode = "blitz" } = playerData;
  const queueKey = `${mode}-${subject}`;

  if (!queues.has(queueKey)) {
    queues.set(queueKey, []);
  }

  const queue = queues.get(queueKey);

  // Prevent duplicate queue entries
  const existing = queue.findIndex(p => p.userId === userId);
  if (existing !== -1) {
    queue[existing] = { userId, username, rating, socketId, joinedAt: Date.now(), subject, mode };
  } else {
    queue.push({ userId, username, rating, socketId, joinedAt: Date.now(), subject, mode });
  }

  // console.log(`[Matchmaking] ${username} joined ${queueKey} queue (${queue.length} in queue)`);

  // If Training mode, instantly start a bot match
  if (mode === "training") {
    createBotMatch({ userId, username, rating, socketId, joinedAt: Date.now() }, subject, mode, io);
    return;
  }

  // Try to find a match immediately
  const match = findMatch(queueKey, userId);
  if (match) {
    startMatchFromQueue(match.player1, match.player2, subject, mode, io);
    return;
  }

  // Send queue status
  io.to(socketId).emit("queue-status", {
    position: queue.length,
    estimatedWait: Math.min(15, queue.length * 3),
  });

  // Set bot fallback timer
  const timer = setTimeout(() => {
    const currentQueue = queues.get(queueKey) || [];
    const stillWaiting = currentQueue.find(p => p.userId === userId);
    if (stillWaiting) {
      // Create bot match
      createBotMatch(stillWaiting, subject, mode, io);
    }
    botFallbackTimers.delete(userId);
  }, BOT_FALLBACK_DELAY);

  botFallbackTimers.set(userId, timer);
};

/**
 * Find a match for a player based on ELO range
 */
const findMatch = (queueKey, userId) => {
  const queue = queues.get(queueKey);
  if (!queue || queue.length < 2) return null;

  const player = queue.find(p => p.userId === userId);
  if (!player) return null;

  let bestMatch = null;
  let bestDiff = Infinity;
  const elapsedSecs = (Date.now() - player.joinedAt) / 1000;
  const searchRange = 200 + Math.floor(elapsedSecs * 20); // Expand by 20 per second

  for (const opponent of queue) {
    if (opponent.userId === userId) continue;
    const diff = Math.abs(player.rating - opponent.rating);
    if (diff <= searchRange && diff < bestDiff) {
      bestDiff = diff;
      bestMatch = opponent;
    }
  }

  if (bestMatch) {
    // Remove both from queue
    const idx1 = queue.findIndex(p => p.userId === player.userId);
    if (idx1 !== -1) queue.splice(idx1, 1);
    const idx2 = queue.findIndex(p => p.userId === bestMatch.userId);
    if (idx2 !== -1) queue.splice(idx2, 1);

    // Clear bot fallback timers
    clearBotFallback(player.userId);
    clearBotFallback(bestMatch.userId);

    return { player1: player, player2: bestMatch };
  }

  return null;
};

/**
 * Create a bot match for a player
 */
const createBotMatch = async (player, subject, mode, io) => {
  const queueKey = `${mode}-${subject}`;
  const queue = queues.get(queueKey) || [];

  // Remove player from queue
  const idx = queue.findIndex(p => p.userId === player.userId);
  if (idx !== -1) queue.splice(idx, 1);

  const botName = getRandomBotName();
  const botElo = generateBotElo(player.rating);
  const roomId = `match_${uuidv4().slice(0, 8)}`;

  // Fetch questions from DB
  const questions = await getMatchQuestions(subject, mode);

  // Store authoritative questions (with correct answers) server-side
  pendingMatches.set(roomId, questions);

  // console.log(`[Matchmaking] Bot match created: ${player.username} vs ${botName} (Room: ${roomId})`);

  io.to(player.socketId).emit("match-found", {
    roomId,
    opponent: {
      username: botName,
      rating: botElo,
      isBot: true,
      avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${botName}`,
    },
    questions: questions.map(q => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
    })),
    mode,
    isBot: true,
    botName,
    botElo,
  });
};

/**
 * Start a match from two queued players
 */
const startMatchFromQueue = async (player1, player2, subject, mode, io) => {
  const roomId = `match_${uuidv4().slice(0, 8)}`;
  const questions = await getMatchQuestions(subject, mode);

  // Store authoritative questions (with correct answers) server-side
  pendingMatches.set(roomId, questions);

  // console.log(`[Matchmaking] PvP match: ${player1.username} vs ${player2.username} (Room: ${roomId})`);

  const matchData = {
    roomId,
    questions: questions.map(q => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
    })),
    mode,
    isBot: false,
  };

  io.to(player1.socketId).emit("match-found", {
    ...matchData,
    opponent: {
      id: player2.userId,
      username: player2.username,
      rating: player2.rating,
      isBot: false,
      socketId: player2.socketId,
      avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${player2.username}`,
    },
  });

  io.to(player2.socketId).emit("match-found", {
    ...matchData,
    opponent: {
      id: player1.userId,
      username: player1.username,
      rating: player1.rating,
      isBot: false,
      socketId: player1.socketId,
      avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${player1.username}`,
    },
  });
};

/**
 * Get random questions for a match from DB
 */
const getMatchQuestions = async (subject, mode = "blitz") => {
  // Normalize subject to DB enum value
  const dbSubject = SUBJECT_MAP[subject?.toLowerCase()] || subject;

  const matchStage = {};
  if (dbSubject && dbSubject !== "mixed") {
    matchStage.subject = dbSubject;
  }

  // Filter question type based on mode
  if (mode === "rapid") {
    matchStage.type = "Case Based Scenario";
  } else {
    matchStage.type = "MCQ";
  }

  let questions = await Question.aggregate([
    { $match: matchStage },
    { $sample: { size: 20 } },
  ]);

  // Fallback: if not enough questions for the mode-specific type, get any type
  if (questions.length < 5) {
    const fallbackStage = {};
    if (dbSubject && dbSubject !== "mixed") {
      fallbackStage.subject = dbSubject;
    }
    questions = await Question.aggregate([
      { $match: fallbackStage },
      { $sample: { size: 20 } },
    ]);
  }

  return questions;
};

/**
 * Remove player from all queues
 */
const leaveQueue = (userId) => {
  for (const [key, queue] of queues) {
    const idx = queue.findIndex(p => p.userId === userId);
    if (idx !== -1) {
      // console.log(`[Matchmaking] ${queue[idx].username} left ${key} queue`);
      queue.splice(idx, 1);
    }
  }
  clearBotFallback(userId);
};

/**
 * Clear bot fallback timer
 */
const clearBotFallback = (userId) => {
  const timer = botFallbackTimers.get(userId);
  if (timer) {
    clearTimeout(timer);
    botFallbackTimers.delete(userId);
  }
};

module.exports = { joinQueue, leaveQueue, findMatch, queues, pendingMatches };
