import React, { useEffect, useState, createContext, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

const ReminderContext = createContext(undefined);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminders must be used within a ReminderProvider");
  }
  return context;
};

const initialReminders = [
  {
    id: "1",
    title: "Team meeting",
    description: "Weekly sync with the product team",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    time: "10:00",
    priority: "high",
    completed: false,
    tags: ["work", "meeting"],
  },
  {
    id: "2",
    title: "Grocery shopping",
    description: "Buy vegetables and fruits",
    date: new Date().toISOString().split("T")[0],
    time: "18:00",
    priority: "medium",
    completed: false,
    tags: ["personal", "shopping"],
  },
  {
    id: "3",
    title: "Gym session",
    description: "Cardio and strength training",
    date: new Date().toISOString().split("T")[0],
    time: "07:00",
    priority: "low",
    completed: true,
    tags: ["health", "personal"],
  },
];

const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState(() => {
    const storedReminders = localStorage.getItem("reminders");
    return storedReminders ? JSON.parse(storedReminders) : initialReminders;
  });

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (reminder) => {
    const newReminder = {
      ...reminder,
      id: uuidv4(),
    };
    setReminders([...reminders, newReminder]);
  };

  const updateReminder = (updatedReminder) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === updatedReminder.id ? updatedReminder : reminder
      )
    );
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id));
  };

  const toggleComplete = (id) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id
          ? { ...reminder, completed: !reminder.completed }
          : reminder
      )
    );
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
