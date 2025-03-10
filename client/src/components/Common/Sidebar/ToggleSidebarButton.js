import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { RiMenu2Fill } from 'react-icons/ri';

const ToggleSidebarButton = ({ isSidebarOpen, toggleSidebar }) => {
    return (
        <button
            className="md:hidden p-2 text-2xl dark:text-gray-400"
            onClick={toggleSidebar}
        >
            {isSidebarOpen ? <IoMdClose /> : <RiMenu2Fill />}
        </button>
    );
};

export default ToggleSidebarButton; 