import React from "react";
import {
  CheckIcon,
  TrashIcon,
  BellIcon,
  AlertCircleIcon,
  InfoIcon,
} from "lucide-react";
import { useNotifications } from "../RNContext/NotificationContext";

const NotificationItem = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "reminder":
        return <BellIcon className="w-5 h-5 text-blue-500" />;
      case "alert":
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />;
      case "system":
      default:
        return <InfoIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div
      className={`p-4 border-b ${
        notification.read ? "bg-white" : "bg-blue-50"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon()}</div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className={`text-sm font-medium ${
                  notification.read ? "text-gray-700" : "text-gray-900"
                }`}
              >
                {notification.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
              <span className="mt-1 text-xs text-gray-500">
                {formatTime(notification.timestamp)}
              </span>
            </div>
            <div className="flex space-x-1 ml-4">
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                  aria-label="Mark as read"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => deleteNotification(notification.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                aria-label="Delete notification"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
