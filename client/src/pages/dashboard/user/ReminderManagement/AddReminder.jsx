import { useState } from "react";
import {
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useReminders } from "./RNContext/ReminderContext";
import { useNotifications } from "./RNContext/NotificationContext";
import ReminderCard from "./RNComponents/ReminderCard";
import ReminderForm from "./RNComponents/ReminderForm";
import NotificationItem from "./RNComponents/NotificationItem";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";

const AddReminder = () => {
  const { reminders } = useReminders();
  const { notifications } = useNotifications();
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingId, setEditingId] = useState(undefined);

  const today = new Date().toISOString().split("T")[0];
  const todayReminders = reminders.filter(
    (reminder) => reminder.date === today && !reminder.completed
  );
  const upcomingReminders = reminders.filter(
    (reminder) => reminder.date > today && !reminder.completed
  );
  const recentNotifications = notifications.slice(0, 3);

  const handleEditReminder = (id) => {
    setEditingId(id);
    setShowReminderForm(true);
  };

  const closeForm = () => {
    setShowReminderForm(false);
    setEditingId(undefined);
  };

  return (
    <div>
      {" "}
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <button
              onClick={() => setShowReminderForm(true)}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Reminder
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Reminders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="font-semibold text-gray-800">
                    Today's Reminders
                  </h2>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {todayReminders.length}
                </span>
              </div>
              <div className="p-4">
                {todayReminders.length > 0 ? (
                  todayReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={handleEditReminder}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ClockIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No reminders for today</p>
                    <button
                      onClick={() => setShowReminderForm(true)}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Add a reminder
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Reminders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-purple-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-purple-600 mr-2" />
                  <h2 className="font-semibold text-gray-800">
                    Upcoming Reminders
                  </h2>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {upcomingReminders.length}
                </span>
              </div>
              <div className="p-4">
                {upcomingReminders.length > 0 ? (
                  upcomingReminders
                    .slice(0, 3)
                    .map((reminder) => (
                      <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        onEdit={handleEditReminder}
                      />
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No upcoming reminders</p>
                    <button
                      onClick={() => setShowReminderForm(true)}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Schedule a reminder
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-amber-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <BellIcon className="w-5 h-5 text-amber-600 mr-2" />
                  <h2 className="font-semibold text-gray-800">
                    Recent Notifications
                  </h2>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div>
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BellIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {showReminderForm && (
            <ReminderForm editingId={editingId} onClose={closeForm} />
          )}
        </div>
      </DashboardLayout>
    </div>
  );
};

export default AddReminder;
