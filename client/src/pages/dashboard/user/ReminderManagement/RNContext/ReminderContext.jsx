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

const API_URL = "http://localhost:3001/api/reminders";
const ReminderContext = createContext(undefined);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminders must be used within a ReminderProvider");
  }
  return context;
};

const ReminderProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [reminders, setReminders] = useState([]);

  const fetchReminders = useCallback(async () => {
    if (!currentUser) {
      console.warn("No user authenticated, skipping fetchReminders");
      return;
    }
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw new Error(
        error.response?.data?.error || "Failed to fetch reminders"
      );
    }
  }, [currentUser]);

  const getReminderById = useCallback(
    async (id) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        const response = await axios.get(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching reminder by ID:", error);
        throw new Error(
          error.response?.data?.error || "Failed to fetch reminder"
        );
      }
    },
    [currentUser]
  );

  const addReminder = useCallback(
    async (reminder) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        const response = await axios.post(
          API_URL,
          { ...reminder, userId: currentUser.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReminders((prev) => [...prev, response.data]);
      } catch (error) {
        console.error("Error adding reminder:", error);
        throw new Error(
          error.response?.data?.error || "Failed to add reminder"
        );
      }
    },
    [currentUser]
  );

  const updateReminder = useCallback(
    async (id, updatedReminder) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        const response = await axios.put(
          `${API_URL}/${id}`,
          { ...updatedReminder, userId: currentUser.id },
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
        throw new Error(
          error.response?.data?.error || "Failed to update reminder"
        );
      }
    },
    [currentUser]
  );

  const deleteReminder = useCallback(
    async (id) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setReminders((prev) => prev.filter((reminder) => reminder._id !== id));
      } catch (error) {
        console.error("Error deleting reminder:", error);
        throw new Error(
          error.response?.data?.error || "Failed to delete reminder"
        );
      }
    },
    [currentUser]
  );

  const toggleComplete = useCallback(
    async (id) => {
      if (!currentUser) throw new Error("User not authenticated");
      try {
        const reminder = reminders.find((r) => r._id === id);
        if (!reminder) throw new Error("Reminder not found");
        const response = await axios.patch(
          `${API_URL}/${id}/completed`,
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
        throw new Error(
          error.response?.data?.error || "Failed to toggle completion"
        );
      }
    },
    [currentUser, reminders]
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
