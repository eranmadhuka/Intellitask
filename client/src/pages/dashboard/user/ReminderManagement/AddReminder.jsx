import { useState, useEffect } from "react";
import axios from "axios";
import { PlusIcon, CalendarIcon, ClockIcon } from "lucide-react";
import ReminderCard from "./RNComponents/ReminderCard";
import ReminderForm from "./RNComponents/ReminderForm";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";
import ReminderProvider from "./RNContext/ReminderContext";
import { useAuth } from "../../../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const AddReminder = () => {
  const { logout } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingId, setEditingId] = useState(undefined);
  const [countdown, setCountdown] = useState("");
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const todayReminders = reminders.filter((reminder) => {
    const reminderDate = new Date(reminder.dueDate).toISOString().split("T")[0];
    return reminderDate === today && !reminder.completed;
  });

  const upcomingReminders = reminders.filter((reminder) => {
    const reminderDate = new Date(reminder.dueDate).toISOString().split("T")[0];
    return reminderDate > today && !reminder.completed;
  });

  const nearestReminder = [...todayReminders, ...upcomingReminders]
    .filter((r) => !r.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reminders/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReminders(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      if (error.response?.status === 401) {
        logout();
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to fetch reminders. Please try again.");
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!nearestReminder) {
        setCountdown("");
        return;
      }

      const target = new Date(nearestReminder.dueDate);
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown("Due now");
        return;
      }

      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [nearestReminder]);

  const handleEditReminder = (id) => {
    setEditingId(id);
    setShowReminderForm(true);
  };

  const handleDeleteReminder = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/reminders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchReminders();
      setError(null);
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

  const closeForm = () => {
    setShowReminderForm(false);
    setEditingId(undefined);
  };

  return (
    <ReminderProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reminder Dashboard
              </h1>
              <button
                onClick={() => setShowReminderForm(true)}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 shadow-sm"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Reminder
              </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Reminders */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="bg-blue-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Today's Reminders
                    </h2>
                  </div>
                  <span className="bg-blue-200 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {todayReminders.length}
                  </span>
                </div>
                <div className="p-6">
                  {todayReminders.length > 0 ? (
                    todayReminders.map((reminder) => (
                      <ReminderCard
                        key={reminder._id}
                        reminder={{
                          ...reminder,
                          date: new Date(reminder.dueDate)
                            .toISOString()
                            .split("T")[0],
                          time: new Date(reminder.dueDate)
                            .toTimeString()
                            .slice(0, 5),
                        }}
                        onEdit={handleEditReminder}
                        onDelete={handleDeleteReminder}
                        showCheckbox={false}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ClockIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium">
                        No reminders for today
                      </p>
                      <button
                        onClick={() => setShowReminderForm(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Add a reminder
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Reminders */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="bg-purple-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="w-6 h-6 text-purple-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Upcoming Reminders
                    </h2>
                  </div>
                  <span className="bg-purple-200 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    {upcomingReminders.length}
                  </span>
                </div>
                <div className="p-6">
                  {upcomingReminders.length > 0 ? (
                    upcomingReminders.slice(0, 3).map((reminder) => (
                      <ReminderCard
                        key={reminder._id}
                        reminder={{
                          ...reminder,
                          date: new Date(reminder.dueDate)
                            .toISOString()
                            .split("T")[0],
                          time: new Date(reminder.dueDate)
                            .toTimeString()
                            .slice(0, 5),
                        }}
                        onEdit={handleEditReminder}
                        onDelete={handleDeleteReminder}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium">
                        No upcoming reminders
                      </p>
                      <button
                        onClick={() => setShowReminderForm(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Schedule a reminder
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Nearest Reminder Countdown */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="bg-amber-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="w-6 h-6 text-amber-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      {nearestReminder ? (
                        <>
                          Next Reminder In:{" "}
                          <span className="text-blue-600 font-bold animate-pulse">
                            {countdown}
                          </span>
                        </>
                      ) : (
                        "No Upcoming Reminder"
                      )}
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  {nearestReminder ? (
                    <ReminderCard
                      reminder={{
                        ...nearestReminder,
                        date: new Date(nearestReminder.dueDate)
                          .toISOString()
                          .split("T")[0],
                        time: new Date(nearestReminder.dueDate)
                          .toTimeString()
                          .slice(0, 5),
                      }}
                      onEdit={handleEditReminder}
                      onDelete={handleDeleteReminder}
                      showCheckbox={false}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <ClockIcon className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">
                        No upcoming reminders
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Create a new reminder to stay on track!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reminder Form Modal */}
            {showReminderForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
                  <ReminderForm
                    editingId={editingId}
                    onClose={closeForm}
                    onCRUDComplete={() => {
                      fetchReminders();
                      closeForm();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </DashboardLayout>
      </div>
    </ReminderProvider>
  );
};

export default AddReminder;
