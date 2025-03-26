import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reminderCount, setReminderCount] = useState(0); // State for today's reminder count

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true); // Open sidebar on large screens
      } else {
        setIsSidebarOpen(false); // Close sidebar on smaller screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call it on mount to set initial state

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up event listener
    };
  }, []);

  useEffect(() => {
    fetchReminders(); // Fetch reminders on component mount
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/reminders/");
      const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format
      const todayReminders = response.data.filter(
        (reminder) => reminder.date === today && reminder.completed === false
      );
      setReminderCount(todayReminders.length); // Set today's uncompleted reminder count
    } catch (error) {
      console.error("Error fetching today's reminders:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar with reminder count */}
      <Sidebar isSidebarOpen={isSidebarOpen} reminderCount={reminderCount} />

      <main
        className={`pt-16 min-h-screen dark:bg-gray-900 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="p-6">
          <div className="rounded-lg p-6 min-h-[calc(100vh-theme(spacing.32))] dark:bg-gray-900">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 dark:border-gray-800 border-t p-4 text-center text-gray-600">
          <p>&copy; 2025 Your Company. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
