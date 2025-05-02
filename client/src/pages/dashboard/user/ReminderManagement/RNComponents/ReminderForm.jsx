import React, { useState, useEffect } from "react";
import { XIcon, TagIcon, PlusIcon } from "lucide-react";
import { useReminders } from "../RNContext/ReminderContext";
import { useAuth } from "../../../../../context/AuthContext";

const ReminderForm = ({ editingId, onClose, onCRUDComplete }) => {
  const { currentUser } = useAuth();
  const { addReminder, updateReminder, getReminderById } = useReminders();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    priority: "medium",
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!editingId) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      setFormData((prev) => ({ ...prev, date: today, time: currentTime }));
      setIsInitialized(true);
    }
  }, [editingId]);

  useEffect(() => {
    const loadReminder = async () => {
      if (!editingId || !currentUser) return;

      try {
        setLoading(true);
        setError("");
        const reminderData = await getReminderById(editingId);

        if (!reminderData) throw new Error("Reminder not found");

        setFormData((prev) => {
          const newData = {
            title: reminderData.title || "",
            description: reminderData.description || "",
            date: reminderData.date || "",
            time: reminderData.time || "",
            priority: reminderData.priority || "medium",
            tags: Array.isArray(reminderData.tags) ? reminderData.tags : [],
          };
          if (
            prev.title !== newData.title ||
            prev.description !== newData.description ||
            prev.date !== newData.date ||
            prev.time !== newData.time ||
            prev.priority !== newData.priority ||
            JSON.stringify(prev.tags) !== JSON.stringify(newData.tags)
          ) {
            return newData;
          }
          return prev;
        });
      } catch (err) {
        setError(err.message || "Failed to load reminder data.");
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadReminder();
  }, [editingId, currentUser, getReminderById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    let isValidDate = dateRegex.test(formData.date);
    if (!isValidDate) {
      try {
        const d = new Date(formData.date);
        if (!isNaN(d.getTime())) {
          setFormData((prev) => ({
            ...prev,
            date: d.toISOString().split("T")[0],
          }));
          isValidDate = true;
        }
      } catch {}
    }
    if (!isValidDate) {
      setError("Invalid date format.");
      return false;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    let isValidTime = timeRegex.test(formData.time);
    if (!isValidTime) {
      try {
        const t = new Date(`2000-01-01T${formData.time}`);
        if (!isNaN(t.getTime())) {
          setFormData((prev) => ({
            ...prev,
            time: `${String(t.getHours()).padStart(2, "0")}:${String(
              t.getMinutes()
            ).padStart(2, "0")}`,
          }));
          isValidTime = true;
        }
      } catch {}
    }
    if (!isValidTime) {
      setError("Invalid time format.");
      return false;
    }

    if (!["low", "medium", "high"].includes(formData.priority)) {
      setError("Invalid priority.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in.");
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      if (editingId) {
        await updateReminder(editingId, formData);
      } else {
        await addReminder(formData);
      }

      onCRUDComplete();
    } catch (err) {
      setError(err.message || "Failed to save reminder.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isInitialized && editingId) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4">Loading reminder...</p>
      </div>
    );
  }

  if (error && editingId && !isInitialized) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Error</h2>
          <button onClick={onClose}>
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-4 text-red-600">{error}</p>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl max-w-lg w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {editingId ? "Edit Reminder" : "New Reminder"}
        </h2>
        <button onClick={onClose} type="button">
          <XIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="mb-4">
        <label className="block mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Add tag"
          />
          <button
            type="button"
            onClick={addTag}
            className="bg-indigo-600 text-white px-3 py-2 rounded"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
            >
              <TagIcon className="w-4 h-4" />
              {tag}
              <XIcon
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {editingId ? "Updating..." : "Creating..."}
            </span>
          ) : editingId ? (
            "Update Reminder"
          ) : (
            "Create Reminder"
          )}
        </button>
      </div>
    </form>
  );
};

export default ReminderForm;
