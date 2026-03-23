/**
 * Shuffle correct answer positions across all question JSON files.
 * 
 * For each question:
 *   1. Identify which option text is the correct answer
 *   2. Fisher-Yates shuffle the options array
 *   3. Update the `correct` index to point to the new position of the correct text
 * 
 * This ensures an approximately even distribution of correct answers across A/B/C/D.
 */

const fs = require("fs");
const path = require("path");

const questionsDir = path.join(__dirname, "questions");
const files = ["os.json", "dbms.json", "cn.json", "oops.json"];

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let grandBefore = [0, 0, 0, 0];
let grandAfter = [0, 0, 0, 0];

files.forEach((file) => {
  const filePath = path.join(questionsDir, file);
  const questions = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const beforeCounts = [0, 0, 0, 0];
  const afterCounts = [0, 0, 0, 0];

  questions.forEach((q) => {
    beforeCounts[q.correct]++;

    // Get the correct answer text BEFORE shuffling
    const correctText = q.options[q.correct];

    // Shuffle options
    q.options = shuffle(q.options);

    // Find where the correct answer text ended up
    q.correct = q.options.indexOf(correctText);

    afterCounts[q.correct]++;
  });

  grandBefore = grandBefore.map((v, i) => v + beforeCounts[i]);
  grandAfter = grandAfter.map((v, i) => v + afterCounts[i]);

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), "utf-8");

  console.log(`${file} (${questions.length} questions):`);
  console.log(`  BEFORE: A=${beforeCounts[0]} B=${beforeCounts[1]} C=${beforeCounts[2]} D=${beforeCounts[3]}`);
  console.log(`  AFTER:  A=${afterCounts[0]} B=${afterCounts[1]} C=${afterCounts[2]} D=${afterCounts[3]}`);
  console.log();
});

console.log("═══════════════════════════════");
console.log("GRAND TOTAL:");
console.log(`  BEFORE: A=${grandBefore[0]} B=${grandBefore[1]} C=${grandBefore[2]} D=${grandBefore[3]}`);
console.log(`  AFTER:  A=${grandAfter[0]} B=${grandAfter[1]} C=${grandAfter[2]} D=${grandAfter[3]}`);
console.log("\n✅ All question files shuffled successfully!");
console.log("📌 Now re-run the seed script: node server/data/seed.js");
