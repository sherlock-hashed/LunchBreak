/**
 * Game Engine — Server-side match state, scoring, timer
 */

const { simulateBotAnswer } = require("./botEngine");
const { calculateNewRatings, calculateXP } = require("./ratingEngine");
const Match = require("../models/Match");
const User = require("../models/User");

// In-memory match states
const activeMatches = new Map();

/**
 * Create a new match state
 */
const createMatch = (roomId, player1, player2, questions, mode, isBot, botName, botElo, customDuration) => {
  const duration = customDuration || (mode === "rapid" ? 90 : 60);

  const matchState = {
    roomId,
    player1, // { id, username, rating, socketId }
    player2, // { id, username, rating, socketId } (or bot info)
    questions,
    mode,
    isBot,
    botName: botName || null,
    botElo: botElo || null,
    duration,
    timeLeft: duration,
    status: "active",
    player1Score: 0,
    player2Score: 0,
    player1Answers: [], // { questionIdx, optionIdx, correct, time }
    player2Answers: [],
    player1Streak: 0,
    player2Streak: 0,
    player1BestStreak: 0,
    player2BestStreak: 0,
    player1CurrentQ: 0,
    player2CurrentQ: 0,
    player1QuestionStart: null,
    player2QuestionStart: null,
    timerInterval: null,
    botTimeouts: [],
    startTime: null,
    questionResults: [],
  };

  activeMatches.set(roomId, matchState);
  return matchState;
};

/**
 * Start the match timer (server-authoritative)
 */
const startMatchTimer = (roomId, io) => {
  const match = activeMatches.get(roomId);
  if (!match) return;

  match.startTime = Date.now();
  match.player1QuestionStart = Date.now();
  match.player2QuestionStart = Date.now();

  match.timerInterval = setInterval(() => {
    match.timeLeft--;

    // Emit timer tick to the room
    io.to(roomId).emit("timer-tick", { timeLeft: match.timeLeft });

    if (match.timeLeft <= 0) {
      endMatch(roomId, io);
    }
  }, 1000);

  // If bot match, start bot answering
  if (match.isBot) {
    scheduleBotAnswer(roomId, io);
  }
};

/**
 * Schedule bot answer for current question
 */
const scheduleBotAnswer = (roomId, io) => {
  const match = activeMatches.get(roomId);
  if (!match || match.status !== "active" || !match.isBot) return;
  if (match.player2CurrentQ >= match.questions.length) return;

  const question = match.questions[match.player2CurrentQ];
  const playerElo = match.player1.rating; // bot difficulty based on player's ELO
  const { isCorrect, delayMs, optionIdx } = simulateBotAnswer(question, playerElo);

  const timeout = setTimeout(() => {
    if (match.status !== "active") return;

    const timeTaken = parseFloat((delayMs / 1000).toFixed(1));
    const qIdx = match.player2CurrentQ;

    // Score the bot answer
    if (isCorrect) {
      match.player2Score += 4;
      match.player2Streak++;
      if (match.player2Streak > match.player2BestStreak) {
        match.player2BestStreak = match.player2Streak;
      }
    } else {
      match.player2Score = Math.max(0, match.player2Score - 1);
      match.player2Streak = 0;
    }

    match.player2Answers.push({
      questionIdx: qIdx,
      optionIdx,
      correct: isCorrect,
      time: timeTaken,
    });

    // Update question results
    const existingResult = match.questionResults.find(r => r.questionIndex === qIdx);
    if (existingResult) {
      existingResult.opponentResult = isCorrect ? "correct" : "wrong";
      existingResult.opponentTime = timeTaken;
      existingResult.opponentAnswer = optionIdx;
    } else {
      match.questionResults.push({
        questionIndex: qIdx,
        questionId: question._id,
        topic: question.topic,
        subject: question.subject,
        difficulty: question.difficulty,
        questionText: question.text,
        correctAnswer: question.correct,
        playerAnswer: -1,
        playerResult: "skip",
        playerTime: 0,
        opponentAnswer: optionIdx,
        opponentResult: isCorrect ? "correct" : "wrong",
        opponentTime: timeTaken,
      });
    }

    match.player2CurrentQ++;

    // Emit opponent scored to player
    io.to(match.player1.socketId).emit("opponent-scored", {
      oppScore: match.player2Score,
      oppStreak: match.player2Streak,
    });

    // Schedule next bot answer
    scheduleBotAnswer(roomId, io);
  }, delayMs);

  match.botTimeouts.push(timeout);
};

/**
 * Submit a player answer
 */
const submitAnswer = (roomId, userId, questionIdx, optionIdx, io) => {
  const match = activeMatches.get(roomId);
  if (!match || match.status !== "active") return null;

  const isPlayer1 = match.player1.id === userId;
  const isPlayer2 = !match.isBot && match.player2.id === userId;

  if (!isPlayer1 && !isPlayer2) return null;

  const question = match.questions[questionIdx % match.questions.length];
  const correct = optionIdx === question.correct;

  // Use per-question start time for accurate response time
  const qStart = isPlayer1 ? match.player1QuestionStart : match.player2QuestionStart;
  const timeTaken = qStart ? parseFloat(((Date.now() - qStart) / 1000).toFixed(1)) : 1;
  const actualTime = Math.max(0.1, Math.min(timeTaken, match.duration)); // clamp to match duration

  if (isPlayer1) {
    if (correct) {
      match.player1Score += 4;
      match.player1Streak++;
      if (match.player1Streak > match.player1BestStreak) {
        match.player1BestStreak = match.player1Streak;
      }
    } else {
      match.player1Score = Math.max(0, match.player1Score - 1);
      match.player1Streak = 0;
    }

    match.player1Answers.push({ questionIdx, optionIdx, correct, time: actualTime });
    match.player1CurrentQ = questionIdx + 1;
    match.player1QuestionStart = Date.now(); // Reset for next question

    // Update question results
    const existingResult = match.questionResults.find(r => r.questionIndex === questionIdx);
    if (existingResult) {
      existingResult.playerAnswer = optionIdx;
      existingResult.playerResult = correct ? "correct" : "wrong";
      existingResult.playerTime = actualTime;
    } else {
      match.questionResults.push({
        questionIndex: questionIdx,
        questionId: question._id,
        topic: question.topic,
        subject: question.subject,
        difficulty: question.difficulty,
        questionText: question.text,
        correctAnswer: question.correct,
        playerAnswer: optionIdx,
        playerResult: correct ? "correct" : "wrong",
        playerTime: actualTime,
        opponentAnswer: -1,
        opponentResult: "skip",
        opponentTime: 0,
      });
    }

    // Notify opponent
    if (!match.isBot && match.player2.socketId) {
      io.to(match.player2.socketId).emit("opponent-scored", {
        oppScore: match.player1Score,
        oppStreak: match.player1Streak,
      });
    }

    return {
      correct,
      correctIdx: question.correct,
      score: match.player1Score,
      oppScore: match.player2Score,
      streak: match.player1Streak,
      bestStreak: match.player1BestStreak,
    };
  }

  if (isPlayer2) {
    if (correct) {
      match.player2Score += 4;
      match.player2Streak++;
      if (match.player2Streak > match.player2BestStreak) {
        match.player2BestStreak = match.player2Streak;
      }
    } else {
      match.player2Score = Math.max(0, match.player2Score - 1);
      match.player2Streak = 0;
    }

    match.player2Answers.push({ questionIdx, optionIdx, correct, time: actualTime });
    match.player2CurrentQ = questionIdx + 1;
    match.player2QuestionStart = Date.now(); // Reset for next question

    // Update question results for P2
    const existingResult = match.questionResults.find(r => r.questionIndex === questionIdx);
    if (existingResult) {
      existingResult.opponentAnswer = optionIdx;
      existingResult.opponentResult = correct ? "correct" : "wrong";
      existingResult.opponentTime = actualTime;
    } else {
      match.questionResults.push({
        questionIndex: questionIdx,
        questionId: question._id,
        topic: question.topic,
        subject: question.subject,
        difficulty: question.difficulty,
        questionText: question.text,
        correctAnswer: question.correct,
        playerAnswer: -1,
        playerResult: "skip",
        playerTime: 0,
        opponentAnswer: optionIdx,
        opponentResult: correct ? "correct" : "wrong",
        opponentTime: actualTime,
      });
    }

    // Notify player1
    if (match.player1.socketId) {
      io.to(match.player1.socketId).emit("opponent-scored", {
        oppScore: match.player2Score,
        oppStreak: match.player2Streak,
      });
    }

    return {
      correct,
      correctIdx: question.correct,
      score: match.player2Score,
      oppScore: match.player1Score,
      streak: match.player2Streak,
      bestStreak: match.player2BestStreak,
    };
  }

  return null;
};

// Helper to update a single user's stats
const updateUserMatchStats = async (userId, isWin, isDraw, matchMode, matchSubject, newRating, answers, questions, xpAmount) => {
  if (!userId || userId === "bot") return;

  const xpGained = xpAmount || 0;

  const modeKey = matchMode || "blitz";
  const ratingPath = `rating.${modeKey}`;
  const peakPath = `peakRating.${modeKey}`;
  const clampedRating = Math.max(100, newRating);
  const incStage = { "stats.matchesPlayed": 1 };
  const setStage = { [ratingPath]: clampedRating };

  // Update W/L and streak
  if (isWin) {
    incStage["stats.wins"] = 1;
    incStage["stats.streak"] = 1;
    // We can't do `$max` for bestStreak easily with `$inc`, just let simple streak grow
  } else if (isDraw) {
    incStage["stats.draws"] = 1;
    setStage["stats.streak"] = 0;
  } else {
    incStage["stats.losses"] = 1;
    setStage["stats.streak"] = 0;
  }

  // Update Subject Stats if applicable
  if (matchSubject && matchSubject !== "mixed") {
    incStage[`subjectStats.${matchSubject}.total`] = 1;
    if (isWin) incStage[`subjectStats.${matchSubject}.wins`] = 1;
    else if (!isDraw) incStage[`subjectStats.${matchSubject}.losses`] = 1;
  }

  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Update peakRating if new rating is higher
    const currentPeak = user.peakRating?.[modeKey] || 1200;
    if (clampedRating > currentPeak) {
      setStage[peakPath] = clampedRating;
    }

    // Add XP to increment stage
    if (xpGained > 0) {
      incStage["xp"] = xpGained;
    }

    // Apply basic updates via atomic operators
    await User.findByIdAndUpdate(userId, { $inc: incStage, $set: setStage });

    // Manually handle Topic Accuracy array since it requires internal array logic
    let modified = false;
    answers.forEach(a => {
      const q = questions[a.questionIdx];
      if (!q || !q.topic) return;

      const topicTopic = q.topic;
      let topicEntry = user.topicAccuracy.find(t => t.topic === topicTopic);
      
      if (!topicEntry) {
        user.topicAccuracy.push({ topic: topicTopic, correct: a.correct ? 1 : 0, total: 1 });
        modified = true;
      } else {
        topicEntry.total += 1;
        if (a.correct) topicEntry.correct += 1;
        modified = true;
      }
    });

    if (modified) {
      await user.save({ validateBeforeSave: false });
    }
  } catch (err) {
    // console.error("Failed to update user match stats:", err);
  }
};

/**
 * End match — calculate results, save to DB, update ratings
 */
const endMatch = async (roomId, io) => {
  const match = activeMatches.get(roomId);
  if (!match || match.status !== "active") return;

  match.status = "completed";

  // Stop timer and bots
  if (match.timerInterval) clearInterval(match.timerInterval);
  match.botTimeouts.forEach(t => clearTimeout(t));

  const p1Score = match.player1Score;
  const p2Score = match.player2Score;

  const p1Correct = match.player1Answers.filter(a => a.correct).length;
  const p1Wrong = match.player1Answers.filter(a => !a.correct).length;
  const p1Total = match.player1Answers.length;
  const p1Accuracy = p1Total > 0 ? Math.round((p1Correct / p1Total) * 100) : 0;

  const p2Correct = match.player2Answers.filter(a => a.correct).length;
  const p2Wrong = match.player2Answers.filter(a => !a.correct).length;
  const p2Total = match.player2Answers.length;
  const p2Accuracy = p2Total > 0 ? Math.round((p2Correct / p2Total) * 100) : 0;

  // Determine winner
  let winner = "draw";
  if (p1Score > p2Score) winner = "player1";
  else if (p2Score > p1Score) winner = "player2";

  // ELO Calculations
  const p1Rating = match.player1.rating;
  const p2Rating = match.isBot ? match.botElo : match.player2.rating;

  let rP1Change, rP2Change, rP1New, rP2New;
  
  if (winner === "draw") {
    const drawRes = calculateNewRatings(p1Rating, p2Rating, true);
    rP1Change = drawRes.winnerChange; rP2Change = drawRes.loserChange;
    rP1New = drawRes.winnerNew;       rP2New = drawRes.loserNew;
  } else if (winner === "player1") {
    const p1Win = calculateNewRatings(p1Rating, p2Rating, false);
    rP1Change = p1Win.winnerChange; rP2Change = p1Win.loserChange;
    rP1New = p1Win.winnerNew;       rP2New = p1Win.loserNew;
  } else {
    // Player 2 wins
    const p2Win = calculateNewRatings(p2Rating, p1Rating, false);
    rP2Change = p2Win.winnerChange; rP1Change = p2Win.loserChange;
    rP2New = p2Win.winnerNew;       rP1New = p2Win.loserNew;
  }

  // Ensure no rating drops below 100
  rP1New = Math.max(100, rP1New);
  rP2New = Math.max(100, rP2New);

  // If bot, p2 ratings don't matter, set to 0
  if (match.isBot || match.mode === "training") {
    rP2Change = 0;
    rP2New = match.botElo;
  }
  
  // If training, nobody's rating changes
  if (match.mode === "training") {
    rP1Change = 0;
    rP1New = p1Rating;
  }

  // XP Calculation
  const p1XP = calculateXP(p1Score, p1Accuracy, match.player1BestStreak, winner === "player1");
  const p2XP = match.isBot ? 0 : calculateXP(p2Score, p2Accuracy, match.player2BestStreak, winner === "player2");

  // Shared payload bits
  const baseResult = {
    roomId,
    winner,
    isBot: match.isBot,
    botName: match.botName,
    botElo: match.botElo,
    subject: match.questions[0]?.subject || "mixed",
    mode: match.mode,
    questionResults: match.questionResults.map(qr => {
      const q = match.questions[qr.questionIndex] || {};
      return {
        questionIndex: qr.questionIndex,
        topic: qr.topic,
        subject: qr.subject,
        playerResult: qr.playerResult,
        playerTime: qr.playerTime,
        botResult: qr.opponentResult,
        botTime: qr.opponentTime,
        questionText: q.text || qr.questionText || "",
        options: q.options || [],
        correctAnswer: q.correct ?? qr.correctAnswer ?? -1,
        explanation: q.explanation || "",
        playerAnswer: qr.playerAnswer ?? -1,
      };
    }),
  };

  // Build Payload for Player 1
  const p1Payload = {
    ...baseResult,
    playerScore: p1Score,
    oppScore: p2Score,
    playerElo: p1Rating,
    playerEloAfter: rP1New,
    ratingChange: rP1Change,
    questionsAnswered: p1Total,
    playerCorrect: p1Correct,
    playerWrong: p1Wrong,
    playerSkipped: match.questions.length - p1Total,
    accuracy: p1Accuracy,
    botAccuracy: p2Accuracy, // opponent accuracy
    bestStreak: match.player1BestStreak,
    botQuestionsAnswered: p2Total,
    botCorrect: p2Correct,
    xpGained: p1XP,
    opponentName: match.isBot ? match.botName : match.player2.username,
    opponentElo: match.isBot ? match.botElo : p2Rating,
  };

  // Emit to Player 1
  if (match.player1.socketId) {
    io.to(match.player1.socketId).emit("match-end", p1Payload);
  }

  // Build Payload for Player 2 (if PvP)
  if (!match.isBot && match.player2.socketId) {
    const p2Payload = {
      ...baseResult,
      // Do NOT invert winner — frontend uses playerScore > oppScore to determine win/loss
      playerScore: p2Score,
      oppScore: p1Score,
      playerElo: p2Rating,
      playerEloAfter: rP2New,
      ratingChange: rP2Change,
      questionsAnswered: p2Total,
      playerCorrect: p2Correct,
      playerWrong: p2Wrong,
      playerSkipped: match.questions.length - p2Total,
      accuracy: p2Accuracy,
      botAccuracy: p1Accuracy,
      bestStreak: match.player2BestStreak,
      botQuestionsAnswered: p1Total,
      botCorrect: p1Correct,
      xpGained: p2XP,
      opponentName: match.player1.username,
      opponentElo: p1Rating,
      // For P2, we must invert the question results
      questionResults: match.questionResults.map(qr => {
        const q = match.questions[qr.questionIndex] || {};
        return {
          questionIndex: qr.questionIndex,
          topic: qr.topic,
          subject: qr.subject,
          playerResult: qr.opponentResult,
          playerTime: qr.opponentTime,
          botResult: qr.playerResult,
          botTime: qr.playerTime,
          questionText: q.text || qr.questionText || "",
          options: q.options || [],
          correctAnswer: q.correct ?? qr.correctAnswer ?? -1,
          explanation: q.explanation || "",
          playerAnswer: qr.opponentAnswer ?? -1,
        };
      }),
    };

    io.to(match.player2.socketId).emit("match-end", p2Payload);
  }

  // Save to Database (Exclude Training Mode)
  if (match.mode !== "training") {
    try {
      const getAvg = times => times.length ? parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)) : 0;
      const getMin = times => times.length > 0 ? Math.min(...times) : 0;
      const getMax = times => times.length > 0 ? Math.max(...times) : 0;

      const p1Times = match.player1Answers.map(a => a.time);
      const p2Times = match.player2Answers.map(a => a.time);

      await Match.create({
        roomId,
        mode: match.mode,
        subject: baseResult.subject,
        duration: match.duration,
        player1: {
          userId: match.player1.id !== "bot" ? match.player1.id : null,
          username: match.player1.username,
          score: p1Score,
          accuracy: p1Accuracy,
          avgResponseTime: getAvg(p1Times),
          fastestResponse: getMin(p1Times),
          slowestResponse: getMax(p1Times),
          correct: p1Correct,
          wrong: p1Wrong,
          skipped: match.questions.length - p1Total,
          streak: match.player1BestStreak,
          ratingBefore: p1Rating,
          ratingAfter: rP1New,
          responses: match.player1Answers.map(a => ({
            questionId: match.questions[a.questionIdx]?._id || null,
            optionSelected: a.optionIdx,
            correct: a.correct,
            responseTime: a.time,
          })),
        },
        player2: {
          userId: match.isBot ? null : (match.player2.id !== "bot" ? match.player2.id : null),
          username: match.isBot ? match.botName : match.player2.username,
          score: p2Score,
          accuracy: p2Accuracy,
          avgResponseTime: getAvg(p2Times),
          fastestResponse: getMin(p2Times),
          slowestResponse: getMax(p2Times),
          correct: p2Correct,
          wrong: p2Wrong,
          skipped: match.questions.length - p2Total,
          streak: match.player2BestStreak,
          ratingBefore: p2Rating,
          ratingAfter: rP2New,
          responses: match.player2Answers.map(a => ({
            questionId: match.questions[a.questionIdx]?._id || null,
            optionSelected: a.optionIdx,
            correct: a.correct,
            responseTime: a.time,
          })),
        },
        isBot: match.isBot,
        winner,
        xpAwarded: { player1: p1XP, player2: p2XP },
        status: "completed",
        completedAt: new Date(),
      });

      // Update DB Stats for P1 and P2 via helper (now includes XP)
      await updateUserMatchStats(match.player1.id, winner === "player1", winner === "draw", match.mode, baseResult.subject, rP1New, match.player1Answers, match.questions, p1XP);
      
      if (!match.isBot && match.player2.id) {
        await updateUserMatchStats(match.player2.id, winner === "player2", winner === "draw", match.mode, baseResult.subject, rP2New, match.player2Answers, match.questions, p2XP);
      }
    } catch (err) {
      // console.error("Error saving match:", err);
    }
  }

  // Cleanup
  setTimeout(() => {
    activeMatches.delete(roomId);
  }, 60000); // keep for 1 min for potential rematch
};

/**
 * Get active match by roomId
 */
const getMatch = (roomId) => activeMatches.get(roomId);

/**
 * Handle player disconnect mid-match
 */
const handleDisconnect = (roomId, userId, io) => {
  const match = activeMatches.get(roomId);
  if (!match || match.status !== "active") return;

  if (match.player1.id === userId) {
    match.player1Score = Math.max(0, match.player1Score - 20); // Forfeit penalty
  } else if (!match.isBot && match.player2.id === userId) {
    match.player2Score = Math.max(0, match.player2Score - 20); // Forfeit penalty
  }

  // Immediately end the match
  endMatch(roomId, io);
};

/**
 * Remove match
 */
const removeMatch = (roomId) => {
  const match = activeMatches.get(roomId);
  if (match) {
    if (match.timerInterval) clearInterval(match.timerInterval);
    match.botTimeouts.forEach(t => clearTimeout(t));
    activeMatches.delete(roomId);
  }
};

module.exports = { createMatch, startMatchTimer, submitAnswer, endMatch, getMatch, removeMatch, handleDisconnect, activeMatches };
