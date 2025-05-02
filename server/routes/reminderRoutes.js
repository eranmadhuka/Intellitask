const express = require("express");
const Reminder = require("../models/Reminder");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new reminder (protected)
router.post("/", auth, async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      userId: req.user.id, // Associate with authenticated user
    };
    const newReminder = new Reminder(reminderData);
    const savedReminder = await newReminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ error: "Error creating reminder", details: error.message });
  }
});

// Get all reminders for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ error: "Error fetching reminders", details: error.message });
  }
});

// Get a single reminder by ID (protected)
router.get("/:id", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(200).json(reminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    res.status(500).json({ error: "Error fetching reminder", details: error.message });
  }
});

// Update a reminder (protected)
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedReminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(200).json(updatedReminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({ error: "Error updating reminder", details: error.message });
  }
});

// Delete a reminder (protected)
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedReminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deletedReminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ error: "Error deleting reminder", details: error.message });
  }
});

// Update the completed status of a reminder (protected)
router.patch("/:id/completed", auth, async (req, res) => {
  try {
    const { completed } = req.body;
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Completed status must be a boolean" });
    }
    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed },
      { new: true }
    );
    if (!updatedReminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(200).json(updatedReminder);
  } catch (error) {
    console.error("Error updating reminder status:", error);
    res.status(500).json({ error: "Error updating reminder status", details: error.message });
  }
});

module.exports = router;