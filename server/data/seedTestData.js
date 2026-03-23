/**
 * Seed Test Data — 7 realistic test players with match history
 * 
 * Usage: node server/data/seedTestData.js
 * 
 * This will:
 *  1. Clear ALL users and matches from the database
 *  2. Create 7 test players with varied ratings and stats
 *  3. Insert ~20 realistic match records between them
 *  4. Update user stats to match the inserted match records
 */

const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const User = require("../models/User");
const Match = require("../models/Match");
const Question = require("../models/Question");
const connectDB = require("../config/db");

// ═══════════════════════════════════════════════
// 7 Test Players — varied skill levels
// ═══════════════════════════════════════════════
const players = [
  {
    name: "Aarav Sharma",
    username: "aarav_dev",
    email: "aarav@csclash.com",
    password: "Test@1234",
    gender: "male",
    bio: "Full-stack dev | MERN enthusiast",
    college: "IIT Bombay",
    country: "India",
    rating: { blitz: 1580, rapid: 1520, arena: 1490 },
    peakRating: { blitz: 1610, rapid: 1540, arena: 1500 },
  },
  {
    name: "Priya Patel",
    username: "priya_codes",
    email: "priya@csclash.com",
    password: "Test@1234",
    gender: "female",
    bio: "Competitive coder | DSA lover",
    college: "NIT Trichy",
    country: "India",
    rating: { blitz: 1720, rapid: 1680, arena: 1650 },
    peakRating: { blitz: 1750, rapid: 1700, arena: 1660 },
  },
  {
    name: "Rohan Gupta",
    username: "rohan_42",
    email: "rohan@csclash.com",
    password: "Test@1234",
    gender: "male",
    bio: "Backend engineer in training",
    college: "BITS Pilani",
    country: "India",
    rating: { blitz: 1350, rapid: 1280, arena: 1300 },
    peakRating: { blitz: 1380, rapid: 1320, arena: 1320 },
  },
  {
    name: "Sneha Reddy",
    username: "sneha_rs",
    email: "sneha@csclash.com",
    password: "Test@1234",
    gender: "female",
    bio: "OS & Networks geek 🔥",
    college: "IIIT Hyderabad",
    country: "India",
    rating: { blitz: 1450, rapid: 1500, arena: 1420 },
    peakRating: { blitz: 1480, rapid: 1520, arena: 1450 },
  },
  {
    name: "Arjun Nair",
    username: "arjun_n",
    email: "arjun@csclash.com",
    password: "Test@1234",
    gender: "male",
    bio: "SDE intern @ startup",
    college: "VIT Vellore",
    country: "India",
    rating: { blitz: 1200, rapid: 1220, arena: 1180 },
    peakRating: { blitz: 1240, rapid: 1250, arena: 1200 },
  },
  {
    name: "Kavya Iyer",
    username: "kavya_i",
    email: "kavya@csclash.com",
    password: "Test@1234",
    gender: "female",
    bio: "DBMS queen 👑 | Placement prep",
    college: "DTU Delhi",
    country: "India",
    rating: { blitz: 1650, rapid: 1600, arena: 1580 },
    peakRating: { blitz: 1680, rapid: 1620, arena: 1600 },
  },
  {
    name: "Vikram Joshi",
    username: "vikram_j",
    email: "vikram@csclash.com",
    password: "Test@1234",
    gender: "male",
    bio: "OOP perfectionist | Java fanboy",
    college: "COEP Pune",
    country: "India",
    rating: { blitz: 1100, rapid: 1150, arena: 1120 },
    peakRating: { blitz: 1200, rapid: 1200, arena: 1200 },
  },
];

// ═══════════════════════════════════════════════
// Match definitions (indices into players array)
// p1Idx, p2Idx, winner ("player1"|"player2"|"draw"), mode, subject, scores, accuracies, streaks
// ═══════════════════════════════════════════════
const matchDefs = [
  // Priya vs Aarav — Priya wins (she's higher rated)
  { p1: 1, p2: 0, winner: "player1", mode: "blitz", subject: "OS",   p1Score: 28, p2Score: 20, p1Acc: 85, p2Acc: 65, p1Streak: 4, p2Streak: 2 },
  // Aarav vs Rohan — Aarav wins easily
  { p1: 0, p2: 2, winner: "player1", mode: "blitz", subject: "DBMS", p1Score: 32, p2Score: 12, p1Acc: 80, p2Acc: 40, p1Streak: 5, p2Streak: 1 },
  // Sneha vs Arjun — Sneha wins
  { p1: 3, p2: 4, winner: "player1", mode: "rapid", subject: "CN",   p1Score: 24, p2Score: 16, p1Acc: 75, p2Acc: 55, p1Streak: 3, p2Streak: 2 },
  // Kavya vs Vikram — Kavya dominates
  { p1: 5, p2: 6, winner: "player1", mode: "blitz", subject: "DBMS", p1Score: 36, p2Score: 8,  p1Acc: 90, p2Acc: 30, p1Streak: 6, p2Streak: 0 },
  // Priya vs Kavya — close match, Priya edges out
  { p1: 1, p2: 5, winner: "player1", mode: "rapid", subject: "OOPs", p1Score: 24, p2Score: 20, p1Acc: 75, p2Acc: 70, p1Streak: 3, p2Streak: 3 },
  // Aarav vs Sneha — draw!
  { p1: 0, p2: 3, winner: "draw",    mode: "blitz", subject: "CN",   p1Score: 20, p2Score: 20, p1Acc: 65, p2Acc: 65, p1Streak: 2, p2Streak: 2 },
  // Rohan vs Arjun — Rohan wins (both low-rated, close)
  { p1: 2, p2: 4, winner: "player1", mode: "blitz", subject: "OS",   p1Score: 20, p2Score: 16, p1Acc: 60, p2Acc: 50, p1Streak: 2, p2Streak: 1 },
  // Kavya vs Aarav — Kavya wins
  { p1: 5, p2: 0, winner: "player1", mode: "rapid", subject: "DBMS", p1Score: 28, p2Score: 24, p1Acc: 80, p2Acc: 70, p1Streak: 4, p2Streak: 3 },
  // Vikram vs Arjun — Arjun upset win!
  { p1: 6, p2: 4, winner: "player2", mode: "blitz", subject: "OOPs", p1Score: 12, p2Score: 16, p1Acc: 40, p2Acc: 55, p1Streak: 1, p2Streak: 2 },
  // Priya vs Rohan — Priya easy win
  { p1: 1, p2: 2, winner: "player1", mode: "blitz", subject: "OS",   p1Score: 32, p2Score: 8,  p1Acc: 85, p2Acc: 30, p1Streak: 5, p2Streak: 0 },
  // Sneha vs Kavya — Kavya wins close
  { p1: 3, p2: 5, winner: "player2", mode: "rapid", subject: "CN",   p1Score: 20, p2Score: 24, p1Acc: 65, p2Acc: 75, p1Streak: 2, p2Streak: 3 },
  // Aarav vs Arjun — Aarav wins
  { p1: 0, p2: 4, winner: "player1", mode: "blitz", subject: "OOPs", p1Score: 28, p2Score: 12, p1Acc: 78, p2Acc: 42, p1Streak: 4, p2Streak: 1 },
  // Priya vs Sneha — draw
  { p1: 1, p2: 3, winner: "draw",    mode: "rapid", subject: "DBMS", p1Score: 24, p2Score: 24, p1Acc: 72, p2Acc: 72, p1Streak: 3, p2Streak: 3 },
  // Rohan vs Vikram — Rohan wins
  { p1: 2, p2: 6, winner: "player1", mode: "blitz", subject: "CN",   p1Score: 24, p2Score: 12, p1Acc: 65, p2Acc: 35, p1Streak: 3, p2Streak: 0 },
  // Kavya vs Priya — Priya wins rematch
  { p1: 5, p2: 1, winner: "player2", mode: "blitz", subject: "OS",   p1Score: 20, p2Score: 28, p1Acc: 65, p2Acc: 82, p1Streak: 2, p2Streak: 4 },
  // Sneha vs Rohan — Sneha wins
  { p1: 3, p2: 2, winner: "player1", mode: "rapid", subject: "OOPs", p1Score: 28, p2Score: 16, p1Acc: 78, p2Acc: 50, p1Streak: 4, p2Streak: 1 },
  // Aarav vs Vikram — Aarav wins
  { p1: 0, p2: 6, winner: "player1", mode: "blitz", subject: "DBMS", p1Score: 32, p2Score: 8,  p1Acc: 82, p2Acc: 28, p1Streak: 5, p2Streak: 0 },
  // Arjun vs Sneha — Sneha wins
  { p1: 4, p2: 3, winner: "player2", mode: "blitz", subject: "CN",   p1Score: 12, p2Score: 24, p1Acc: 40, p2Acc: 72, p1Streak: 1, p2Streak: 3 },
  // Priya vs Vikram — Priya dominates
  { p1: 1, p2: 6, winner: "player1", mode: "rapid", subject: "DBMS", p1Score: 36, p2Score: 4,  p1Acc: 92, p2Acc: 20, p1Streak: 7, p2Streak: 0 },
  // Kavya vs Arjun — Kavya wins
  { p1: 5, p2: 4, winner: "player1", mode: "blitz", subject: "OOPs", p1Score: 28, p2Score: 12, p1Acc: 78, p2Acc: 42, p1Streak: 4, p2Streak: 1 },
];

// ═══════════════════════════════════════════════
// Main seed function
// ═══════════════════════════════════════════════
const seed = async () => {
  try {
    await connectDB();
    console.log("\n🌱 Starting test data seed...\n");

    // 1. Clear users and matches
    await User.deleteMany({});
    await Match.deleteMany({});
    console.log("🗑️  Cleared all users and matches\n");

    // 2. Create users (plain password — Mongoose pre-save hook handles hashing)
    const createdUsers = [];
    for (const p of players) {
      const user = await User.create({
        ...p,
        avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${p.username}`,
        xp: Math.floor(Math.random() * 500) + 100,
        stats: { matchesPlayed: 0, wins: 0, losses: 0, draws: 0, streak: 0 },
      });
      createdUsers.push(user);
      console.log(`👤 Created: ${p.username} (${p.email})`);
    }

    console.log("");

    // 3. Fetch some real question IDs for match responses
    const sampleQuestions = await Question.find().limit(20).select("_id");
    const qIds = sampleQuestions.map(q => q._id);

    // 4. Create matches
    const baseDate = new Date("2026-03-10T10:00:00Z");

    for (let i = 0; i < matchDefs.length; i++) {
      const md = matchDefs[i];
      const u1 = createdUsers[md.p1];
      const u2 = createdUsers[md.p2];
      const duration = md.mode === "rapid" ? 90 : 60;

      // Generate realistic response data
      const p1Answered = Math.floor(md.p1Acc / 10) + Math.floor(Math.random() * 3);
      const p2Answered = Math.floor(md.p2Acc / 10) + Math.floor(Math.random() * 3);
      const p1Correct = Math.round(p1Answered * md.p1Acc / 100);
      const p2Correct = Math.round(p2Answered * md.p2Acc / 100);
      const p1Wrong = p1Answered - p1Correct;
      const p2Wrong = p2Answered - p2Correct;

      // Generate per-question response times (1-8 seconds)
      const makeResponses = (count, correct) => {
        const resps = [];
        let correctLeft = correct;
        for (let j = 0; j < count; j++) {
          const isCorrect = correctLeft > 0 && (Math.random() < 0.7 || j >= count - correctLeft);
          if (isCorrect) correctLeft--;
          resps.push({
            questionId: qIds[j % qIds.length] || null,
            optionSelected: isCorrect ? 1 : Math.floor(Math.random() * 4),
            correct: isCorrect,
            responseTime: parseFloat((1 + Math.random() * 7).toFixed(1)),
          });
        }
        return resps;
      };

      const p1Responses = makeResponses(p1Answered, p1Correct);
      const p2Responses = makeResponses(p2Answered, p2Correct);

      const p1Times = p1Responses.map(r => r.responseTime);
      const p2Times = p2Responses.map(r => r.responseTime);
      const avg = arr => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0;

      // Rating changes (simplified)
      let p1RatingBefore = u1.rating[md.mode] || 1200;
      let p2RatingBefore = u2.rating[md.mode] || 1200;
      let p1Change = md.winner === "player1" ? 16 : md.winner === "draw" ? 2 : -14;
      let p2Change = md.winner === "player2" ? 16 : md.winner === "draw" ? 2 : -14;

      const matchDate = new Date(baseDate.getTime() + i * 3600000); // 1 hour apart

      await Match.create({
        roomId: `test_match_${i + 1}`,
        mode: md.mode,
        subject: md.subject,
        duration,
        player1: {
          userId: u1._id,
          username: u1.username,
          score: md.p1Score,
          accuracy: md.p1Acc,
          avgResponseTime: avg(p1Times),
          fastestResponse: p1Times.length ? Math.min(...p1Times) : 0,
          slowestResponse: p1Times.length ? Math.max(...p1Times) : 0,
          correct: p1Correct,
          wrong: p1Wrong,
          skipped: 20 - p1Answered,
          streak: md.p1Streak,
          ratingBefore: p1RatingBefore,
          ratingAfter: p1RatingBefore + p1Change,
          responses: p1Responses,
        },
        player2: {
          userId: u2._id,
          username: u2.username,
          score: md.p2Score,
          accuracy: md.p2Acc,
          avgResponseTime: avg(p2Times),
          fastestResponse: p2Times.length ? Math.min(...p2Times) : 0,
          slowestResponse: p2Times.length ? Math.max(...p2Times) : 0,
          correct: p2Correct,
          wrong: p2Wrong,
          skipped: 20 - p2Answered,
          streak: md.p2Streak,
          ratingBefore: p2RatingBefore,
          ratingAfter: p2RatingBefore + p2Change,
          responses: p2Responses,
        },
        isBot: false,
        winner: md.winner,
        xpAwarded: { player1: md.p1Score * 2 + md.p1Streak * 5, player2: md.p2Score * 2 + md.p2Streak * 5 },
        status: "completed",
        createdAt: matchDate,
        completedAt: new Date(matchDate.getTime() + duration * 1000),
      });

      console.log(`⚔️  Match ${i + 1}: ${u1.username} vs ${u2.username} → ${md.winner === "draw" ? "DRAW" : md.winner === "player1" ? u1.username + " wins" : u2.username + " wins"} (${md.mode}/${md.subject})`);
    }

    // 5. Update user stats based on matches
    console.log("\n📊 Updating user stats...");
    for (const u of createdUsers) {
      const asP1 = await Match.find({ "player1.userId": u._id, status: "completed" });
      const asP2 = await Match.find({ "player2.userId": u._id, status: "completed" });

      let wins = 0, losses = 0, draws = 0;

      asP1.forEach(m => {
        if (m.winner === "player1") wins++;
        else if (m.winner === "draw") draws++;
        else losses++;
      });

      asP2.forEach(m => {
        if (m.winner === "player2") wins++;
        else if (m.winner === "draw") draws++;
        else losses++;
      });

      const total = wins + losses + draws;
      await User.findByIdAndUpdate(u._id, {
        $set: {
          "stats.matchesPlayed": total,
          "stats.wins": wins,
          "stats.losses": losses,
          "stats.draws": draws,
          "stats.streak": wins > losses ? Math.min(wins, 3) : 0,
        },
      });

      console.log(`   ${u.username}: ${total} matches (${wins}W ${losses}L ${draws}D)`);
    }

    // Summary
    console.log("\n═══════════════════════════════════════════");
    console.log("📋 LOGIN CREDENTIALS (all passwords: Test@1234)");
    console.log("═══════════════════════════════════════════");
    players.forEach(p => {
      console.log(`   ${p.username.padEnd(14)} → ${p.email.padEnd(24)} Blitz:${p.rating.blitz}  Rapid:${p.rating.rapid}`);
    });

    console.log("\n🎮 RECOMMENDED MATCHMAKING TEST PAIRS:");
    console.log("───────────────────────────────────────────");
    console.log("   Close match:  aarav_dev  (1580) vs sneha_rs   (1450) — Blitz");
    console.log("   Skill gap:    priya_codes(1720) vs arjun_n    (1200) — Blitz");
    console.log("   Even match:   kavya_i    (1650) vs priya_codes(1720) — Rapid");
    console.log("   Low ELO:      arjun_n    (1200) vs vikram_j   (1100) — Blitz");
    
    console.log("\n✨ Seed completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
