import React from "react";
import {
  CheckIcon,
  ClockIcon,
  TrashIcon,
  EditIcon,
  AlertTriangleIcon,
  TagIcon,
} from "lucide-react";
import { Reminder, useReminders } from "../RNContext/ReminderContext";

const ReminderCard = ({ reminder, onEdit }) => {
  const { toggleComplete, deleteReminder } = useReminders();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 bg-white shadow-sm transition-all ${
        reminder.completed ? "opacity-70" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={() => toggleComplete(reminder._id)}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
              reminder.completed
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-gray-300 hover:border-blue-500"
            }`}
          >
            {reminder.completed && <CheckIcon className="w-3 h-3" />}
          </button>
          <div>
            <h3
              className={`text-lg font-medium ${
                reminder.completed
                  ? "line-through text-gray-500"
                  : "text-gray-800"
              }`}
            >
              {reminder.title}
            </h3>
            {reminder.description && (
              <p
                className={`mt-1 text-sm ${
                  reminder.completed ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {reminder.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center text-xs text-gray-500">
                <ClockIcon className="w-3 h-3 mr-1" />
                <span>
                  {formatDate(reminder.date)} {reminder.time}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(
                  reminder.priority
                )}`}
              >
                {reminder.priority}
              </span>
              {reminder.tags.length > 0 && (
                <div className="flex items-center text-xs text-gray-500">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {reminder.tags.map((tag, index) => (
                    <span key={index} className="mr-1">
                      #{tag}
                      {index < reminder.tags.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(reminder._id)}
            className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
            aria-label="Edit reminder"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteReminder(reminder._id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
            aria-label="Delete reminder"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {reminder.priority === "high" && !reminder.completed && (
        <div className="mt-3 flex items-center text-xs text-red-600">
          <AlertTriangleIcon className="w-3 h-3 mr-1" />
          <span>High priority reminder</span>
        </div>
      )}
    </div>
  );
};

export default ReminderCard;
