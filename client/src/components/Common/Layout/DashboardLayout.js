import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const DashboardLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reminderCount, setReminderCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchReminders();
    }
  }, [currentUser]);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reminders/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const today = new Date().toISOString().split("T")[0];
      const todayReminders = response.data.filter(
        (reminder) =>
          new Date(reminder.dueDate).toISOString().split("T")[0] === today &&
          !reminder.completed
      );
      setReminderCount(todayReminders.length);
      setError(null);
    } catch (error) {
      console.error("Error fetching today's reminders:", error);
      if (error.response?.status === 401) {
        logout();
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to fetch today's reminders. Please try again.");
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar with reminder count */}
      <Sidebar isSidebarOpen={isSidebarOpen} reminderCount={reminderCount} />

      <main
        className={`pt-16 min-h-screen ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
      >
        <div className="p-6">
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
          <div className="rounded-lg p-6 min-h-[calc(100vh-theme(spacing.32))] dark:bg-gray-900">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 dark:border-gray-800 border-t p-4 text-center text-gray-600">
          <p>© 2025 Your Company. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;