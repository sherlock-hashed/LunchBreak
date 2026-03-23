const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");

// Load env vars — try local first (Docker), then parent (dev monorepo)
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./config/db");
const { initializeSocket } = require("./socket/socketHandler");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true,
    },
});

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "CSClash API is running" });
});

// Initialize Socket.io handler
initializeSocket(io);

// Make io accessible in routes
app.set("io", io);

// ----------------------------------------------------
// Serve React Frontend in Production (Render All-in-One)
// ----------------------------------------------------
if (process.env.NODE_ENV === "production") {
    // Serve static files from the React dist folder
    app.use(express.static(path.join(__dirname, "../dist")));

    // Route all undefined routes to the React index.html for SPA routing
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
    });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
