import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen((prevState) => !prevState);
    };

    return (
        <>
            <div className='min-h-screen bg-gray-100'>
                <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                <Sidebar isSidebarOpen={isSidebarOpen} />
                <main
                    className={`pt-16 min-h-screen dark:bg-gray-900 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}
                >
                    <div className="p-6">
                        <div className='rounded-lg p-6 min-h-[calc(100vh-theme(spacing.32))] dark:bg-gray-900'>
                            {children}
                        </div>

                    </div>

                    {/* Footer */}
                    <footer className="bg-white dark:bg-gray-900 dark:border-gray-800 border-t p-4 text-center text-gray-600">
                        <p>&copy; 2025 Your Company. All rights reserved.</p>
                    </footer>
                </main>

            </div>
        </>
    );
};

export default DashboardLayout