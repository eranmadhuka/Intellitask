import React, { useState, useEffect } from 'react';
import {
    FiUsers, FiCheckCircle, FiClock, FiAlertCircle, FiBarChart2,
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiGrid, FiList
} from 'react-icons/fi';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
    // State management
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [systemStats, setSystemStats] = useState({
        totalUsers: 0,
        totalTasks: 0,
        totalReminders: 0,
        completedTasks: 0,
        pendingTasks: 0,
        highPriorityTasks: 0
    });
    const [activeTab, setActiveTab] = useState('users');
    const [activeUserTab, setActiveUserTab] = useState('all');
    const [activeTaskTab, setActiveTaskTab] = useState('all');
    const [activeReminderTab, setActiveReminderTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
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

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Get all users
                const usersResponse = await axios.get(`${API_URL}/api/auth/users`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Get all tasks
                const tasksResponse = await axios.get(`${API_URL}/api/tasks/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Get all reminders
                const remindersResponse = await axios.get(`${API_URL}/api/reminders`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Process the data
                const userData = usersResponse.data.users || [];
                const taskData = tasksResponse.data || [];
                const reminderData = remindersResponse.data || [];

                setUsers(userData);
                setTasks(taskData);
                setReminders(reminderData);

                // Calculate system statistics
                const stats = {
                    totalUsers: userData.length,
                    totalTasks: taskData.length,
                    totalReminders: reminderData.length,
                    completedTasks: taskData.filter(task => task.status === 'Completed').length,
                    pendingTasks: taskData.filter(task => task.status !== 'Completed').length,
                    highPriorityTasks: taskData.filter(task => task.priority === 'High').length
                };

                setSystemStats(stats);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching admin dashboard data:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle adding a new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/auth/add`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Refresh users list
            const usersResponse = await axios.get(`${API_URL}/api/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setUsers(usersResponse.data.users || []);
            setSystemStats({ ...systemStats, totalUsers: usersResponse.data.users.length });

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
            // Remove password if not changed (empty)
            const dataToUpdate = { ...formData };
            if (!dataToUpdate.password) {
                delete dataToUpdate.password;
            }

            const response = await axios.put(`${API_URL}/api/auth/user/update/${currentUser._id}`, dataToUpdate, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Refresh users list
            const usersResponse = await axios.get(`${API_URL}/api/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
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
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Refresh users list
                const usersResponse = await axios.get(`${API_URL}/api/auth/users`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setUsers(usersResponse.data.users || []);
                setSystemStats({ ...systemStats, totalUsers: usersResponse.data.users.length });

                alert('User deleted successfully!');
            } catch (error) {
                console.error("Error deleting user:", error);
                alert('Error deleting user: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // Handle updating task status
    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            await axios.patch(`${API_URL}/api/tasks/update-status/${taskId}`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );

            // Update local tasks state
            const updatedTasks = tasks.map(task =>
                task._id === taskId ? { ...task, status: newStatus } : task
            );
            setTasks(updatedTasks);

            // Update stats
            const completedCount = updatedTasks.filter(task => task.status === 'Completed').length;
            const pendingCount = updatedTasks.filter(task => task.status !== 'Completed').length;

            setSystemStats({
                ...systemStats,
                completedTasks: completedCount,
                pendingTasks: pendingCount
            });

            alert('Task status updated successfully!');
        } catch (error) {
            console.error("Error updating task status:", error);
            alert('Error updating task status: ' + (error.response?.data?.message || error.message));
        }
    };

    // Handle deleting a task
    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            try {
                await axios.delete(`${API_URL}/api/tasks/delete/${taskId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Remove task from local state
                const updatedTasks = tasks.filter(task => task._id !== taskId);
                setTasks(updatedTasks);

                // Update stats
                const completedCount = updatedTasks.filter(task => task.status === 'Completed').length;
                const pendingCount = updatedTasks.filter(task => task.status !== 'Completed').length;
                const highPriorityCount = updatedTasks.filter(task => task.priority === 'High').length;

                setSystemStats({
                    ...systemStats,
                    totalTasks: updatedTasks.length,
                    completedTasks: completedCount,
                    pendingTasks: pendingCount,
                    highPriorityTasks: highPriorityCount
                });

                alert('Task deleted successfully!');
            } catch (error) {
                console.error("Error deleting task:", error);
                alert('Error deleting task: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // Handle deleting a reminder
    const handleDeleteReminder = async (reminderId) => {
        if (window.confirm('Are you sure you want to delete this reminder? This action cannot be undone.')) {
            try {
                await axios.delete(`${API_URL}/api/reminders/${reminderId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Remove reminder from local state
                const updatedReminders = reminders.filter(reminder => reminder._id !== reminderId);
                setReminders(updatedReminders);

                // Update stats
                setSystemStats({
                    ...systemStats,
                    totalReminders: updatedReminders.length
                });

                alert('Reminder deleted successfully!');
            } catch (error) {
                console.error("Error deleting reminder:", error);
                alert('Error deleting reminder: ' + (error.response?.data?.message || error.message));
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
            password: '', // Password field will be empty - only update if provided
            phone: user.phone,
            gender: user.gender,
            role: user.role
        });
        setShowEditUserModal(true);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
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

    // Filter tasks based on search term and active tab
    const filteredTasks = tasks.filter(task => {
        const searchMatch = searchTerm === '' ||
            task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.category?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!searchMatch) return false;

        switch (activeTaskTab) {
            case 'todo':
                return task.status === 'To do';
            case 'inProgress':
                return task.status === 'In progress';
            case 'completed':
                return task.status === 'Completed';
            case 'highPriority':
                return task.priority === 'High';
            default:
                return true;
        }
    });

    // Filter reminders based on search term and active tab
    const filteredReminders = reminders.filter(reminder => {
        const searchMatch = searchTerm === '' ||
            reminder.title?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!searchMatch) return false;

        switch (activeReminderTab) {
            case 'completed':
                return reminder.completed;
            case 'upcoming':
                return !reminder.completed;
            default:
                return true;
        }
    });

    // Render loading spinner if data is loading
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
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
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users, tasks, and reminders</p>
                    </div>

                    <div className="mt-4 md:mt-0 flex gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        {activeTab === 'users' && (
                            <button
                                onClick={() => setShowAddUserModal(true)}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg transition-all hover:bg-blue-700"
                            >
                                <FiPlus className="mr-2" />
                                Add User
                            </button>
                        )}
                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                            >
                                <FiGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                            >
                                <FiList size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                    {/* Users Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                                <FiUsers className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{systemStats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                <FiCheckCircle className="text-green-600 dark:text-green-400" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{systemStats.totalTasks}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reminders Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-500">
                        <div className="flex items-center">
                            <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                                <FiClock className="text-purple-600 dark:text-purple-400" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Reminders</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{systemStats.totalReminders}</p>
                            </div>
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-teal-500">
                        <div className="flex items-center">
                            <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-full">
                                <FiCheckCircle className="text-teal-600 dark:text-teal-400" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{systemStats.completedTasks}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Tasks */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-yellow-500">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-full">
                                <FiClock className="text-yellow-600 dark:text-yellow-400" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tasks</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{systemStats.pendingTasks}</p>
                            </div>
                        </div>
                    </div>

                    {/* High Priority Tasks */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-red-500">
                        <div className="flex items-center">
                            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
                                <FiAlertCircle className="text-red-600 dark:text-red-400" size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</h2>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{systemStats.highPriorityTasks}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`px-6 py-3 font-medium ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            >
                                Tasks
                            </button>
                            <button
                                onClick={() => setActiveTab('reminders')}
                                className={`px-6 py-3 font-medium ${activeTab === 'reminders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            >
                                Reminders
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Users Section */}
                {activeTab === 'users' && (
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text">ASd</th>
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
                )}

                {/* Tasks Section */}
                {activeTab === 'tasks' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex flex-wrap">
                                <button
                                    onClick={() => setActiveTaskTab('all')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTaskTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    All Tasks
                                </button>
                                <button
                                    onClick={() => setActiveTaskTab('todo')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTaskTab === 'todo' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    To Do
                                </button>
                                <button
                                    onClick={() => setActiveTaskTab('inProgress')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTaskTab === 'inProgress' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => setActiveTaskTab('completed')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTaskTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    Completed
                                </button>
                                <button
                                    onClick={() => setActiveTaskTab('highPriority')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTaskTab === 'highPriority' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    High Priority
                                </button>
                            </nav>
                        </div>

                        <div className="p-4">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTasks.map(task => (
                                        <div key={task._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-lg text-gray-900 dark:text-white">{task.title}</h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                        task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                            'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                <p><span className="font-medium">Category:</span> {task.category}</p>
                                                <p><span className="font-medium">Due:</span> {formatDate(task.dueDate)}</p>
                                                <p><span className="font-medium">Created by:</span> {task.createdBy?.firstName} {task.createdBy?.lastName}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                                    className={`text-xs rounded px-2 py-1 ${task.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                            task.status === 'In progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                                                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                                        }`}
                                                >
                                                    <option value="To do">To do</option>
                                                    <option value="In progress">In progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                                >
                                                    <FiTrash2 size={14} />
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredTasks.map(task => (
                                                <tr key={task._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{task.category}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white line-clamp-2">{task.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                                task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                            }`}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                                            className={`text-xs rounded px-2 py-1 ${task.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                                    task.status === 'In progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                                                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                                                }`}
                                                        >
                                                            <option value="To do">To do</option>
                                                            <option value="In progress">In progress</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(task.dueDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeleteTask(task._id)}
                                                            className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reminders Section */}
                {activeTab === 'reminders' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex flex-wrap">
                                <button
                                    onClick={() => setActiveReminderTab('all')}
                                    className={`px-4 py-3 text-sm font-medium ${activeReminderTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    All Reminders
                                </button>
                                <button
                                    onClick={() => setActiveReminderTab('upcoming')}
                                    className={`px-4 py-3 text-sm font-medium ${activeReminderTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => setActiveReminderTab('completed')}
                                    className={`px-4 py-3 text-sm font-medium ${activeReminderTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                >
                                    Completed
                                </button>
                            </nav>
                        </div>

                        <div className="p-4">
                            {filteredReminders.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">No reminders found</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredReminders.map(reminder => (
                                        <div key={reminder._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-lg text-gray-900 dark:text-white">{reminder.title}</h3>
                                                {reminder.completed ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{reminder.description}</p>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                <p><span className="font-medium">Due:</span> {formatDate(reminder.dueDate)}</p>
                                                <p><span className="font-medium">Created by:</span> {reminder.createdBy?.firstName} {reminder.createdBy?.lastName}</p>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleDeleteReminder(reminder._id)}
                                                    className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                                >
                                                    <FiTrash2 size={14} />
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredReminders.map(reminder => (
                                                <tr key={reminder._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{reminder.title}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white line-clamp-2">{reminder.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {reminder.completed ? (
                                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(reminder.dueDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeleteReminder(reminder._id)}
                                                            className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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