import React, { useState } from "react";
import {
  BellIcon,
  ClockIcon,
  SaveIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
  RefreshCwIcon,
} from "lucide-react";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      reminderAlerts: {
        enabled: true,
        timing: "30",
      },
    },
    appearance: {
      theme: "light",
      compactView: false,
    },
    privacy: {
      saveHistory: true,
      anonymousData: false,
    },
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (section, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: value,
      },
    }));
    setSaved(false);
  };

  const handleNestedChange = (section, parent, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [setting]: value,
        },
      },
    }));
    setSaved(false);
  };

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <DashboardLayout>
        <div>
          <h1 className="text-customDark font-semibold text-2xl dark:text-gray-300 mt-5">
            Dashboard
          </h1>
          <p className="text-customGray text-sm">
            Welcome to Learning Management Dashboard.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <BellIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="font-semibold text-gray-800">
                  Notification Settings
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Enable Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive alerts for your reminders
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enabled}
                      onChange={(e) =>
                        handleChange(
                          "notifications",
                          "enabled",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mb-8">
            <button
              onClick={saveSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              {saved ? (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <SaveIcon className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Settings;
