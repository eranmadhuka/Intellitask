import React, { useEffect, useState } from "react";
import axios from "axios";
import { XIcon } from "lucide-react";
import { useReminders } from "../RNContext/ReminderContext";

const API_URL = "http://localhost:3001/api";

const ReminderForm = ({ editingId, onClose }) => {
  const { addReminder, updateReminder } = useReminders();
  const [tagsInput, setTagsInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    priority: "medium",
    completed: false,
    tags: [],
  });

  const [errors, setErrors] = useState({});

  // Fetch reminder if editing
  useEffect(() => {
    if (editingId) {
      axios
        .get(`${API_URL}/reminders/${editingId}`)
        .then((response) => {
          setFormData(response.data);
          setTagsInput(response.data.tags.join(", "));
        })
        .catch((error) => console.error("Error fetching reminder:", error));
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTagsChange = (e) => {
    setTagsInput(e.target.value);
  };

  // Validate the form
  const validateForm = () => {
    const currentErrors = {};
    const { title, date, time } = formData;

    // Title validation
    if (!title.trim()) currentErrors.title = "Title is required";

    // Date validation (must be today or in the future)
    const today = new Date().toISOString().split("T")[0];
    if (date < today)
      currentErrors.date = "Date must be today or in the future";

    // Time validation based on date selection
    if (date === today) {
      const now = new Date();
      const selectedTime = new Date(`${date}T${time}`);
      if (selectedTime <= now) {
        currentErrors.time = "Time must be in the future for today's date";
      }
    }

    // Tags validation (if any tags are entered, make sure they are non-empty)
    const tagsArray = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    if (tagsArray.length === 0)
      currentErrors.tags = "At least one tag is required";

    setErrors(currentErrors);

    return Object.keys(currentErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const processedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const reminderWithTags = { ...formData, tags: processedTags };

    if (!validateForm()) return;

    try {
      if (editingId) {
        // Update existing reminder
        const response = await axios.put(
          `${API_URL}/reminders/${editingId}`,
          reminderWithTags
        );
        updateReminder(response.data); // Update in context
        alert("Reminder updated successfully!");
      } else {
        // Create new reminder
        const response = await axios.post(
          `${API_URL}/reminders`,
          reminderWithTags
        );
        addReminder(response.data); // Add to context
        alert("Reminder created successfully!");
      }
      onClose();
    } catch (error) {
      console.error("Error saving reminder:", error);
      alert("Failed to save reminder.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Reminder" : "Create New Reminder"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-1"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && (
                <p className="text-red-500 text-xs">{errors.date}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.time && (
                <p className="text-red-500 text-xs">{errors.time}</p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="mb-6">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tagsInput}
              onChange={handleTagsChange}
              required
              placeholder="work, personal, health"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.tags && (
              <p className="text-red-500 text-xs">{errors.tags}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;
