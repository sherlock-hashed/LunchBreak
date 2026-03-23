const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Question text is required"],
        trim: true,
    },
    options: {
        type: [String],
        required: [true, "Options are required"],
        validate: {
            validator: function (v) {
                return v.length === 4;
            },
            message: "Exactly 4 options are required",
        },
    },
    correct: {
        type: Number,
        required: [true, "Correct answer index is required"],
        min: 0,
        max: 3,
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
        enum: ["OS", "DBMS", "CN", "OOPs"],
    },
    topic: {
        type: String,
        required: [true, "Topic is required"],
        trim: true,
    },
    difficulty: {
        type: String,
        required: [true, "Difficulty is required"],
        enum: ["Easy", "Medium", "Hard"],
    },
    type: {
        type: String,
        required: [true, "Question type is required"],
        enum: ["MCQ", "MSQ", "Case Based Scenario"],
        default: "MCQ",
    },
    source: {
        type: String,
        default: "",
    },
    tags: {
        type: [String],
        default: [],
    },
    explanation: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient filtering
QuestionSchema.index({ subject: 1, topic: 1, difficulty: 1, type: 1 });

module.exports = mongoose.model("Question", QuestionSchema);
