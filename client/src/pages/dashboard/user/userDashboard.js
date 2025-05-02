import React, { useState, useEffect } from 'react';
import { FaPlus, FaCalendar, FaClock, FaCheckCircle, FaChartBar, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';
import axios from 'axios';
import SmartPrioritization from '../../../components/SmartPriority/SmartPrioritization';

const API_URL = process.env.REACT_APP_API_URL;

const UserDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [taskStats, setTaskStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        highPriority: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showSmartTaskModal, setShowSmartTaskModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const tasksResponse = await axios.get(`${API_URL}/api/tasks/tasks`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const remindersResponse = await axios.get(`${API_URL}/api/reminders`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                setTasks(tasksResponse.data);
                setReminders(remindersResponse.data);

                const stats = {
                    total: tasksResponse.data.length,
                    completed: tasksResponse.data.filter(task => task.status === 'Completed').length,
                    inProgress: tasksResponse.data.filter(task => task.status === 'In progress').length,
                    todo: tasksResponse.data.filter(task => task.status === 'To do').length,
                    highPriority: tasksResponse.data.filter(task => task.priority === 'High').length
                };
                setTaskStats(stats);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTasks = () => {
        switch (activeTab) {
            case 'todo': return tasks.filter(task => task.status === 'To do');
            case 'inProgress': return tasks.filter(task => task.status === 'In progress');
            case 'completed': return tasks.filter(task => task.status === 'Completed');
            case 'highPriority': return tasks.filter(task => task.priority === 'High');
            default: return tasks;
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.patch(`${API_URL}/api/tasks/update-status/${taskId}`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            setTasks(tasks.map(task =>
                task._id === taskId ? { ...task, status: newStatus } : task
            ));
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
            console.error('Error updating task status:', error);
        }
    };

    const handleAddTask = (newTask) => {
        setTasks([newTask, ...tasks]);
        setTaskStats({
            ...taskStats,
            total: taskStats.total + 1,
            todo: taskStats.todo + 1,
            highPriority: newTask.priority === 'High' ? taskStats.highPriority + 1 : taskStats.highPriority
        });
        setShowSmartTaskModal(false);
    };

    const upcomingReminders = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.dateTime);
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return reminderDate >= now && reminderDate <= tomorrow;
    });

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <DashboardLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-400">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to IntelliTask</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => setShowSmartTaskModal(true)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <FaPlus className="mr-2" /> Add Smart Task
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { title: 'Total Tasks', value: taskStats.total, icon: FaCheckCircle, color: 'indigo' },
                        { title: 'In Progress', value: taskStats.inProgress, icon: FaClock, color: 'yellow' },
                        { title: 'Completed', value: taskStats.completed, icon: FaCheckCircle, color: 'green' },
                        { title: 'High Priority', value: taskStats.highPriority, icon: FaExclamationCircle, color: 'red' }
                    ].map(stat => (
                        <div key={stat.title} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-${stat.color}-500`}>
                            <div className="flex items-center">
                                <div className={`bg-${stat.color}-100 dark:bg-${stat.color}-900/50 p-3 rounded-full`}>
                                    <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h2>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Task List */}
                    <div className="w-full lg:w-8/12">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <nav className="flex border-b border-gray-200 dark:border-gray-700">
                                {['all', 'todo', 'inProgress', 'completed', 'highPriority'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-3 text-sm font-medium ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                                    </button>
                                ))}
                            </nav>
                            <div className="p-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : filteredTasks().length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredTasks().map(task => (
                                            <li key={task._id} className="py-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-1">
                                                            <div className={`h-3 w-3 rounded-full mr-2 ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                                            <h3 className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                                {task.title}
                                                            </h3>
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap items-center mt-2 text-xs text-gray-500 dark:text-gray-400 gap-2">
                                                            {task.category && (
                                                                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded">
                                                                    {task.category}
                                                                </span>
                                                            )}
                                                            {task.dueDate && (
                                                                <span className="flex items-center">
                                                                    <FaCalendar className="mr-1" />
                                                                    {formatDate(task.dueDate)}
                                                                </span>
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

                    {/* Reminders Sidebar */}
                    <div className="w-full lg:w-4/12">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium">Upcoming Reminders</h2>
                                    <span className="bg-indigo-500 text-xs px-2 py-1 rounded-full">{upcomingReminders.length}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-24">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : upcomingReminders.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 dark:text-gray-400">No upcoming reminders</p>
                                        <button className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">+ Add Reminder</button>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {upcomingReminders.map(reminder => (
                                            <li key={reminder._id} className="py-3">
                                                <div className="flex items-start">
                                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded">
                                                        <FaClock className="text-indigo-600 dark:text-indigo-400" size={16} />
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
                                <button className="w-full py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition">
                                    View All Reminders
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-4 p-4">
                            <div className="flex items-center mb-3">
                                <FaChartBar className="text-indigo-600 dark:text-indigo-400" size={20} />
                                <h3 className="ml-2 font-medium text-gray-800 dark:text-white">Task Progress</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { title: 'To Do', value: taskStats.todo, color: 'indigo' },
                                    { title: 'In Progress', value: taskStats.inProgress, color: 'yellow' },
                                    { title: 'Completed', value: taskStats.completed, color: 'green' }
                                ].map(stat => (
                                    <div key={stat.title}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">{stat.title}</span>
                                            <span className="text-gray-900 dark:text-gray-200">{stat.value} tasks</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`bg-${stat.color}-500 h-2 rounded-full`}
                                                style={{ width: `${taskStats.total ? (stat.value / taskStats.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Smart Task Modal */}
                {showSmartTaskModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add Smart Task</h2>
                                <button
                                    onClick={() => setShowSmartTaskModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <SmartPrioritization onTaskCreated={handleAddTask} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;