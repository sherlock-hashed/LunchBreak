const User = require("../models/User");

// Helper: send token response with cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedToken();

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    // Remove password from output
    const userData = user.toObject();
    delete userData.password;

    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, token, user: userData });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, username, email, password, gender } = req.body;

        // Validate required fields
        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, username, email, and password",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? "email" : "username";
            return res.status(400).json({
                success: false,
                message: `A user with this ${field} already exists`,
            });
        }

        const user = await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            gender: gender || "male",
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "This account uses Google sign-in. Please use Google to login.",
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        res.cookie("token", "none", {
            expires: new Date(Date.now() + 5 * 1000), // 5 seconds
            httpOnly: true,
        });

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Google auth — receive Firebase idToken, verify, find/create user
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
    try {
        const { idToken, name, email, photoURL, uid } = req.body;

        if (!email || !uid) {
            return res.status(400).json({
                success: false,
                message: "Invalid Google auth data",
            });
        }

        // Check if user exists with this email or googleId
        let user = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { googleId: uid }],
        });

        if (user) {
            // Update googleId if not set
            if (!user.googleId) {
                user.googleId = uid;
                await user.save();
            }
        } else {
            // Create new user from Google data
            const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");

            // Ensure unique username
            let finalUsername = username;
            let counter = 1;
            while (await User.findOne({ username: finalUsername })) {
                finalUsername = `${username}_${counter}`;
                counter++;
            }

            user = await User.create({
                name: name || "CSClash Warrior",
                username: finalUsername,
                email: email.toLowerCase(),
                googleId: uid,
                avatar: photoURL || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${finalUsername}`,
                gender: "male", // default for Google auth
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Google auth error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
