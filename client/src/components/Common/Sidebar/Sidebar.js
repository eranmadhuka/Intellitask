import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUserGraduate, FaTasks } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";
import { RiUserSettingsFill } from "react-icons/ri";
import { PiPaperclipFill } from "react-icons/pi";
import { TbLogout2 } from "react-icons/tb";
import { HiBellAlert } from "react-icons/hi2";

import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL;

const navigation = {
  // admin: [
  //   {
  //     name: "Dashboard",
  //     path: "/admin/dashboard",
  //     icon: <MdDashboard />,
  //   },
  //   {
  //     name: "Users Management",
  //     icon: <FaUsers />,
  //     subMenu: [
  //       { name: "View All Users", path: "/admin/dashboard/" },
  //       { name: "Add task", path: "/user/dashboard/addtask" },
  //       { name: "My tasks", path: "/user/dashboard/mytasks" },
  //     ],
  //   },
  //   {
  //     name: "Task Monitoring",
  //     icon: <FaTasks />,
  //     subMenu: [
  //       { name: "Task Analytics", path: "/admin/dashboard/" },
  //       { name: "User Task Logs", path: "/admin/dashboard/" },
  //       { name: "Productivity Reports", path: "/admin/dashboard/" },
  //     ],
  //   },
  //   {
  //     name: "System Settings",
  //     icon: <PiPaperclipFill />,
  //     subMenu: [
  //       { name: "Task Categorization Rules", path: "/admin/dashboard/" },
  //       { name: "Voice-to-Text Configuration", path: "/admin/dashboard/" },
  //       { name: "Notification & Reminder Settings", path: "/admin/dashboard/" },
  //     ],
  //   },
  //   {
  //     name: "Profile Setting",
  //     path: "/admin/dashboard/user/settings",
  //     icon: <RiUserSettingsFill />,
  //   },
  // ],
  // user: [
  //   {
  //     name: "Dashboard",
  //     path: "/user/dashboard",
  //     icon: <MdDashboard />,
  //   },
  //   {
  //     name: "My Tasks",
  //     icon: <FaUserGraduate />,
  //     subMenu: [
  //       { name: "Add New Task", path: "/user/dashboard/addtask" },

  //       { name: "View All Tasks", path: "/user/dashboard/mytasks" },

  //       { name: "View All Tasks", path: "/user/dashboard/mytasks" },
  //     ],
  //   },
  //   {
  //     name: "Reminders & Alerts",
  //     icon: <HiBellAlert />,
  //     subMenu: [
  //       { name: "Today's Reminders", path: "/user/dashboard/myReminders" },
  //       { name: "Manage Reminders", path: "/user/dashboard/addReminder" },
  //       {
  //         name: "Notifications History ",
  //         path: "/user/dashboard/notifications",
  //       },
  //       {
  //         name: "Notifications Settings",
  //         path: "/user/dashboard/settings",
  //       },

  //       { name: "Today's Deadlines", path: "/user/dashboard/" },
  //       { name: "Smart Categorization", path: "/user/dashboard/" },
  //       { name: "Notification Settings", path: "/user/dashboard/" },
  //     ],
  //   },
  //   {
  //     name: "Progress & Insights",
  //     icon: <FaBarsProgress />,
  //     subMenu: [
  //       { name: "Productivity Stats", path: "/user/dashboard/" },
  //       { name: "Time Spent on Tasks", path: "/user/dashboard/" },
  //       { name: "Task Completion Rate", path: "/user/dashboard/" },
  //     ],
  //   },
  //   {
  //     name: "Profile Setting",
  //     path: "/user/dashboard/settings",
  //     icon: <RiUserSettingsFill />,
  //   },
  // ],

  admin: [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <MdDashboard />,
    },
    {
      name: "Users Management",
      icon: <FaUsers />,
      subMenu: [
        { name: "View All Users", path: "/admin/dashboard/users" },
        { name: "Add New User", path: "/admin/dashboard/add" },
      ],
    },
    {
      name: "Task Monitoring",
      icon: <FaTasks />,
      subMenu: [
        { name: "Task Analytics", path: "/admin/dashboard/" },
        { name: "User Task Logs", path: "/admin/dashboard/" },
        { name: "Productivity Reports", path: "/admin/dashboard/" },
      ],
    },
    {
      name: "System Settings",
      icon: <PiPaperclipFill />,
      subMenu: [
        { name: "Task Categorization Rules", path: "/admin/dashboard/" },
        { name: "Voice-to-Text Configuration", path: "/admin/dashboard/" },
        { name: "Notification & Reminder Settings", path: "/admin/dashboard/" },
      ],
    },
    {
      name: "Profile Setting",
      path: "/admin/dashboard/profile",
      icon: <RiUserSettingsFill />,
    },
  ],
  user: [
    {
      name: "Dashboard",
      path: "/user/dashboard",
      icon: <MdDashboard />,
    },
    {
      name: "My Tasks",
      icon: <FaUserGraduate />,
      subMenu: [
        { name: "Add New Task", path: "/user/dashboard/addtask" },
        { name: "View All Tasks", path: "/user/dashboard/mytasks" },
      ],
    },
    {
      name: "Reminders & Alerts",
      icon: <HiBellAlert />,
      subMenu: [
        { name: "Today's Reminders", path: "/user/dashboard/myReminders" },
        { name: "Manage Reminders", path: "/user/dashboard/addReminder" },
        {
          name: "Notifications History",
          path: "/user/dashboard/notifications",
        },
        // {
        //   name: "Notifications Settings",
        //   path: "/user/dashboard/settings",
        // },

        // { name: "Upcoming Deadlines", path: "/user/dashboard/" },
        // { name: "Smart Categorization", path: "/user/dashboard/" },
        // { name: "Notification Settings", path: "/user/dashboard/" },
      ],
    },
    {
      name: "Profile Setting",
      path: "/user/dashboard/profile",
      icon: <RiUserSettingsFill />,
    },
  ],
};

const Sidebar = ({ isSidebarOpen, reminderCount }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSubmenu, setActiveSubmenu] = useState("");

  // const currentUser = "user";
  const activeMenu = navigation[currentUser?.role] || [];
  // const activeMenu = navigation[currentUser] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSubmenu = (name) => {
    setActiveSubmenu(activeSubmenu === name ? "" : name);
  };

  // const isActiveRoute = (path) => {
  //     return location.pathname.startsWith(path);
  // };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2 font-medium text-gray-700 dark:text-gray-200">
            {activeMenu.map((item) => (
              <li key={item.name}>
                {item.subMenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`flex items-center justify-between w-full p-2 rounded-lg ${activeSubmenu === item.name ||
                          item.subMenu.some((subItem) =>
                            isActiveRoute(subItem.path)
                          )
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="text-gray-700 dark:text-gray-200">
                          {item.name}
                        </span>
                      </div>
                      {activeSubmenu === item.name ? (
                        <FaChevronDown className="w-4 h-4" />
                      ) : (
                        <FaChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {activeSubmenu === item.name && (
                      <ul className="ml-6 mt-2 space-y-2">
                        {item.subMenu.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.path}
                              className={`block p-2 rounded-lg ${isActiveRoute(subItem.path)
                                  ? "bg-gray-100 dark:bg-gray-700"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-2 rounded-lg ${isActiveRoute(item.path)
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    {item.icon}
                    <span className="text-gray-700 dark:text-gray-200">
                      {item.name}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Reminder Count */}
        {currentUser?.role === "user" && reminderCount > 0 && (
          <div className="px-3 py-2 border-t dark:border-gray-700 dark:text-gray-200">
            <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="font-medium">Reminders</span>
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {reminderCount}
              </span>
            </div>
          </div>
        )}

        <div className="px-3 py-2 border-t dark:border-gray-700 dark:text-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <TbLogout2 className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
