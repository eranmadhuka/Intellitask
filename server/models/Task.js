const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["To do", "In progress", "Completed"], default: "To do" },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);