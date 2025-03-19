const express = require("express");
const Reminder = require("../models/Reminder");

const router = express.Router();

// ✅ Create a new reminder
router.post("/", async (req, res) => {
  try {
    const newReminder = new Reminder(req.body);
    const savedReminder = await newReminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all reminders
router.get("/", async (req, res) => {
  try {
    const reminders = await Reminder.find();
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get a single reminder by ID
router.get("/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update a reminder
router.put("/:id", async (req, res) => {
  try {
    const updatedReminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedReminder)
      return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a reminder
router.delete("/:id", async (req, res) => {
  try {
    const deletedReminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!deletedReminder)
      return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
