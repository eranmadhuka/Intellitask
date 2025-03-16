import React, { useState, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaRobot } from "react-icons/fa";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const AddTask = ({ onAddTask }) => {
  const { currentUser, loading } = useAuth();
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    category: "General", // New field
  });
  const [error, setError] = useState("");
  const [isListeningTitle, setIsListeningTitle] = useState(false);
  const [isListeningDescription, setIsListeningDescription] = useState(false);
  const [isListeningVoiceCommand, setIsListeningVoiceCommand] = useState(false);
  const [voiceCommandText, setVoiceCommandText] = useState("");
  const [nlpAnalysis, setNlpAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNlpDetails, setShowNlpDetails] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = React.useRef(null);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const startListening = (field, setListeningState) => {
    setListeningState(true);
    recognitionRef.current.start();

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTask((prev) => ({ ...prev, [field]: prev[field] + " " + transcript }));
      setListeningState(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListeningState(false);
    };
  };

  const startListeningVoiceCommand = () => {
    setIsListeningVoiceCommand(true);
    setVoiceCommandText("");

    recognitionRef.current = new SpeechRecognition();
    const voiceRecognition = recognitionRef.current;
    voiceRecognition.continuous = true;
    voiceRecognition.lang = "en-US";
    voiceRecognition.start();

    voiceRecognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(" ");

      setVoiceCommandText(transcript);
    };

    voiceRecognition.onend = () => {
      setIsListeningVoiceCommand(false);
    };

    // Stop listening after 10 seconds if user doesn't stop manually
    setTimeout(() => {
      if (voiceRecognition) {
        voiceRecognition.stop();
      }
    }, 10000);

    return voiceRecognition;
  };

  const stopListeningVoiceCommand = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListeningVoiceCommand(false);

    if (voiceCommandText) {
      processVoiceCommand(voiceCommandText);
    }
  };

  const processVoiceCommand = async (text) => {
    if (!text || !currentUser?.token) return;

    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/tasks/process-input`,
        { inputText: text },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );

      setNlpAnalysis(response.data.nlpAnalysis);

      // Update the form with processed data
      setTask({
        title: response.data.task.title || "",
        description: response.data.task.description || "",
        priority: response.data.task.priority || "Medium",
        dueDate: response.data.task.dueDate ? new Date(response.data.task.dueDate).toISOString().split('T')[0] : "",
        category: response.data.task.category || "General"
      });

      setShowNlpDetails(true);

      // If the task was automatically created, notify the user
      if (typeof onAddTask === "function") {
        onAddTask(response.data);
        alert("Task created successfully with smart prioritization!");
      }

    } catch (error) {
      console.error("Error processing voice command:", error);
      setError("Failed to process voice command. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.title) {
      setError("Title is required");
      return;
    }

    if (loading) {
      setError("Loading user data...");
      return;
    }

    if (!currentUser || !currentUser.token) {
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
        onAddTask(response.data);
      }

      // Store NLP analysis for display
      setNlpAnalysis(response.data.nlpAnalysis);

      setTask({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        category: "General"
      });

      alert("Task added successfully!");
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError(error.response?.data?.message || "Failed to add task");
      }
      console.error("Error adding task:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <h1 className="text-customDark font-semibold text-2xl dark:text-gray-300 mt-5">
        Add Task
      </h1>
      <p className="text-customGray text-sm dark:text-gray-400">
        Manage your tasks efficiently with smart prioritization.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Voice Command Section */}
        <div className="w-full">
          <div className="bg-indigo-50 dark:bg-gray-700 p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-300 flex items-center">
              <FaRobot className="mr-2" /> Voice/Text Smart Processing
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Speak or type your task naturally. Our AI will automatically detect priorities, deadlines, and categories.
            </p>

            <div className="relative">
              <textarea
                value={voiceCommandText}
                onChange={(e) => setVoiceCommandText(e.target.value)}
                placeholder="Example: 'Remind me to call John tomorrow at 2 PM' or 'Important presentation for the marketing team due next Friday'"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 mb-2"
                rows={3}
              ></textarea>

              <button
                type="button"
                onClick={() => {
                  if (isListeningVoiceCommand) {
                    stopListeningVoiceCommand();
                  } else {
                    const recognition = startListeningVoiceCommand();
                    setIsListeningVoiceCommand(true);
                  }
                }}
                className={`absolute top-2 right-2 p-2 rounded-full transition-all ${isListeningVoiceCommand
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-indigo-100 hover:bg-indigo-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  }`}
                disabled={isProcessing}
              >
                {isListeningVoiceCommand ? (
                  <FaMicrophoneSlash className="dark:text-gray-100" />
                ) : (
                  <FaMicrophone className="text-indigo-500 dark:text-indigo-300" />
                )}
              </button>
            </div>

            {isListeningVoiceCommand && (
              <p className="text-sm text-indigo-500 dark:text-indigo-300 my-2 animate-pulse">
                Listening... Speak your task now.
              </p>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => processVoiceCommand(voiceCommandText)}
                className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition dark:bg-indigo-600 dark:hover:bg-indigo-700 flex-1 mr-2"
                disabled={isProcessing || !voiceCommandText.trim()}
              >
                {isProcessing ? "Processing..." : "Process Task"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setVoiceCommandText("");
                  setNlpAnalysis(null);
                  setShowNlpDetails(false);
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                disabled={isProcessing}
              >
                Clear
              </button>
            </div>
          </div>

          {/* NLP Analysis Results */}
          {nlpAnalysis && showNlpDetails && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 border-l-4 border-indigo-500">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700 dark:text-gray-300">
                  Smart Analysis Results
                </h3>
                <button
                  onClick={() => setShowNlpDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Hide
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600 dark:text-gray-400">Priority:</div>
                <div className={`font-medium ${nlpAnalysis.priority === 'High' ? 'text-red-500' :
                  nlpAnalysis.priority === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                  {nlpAnalysis.priority}
                </div>

                <div className="text-gray-600 dark:text-gray-400">Category:</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {nlpAnalysis.category}
                </div>

                {nlpAnalysis.deadline?.hasDeadline && (
                  <>
                    <div className="text-gray-600 dark:text-gray-400">Deadline:</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {nlpAnalysis.deadline.text ||
                        (nlpAnalysis.deadline.date && new Date(nlpAnalysis.deadline.date).toLocaleDateString())}
                    </div>
                  </>
                )}

                {nlpAnalysis.contactPerson && (
                  <>
                    <div className="text-gray-600 dark:text-gray-400">Contact:</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {nlpAnalysis.contactPerson}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Regular Task Form */}
        <div className="w-full">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Add Task Manually</h2>
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
                <label className="block text-gray-700 dark:text-gray-300">Due Date:</label>
                <input
                  type="date"
                  name="dueDate"
                  value={task.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300">Category:</label>
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
      </div>
    </DashboardLayout>
  );
};

export default AddTask;