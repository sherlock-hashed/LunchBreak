const express = require("express");
const router = express.Router();
const {
    getQuestions,
    getRandomSet,
    addQuestion,
    getTopics,
} = require("../controllers/questionController");
const { protect } = require("../middleware/auth");

router.get("/", getQuestions);
router.get("/random", getRandomSet);
router.get("/topics", getTopics);
router.post("/", protect, addQuestion);

module.exports = router;
