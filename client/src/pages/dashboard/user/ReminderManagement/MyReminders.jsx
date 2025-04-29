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

const MyReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingId, setEditingId] = useState(undefined);
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedReminders, setSelectedReminders] = useState([]);

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
    console.log("Checking for upcoming reminders every minute"); // Debug log
    const interval = setInterval(() => {
      checkForUpcomingReminders(); // Check for upcoming reminders every minute
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  const closeAlarm = async () => {
    if (activeReminder) {
      try {
        // Mark the reminder as completed (set completed to true)
        await axios.patch(
          `http://localhost:3001/api/reminders/${activeReminder._id}/completed`,
          { completed: true }
        );

        // Refresh reminders to update the state
        fetchReminders();
        //alarmSound.pause();
      } catch (error) {
        console.error("Error marking reminder as completed:", error);
      }

      // Close the active reminder modal
      setActiveReminder(null);
    }
  };

  return (
    <div>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-black">Reminders</h1>
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
                    isSelected={selectedReminders.includes(reminder._id)} // Pass isSelected for selection state
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
      </DashboardLayout>
    </div>
  );
};

export default MyReminders;
