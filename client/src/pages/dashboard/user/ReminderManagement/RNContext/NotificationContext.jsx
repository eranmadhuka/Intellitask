import React, { useEffect, useState, createContext, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

const initialNotifications = [
  {
    id: "1",
    title: "Welcome to Reminders",
    message: "Get started by creating your first reminder",
    timestamp: new Date().toISOString(),
    read: false,
    type: "system",
  },
  {
    id: "2",
    title: "Team meeting",
    message: "Reminder: You have a meeting in 30 minutes",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
    type: "reminder",
  },
  {
    id: "3",
    title: "System Update",
    message: "New features available. Check settings to learn more.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: "alert",
  },
];

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const storedNotifications = localStorage.getItem("notifications");
    return storedNotifications
      ? JSON.parse(storedNotifications)
      : initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications([newNotification, ...notifications]);
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
