const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true,
    },
    username: {
        type: String,
        required: [true, "Please add a username"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please add a valid email"],
    },
    password: {
        type: String,
        minlength: 8,
        select: false,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    avatar: {
        type: String,
    },
    college: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        maxlength: 200,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    googleId: {
        type: String,
        default: null,
    },
    socials: {
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        instagram: { type: String, default: "" },
    },
    rating: {
        blitz: { type: Number, default: 1200 },
        rapid: { type: Number, default: 1200 },
        arena: { type: Number, default: 1200 },
    },
    peakRating: {
        blitz: { type: Number, default: 1200 },
        rapid: { type: Number, default: 1200 },
        arena: { type: Number, default: 1200 },
    },
    xp: { type: Number, default: 0 },
    stats: {
        matchesPlayed: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
    },
    subjectStats: {
        OS: {
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
        DBMS: {
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
        CN: {
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
        OOPs: {
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
    },
    topicAccuracy: [
        {
            topic: String,
            correct: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Generate default avatar from username
UserSchema.pre("validate", function (next) {
    if (!this.avatar && this.username) {
        this.avatar = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${this.username}`;
    }
    next();
});

// Hash password before save
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT
UserSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

module.exports = mongoose.model("User", UserSchema);
