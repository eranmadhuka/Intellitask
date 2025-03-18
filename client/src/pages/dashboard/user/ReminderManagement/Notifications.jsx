import React, { useState } from "react";
import { BellOffIcon, CheckIcon, TrashIcon, FilterIcon } from "lucide-react";
import { useNotifications } from "./RNContext/NotificationContext";
import NotificationItem from "./RNComponents/NotificationItem";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";

const Notifications = () => {
  const { notifications, markAllAsRead, clearAllNotifications, unreadCount } =
    useNotifications();
  const [filter, setFilter] = useState("all");

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((notification) => notification.type === filter);
  return (
    <div>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Notifications
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${
                      unreadCount !== 1 ? "s" : ""
                    }`
                  : "No unread notifications"}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Clear all
                </button>
              )}
            </div>
          </div>
          {/* Filter Bar */}
          {notifications.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex items-center">
              <FilterIcon className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600 mr-4">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {["all", "reminder", "system", "alert"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === type
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BellOffIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No notifications
                </h3>
                <p className="mt-1 text-gray-500">
                  {filter !== "all"
                    ? `No ${filter} notifications found`
                    : "You're all caught up!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Notifications;
