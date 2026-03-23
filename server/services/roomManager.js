/**
 * Room Manager — Custom room state management for Arena mode
 */

const { randomUUID: uuidv4 } = require("crypto");

// In-memory custom rooms: Map<roomCode, RoomState>
const customRooms = new Map();

/**
 * Generate a 6-char alphanumeric room code (no ambiguous chars)
 */
const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  } while (customRooms.has(code)); // Ensure uniqueness
  return code;
};

/**
 * Create a new custom room
 * @param {Object} host - { id, username, rating, socketId }
 * @returns {Object} room state
 */
const createRoom = (host) => {
  const code = generateRoomCode();

  const room = {
    code,
    host: {
      id: host.id,
      username: host.username,
      rating: host.rating,
      socketId: host.socketId,
      ready: true,
    },
    guest: null,
    settings: {
      subject: "mixed",
      duration: 60,
      questionType: "mcq",
      ratingImpact: false,
    },
    status: "waiting", // waiting | ready | started
    createdAt: Date.now(),
  };

  customRooms.set(code, room);
  // console.log(`[Room] Created room ${code} by ${host.username}`);
  return room;
};

/**
 * Join an existing room
 * @param {string} code - Room code
 * @param {Object} player - { id, username, rating, socketId }
 * @returns {{ success: boolean, room?: Object, error?: string }}
 */
const joinRoom = (code, player) => {
  const room = customRooms.get(code);

  if (!room) {
    return { success: false, error: "Room not found. Check the code and try again." };
  }

  if (room.status === "started") {
    return { success: false, error: "Match already in progress." };
  }

  if (room.guest) {
    return { success: false, error: "Room is full." };
  }

  if (room.host.id === player.id) {
    return { success: false, error: "You cannot join your own room." };
  }

  room.guest = {
    id: player.id,
    username: player.username,
    rating: player.rating,
    socketId: player.socketId,
    ready: true,
  };

  room.status = "ready";
  // console.log(`[Room] ${player.username} joined room ${code}`);
  return { success: true, room };
};

/**
 * Update room settings (host only)
 * @param {string} code - Room code
 * @param {string} hostId - ID of the user attempting the update
 * @param {Object} settings - New settings
 * @returns {{ success: boolean, room?: Object, error?: string }}
 */
const updateSettings = (code, hostId, settings) => {
  const room = customRooms.get(code);

  if (!room) return { success: false, error: "Room not found." };
  if (room.host.id !== hostId) return { success: false, error: "Only the host can change settings." };
  if (room.status === "started") return { success: false, error: "Cannot change settings during a match." };

  // Merge only allowed fields
  if (settings.subject !== undefined) room.settings.subject = settings.subject;
  if (settings.duration !== undefined) room.settings.duration = parseInt(settings.duration) || 60;
  if (settings.questionType !== undefined) room.settings.questionType = settings.questionType;
  if (settings.ratingImpact !== undefined) room.settings.ratingImpact = Boolean(settings.ratingImpact);

  return { success: true, room };
};

/**
 * Remove a player from a room (leave or disconnect)
 * @param {string} code - Room code
 * @param {string} userId - ID of the leaving player
 * @returns {{ success: boolean, disbanded: boolean, room?: Object }}
 */
const leaveRoom = (code, userId) => {
  const room = customRooms.get(code);
  if (!room) return { success: false, disbanded: false };

  // Host leaves — disband the room
  if (room.host.id === userId) {
    customRooms.delete(code);
    // console.log(`[Room] Room ${code} disbanded (host left)`);
    return { success: true, disbanded: true };
  }

  // Guest leaves
  if (room.guest && room.guest.id === userId) {
    room.guest = null;
    room.status = "waiting";
    // console.log(`[Room] Guest left room ${code}`);
    return { success: true, disbanded: false, room };
  }

  return { success: false, disbanded: false };
};

/**
 * Check if room is ready to start
 * @param {string} code - Room code
 * @param {string} hostId - ID of the user attempting to start
 * @returns {{ success: boolean, room?: Object, error?: string }}
 */
const canStartRoom = (code, hostId) => {
  const room = customRooms.get(code);

  if (!room) return { success: false, error: "Room not found." };
  if (room.host.id !== hostId) return { success: false, error: "Only the host can start the match." };
  if (!room.guest) return { success: false, error: "Need 2 players to start." };
  if (room.status === "started") return { success: false, error: "Match already started." };

  room.status = "started";
  return { success: true, room };
};

/**
 * Get a room by code
 */
const getRoom = (code) => customRooms.get(code);

/**
 * Find which room a user is in (for disconnect cleanup)
 * @param {string} userId
 * @returns {{ code: string, room: Object } | null}
 */
const findUserRoom = (userId) => {
  for (const [code, room] of customRooms) {
    if (room.host.id === userId || (room.guest && room.guest.id === userId)) {
      return { code, room };
    }
  }
  return null;
};

/**
 * Delete a room
 */
const deleteRoom = (code) => {
  customRooms.delete(code);
};

module.exports = {
  createRoom,
  joinRoom,
  updateSettings,
  leaveRoom,
  canStartRoom,
  getRoom,
  findUserRoom,
  deleteRoom,
  customRooms,
};
