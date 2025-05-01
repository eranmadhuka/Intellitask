import React, { useState, useEffect } from 'react';
import { FiPlus, FiCalendar, FiClock, FiCheckCircle, FiBarChart2, FiAlertCircle, FiMic } from 'react-icons/fi';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const UserDashboard = () => {
    // State management
    const [tasks, setTasks] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [taskStats, setTaskStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        highPriority: 0
    });
    const [voiceInput, setVoiceInput] = useState('');
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    // Fetch tasks and reminders on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Get tasks
                const tasksResponse = await axios.get(`${API_URL}/api/tasks/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Get reminders
                const remindersResponse = await axios.get(`${API_URL}/api/reminders`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setTasks(tasksResponse.data);
                setReminders(remindersResponse.data);

                // Calculate task statistics
                const stats = {
                    total: tasksResponse.data.length,
                    completed: tasksResponse.data.filter(task => task.status === 'Completed').length,
                    inProgress: tasksResponse.data.filter(task => task.status === 'In progress').length,
                    todo: tasksResponse.data.filter(task => task.status === 'To do').length,
                    highPriority: tasksResponse.data.filter(task => task.priority === 'High').length
                };

                setTaskStats(stats);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter tasks based on active tab
    const filteredTasks = () => {
        switch (activeTab) {
            case 'todo':
                return tasks.filter(task => task.status === 'To do');
            case 'inProgress':
                return tasks.filter(task => task.status === 'In progress');
            case 'completed':
                return tasks.filter(task => task.status === 'Completed');
            case 'highPriority':
                return tasks.filter(task => task.priority === 'High');
            default:
                return tasks;
        }
    };

    // Handle task status update
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.patch(`${API_URL}/api/tasks/update-status/${taskId}`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );

            // Update local state
            setTasks(tasks.map(task =>
                task._id === taskId ? { ...task, status: newStatus } : task
            ));

            // Update stats
            const updatedStats = { ...taskStats };

            if (newStatus === 'Completed') {
                updatedStats.completed += 1;
                if (taskStats.inProgress > 0) updatedStats.inProgress -= 1;
                else if (taskStats.todo > 0) updatedStats.todo -= 1;
            } else if (newStatus === 'In progress') {
                updatedStats.inProgress += 1;
                if (taskStats.completed > 0) updatedStats.completed -= 1;
                else if (taskStats.todo > 0) updatedStats.todo -= 1;
            } else if (newStatus === 'To do') {
                updatedStats.todo += 1;
                if (taskStats.completed > 0) updatedStats.completed -= 1;
                else if (taskStats.inProgress > 0) updatedStats.inProgress -= 1;
            }

            setTaskStats(updatedStats);

        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    // Handle voice input
    const startVoiceInput = () => {
        // Here you would integrate with your voice recognition API
        // For now, let's simulate with a placeholder
        setIsVoiceActive(true);

        // Simulating voice recognition result
        setTimeout(() => {
            setVoiceInput('Schedule team meeting for Friday at 3pm');
            setIsVoiceActive(false);

            // In a real implementation, you would send this to your NLP service
            // and create a task based on the result
        }, 2000);
    };

    // Submit voice input as a new task
    const submitVoiceInput = async () => {
        if (!voiceInput) return;

        try {
            const response = await axios.post(`${API_URL}/api/tasks/process-input`,
                { inputText: voiceInput },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );

            // Add the new task to the list and update stats
            setTasks([response.data.task, ...tasks]);
            setTaskStats({
                ...taskStats,
                total: taskStats.total + 1,
                todo: taskStats.todo + 1
            });

            // Clear the voice input
            setVoiceInput('');

        } catch (error) {
            console.error("Error creating task from voice input:", error);
        }
    };

    // Get upcoming reminders (next 24 hours)
    const upcomingReminders = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.dateTime);
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        return reminderDate >= now && reminderDate <= tomorrow;
    });

    // Format date for display
    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <DashboardLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to IntelliTask - Your personal task assistant</p>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                        {/* Voice Input Button */}
                        <button
                            onClick={startVoiceInput}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg 
                ${isVoiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white'} 
                transition-all hover:bg-blue-700`}
                        >
                            <FiMic className="mr-2" />
                            {isVoiceActive ? 'Listening...' : 'Voice Input'}
                        </button>

                        {/* Add Task Button */}
                        <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg transition-all hover:bg-blue-700">
                            <FiPlus className="mr-2" />
                            Add Task
                        </button>
                    </div>
                </div>

                {/* Voice Input Display (when active) */}
                {voiceInput && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-medium text-blue-700 dark:text-blue-400">Voice Input Detected</h3>
                                <p className="text-gray-700 dark:text-gray-300 mt-1">{voiceInput}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setVoiceInput('')}
                                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitVoiceInput}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Create Task
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Tasks */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                                <FiCheckCircle className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</h2>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{taskStats.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full">
                                <FiClock className="text-yellow-600 dark:text-yellow-400" size={24} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</h2>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{taskStats.inProgress}</p>
                            </div>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                                <FiCheckCircle className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</h2>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{taskStats.completed}</p>
                            </div>
                        </div>
                    </div>

                    {/* High Priority */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
                        <div className="flex items-center">
                            <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                                <FiAlertCircle className="text-red-600 dark:text-red-400" size={24} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</h2>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{taskStats.highPriority}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Task List (70%) */}
                    <div className="w-full lg:w-8/12">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex flex-wrap">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                    >
                                        All Tasks
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('todo')}
                                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'todo' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                    >
                                        To Do
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('inProgress')}
                                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'inProgress' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                    >
                                        In Progress
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('completed')}
                                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                    >
                                        Completed
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('highPriority')}
                                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'highPriority' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                    >
                                        High Priority
                                    </button>
                                </nav>
                            </div>

                            <div className="p-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : filteredTasks().length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">No tasks found in this category</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredTasks().map(task => (
                                            <li key={task._id} className="py-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-1">
                                                            <div
                                                                className={`h-3 w-3 rounded-full mr-2 ${task.priority === 'High' ? 'bg-red-500' :
                                                                    task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                                                    }`}
                                                            ></div>
                                                            <h3 className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                                {task.title}
                                                            </h3>
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap items-center mt-2 text-xs text-gray-500 dark:text-gray-400 gap-2">
                                                            {task.category && (
                                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                                                    {task.category}
                                                                </span>
                                                            )}
                                                            {task.dueDate && (
                                                                <span className="flex items-center">
                                                                    <FiCalendar className="mr-1" />
                                                                    {formatDate(task.dueDate)}
                                                                </span>
                                                            )}
                                                            {task.contactPerson && (
                                                                <span>Contact: {task.contactPerson}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                            className="text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-1"
                                                        >
                                                            <option value="To do">To Do</option>
                                                            <option value="In progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reminders Sidebar (30%) */}
                    <div className="w-full lg:w-4/12">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium">Upcoming Reminders</h2>
                                    <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">{upcomingReminders.length}</span>
                                </div>
                            </div>

                            <div className="p-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-24">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : upcomingReminders.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 dark:text-gray-400">No upcoming reminders</p>
                                        <button className="mt-2 text-sm text-blue-600 dark:text-blue-400">+ Add Reminder</button>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {upcomingReminders.map(reminder => (
                                            <li key={reminder._id} className="py-3">
                                                <div className="flex items-start">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                                                        <FiClock className="text-blue-600 dark:text-blue-400" size={16} />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {reminder.title}
                                                        </h4>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {formatDate(reminder.dateTime)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                                <button className="w-full py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                                    View All Reminders
                                </button>
                            </div>
                        </div>

                        {/* Quick Statistics Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-4 p-4">
                            <div className="flex items-center mb-3">
                                <FiBarChart2 className="text-blue-600 dark:text-blue-400" size={20} />
                                <h3 className="ml-2 font-medium text-gray-800 dark:text-white">Task Progress</h3>
                            </div>

                            {/* Progress Bars */}
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">To Do</span>
                                        <span className="text-gray-900 dark:text-gray-200">{taskStats.todo} tasks</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${taskStats.total ? (taskStats.todo / taskStats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                                        <span className="text-gray-900 dark:text-gray-200">{taskStats.inProgress} tasks</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{ width: `${taskStats.total ? (taskStats.inProgress / taskStats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Completed</span>
                                        <span className="text-gray-900 dark:text-gray-200">{taskStats.completed} tasks</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${taskStats.total ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;