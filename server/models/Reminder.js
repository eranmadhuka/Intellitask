const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: ["Work", "Personal", "Urgent", ""],
    default: "",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reminder", reminderSchema);