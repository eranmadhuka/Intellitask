import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api/reminders";
const ReminderContext = createContext(undefined);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminders must be used within a ReminderProvider");
  }
  return context;
};

const ReminderProvider = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const [reminders, setReminders] = useState([]);

  const fetchReminders = useCallback(async () => {
    if (!currentUser) {
      console.warn("No user authenticated, skipping fetchReminders");
      return;
    }
    try {
      const response = await axios.get("http://localhost:3001/api/reminders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      if (error.response?.status === 401) {
        logout();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Your session has expired. Please log in again.");
      }
      throw new Error(
        error.response?.data?.error || "Failed to fetch reminders"
      );
    }
  }, [currentUser, logout]);

  const getReminderById = useCallback(
    async (id) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        const response = await axios.get(
          `http://localhost:3001/api/reminders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        return {
          ...response.data,
          category: response.data.category || "",
        };
      } catch (error) {
        console.error("Error fetching reminder by ID:", error);
        if (error.response?.status === 401) {
          logout();
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(
          error.response?.data?.error || "Failed to fetch reminder"
        );
      }
    },
    [currentUser, logout]
  );

  const addReminder = useCallback(
    async (reminder) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        // Combine date and time into dueDate if provided
        const dueDate =
          reminder.date && reminder.time
            ? new Date(`${reminder.date}T${reminder.time}`).toISOString()
            : reminder.dueDate || null;
        const response = await axios.post(
          "http://localhost:3001/api/reminders/",
          { ...reminder, dueDate, userId: currentUser.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReminders((prev) => [...prev, response.data]);
      } catch (error) {
        console.error("Error adding reminder:", error);
        if (error.response?.status === 401) {
          logout();
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(
          error.response?.data?.error || "Failed to add reminder"
        );
      }
    },
    [currentUser, logout]
  );

  const updateReminder = useCallback(
    async (id, updatedReminder) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        // Combine date and time into dueDate if provided
        const dueDate =
          updatedReminder.date && updatedReminder.time
            ? new Date(
                `${updatedReminder.date}T${updatedReminder.time}`
              ).toISOString()
            : updatedReminder.dueDate || null;
        const response = await axios.put(
          `http://localhost:3001/api/reminders/${id}`,
          { ...updatedReminder, dueDate, userId: currentUser.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder._id === id ? response.data : reminder
          )
        );
      } catch (error) {
        console.error("Error updating reminder:", error);
        if (error.response?.status === 401) {
          logout();
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(
          error.response?.data?.error || "Failed to update reminder"
        );
      }
    },
    [currentUser, logout]
  );

  const deleteReminder = useCallback(
    async (id) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        await axios.delete(`http://localhost:3001/api/reminders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setReminders((prev) => prev.filter((reminder) => reminder._id !== id));
      } catch (error) {
        console.error("Error deleting reminder:", error);
        if (error.response?.status === 401) {
          logout();
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(
          error.response?.data?.error || "Failed to delete reminder"
        );
      }
    },
    [currentUser, logout]
  );

  const toggleComplete = useCallback(
    async (id) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        const reminder = reminders.find((r) => r._id === id);
        if (!reminder) throw new Error("Reminder not found");
        const response = await axios.patch(
          `http://localhost:3001/api/reminders/${id}/completed`,
          { completed: !reminder.completed },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReminders((prev) =>
          prev.map((r) => (r._id === id ? response.data : r))
        );
      } catch (error) {
        console.error("Error toggling reminder completion:", error);
        if (error.response?.status === 401) {
          logout();
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(
          error.response?.data?.error || "Failed to toggle completion"
        );
      }
    },
    [currentUser, reminders, logout]
  );

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      reminders,
      fetchReminders,
      getReminderById,
      addReminder,
      updateReminder,
      deleteReminder,
      toggleComplete,
    }),
    [
      reminders,
      fetchReminders,
      getReminderById,
      addReminder,
      updateReminder,
      deleteReminder,
      toggleComplete,
    ]
  );

  return (
    <ReminderContext.Provider value={contextValue}>
      {children}
    </ReminderContext.Provider>
  );
};

export default ReminderProvider;
