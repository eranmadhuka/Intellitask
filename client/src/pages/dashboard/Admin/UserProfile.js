import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const UserProfile = () => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        gender: "",
    });
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            if (!currentUser) {
                toast.error("You must be logged in to view this page");
                navigate('/login');
                return;
            }

            if (currentUser.role !== "admin") {
                toast.error("Only admins can edit user profiles");
                navigate('/');
                return;
            }

            try {
                const token = currentUser.token || localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get(`${API_URL}/api/auth/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const { firstName, lastName, username, email, phone, gender } = response.data.user;
                setFormData({ firstName, lastName, username, email, phone, gender });
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Error fetching user data";
                toast.error(errorMessage);
                console.error("Error fetching user data:", error);
            }
        };

        fetchUser();
    }, [id, currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = currentUser.token || localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            await axios.put(`${API_URL}/api/auth/user/update/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("User updated successfully!");
            setTimeout(() => navigate('/admin/dashboard'), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update user";
            toast.error(errorMessage);
            console.error("Error updating user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const token = currentUser.token || localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                await axios.delete(`${API_URL}/api/auth/user/delete/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                toast.success("User deleted successfully!");
                setTimeout(() => navigate('/admin/dashboard'), 2000);
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Failed to delete user";
                toast.error(errorMessage);
                console.error("Error deleting user:", error);
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="bg-gray-100 dark:bg-slate-900 min-h-screen flex items-center justify-center">
                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-slate-800">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Edit User Profile
                    </h1>
                    <form className="space-y-6" onSubmit={handleUpdateUser}>
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                placeholder="First Name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                placeholder="Last Name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Username"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="name@company.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="Phone Number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="gender"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800 ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Profile"}
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteUser}
                            className="w-full px-4 py-2 mt-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-red-700 dark:hover:bg-red-800"
                        >
                            Delete Profile
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserProfile;