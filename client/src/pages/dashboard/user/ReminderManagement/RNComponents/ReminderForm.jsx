import React, { useState, useEffect } from "react";
import { XIcon } from "lucide-react";
import { useReminders } from "../RNContext/ReminderContext";
import { useAuth } from "../../../../../context/AuthContext";

const ReminderForm = ({ editingId, onClose, onCRUDComplete }) => {
  const { currentUser } = useAuth();
  const { addReminder, updateReminder, getReminderById } = useReminders();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    category: "", // New field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!editingId) {
      const now = new Date();
      const defaultDueDate = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      setFormData((prev) => ({ ...prev, dueDate: defaultDueDate }));
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

        setFormData({
          title: reminderData.title || "",
          description: reminderData.description || "",
          dueDate: reminderData.dueDate
            ? new Date(reminderData.dueDate).toISOString().slice(0, 16)
            : "",
          category: reminderData.category || "", // Load category
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (formData.dueDate && isNaN(new Date(formData.dueDate).getTime())) {
      setError("Invalid due date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const reminderData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
        category: formData.category.trim(), // Include category
      };

      if (editingId) {
        await updateReminder(editingId, reminderData);
      } else {
        await addReminder(reminderData);
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

      <div className="mb-4">
        <label className="block mb-1">Due Date</label>
        <input
          type="datetime-local"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">None</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      <div className="flex justify-end mt-6 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
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
