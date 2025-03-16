import React, { useState } from "react";

import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";

const AddTask = ({ onAddTask }) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const titleRegex = /^[a-zA-Z0-9 ]{3,50}$/;
    if (!task.title.trim()) {
      setError("Title is required.");
      return false;
    }
    if (!titleRegex.test(task.title)) {
      setError(
        "Title must be 3-50 characters long and contain only letters, numbers, and spaces."
      );
      return false;
    }
    if (!task.description.trim()) {
      setError("Description is required.");
      return false;
    }
    if (task.description.length < 10 || task.description.length > 100) {
      setError("Description must be between 10 and 100 characters.");
      return false;
    }
    if (!task.dueDate) {
      setError("Due Date is required.");
      return false;
    }
    const currentDate = new Date().toISOString().split("T")[0];
    if (task.dueDate < currentDate) {
      setError("Due Date cannot be in the past.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onAddTask(task);
    setTask({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
    });
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-customDark font-semibold text-2xl dark:text-gray-300 mt-5">
          Dashboard
        </h1>
        <p className="text-customGray text-sm">
          Welcome to Learning Management Dashboard.
        </p>
      </div>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add Task</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Title:</label>
            <input
              type="text"
              name="title"
              value={task.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Description:</label>
            <textarea
              name="description"
              value={task.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700">Priority:</label>
            <select
              name="priority"
              value={task.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Due Date:</label>
            <input
              type="date"
              name="dueDate"
              value={task.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Add Task
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddTask;
