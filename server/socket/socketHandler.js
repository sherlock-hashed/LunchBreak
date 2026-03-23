/**
 * Socket Handler — Main Socket.io event handler
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { joinQueue, leaveQueue, pendingMatches } = require("../services/matchmaking");
const { createMatch, startMatchTimer, submitAnswer, getMatch, removeMatch, handleDisconnect, activeMatches } = require("../services/gameEngine");
const { createRoom, joinRoom, updateSettings, leaveRoom, canStartRoom, findUserRoom, deleteRoom } = require("../services/roomManager");
const Question = require("../models/Question");

// Track online users: socketId -> { userId, username }
const onlineUsers = new Map();

const initializeSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = {
        id: user._id.toString(),
        username: user.username,
        rating: typeof user.rating === "object"
          ? (user.rating.blitz || 1200)
          : (user.rating || 1200),
        ratingObj: user.rating,
        avatar: user.avatar,
      };

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { id: userId, username, rating } = socket.user;

    onlineUsers.set(socket.id, { userId, username });
    // console.log(`[Socket] ${username} connected (${socket.id}) — ${onlineUsers.size} online`);

    // Emit online count to all
    io.emit("online-count", { count: onlineUsers.size });

    // ──── JOIN QUEUE ────
    socket.on("join-queue", (data) => {
      const { subject = "mixed", mode = "blitz" } = data || {};

      // Use mode-specific rating for matchmaking
      const ratingObj = socket.user.ratingObj || {};
      const modeRating = ratingObj[mode] || ratingObj.blitz || rating;

      joinQueue({
        userId,
        username,
        rating: modeRating,
        socketId: socket.id,
        subject,
        mode,
      }, io);
    });

    // ──── LEAVE QUEUE ────
    socket.on("leave-queue", () => {
      leaveQueue(userId);
    });

    // ──── MATCH FOUND ACK — Client confirmed, create game engine match ────
    socket.on("match-ready", (data) => {
      const { roomId, opponent, mode, isBot, botName, botElo, customDuration } = data;

      // Retrieve authoritative questions from server-side cache (includes `correct` field)
      const authoritativeQuestions = pendingMatches.get(roomId);
      if (!authoritativeQuestions) {
        // console.error(`[Socket] No pending match found for room ${roomId}. Cannot start match.`);
        return;
      }

      socket.join(roomId);

      const existingMatch = getMatch(roomId);

      if (!existingMatch) {
        // First player to call match-ready — create the match
        // Use mode-specific rating, not the default blitz rating
        const ratingObj = socket.user.ratingObj || {};
        const modeRating = ratingObj[mode] || ratingObj.blitz || rating;

        const player1 = {
          id: userId,
          username,
          rating: modeRating,
          socketId: socket.id,
        };

        const player2 = isBot ? {
          id: "bot",
          username: botName || opponent?.username,
          rating: botElo || opponent?.rating,
          socketId: null,
        } : {
          id: opponent?.id,
          username: opponent?.username,
          rating: opponent?.rating,
          socketId: opponent?.socketId,
        };

        // Use authoritative questions from server cache, NOT from client payload
        createMatch(roomId, player1, player2, authoritativeQuestions, mode, isBot, botName, botElo, customDuration);

        const match = getMatch(roomId);

        if (isBot && match) {
          // Bot match: start immediately, clean up pending cache
          pendingMatches.delete(roomId);
          io.to(roomId).emit("match-start", {
            startTime: Date.now(),
            duration: match.duration,
            timeLeft: match.timeLeft,
          });
          startMatchTimer(roomId, io);
        }
      } else {
        // Second player joining (PvP) — update their socketId + start
        if (!existingMatch.isBot) {
          // Determine which player slot this user fills
          if (existingMatch.player2.id === userId) {
            existingMatch.player2.socketId = socket.id;
          } else if (existingMatch.player1.id === userId) {
            existingMatch.player1.socketId = socket.id;
          }

          // Both in room — start the match
          if (!existingMatch.startTime) {
            pendingMatches.delete(roomId); // Clean up pending cache
            io.to(roomId).emit("match-start", {
              startTime: Date.now(),
              duration: existingMatch.duration,
              timeLeft: existingMatch.timeLeft,
            });
            startMatchTimer(roomId, io);
          }
        }
      }
    });

    // ──── SUBMIT ANSWER ────
    socket.on("submit-answer", (data) => {
      const { roomId, questionIdx, optionIdx } = data;

      const result = submitAnswer(roomId, userId, questionIdx, optionIdx, io);

      if (result) {
        socket.emit("answer-result", {
          correct: result.correct,
          correctIdx: result.correctIdx,
          score: result.score,
          oppScore: result.oppScore,
          streak: result.streak,
          bestStreak: result.bestStreak,
        });
      }
    });

    // ──── REJOIN MATCH (page refresh recovery) ────
    socket.on("rejoin-match", (data) => {
      const { roomId } = data || {};
      if (!roomId) return;

      const match = getMatch(roomId);
      if (!match || match.status !== "active") return;

      // Re-join the socket room so timer-tick and match-end events reach this client
      socket.join(roomId);

      // Update the socket ID for this player in the match
      const isP1 = match.player1.id === userId;
      const isP2 = !match.isBot && match.player2.id === userId;

      if (isP1) {
        match.player1.socketId = socket.id;
        // Cancel pending disconnect forfeit if exists
        if (match._p1DisconnectTimeout) {
          clearTimeout(match._p1DisconnectTimeout);
          match._p1DisconnectTimeout = null;
          // console.log(`[Socket] ${username} reconnected in time — forfeit cancelled`);
        }
      } else if (isP2) {
        match.player2.socketId = socket.id;
        if (match._p2DisconnectTimeout) {
          clearTimeout(match._p2DisconnectTimeout);
          match._p2DisconnectTimeout = null;
          // console.log(`[Socket] ${username} reconnected in time — forfeit cancelled`);
        }
      }

      // Send current match state back so the client can restore scores/time
      const playerScore = isP1 ? match.player1Score : match.player2Score;
      const oppScore = isP1 ? match.player2Score : match.player1Score;
      const playerCurrentQ = isP1 ? match.player1CurrentQ : match.player2CurrentQ;

      socket.emit("match-state", {
        timeLeft: match.timeLeft,
        playerScore,
        oppScore,
        playerCurrentQ: playerCurrentQ || 0,
      });

      // console.log(`[Socket] ${username} rejoined match ${roomId} with new socket ${socket.id}`);
    });

    // ──── REQUEST REMATCH ────
    socket.on("request-rematch", (data) => {
      const { roomId } = data;
      const match = getMatch(roomId);
      if (!match) return;

      if (match.isBot) {
        // For bot matches, just emit rematch accepted immediately
        socket.emit("rematch-accepted", { roomId });
      } else {
        // Notify opponent
        const oppSocketId = match.player1.id === userId ? match.player2.socketId : match.player1.socketId;
        if (oppSocketId) {
          io.to(oppSocketId).emit("rematch-request", { from: username, roomId });
        }
      }
    });

    // ──── ACCEPT REMATCH ────
    socket.on("accept-rematch", (data) => {
      const { roomId } = data;
      io.to(roomId).emit("rematch-accepted", { roomId });
    });

    // ══════════════════════════════════════════
    // ──── CUSTOM ROOM EVENTS ────
    // ══════════════════════════════════════════

    // ──── CREATE ROOM ────
    socket.on("create-room", () => {
      const ratingObj = socket.user.ratingObj || {};
      const room = createRoom({
        id: userId,
        username,
        rating: ratingObj.blitz || 1200,
        socketId: socket.id,
      });

      socket.join(`room_${room.code}`);
      socket.emit("room-created", {
        roomCode: room.code,
        settings: room.settings,
        players: [{ name: room.host.username, rating: room.host.rating, ready: true, isHost: true }],
      });
    });

    // ──── JOIN ROOM ────
    socket.on("join-room", (data) => {
      const { roomCode } = data || {};
      if (!roomCode) {
        socket.emit("room-error", { message: "Please enter a room code." });
        return;
      }

      const ratingObj = socket.user.ratingObj || {};
      const result = joinRoom(roomCode.toUpperCase(), {
        id: userId,
        username,
        rating: ratingObj.blitz || 1200,
        socketId: socket.id,
      });

      if (!result.success) {
        socket.emit("room-error", { message: result.error });
        return;
      }

      const room = result.room;
      socket.join(`room_${room.code}`);

      // Send full room state to the joining player
      socket.emit("room-joined", {
        roomCode: room.code,
        settings: room.settings,
        players: [
          { name: room.host.username, rating: room.host.rating, ready: true, isHost: true },
          { name: room.guest.username, rating: room.guest.rating, ready: true, isHost: false },
        ],
        isHost: false,
      });

      // Notify the host (and any other players) that someone joined, excluding the sender
      socket.to(`room_${room.code}`).emit("player-joined", {
        players: [
          { name: room.host.username, rating: room.host.rating, ready: true, isHost: true },
          { name: room.guest.username, rating: room.guest.rating, ready: true, isHost: false },
        ],
      });
    });

    // ──── ROOM SETTINGS (host only) ────
    socket.on("room-settings", (data) => {
      const { roomCode, settings } = data || {};
      if (!roomCode) return;

      const result = updateSettings(roomCode, userId, settings);

      if (!result.success) {
        socket.emit("room-error", { message: result.error });
        return;
      }

      // Broadcast updated settings to the room, excluding the sender (host)
      socket.to(`room_${roomCode}`).emit("settings-updated", {
        settings: result.room.settings,
      });
    });

    // ──── START ROOM MATCH (host only) ────
    socket.on("start-room-match", async (data) => {
      const { roomCode } = data || {};
      if (!roomCode) return;

      const result = canStartRoom(roomCode, userId);

      if (!result.success) {
        socket.emit("room-error", { message: result.error });
        return;
      }

      const room = result.room;
      const subject = room.settings.subject;
      const mode = "arena";
      const duration = room.settings.duration;

      // Fetch questions
      const SUBJECT_MAP = { os: "OS", dbms: "DBMS", cn: "CN", oops: "OOPs" };
      const dbSubject = SUBJECT_MAP[subject?.toLowerCase()] || subject;
      const matchStage = {};
      if (dbSubject && dbSubject !== "mixed") matchStage.subject = dbSubject;
      // Question type filtering
      if (room.settings.questionType === "mcq") {
        matchStage.type = "MCQ";
      } else if (room.settings.questionType === "case_based") {
        matchStage.type = "Case Based Scenario";
      }
      // "mixed" = no type filter → fetch all types

      let questions = await Question.aggregate([
        { $match: matchStage },
        { $sample: { size: 20 } },
      ]);

      // Fallback if not enough questions
      if (questions.length < 5) {
        const fallback = {};
        if (dbSubject && dbSubject !== "mixed") fallback.subject = dbSubject;
        questions = await Question.aggregate([
          { $match: fallback },
          { $sample: { size: 20 } },
        ]);
      }

      const roomId = `arena_${roomCode}`;

      // Store questions server-side
      pendingMatches.set(roomId, questions);

      // Stripped questions for client (no correct answer)
      const clientQuestions = questions.map(q => ({
        _id: q._id,
        text: q.text,
        options: q.options,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
      }));

      // Emit match-found to both players
      const matchData = {
        roomId,
        questions: clientQuestions,
        mode: "arena",
        isBot: false,
        customDuration: duration,
      };

      io.to(room.host.socketId).emit("match-found", {
        ...matchData,
        opponent: {
          id: room.guest.id,
          username: room.guest.username,
          rating: room.guest.rating,
          isBot: false,
          socketId: room.guest.socketId,
          avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${room.guest.username}`,
        },
      });

      io.to(room.guest.socketId).emit("match-found", {
        ...matchData,
        opponent: {
          id: room.host.id,
          username: room.host.username,
          rating: room.host.rating,
          isBot: false,
          socketId: room.host.socketId,
          avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${room.host.username}`,
        },
      });
    });

    // ──── LEAVE ROOM ────
    socket.on("leave-room", (data) => {
      const { roomCode } = data || {};
      if (!roomCode) return;

      const result = leaveRoom(roomCode, userId);

      if (result.disbanded) {
        socket.to(`room_${roomCode}`).emit("room-disbanded", { message: "Host left. Room disbanded." });
      } else if (result.room) {
        socket.to(`room_${roomCode}`).emit("player-left", {
          players: [
            { name: result.room.host.username, rating: result.room.host.rating, ready: true, isHost: true },
          ],
        });
      }

      socket.leave(`room_${roomCode}`);
    });

    // ──── DISCONNECT ────
    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      leaveQueue(userId);

      // Clean up custom rooms (only if not in an active match — room is already consumed)
      const userRoom = findUserRoom(userId);
      if (userRoom) {
        const result = leaveRoom(userRoom.code, userId);
        if (result.disbanded) {
          socket.to(`room_${userRoom.code}`).emit("room-disbanded", { message: "Host disconnected. Room disbanded." });
        } else if (result.room) {
          socket.to(`room_${userRoom.code}`).emit("player-left", {
            players: [
              { name: result.room.host.username, rating: result.room.host.rating, ready: true, isHost: true },
            ],
          });
        }
      }

      // Grace period for mid-match disconnects (e.g. page refresh)
      // Wait 5 seconds — if they rejoin-match within that time, cancel the forfeit
      for (const [roomId, match] of activeMatches.entries()) {
        if (match.status === "active") {
          const isP1 = match.player1.id === userId;
          const isP2 = !match.isBot && match.player2.id === userId;

          if (isP1 || isP2) {
            // console.log(`[Socket] ${username} disconnected mid-match. Waiting 5s for reconnection...`);

            // Store the pending disconnect timeout on the match so rejoin-match can cancel it
            const timeoutKey = isP1 ? "_p1DisconnectTimeout" : "_p2DisconnectTimeout";
            match[timeoutKey] = setTimeout(() => {
              // Player did NOT reconnect — forfeit the match
              // console.log(`[Socket] ${username} did not reconnect. Forfeiting room ${roomId}`);

              // Notify the opponent that the match was terminated
              const opponentSocketId = isP1 ? match.player2.socketId : match.player1.socketId;
              const disconnectedName = isP1 ? match.player1.username : match.player2.username;

              if (opponentSocketId) {
                io.to(opponentSocketId).emit("match-terminated", {
                  reason: `${disconnectedName} disconnected. Match terminated.`,
                });
              }

              handleDisconnect(roomId, userId, io);
            }, 5000);
          }
        }
      }

      // console.log(`[Socket] ${username} disconnected — ${onlineUsers.size} online`);
      io.emit("online-count", { count: onlineUsers.size });
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
