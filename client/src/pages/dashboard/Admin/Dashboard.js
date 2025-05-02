import React, { useState, useEffect } from 'react';
import {
    FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiGrid, FiList, FiBarChart2
} from 'react-icons/fi';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const AdminDashboard = () => {
    // State management
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalUsers: 0,
        totalTasks: 0,
        totalReminders: 0,
        avgTasksPerUser: 0,
        avgRemindersPerUser: 0,
        taskCompletionRate: 0,
        overdueTasks: 0,
        overdueReminders: 0
    });
    const [taskStatusData, setTaskStatusData] = useState({});
    const [taskPriorityData, setTaskPriorityData] = useState({});
    const [reminderCategoryData, setReminderCategoryData] = useState({}); // New state for category distribution
    const [activityTrendData, setActivityTrendData] = useState({});
    const [activeUserTab, setActiveUserTab] = useState('all');
    const [timeFilter, setTimeFilter] = useState('30d');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    // Form data for adding/editing users
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        gender: 'male',
        role: 'user'
    });

    // Fetch data on component mount and when time filter changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Get all users
                const usersResponse = await axios.get(`${API_URL}/api/auth/users`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                // Get analytics data
                const analyticsResponse = await axios.get(`${API_URL}/api/analytics`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    params: { timePeriod: timeFilter }
                });

                const userData = usersResponse.data.users || [];
                const analyticsData = analyticsResponse.data || {};

                setUsers(userData);
                setAnalytics({
                    totalUsers: analyticsData.totalUsers || 0,
                    totalTasks: analyticsData.totalTasks || 0,
                    totalReminders: analyticsData.totalReminders || 0,
                    avgTasksPerUser: parseFloat(analyticsData.avgTasksPerUser) || 0,
                    avgRemindersPerUser: parseFloat(analyticsData.avgRemindersPerUser) || 0,
                    taskCompletionRate: parseFloat(analyticsData.taskCompletionRate) || 0,
                    overdueTasks: analyticsData.overdueTasks || 0,
                    overdueReminders: analyticsData.overdueReminders || 0
                });

                // Task status distribution
                setTaskStatusData({
                    labels: ['To Do', 'In Progress', 'Completed'],
                    datasets: [{
                        label: 'Task Status',
                        data: [
                            analyticsData.taskStatus?.todo || 0,
                            analyticsData.taskStatus?.inProgress || 0,
                            analyticsData.taskStatus?.completed || 0
                        ],
                        backgroundColor: ['#f87171', '#60a5fa', '#4ade80']
                    }]
                });

                // Task priority distribution
                setTaskPriorityData({
                    labels: ['High', 'Medium', 'Low'],
                    datasets: [{
                        label: 'Task Priority',
                        data: [
                            analyticsData.taskPriority?.high || 0,
                            analyticsData.taskPriority?.medium || 0,
                            analyticsData.taskPriority?.low || 0
                        ],
                        backgroundColor: ['#ef4444', '#facc15', '#22c55e']
                    }]
                });

                // Reminder category distribution
                setReminderCategoryData({
                    labels: analyticsData.reminderCategories?.map(c => c.category || 'None') || [],
                    datasets: [{
                        label: 'Reminder Categories',
                        data: analyticsData.reminderCategories?.map(c => c.count) || [],
                        backgroundColor: ['#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6b7280']
                    }]
                });

                // Activity trend (tasks/reminders over time)
                setActivityTrendData({
                    labels: analyticsData.activityTrend?.dates || [],
                    datasets: [
                        {
                            label: 'Tasks Created',
                            data: analyticsData.activityTrend?.tasks || [],
                            borderColor: '#3b82f6',
                            fill: false
                        },
                        {
                            label: 'Reminders Created',
                            data: analyticsData.activityTrend?.reminders || [],
                            borderColor: '#8b5cf6',
                            fill: false
                        }
                    ]
                });

                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching admin dashboard data:", error);
                setError(error.response?.data?.message || 'Failed to load dashboard data');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeFilter]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle adding a new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/add`, formData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            // Refresh users list
            const usersResponse = await axios.get(`${API_URL}/api/auth/users`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setUsers(usersResponse.data.users || []);
            setAnalytics(prev => ({ ...prev, totalUsers: usersResponse.data.users.length }));

            // Close modal and reset form
            setShowAddUserModal(false);
            setFormData({
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                phone: '',
                gender: 'male',
                role: 'user'
            });

            alert('User added successfully!');
        } catch (error) {
            console.error("Error adding user:", error);
            alert('Error adding user: ' + (error.response?.data?.message || error.message));
        }
    };

    // Handle editing a user
    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const dataToUpdate = { ...formData };
            if (!dataToUpdate.password) {
                delete dataToUpdate.password;
            }

            await axios.put(`${API_URL}/api/auth/user/update/${currentUser._id}`, dataToUpdate, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            // Refresh users list
            const usersResponse = await axios.get(`${API_URL}/api/auth/users`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setUsers(usersResponse.data.users || []);

            // Close modal and reset states
            setShowEditUserModal(false);
            setCurrentUser(null);
            setFormData({
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                phone: '',
                gender: 'male',
                role: 'user'
            });

            alert('User updated successfully!');
        } catch (error) {
            console.error("Error updating user:", error);
            alert('Error updating user: ' + (error.response?.data?.message || error.message));
        }
    };

    // Handle deleting a user
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axios.delete(`${API_URL}/api/auth/user/delete/${userId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                // Refresh users list
                const usersResponse = await axios.get(`${API_URL}/api/auth/users`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                setUsers(usersResponse.data.users || []);
                setAnalytics(prev => ({ ...prev, totalUsers: usersResponse.data.users.length }));

                alert('User deleted successfully!');
            } catch (error) {
                console.error("Error deleting user:", error);
                alert('Error deleting user: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // Handle setting up user edit
    const handleEditUserSetup = (user) => {
        setCurrentUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            password: '',
            phone: user.phone,
            gender: user.gender,
            role: user.role
        });
        setShowEditUserModal(true);
    };

    // Filter users based on search term and active tab
    const filteredUsers = users.filter(user => {
        const searchMatch = searchTerm === '' ||
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!searchMatch) return false;

        switch (activeUserTab) {
            case 'admin':
                return user.role === 'admin';
            case 'user':
                return user.role === 'user';
            default:
                return true;
        }
    });

    // Chart options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true }
        }
    };

    // Render loading spinner or error
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6 text-center">
                    <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
                    <button
                        onClick={() => setTimeFilter(timeFilter)} // Retry fetch
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">Admin Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users and analyze system activity</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <FiPlus className="mr-2" />
                            Add User
                        </button>
                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'bg-white dark:bg-gray-700 text-gray-600'}`}
                            >
                                <FiGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'bg-white dark:bg-gray-700 text-gray-600'}`}
                            >
                                <FiList size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                                <FiUsers className="text-blue-600" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{analytics.totalUsers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                <FiBarChart2 className="text-green-600" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{analytics.totalTasks}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-500">
                        <div className="flex items-center">
                            <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                                <FiBarChart2 className="text-purple-600" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reminders</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{analytics.totalReminders}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-yellow-500">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-full">
                                <FiBarChart2 className="text-yellow-600" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Task Completion</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{(analytics.taskCompletionRate * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Analytics</h2>
                            <select
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Task Status Distribution</h3>
                                <Pie
                                    data={taskStatusData}
                                    options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Task Status Distribution' } } }}
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Task Priority Distribution</h3>
                                <Pie
                                    data={taskPriorityData}
                                    options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Task Priority Distribution' } } }}
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Reminder Category Distribution</h3>
                                <Pie
                                    data={reminderCategoryData}
                                    options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Reminder Category Distribution' } } }}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Activity Trend</h3>
                                <Bar
                                    data={activityTrendData}
                                    options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Tasks and Reminders Over Time' } } }}
                                />
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Tasks/User</h3>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">{analytics.avgTasksPerUser.toFixed(1)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Reminders/User</h3>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">{analytics.avgRemindersPerUser.toFixed(1)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Items</h3>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {analytics.overdueTasks + analytics.overdueReminders} (Tasks: {analytics.overdueTasks}, Reminders: {analytics.overdueReminders})
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Reminder Category</h3>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {reminderCategoryData.labels?.[0] || 'None'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex flex-wrap">
                            <button
                                onClick={() => setActiveUserTab('all')}
                                className={`px-4 py-3 text-sm font-medium ${activeUserTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                All Users
                            </button>
                            <button
                                onClick={() => setActiveUserTab('admin')}
                                className={`px-4 py-3 text-sm font-medium ${activeUserTab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                Admin Users
                            </button>
                            <button
                                onClick={() => setActiveUserTab('user')}
                                className={`px-4 py-3 text-sm font-medium ${activeUserTab === 'user' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                Standard Users
                            </button>
                        </nav>
                    </div>
                    <div className="p-4">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">No users found</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredUsers.map(user => (
                                    <div key={user._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 dark:bg-blue-900/50 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            <p><span className="font-medium">Username:</span> {user.username}</p>
                                            <p><span className="font-medium">Phone:</span> {user.phone}</p>
                                            <p><span className="font-medium">Gender:</span> {user.gender}</p>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditUserSetup(user)}
                                                className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredUsers.map(user => (
                                            <tr key={user._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="bg-blue-100 dark:bg-blue-900/50 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                            {user.firstName[0]}{user.lastName[0]}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditUserSetup(user)}
                                                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add User Modal */}
                {showAddUserModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New User</h2>
                                <button
                                    onClick={() => setShowAddUserModal(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleAddUser}>
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUserModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {showEditUserModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h2>
                                <button
                                    onClick={() => setShowEditUserModal(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleEditUser}>
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (leave blank to keep current)</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditUserModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Update User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;