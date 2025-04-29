import React, { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

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
  const [reminders, setReminders] = useState([]);

  // Fetch reminders from the API
  const fetchReminders = async () => {
    try {
      const response = await axios.get(API_URL);
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  // Fetch reminders when component mounts
  useEffect(() => {
    fetchReminders(); // Initial fetch on component mount
  }, []);

  const addReminder = async (reminder) => {
    const newReminder = {
      ...reminder,
      id: uuidv4(),
    };
    try {
      await axios.post(API_URL, newReminder);
      fetchReminders(); // Re-fetch after adding
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  const updateReminder = async (updatedReminder) => {
    try {
      await axios.put(`${API_URL}/${updatedReminder.id}`, updatedReminder);
      fetchReminders(); // Re-fetch after updating
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchReminders(); // Re-fetch after deleting
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const toggleComplete = async (id) => {
    const reminder = reminders.find((reminder) => reminder.id === id);
    if (!reminder) return;
    const updatedReminder = { ...reminder, completed: !reminder.completed };

    try {
      await axios.put(`${API_URL}/${id}`, updatedReminder);
      fetchReminders(); // Re-fetch after toggling completion
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const getReminder = (id) => {
    return reminders.find((reminder) => reminder.id === id);
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleComplete,
        getReminder,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export default ReminderProvider;
