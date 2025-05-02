import React, { useState } from "react";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { redirect, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const AddTask = ({ onAddTask }) => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    category: "General",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    const trimmedTitle = task.title.trim();
    const trimmedDescription = task.description.trim();

    // Validation checks
    if (trimmedTitle.length < 3 || trimmedTitle.length > 40) {
      setError("Title must be between 3 and 40 characters.");
      return;
    }
    if (trimmedDescription.length < 5 || trimmedDescription.length > 100) {
      setError("Description must be between 5 and 100 characters.");
      return;
    }
    if (!task.dueDate) {
      setError("Due date is required.");
      return;
    }
    if (task.dueDate < today) {
      setError("Due date cannot be in the past.");
      return;
    }
    if (!currentUser || !currentUser.id || !currentUser.token) {
      setError("You must be logged in to add a task.");
      return;
    }

    try {
      const taskData = { ...task, userId: currentUser.id };

      const response = await axios.post(`${API_URL}/api/tasks/add`, taskData, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });

      setError("");
      if (typeof onAddTask === "function") {
        onAddTask(response.data.task);
      }

      setTask({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        category: "General",
      });

      alert("Task added successfully!");
      navigate('/user/dashboard/mytasks')
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to add task";
      setError(errorMessage);
      console.error("Error adding task:", error);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-customDark font-semibold text-2xl dark:text-gray-300 mt-5">
        Add Task
      </h1>
      <p className="text-customGray text-sm dark:text-gray-400">
        Manage your tasks efficiently by adding them manually.
      </p>

      {/* Task Form */}
      <div className="w-full mt-5">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">
            Add New Task
          </h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300">
                Title:
              </label>
              <input
                type="text"
                name="title"
                value={task.title}
                onChange={handleChange}
                maxLength="40"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              <p className="text-sm text-gray-500">{task.title.length}/40</p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300">
                Description:
              </label>
              <textarea
                name="description"
                value={task.description}
                onChange={handleChange}
                maxLength="100"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              ></textarea>
              <p className="text-sm text-gray-500">
                {task.description.length}/100
              </p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300">
                Priority:
              </label>
              <select
                name="priority"
                value={task.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300">
                Due Date:
              </label>
              <input
                type="date"
                name="dueDate"
                value={task.dueDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300">
                Category:
              </label>
              <select
                name="category"
                value={task.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              Add Task
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddTask;