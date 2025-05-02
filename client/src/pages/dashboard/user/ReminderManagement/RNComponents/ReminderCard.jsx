import React from "react";
import { ClockIcon, TrashIcon, EditIcon, TagIcon } from "lucide-react";

const ReminderCard = ({
  reminder,
  onEdit,
  onDelete,
  onToggleSelect,
  isSelected,
  showCheckbox = false,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 bg-white shadow-sm transition-all ${
        reminder.completed ? "opacity-70" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Checkbox for selection */}
        <div className="flex items-start space-x-3">
          {showCheckbox && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(reminder._id)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          )}
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
                  {formatDate(reminder.date)} {reminder.time || "No time"}
                </span>
              </div>
              {reminder.category && (
                <div className="flex items-center text-xs text-gray-500">
                  <TagIcon className="w-3 h-3 mr-1" />
                  <span>{reminder.category}</span>
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
            onClick={() => onDelete(reminder._id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
            aria-label="Delete reminder"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;
