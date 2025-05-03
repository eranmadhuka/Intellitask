import React, { useState, useEffect } from "react";
import { TrashIcon } from "lucide-react";
import axios from "axios";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";
import { useAuth } from "../../../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const Notifications = () => {
  const { logout } = useAuth();
  const [completedReminders, setCompletedReminders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompletedReminders();
  }, []);

  const fetchCompletedReminders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reminders/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const completed = response.data.filter(
        (reminder) => reminder.completed === true
      );
      setCompletedReminders(completed);
      setError(null);
    } catch (error) {
      console.error("Error fetching completed reminders:", error);
      if (error.response?.status === 401) {
        logout();
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to fetch reminders. Try again.");
      }
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/reminders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCompletedReminders((prev) =>
        prev.filter((reminder) => reminder._id !== id)
      );
    } catch (error) {
      console.error("Error deleting reminder:", error);
      if (error.response?.status === 401) {
        logout();
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to delete reminder. Try again.");
      }
    }
  };

  const handleDownloadReport = () => {
    const csvHeader = "Title,Date\n";
    const csvRows = completedReminders
      .map((reminder) => `"${reminder.title}","${reminder.date}"`)
      .join("\n");
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "completed_reminders_report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md flex justify-between items-center shadow-sm">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-sm font-medium hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Completed Reminders
            </h1>
            {completedReminders.length > 0 && (
              <button
                onClick={handleDownloadReport}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Download Report
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {completedReminders.length > 0 ? (
              completedReminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className="flex justify-between items-center p-4 border-b border-gray-200"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {reminder.title}
                    </h3>
                    <p className="text-sm text-gray-500">{reminder.date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(reminder._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">
                  No completed reminders found
                </h3>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Notifications;
