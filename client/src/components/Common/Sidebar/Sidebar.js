import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { MdDashboard } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa6";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import { FaChartArea } from "react-icons/fa";
import { RiUserSettingsFill } from "react-icons/ri";
import { PiBooksFill } from "react-icons/pi";
import { PiPaperclipFill } from "react-icons/pi";
import { TbLogout2 } from "react-icons/tb";
import { PiExamFill } from "react-icons/pi";
import { FaFilePen } from "react-icons/fa6";
import { ImBooks } from "react-icons/im";
import { IoIosNotifications } from "react-icons/io";
import { BiSupport } from "react-icons/bi";

import {
    FaChevronDown,
    FaChevronRight,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const navigation = {
    admin: [
        {
            name: 'Dashboard',
            path: '/admin/dashboard',
            icon: <MdDashboard />,
        },
        {
            name: 'Students',
            icon: <FaUserGraduate />,
            subMenu: [
                { name: 'Student List', path: '/admin/dashboard/students/list' },
                { name: 'Add Student', path: '/admin/dashboard/students/add' },
            ],
        },
        {
            name: 'Instructors',
            icon: <FaUserTie />,
            subMenu: [
                { name: 'Instructors List', path: '/admin/dashboard/Instructors/list' },
                { name: 'Add Instructor', path: '/admin/dashboard/Instructors/add' },
            ],
        },
        {
            name: 'Faculties & Modules',
            icon: <PiBooksFill />,
            subMenu: [
                { name: 'Faculties', path: '/admin/dashboard/faculties' },
                { name: 'Modules', path: '/admin/dashboard/modules' },
            ],
        },
        {
            name: 'Quiz Management',
            icon: <PiPaperclipFill />,
            subMenu: [
                { name: 'Quiz List', path: '/admin/dashboard/quizzes' },
                { name: 'Create Quiz', path: '/admin/dashboard/quiz/manage/add' },
            ],
        },
        {
            name: 'Study Materials',
            path: '/admin/dashboard/manage/study-materials',
            icon: <ImBooks />,
        },
        // {
        //     name: 'Analysis',
        //     icon: <FaChartArea />,
        //     subMenu: [
        //         { name: 'Question Performance', path: '/admin/dashboard/quize/list' },
        //         { name: 'Question Difficulty', path: '/admin/dashboard/quize/add' },
        //         { name: 'Quiz Reports', path: '/admin/dashboard/quize/edit' },
        //     ],
        // },
        {
            name: 'Profile Setting',
            path: '/admin/dashboard/user/settings',
            icon: <RiUserSettingsFill />,
        },
    ],
    instructor: [
        {
            name: 'Dashboard',
            path: '/instructor/dashboard',
            icon: <MdDashboard />,
        },
        {
            name: 'Student',
            icon: <FaUserGraduate />,
            subMenu: [
                { name: 'Student List', path: '/instructor/dashboard/students/list' },
                { name: 'Add Student', path: '/instructor/dashboard/students/add' },
            ],
        },
        {
            name: 'Quiz Management',
            icon: <PiPaperclipFill />,
            subMenu: [
                { name: 'Quiz List', path: '/admin/dashboard/quizzes' },
                { name: 'Create Quiz', path: '/admin/dashboard/quiz/manage/add' },
            ],
        },
        {
            name: 'Study Materials',
            path: '/instructor/dashboard/manage/study-materials',
            icon: <ImBooks />,
        },
        // {
        //     name: 'Analysis',
        //     icon: <FaChartArea />,
        //     subMenu: [
        //         { name: 'Question Performance', path: '/instructor/dashboard/quize/list' },
        //         { name: 'Question Difficulty', path: '/instructor/dashboard/quize/add' },
        //         { name: 'Quiz Reports', path: '/instructor/dashboard/quize/edit' },
        //     ],
        // },
        {
            name: 'Profile Setting',
            path: '/instructor/dashboard/settings',
            icon: <RiUserSettingsFill />,
        },
    ],
    student: [
        {
            name: 'Dashboard',
            path: '/student/dashboard',
            icon: <MdDashboard />,
        },
        {
            name: 'Quizzes',
            path: '/student/dashboard/exam/select',
            icon: <FaFilePen />,
        },
        {
            name: 'Results',
            path: '/student/dashboard/results',
            icon: <PiExamFill />,
        },
        {
            name: 'Study Materials',
            path: '/student/dashboard/study-materials',
            icon: <ImBooks />,
        },
        {
            name: 'Notifications',
            path: '/student/dashboard/notifications',
            icon: <IoIosNotifications />,
        },
        {
            name: 'Support',
            path: '/student/dashboard/support',
            icon: <BiSupport />,
        },
        {
            name: 'Settings',
            path: '/student/dashboard/settings',
            icon: <RiUserSettingsFill />,
        },
    ],
};

const Sidebar = ({ isSidebarOpen }) => {
    const { currentUser, additionalData, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSubmenu, setActiveSubmenu] = useState('');

    const activeMenu = navigation[currentUser?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSubmenu = (name) => {
        setActiveSubmenu(activeSubmenu === name ? '' : name);
    };

    // const isActiveRoute = (path) => {
    //     return location.pathname.startsWith(path);
    // };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };


    return (
        <aside className={`fixed top-16 bottom-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 dark:bg-gray-800 dark:border-gray-700'
            }`}>
            <div className="flex flex-col h-full">
                {/* User Profile Section */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center space-x-3">
                        <img
                            src={`${API_URL}/${currentUser?.avatar}`}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className='text-center mt-3'>
                            <h3 className="text-sm font-semibold dark:text-white">{additionalData?.studentId || additionalData?.employeeId}</h3>
                            <h3 className="text-sm font-semibold dark:text-white">{currentUser?.firstName} {currentUser?.lastName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentUser?.role}</p>
                        </div>
                    </div>
                </div>
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-2 font-medium text-gray-700 dark:text-gray-200">
                        {activeMenu.map((item) => (
                            <li key={item.name}>
                                {item.subMenu ? (
                                    <div>
                                        <button
                                            onClick={() => toggleSubmenu(item.name)}
                                            className={`flex items-center justify-between w-full p-2 rounded-lg ${activeSubmenu === item.name || item.subMenu.some((subItem) => isActiveRoute(subItem.path))
                                                ? 'bg-gray-100 dark:bg-gray-700'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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
                                                                ? 'bg-gray-100 dark:bg-gray-700'
                                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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
                                            ? 'bg-gray-100 dark:bg-gray-700'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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
