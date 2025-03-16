// routes/task.js
const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Add a new task (protected route)
router.post("/add", auth, async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;

        // Validate required fields
        if (!title || !description || !dueDate) {
            return res.status(400).json({ error: "Title, description, and due date are required" });
        }

        // Create a new task with the user's ID
        const newTask = new Task({
            title,
            description,
            priority: priority || "Medium",
            dueDate,
            status: "To do",
            userId: req.user.id,
        });

        // Save the task to the database
        await newTask.save();

        // Respond with the created task
        res.status(201).json({ message: "Task added successfully", task: newTask });
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({
            error: "Error adding task",
            details: error.message,
        });
    }
});

// Get all tasks
router.get("/tasks", async (req, res) => {
    try {
        // Fetch all tasks, sorted by creation date (newest first)
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({
            error: "Error fetching tasks",
            details: error.message
        });
    }
});

// Update task status
router.patch("/update-status/:id", async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        if (!status || !["To do", "In progress", "Completed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        // Find and update the task
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true } // Return the updated document
        );

        // Check if the task exists
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Respond with the updated task
        res.status(200).json({ message: "Task status updated successfully", task });
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({
            error: "Error updating task status",
            details: error.message
        });
    }
});

// Update task
router.put("/update/:id", async (req, res) => {
    try {
        const { title, description, priority, dueDate, status } = req.body;

        // Validate required fields
        if (!title || !description || !dueDate) {
            return res.status(400).json({ error: "Title, description, and due date are required" });
        }

        // Find and update the task
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, priority, dueDate, status },
            { new: true } // Return the updated document
        );

        // Check if the task exists
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Respond with the updated task
        res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({
            error: "Error updating task",
            details: error.message
        });
    }
});

// Delete task
router.delete("/delete/:id", async (req, res) => {
    try {
        // Find and delete the task
        const task = await Task.findByIdAndDelete(req.params.id);

        // Check if the task exists
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Respond with a success message
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({
            error: "Error deleting task",
            details: error.message
        });
    }
});

module.exports = router;