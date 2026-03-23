/**
 * One-time script: Remove "Concept Check: " prefix from all question texts in DB.
 * 
 * Run: node server/scripts/cleanQuestionText.js
 */

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const mongoose = require("mongoose");
const Question = require("../models/Question");
const connectDB = require("../config/db");

const PATTERN = /^Concept Check:\s*/i;

const run = async () => {
  await connectDB();

  const questions = await Question.find({ text: { $regex: PATTERN } });

  console.log(`Found ${questions.length} questions with "Concept Check:" prefix.\n`);

  if (questions.length === 0) {
    console.log("Nothing to clean. Exiting.");
    process.exit(0);
  }

  let updated = 0;
  for (const q of questions) {
    const oldText = q.text;
    const newText = oldText.replace(PATTERN, "");
    q.text = newText;
    await q.save({ validateBeforeSave: false });
    updated++;
    console.log(`[${updated}] ${oldText.slice(0, 60)}...  →  ${newText.slice(0, 60)}...`);
  }

  console.log(`\n✅ Done! Updated ${updated} questions.`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
