import React, { useState } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AddTask = ({ onAddTask }) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [isListeningTitle, setIsListeningTitle] = useState(false);
  const [isListeningDescription, setIsListeningDescription] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const startListening = (field, setListeningState) => {
    setListeningState(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTask((prev) => ({ ...prev, [field]: prev[field] + " " + transcript }));
      setListeningState(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListeningState(false);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.title || !task.description || !task.dueDate) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/tasks/add`, task);
      setError("");
      setTask({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
      });
      // Optionally, you can display a success message or redirect the user
      alert("Task added successfully!");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add task");
      console.error("Error adding task:", error);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-customDark font-semibold text-2xl dark:text-gray-300 mt-5">
        Add Task
      </h1>
      <p className="text-customGray text-sm dark:text-gray-400">
        Manage your tasks efficiently with priority levels.
      </p>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 mt-10 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Add Task</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Title:</label>
            <div className="flex">
              <input
                type="text"
                name="title"
                value={task.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              <button
                type="button"
                onClick={() => startListening("title", setIsListeningTitle)}
                className={`ml-2 p-2 rounded transition-all ${isListeningTitle
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  }`}
                title={isListeningTitle ? "Listening..." : "Click to speak"}
              >
                {isListeningTitle ? (
                  <FaMicrophoneSlash className="dark:text-gray-300" />
                ) : (
                  <FaMicrophone className="dark:text-gray-300" />
                )}
              </button>
            </div>
            {isListeningTitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Listening... Speak now.
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Description:</label>
            <div className="flex">
              <textarea
                name="description"
                value={task.description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              ></textarea>
              <button
                type="button"
                onClick={() => startListening("description", setIsListeningDescription)}
                className={`ml-2 p-2 rounded transition-all ${isListeningDescription
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  }`}
                title={isListeningDescription ? "Listening..." : "Click to speak"}
              >
                {isListeningDescription ? (
                  <FaMicrophoneSlash className="dark:text-gray-300" />
                ) : (
                  <FaMicrophone className="dark:text-gray-300" />
                )}
              </button>
            </div>
            {isListeningDescription && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Listening... Speak now.
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Priority:</label>
            <div className="flex space-x-2">
              {["High", "Medium", "Low"].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`px-4 py-2 rounded-md ${task.priority === level
                    ? level === "High"
                      ? "bg-red-500 text-white"
                      : level === "Medium"
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  onClick={() => setTask({ ...task, priority: level })}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Due Date:</label>
            <input
              type="date"
              name="dueDate"
              value={task.dueDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddTask;