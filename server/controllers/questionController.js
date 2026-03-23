const Question = require("../models/Question");

// @desc    Get questions with filters + pagination
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res) => {
    try {
        const { subject, topic, difficulty, type, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (subject) filter.subject = subject;
        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;
        if (type) filter.type = type;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Question.countDocuments(filter);
        const questions = await Question.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: questions.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: questions,
        });
    } catch (error) {
        console.error("getQuestions error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get random set of questions for a match
// @route   GET /api/questions/random
// @access  Public
exports.getRandomSet = async (req, res) => {
    try {
        const { subject, count = 10, mode } = req.query;

        const matchStage = {};
        if (subject && subject !== "mixed") {
            matchStage.subject = subject;
        }
        if (mode && mode !== "mixed") {
            matchStage.type = mode;
        }

        const questions = await Question.aggregate([
            { $match: matchStage },
            { $sample: { size: parseInt(count) } },
        ]);

        // Strip "Concept Check: Related to X - " prefix from question text
        const cleaned = questions.map(q => ({
            ...q,
            text: q.text.replace(/^Concept Check:\s*Related to .+?\s*-\s*/i, ""),
        }));

        res.status(200).json({
            success: true,
            count: cleaned.length,
            data: cleaned,
        });
    } catch (error) {
        console.error("getRandomSet error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Add a new question (admin/future use)
// @route   POST /api/questions
// @access  Private
exports.addQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json({ success: true, data: question });
    } catch (error) {
        console.error("addQuestion error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get all unique topics for a subject
// @route   GET /api/questions/topics
// @access  Public
exports.getTopics = async (req, res) => {
    try {
        const { subject } = req.query;
        const matchStage = {};
        if (subject) matchStage.subject = subject;

        const topics = await Question.aggregate([
            { $match: matchStage },
            { $group: { _id: { subject: "$subject", topic: "$topic" }, count: { $sum: 1 } } },
            { $sort: { "_id.subject": 1, "_id.topic": 1 } },
        ]);

        const formatted = topics.map((t) => ({
            subject: t._id.subject,
            topic: t._id.topic,
            count: t.count,
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error("getTopics error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
