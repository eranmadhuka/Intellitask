import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  FilterIcon,
  CheckSquareIcon,
  TagIcon,
  TrashIcon,
  SearchIcon,
} from "lucide-react";
import ReminderCard from "./RNComponents/ReminderCard";
import ReminderForm from "./RNComponents/ReminderForm";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";
import alarmSoundFile from "../../../../assets/audio/ring.mp3";
import ReminderProvider, { useReminders } from "./RNContext/ReminderContext";
import { useAuth } from "../../../../context/AuthContext";

const MyReminders = () => {
  const { reminders, fetchReminders, deleteReminder, toggleComplete } =
    useReminders();
  const { currentUser, logout } = useAuth();
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingId, setEditingId] = useState(undefined);
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedReminders, setSelectedReminders] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);
  const [alarmSound, setAlarmSound] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sound = new Audio(alarmSoundFile);
    sound.loop = true;
    setAlarmSound(sound);
    return () => {
      sound.pause();
      sound.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setError("Please log in to view your reminders.");
      setIsLoading(false);
      return;
    }
    fetchReminders()
      .then(() => setIsLoading(false))
      .catch(() => {
        setError("Failed to load reminders. Please try again later.");
        setIsLoading(false);
      });
  }, [currentUser, fetchReminders]);

  const checkForUpcomingReminders = () => {
    const now = new Date();
    const upcomingReminder = reminders.find((reminder) => {
      const reminderTime = new Date(reminder.date + "T" + reminder.time);
      return reminderTime > now && reminderTime - now <= 5 * 60 * 1000;
    });

    if (
      upcomingReminder &&
      (!activeReminder || upcomingReminder._id !== activeReminder._id)
    ) {
      setActiveReminder(upcomingReminder);
      alarmSound?.play().catch((err) => console.warn("Autoplay blocked:", err));
    }
  };

  const toggleSelectReminder = (id) => {
    setSelectedReminders((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((reminderId) => reminderId !== id)
        : [...prevSelected, id]
    );
  };

  const deleteSelectedReminders = async () => {
    if (!currentUser) {
      setError("Please log in to perform this action.");
      return;
    }

    try {
      await Promise.all(selectedReminders.map((id) => deleteReminder(id)));
      setSelectedReminders([]);
    } catch (error) {
      console.error("Error deleting reminders:", error);
      if (error.response?.status === 401) {
        logout();
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to delete reminders. Please try again.");
      }
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!currentUser) {
      setError("Please log in to perform this action.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );
    if (!confirmed) return;

    try {
      await deleteReminder(id);
    } catch (error) {
      console.error("Error deleting reminder:", error);
      if (error.response?.status === 401) {
        logout();
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to delete reminder. Please try again.");
      }
    }
  };

  const markAsDone = async () => {
    if (!currentUser) {
      setError("Please log in to perform this action.");
      return;
    }

    try {
      await Promise.all(selectedReminders.map((id) => toggleComplete(id)));
      setSelectedReminders([]);
    } catch (error) {
      console.error("Error marking reminders as done:", error);
      if (error.response?.status === 401) {
        logout();
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to mark reminders as done. Please try again.");
      }
    }
  };

  const handleCRUDComplete = () => {
    fetchReminders();
    closeForm();
  };

  const handleEditReminder = (id) => {
    setEditingId(id);
    setShowReminderForm(true);
  };

  const closeForm = () => {
    setShowReminderForm(false);
    setEditingId(undefined);
  };

  const allTags = Array.from(
    new Set(reminders.flatMap((reminder) => reminder.tags || []))
  ).sort();

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch =
      searchTerm === "" ||
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reminder.description &&
        reminder.description.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesFilter = true;
    if (filterBy === "completed") {
      matchesFilter = reminder.completed;
    } else if (filterBy === "active") {
      matchesFilter = !reminder.completed;
    } else if (["high", "medium", "low"].includes(filterBy)) {
      matchesFilter = reminder.priority === filterBy;
    }

    const matchesTag =
      !selectedTag || (reminder.tags && reminder.tags.includes(selectedTag));
    return matchesSearch && matchesFilter && matchesTag;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    const priorityWeights = { high: 0, medium: 1, low: 2 };

    switch (sortBy) {
      case "date-asc":
        return (
          new Date(a.date + "T" + a.time) - new Date(b.date + "T" + b.time)
        );
      case "date-desc":
        return (
          new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)
        );
      case "priority":
        return priorityWeights[a.priority] - priorityWeights[b.priority];
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpcomingReminders();
    }, 5000);
    return () => clearInterval(interval);
  }, [reminders, activeReminder]);

  const closeAlarm = async () => {
    if (!currentUser) {
      setError("Please log in to perform this action.");
      return;
    }

    if (activeReminder) {
      try {
        await toggleComplete(activeReminder._id);
        alarmSound?.pause();
        alarmSound.currentTime = 0;
        setActiveReminder(null);
      } catch (error) {
        console.error("Error marking reminder as completed:", error);
        if (error.response?.status === 401) {
          logout();
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to mark reminder as completed. Please try again.");
        }
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg flex justify-between items-center shadow-sm">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-900 dark:text-red-300 hover:underline text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Reminders
            </h1>
            <button
              onClick={() => setShowReminderForm(true)}
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 shadow-sm"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Reminder
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search reminders..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-3 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
              </div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-gray-900 dark:text-white"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-gray-900 dark:text-white"
              >
                <option value="date-asc">Date (Asc)</option>
                <option value="date-desc">Date (Desc)</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
            {allTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    !selectedTag
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  } hover:bg-indigo-500 dark:hover:bg-indigo-400 hover:text-white transition-all`}
                >
                  All Tags
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTag === tag
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    } hover:bg-indigo-500 dark:hover:bg-indigo-400 hover:text-white transition-all`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {sortedReminders.length > 0 ? (
              <>
                {selectedReminders.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-6">
                    <button
                      onClick={deleteSelectedReminders}
                      className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600 dark:hover:bg-red-700 transition-all shadow-sm"
                    >
                      <TrashIcon className="w-5 h-5 mr-2" />
                      Delete Selected
                    </button>
                    <button
                      onClick={markAsDone}
                      className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 dark:hover:bg-green-700 transition-all shadow-sm"
                    >
                      <CheckSquareIcon className="w-5 h-5 mr-2" />
                      Mark as Done
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedReminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className="transform transition-all hover:scale-105 duration-200"
                    >
                      <ReminderCard
                        reminder={reminder}
                        onEdit={handleEditReminder}
                        onToggleSelect={toggleSelectReminder}
                        onDelete={handleDeleteReminder}
                        isSelected={selectedReminders.includes(reminder._id)}
                        showCheckbox={true}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CheckSquareIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  No reminders found
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Try changing your filters or search term
                </p>
                <button
                  onClick={() => setShowReminderForm(true)}
                  className="mt-6 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-sm"
                >
                  Create New Reminder
                </button>
              </div>
            )}
          </div>

          {showReminderForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
              <div className="transform transition-all duration-300 scale-100 hover:scale-105">
                <ReminderForm
                  editingId={editingId}
                  onClose={closeForm}
                  onCRUDComplete={handleCRUDComplete}
                />
              </div>
            </div>
          )}

          {activeReminder && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg text-center transform transition-all duration-300 animate-pulse">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                  Reminder Alert!
                </h2>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  {activeReminder.title}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {activeReminder.description}
                </p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Due at {activeReminder.time} on {activeReminder.date}
                </p>
                <button
                  onClick={closeAlarm}
                  className="mt-6 bg-green-500 dark:bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-all w-full shadow-sm"
                >
                  Mark as Done & Stop Alarm
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
};

// Wrap MyReminders with ReminderProvider
const MyRemindersWithProvider = () => (
  <ReminderProvider>
    <MyReminders />
  </ReminderProvider>
);

export default MyRemindersWithProvider;
