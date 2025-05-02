import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import Logo from '../../../assets/images/logo.png';
import Switcher from '../../ui/Switcher';
import { FaBars, FaUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { IoSettings } from "react-icons/io5";
import { RiLockPasswordFill } from "react-icons/ri";
const API_URL = process.env.REACT_APP_API_URL;

const dropdownMenu = [
    {
        title: 'Profile',
        icon: <FaUser />,
        link: `#`,
    },
    {
        title: 'Setting',
        icon: <IoSettings />,
        link: '#',
    },
    {
        title: 'Update Password',
        icon: <RiLockPasswordFill />,
        link: '#',
    },
    {
        title: 'Logout',
        icon: <IoLogOut />,
        link: '#',
    },
];

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
    const { currentUser, additionalData, logout } = useAuth();
    const [isOpened, setIsOpened] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsOpened(!isOpened);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpened(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className='fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700'>
            <div className="flex items-center justify-between px-4 h-16">
                <div className='flex items-center justify-start'>
                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        type="button"
                        className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    >
                        <FaBars className="w-6 h-6" />
                    </button>

                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <div className="-m-1.5 p-1.5">
                            <span className="sr-only">Logo</span>
                            <img className="h-8 w-auto" src={Logo} alt="Logo" />
                        </div>
                    </div>
                </div>
                <div className='flex items-center space-x-2'>
                    {/* Switcher */}
                    <Switcher />

                    {/* Profile menu */}
                    <div className="relative inline-block text-left" ref={dropdownRef}>
                        <div>
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center text-sm pe-1 font-medium text-gray-900 rounded-full hover:text-blue-600 dark:hover:text-blue-500 md:me-0 dark:text-white"
                                type="button"
                            >
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-3">

                                        <div className="flex flex-col items-start space-y-0 ml-2">
                                            <h3 className="text-sm font-semibold dark:text-white text-left">{currentUser?.firstName} {currentUser?.lastName}</h3>
                                            <p className="text-xs text-start text-gray-500 dark:text-gray-400 capitalize">{currentUser?.role}</p>
                                        </div>

                                    </div>
                                </div>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
