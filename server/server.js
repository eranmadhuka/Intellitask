require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const transcribeAudio = require("./speechService");

// Import routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoute");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Speech-to-Text Route
app.post("/api/speech-to-text", upload.single("audio"), async (req, res) => {
    try {
        const transcript = await transcribeAudio(req.file.path);
        res.json({ transcript });
    } catch (error) {
        res.status(500).json({ error: "Speech recognition failed" });
    }
});

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));