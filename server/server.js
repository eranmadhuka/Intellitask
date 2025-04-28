const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require('bcryptjs');

// Import routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoute");
const reminderRoutes = require("./routes/reminderRoutes");


dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reminders", reminderRoutes);

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

app.use("/api/auth", require("./routes/authRoutes"));


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
