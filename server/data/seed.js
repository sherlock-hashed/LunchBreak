const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const Question = require("../models/Question");
const User = require("../models/User");

const connectDB = require("../config/db");

const seedQuestions = async () => {
    const questionsDir = path.join(__dirname, "questions");
    const files = ["os.json", "dbms.json", "cn.json", "oops.json"];

    let totalInserted = 0;

    for (const file of files) {
        const filePath = path.join(questionsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        console.log(`📄 Loaded ${data.length} questions from ${file}`);

        await Question.insertMany(data, { ordered: false }).catch((err) => {
            if (err.code === 11000) {
                console.log(`   ⚠️  Some duplicates skipped in ${file}`);
            } else {
                throw err;
            }
        });

        totalInserted += data.length;
    }

    return totalInserted;
};

const seedTestUser = async () => {
    const existingUser = await User.findOne({ email: "testplayer@csclash.com" });
    if (existingUser) {
        console.log("👤 Test user already exists, skipping...");
        return;
    }

    await User.create({
        name: "Test Player",
        username: "test_player",
        email: "testplayer@csclash.com",
        password: "testpassword123",
        gender: "male",
        rating: { blitz: 1200, rapid: 1200, arena: 1200 },
        peakRating: { blitz: 1200, rapid: 1200, arena: 1200 },
        stats: {
            wins: 15,
            losses: 8,
            draws: 2,
            streak: 3,
            matchesPlayed: 25,
        },
    });

    console.log("👤 Test user created: testplayer@csclash.com / testpassword123");
};

const seed = async () => {
    try {
        await connectDB();
        console.log("\n🌱 Starting seed process...\n");

        // Clear existing questions
        await Question.deleteMany({});
        console.log("🗑️  Cleared existing questions\n");

        // Seed questions
        const count = await seedQuestions();
        console.log(`\n✅ Seeded ${count} questions total\n`);

        // Seed test user
        await seedTestUser();

        // Print summary
        const subjectCounts = await Question.aggregate([
            { $group: { _id: "$subject", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        console.log("\n📊 Question Summary:");
        console.log("─────────────────────");
        subjectCounts.forEach((s) => {
            console.log(`   ${s._id}: ${s.count} questions`);
        });

        const typeCounts = await Question.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        console.log("\n📝 Question Types:");
        console.log("─────────────────────");
        typeCounts.forEach((t) => {
            console.log(`   ${t._id}: ${t.count}`);
        });

        const total = await Question.countDocuments();
        console.log(`\n🎯 Total questions in DB: ${total}`);
        console.log("\n✨ Seed completed successfully!\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seed();
