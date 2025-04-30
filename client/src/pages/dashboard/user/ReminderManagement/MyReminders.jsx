import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  FilterIcon,
  CheckSquareIcon,
  TagIcon,
  TrashIcon,
} from "lucide-react";
import ReminderCard from "./RNComponents/ReminderCard";
import ReminderForm from "./RNComponents/ReminderForm";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";
import alarmSoundFile from "../../../../assets/audio/ring.mp3";
import ReminderProvider from "./RNContext/ReminderContext";

const MyReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingId, setEditingId] = useState(undefined);
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedReminders, setSelectedReminders] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);
  const [alarmSound, setAlarmSound] = useState(null);

  useEffect(() => {
    const sound = new Audio(alarmSoundFile);
    sound.loop = true; // repeat the sound until dismissed
    setAlarmSound(sound);
  }, []);

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

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/reminders/");
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      const todayReminders = response.data.filter(
        (reminder) => reminder.date === today && reminder.completed === false // Filter for today's date and completed = false
      );
      setReminders(todayReminders); // Set today's uncompleted reminders
    } catch (error) {
      console.error("Error fetching today's reminders:", error);
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
    try {
      await Promise.all(
        selectedReminders.map((id) =>
          axios.delete(`http://localhost:3001/api/reminders/${id}`)
        )
      );
      fetchReminders(); // Refresh reminders after deletion
      setSelectedReminders([]); // Clear selected reminders
    } catch (error) {
      console.error("Error deleting reminders:", error);
    }
  };
  const handleDeleteReminder = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3001/api/reminders/${id}`);
      fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const markAsDone = async () => {
    try {
      await Promise.all(
        selectedReminders.map((id) =>
          axios.patch(`http://localhost:3001/api/reminders/${id}/completed`, {
            completed: true,
          })
        )
      );
      fetchReminders(); // Refresh reminders after marking as done
      setSelectedReminders([]); // Clear selected reminders
    } catch (error) {
      console.error("Error marking reminders as done:", error);
    }
  };

  // Handle CRUD operation completion
  const handleCRUDComplete = () => {
    fetchReminders(); // Auto-refresh reminders
    closeForm(); // Close the form after completion
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
    new Set(reminders.flatMap((reminder) => reminder.tags))
  ).sort();

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch =
      searchTerm === "" ||
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterBy === "completed") {
      matchesFilter = reminder.completed;
    } else if (filterBy === "active") {
      matchesFilter = !reminder.completed;
    } else if (["high", "medium", "low"].includes(filterBy)) {
      matchesFilter = reminder.priority === filterBy;
    }

    const matchesTag = !selectedTag || reminder.tags.includes(selectedTag);
    return matchesSearch && matchesFilter && matchesTag;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
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
        return (
          { high: 0, medium: 1, low: 2 }[a.priority] -
          { high: 0, medium: 1, low: 2 }[b.priority]
        );
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  useEffect(() => {
    console.log("Checking for upcoming reminders every 5 seconds");
    const interval = setInterval(() => {
      checkForUpcomingReminders(); // 🔔 checks more frequently
    }, 5000); // ✅ 5000 ms = 5 seconds

    return () => clearInterval(interval);
  }, [reminders, activeReminder]); // track activeReminder to avoid duplicates

  const closeAlarm = async () => {
    if (activeReminder) {
      try {
        await axios.patch(
          `http://localhost:3001/api/reminders/${activeReminder._id}/completed`,
          { completed: true }
        );
        fetchReminders();
      } catch (error) {
        console.error("Error marking reminder as completed:", error);
      }

      // 🛑 Stop the alarm
      alarmSound?.pause();
      alarmSound.currentTime = 0;

      setActiveReminder(null);
    }
  };

  return (
    <ReminderProvider>
      <div>
        <DashboardLayout>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Reminders</h1>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search reminders..."
                className="flex-grow pl-4 pr-10 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div className="space-y-4">
              {sortedReminders.length > 0 ? (
                <>
                  {selectedReminders.length > 0 && (
                    <div className="flex space-x-4 mb-4">
                      <button
                        onClick={deleteSelectedReminders}
                        className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </button>

                      <button
                        onClick={markAsDone} // Function to mark selected reminders as done
                        className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <CheckSquareIcon className="w-4 h-4 mr-2" />
                        Done
                      </button>
                    </div>
                  )}

                  {sortedReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder._id}
                      reminder={reminder}
                      onEdit={handleEditReminder}
                      onToggleSelect={toggleSelectReminder}
                      onDelete={handleDeleteReminder}
                      isSelected={selectedReminders.includes(reminder._id)}
                      showCheckbox={true}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <CheckSquareIcon className="w-8 h-8 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No reminders found
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Try changing your filters or search term
                  </p>
                  <button
                    onClick={() => setShowReminderForm(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    New Reminder
                  </button>
                </div>
              )}
            </div>

            {showReminderForm && (
              <ReminderForm
                editingId={editingId}
                onClose={closeForm}
                onCRUDComplete={handleCRUDComplete} // Refresh after form submission
              />
            )}
          </div>
          {activeReminder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Reminder Alert!
                </h2>
                <p className="text-lg font-medium">{activeReminder.title}</p>
                <p className="text-sm text-gray-600">
                  {activeReminder.description}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Due at {activeReminder.time} on {activeReminder.date}
                </p>
                <button
                  onClick={closeAlarm}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Mark as Done & Stop Alarm
                </button>
              </div>
            </div>
          )}
        </DashboardLayout>
      </div>
    </ReminderProvider>
  );
};

export default MyReminders;
