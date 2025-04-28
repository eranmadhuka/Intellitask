// routes/task.js
const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");
const nlpService = require("../services/nlpService");
const router = express.Router();

// Add a new task (protected route)
router.post("/add", auth, async (req, res) => {
  try {
    let { title, description, priority, dueDate, status } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Use NLP to analyze and enhance task data
    const nlpAnalysis = nlpService.analyzeTaskText(
      title + " " + (description || "")
    );

    // Apply NLP results if not explicitly provided by user
    if (!priority) {
      priority = nlpAnalysis.priority;
    }

    if (!dueDate && nlpAnalysis.deadline.hasDeadline) {
      dueDate = nlpAnalysis.deadline.date;
    }

    // Add category from NLP analysis
    const category = nlpAnalysis.category;
    const contactPerson = nlpAnalysis.contactPerson;

    // Create a new task with the user's ID and NLP-derived fields
    const newTask = new Task({
      title,
      description: description || "",
      priority: priority || "Medium",
      dueDate,
      status: status || "To do",
      userId: req.user.id,
      category,
      contactPerson,
    });

    // Save the task to the database
    await newTask.save();

    // Respond with the created task and NLP analysis
    res.status(201).json({
      message: "Task added successfully",
      task: newTask,
      nlpAnalysis, // Optionally return NLP analysis for debugging
    });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({
      error: "Error adding task",
      details: error.message,
    });
  }
});

// Process text or voice input to create task
router.post("/process-input", auth, async (req, res) => {
  try {
    const { inputText } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "Input text is required" });
    }

    // Use NLP service to analyze the input text
    const nlpAnalysis = nlpService.analyzeTaskText(inputText);

    // Extract task details from NLP analysis
    const title = inputText.split(".")[0] || inputText; // Use first sentence as title
    const description =
      inputText.length > title.length
        ? inputText.substring(title.length + 1)
        : "";
    const priority = nlpAnalysis.priority;
    const dueDate = nlpAnalysis.deadline.hasDeadline
      ? nlpAnalysis.deadline.date
      : null;
    const category = nlpAnalysis.category;
    const contactPerson = nlpAnalysis.contactPerson;

    // Create a new task with NLP-derived fields
    const newTask = new Task({
      title,
      description,
      priority,
      dueDate,
      status: "To do",
      userId: req.user.id,
      category,
      contactPerson,
    });

    // Save the task to the database
    await newTask.save();

    // Return the processed task and analysis
    res.status(201).json({
      message: "Task processed and created successfully",
      task: newTask,
      nlpAnalysis,
    });
  } catch (error) {
    console.error("Error processing input:", error);
    res.status(500).json({
      error: "Error processing input",
      details: error.message,
    });
  }
});

// Get all tasks
router.get("/tasks", auth, async (req, res) => {
  try {
    // Fetch all tasks for the current user, sorted by creation date (newest first)
    const tasks = await Task.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      error: "Error fetching tasks",
      details: error.message,
    });
  }
});

// Get tasks by category
router.get("/tasks/category/:category", auth, async (req, res) => {
  try {
    const { category } = req.params;
    // Fetch tasks by category for the current user
    const tasks = await Task.find({
      userId: req.user.id,
      category,
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by category:", error);
    res.status(500).json({
      error: "Error fetching tasks by category",
      details: error.message,
    });
  }
});

// Get tasks by priority
router.get("/tasks/priority/:priority", auth, async (req, res) => {
  try {
    const { priority } = req.params;
    // Fetch tasks by priority for the current user
    const tasks = await Task.find({
      userId: req.user.id,
      priority,
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by priority:", error);
    res.status(500).json({
      error: "Error fetching tasks by priority",
      details: error.message,
    });
  }
});

// Update task status
router.patch("/update-status/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !["To do", "In progress", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Find and update the task (ensuring it belongs to the current user)
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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
      details: error.message,
    });
  }
});

// Update task
router.put("/update/:id", auth, async (req, res) => {
  try {
    let {
      title,
      description,
      priority,
      dueDate,
      status,
      category,
      contactPerson,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // If title or description changed, re-analyze with NLP
    const existingTask = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (
      existingTask &&
      (existingTask.title !== title || existingTask.description !== description)
    ) {
      // Re-analyze text with NLP
      const nlpAnalysis = nlpService.analyzeTaskText(
        title + " " + (description || "")
      );

      // Only use NLP results if values not explicitly provided
      if (!priority) {
        priority = nlpAnalysis.priority;
      }

      if (!dueDate && nlpAnalysis.deadline.hasDeadline) {
        dueDate = nlpAnalysis.deadline.date;
      }

      if (!category) {
        category = nlpAnalysis.category;
      }

      if (!contactPerson) {
        contactPerson = nlpAnalysis.contactPerson;
      }
    }

    // Find and update the task (ensuring it belongs to the current user)
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        title,
        description,
        priority,
        dueDate,
        status,
        category,
        contactPerson,
      },
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
      details: error.message,
    });
  }
});

// Delete task
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    // Find and delete the task (ensuring it belongs to the current user)
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

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
      details: error.message,
    });
  }
});

module.exports = router;
