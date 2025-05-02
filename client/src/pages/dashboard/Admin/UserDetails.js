import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';

const UserDetails = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser) {
                toast.error("You must be logged in to view users");
                navigate('/login');
                return;
            }

            if (currentUser.role !== "admin") {
                toast.error("Only admins can view user details");
                navigate('/');
                return;
            }

            try {
                const token = currentUser.token || localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get('http://localhost:3001/api/auth/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    setUsers(response.data.users);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Error fetching users";
                toast.error(errorMessage);
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, [currentUser, navigate]);

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const token = currentUser.token || localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                await axios.delete(`http://localhost:3001/api/auth/user/delete/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success("User deleted successfully!");
                setUsers(users.filter(user => user._id !== userId));
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Failed to delete user";
                toast.error(errorMessage);
                console.error("Error deleting user:", error);
            }
        }
    };

    const handleDownloadReport = () => {
        const worksheet = XLSX.utils.json_to_sheet(users);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users Report");
        XLSX.writeFile(workbook, "UserDetailsReport.xlsx");
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const gender = user.gender?.toLowerCase();

        return (
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.toLowerCase().includes(query) ||
            (gender && (
                gender.includes(query) ||
                (query === "m" && gender === "m") ||
                (query === "f" && gender === "f")
            ))
        );
    });

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            User Management
                        </h1>

                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search by Username, Email, Phone, or Gender..."
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                onClick={handleDownloadReport}
                            >
                                <i className="fas fa-file-excel"></i> Download Report
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="hidden md:block">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">First Name</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Last Name</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Username</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Gender</th>
                                            <th className="p-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="p-4 text-gray-900 dark:text-white">{user.firstName || "N/A"}</td>
                                                <td className="p-4 text-gray-900 dark:text-white">{user.lastName || "N/A"}</td>
                                                <td className="p-4 text-gray-900 dark:text-white">{user.username || "N/A"}</td>
                                                <td className="p-4 text-gray-900 dark:text-white">{user.email || "N/A"}</td>
                                                <td className="p-4 text-gray-900 dark:text-white">{user.phone || "N/A"}</td>
                                                <td className="p-4 text-gray-900 dark:text-white">{user.gender || "N/A"}</td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                                                            onClick={() => navigate(`/admin/dashboard/edit/${user._id}`)}
                                                        >
                                                            <i className="fas fa-edit"></i> Edit
                                                        </button>
                                                        <button
                                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                                            onClick={() => handleDelete(user._id)}
                                                        >
                                                            <i className="fas fa-trash-alt"></i> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile view - Card layout */}
                            <div className="md:hidden space-y-4">
                                {filteredUsers.map(user => (
                                    <div key={user._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="font-semibold text-gray-600 dark:text-gray-300">First Name:</div>
                                            <div>{user.firstName || "N/A"}</div>
                                            <div className="font-semibold text-gray-600 dark:text-gray-300">Last Name:</div>
                                            <div>{user.lastName || "N/A"}</div>
                                            <div className="font-semibold text-gray-600 dark:text-gray-300">Username:</div>
                                            <div>{user.username || "N/A"}</div>
                                            <div className="font-semibold text-gray-600 dark:text-gray-300">Email:</div>
                                            <div>{user.email || "N/A"}</div>
                                            <div className="font-semibold text-gray-600 dark:text-gray-300">Phone:</div>
                                            <div>{user.phone || "N/A"}</div>
                                            <div className="font-semibold text-gray-600 dark:text-gray-300">Gender:</div>
                                            <div>{user.gender || "N/A"}</div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                                                onClick={() => navigate(`/admin/dashboard/edit/${user._id}`)}
                                            >
                                                <i className="fas fa-edit"></i> Edit
                                            </button>
                                            <button
                                                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                                onClick={() => handleDelete(user._id)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            onClick={() => navigate('/admin/dashboard/add')}
                        >
                            <i className="fas fa-plus"></i> Add New User
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDetails;