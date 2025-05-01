import React, { useState, useEffect } from "react";
import { TrashIcon } from "lucide-react";
import axios from "axios";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";

const Notifications = () => {
  const [completedReminders, setCompletedReminders] = useState([]);

  // Fetch completed reminders
  useEffect(() => {
    fetchCompletedReminders();
  }, []);

  const fetchCompletedReminders = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/reminders/");
      const completed = response.data.filter(
        (reminder) => reminder.completed === true
      );
      setCompletedReminders(completed);
    } catch (error) {
      console.error("Error fetching completed reminders:", error);
    }
  };

  // Handle reminder delete
  const handleDeleteReminder = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/reminders/${id}`);
      setCompletedReminders((prevReminders) =>
        prevReminders.filter((reminder) => reminder._id !== id)
      );
    } catch (error) {
      console.error("Error deleting reminder:", error);
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
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">
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

          {/* Notifications List */}
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
