import React, { useState, useEffect } from 'react';
import { FaPlus, FaCalendar, FaClock, FaCheckCircle, FaChartBar, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';
import axios from 'axios';
import SmartPrioritization from '../../../components/SmartPriority/SmartPrioritization';
import { Link } from 'react-router-dom';

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

    const today = new Date().toISOString().split('T')[0];
    const todayReminders = reminders
        .filter(reminder => {
            const reminderDate = new Date(reminder.dueDate).toISOString().split('T')[0];
            return reminderDate === today && !reminder.completed;
        })
        .slice(0, 3);

    const upcomingReminders = reminders
        .filter(reminder => {
            const reminderDate = new Date(reminder.dueDate);
            const todayDate = new Date(today);
            return reminderDate > todayDate && !reminder.completed;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome to IntelliTask</h1>
                            <p className="text-gray-600 mt-2">Stay on top of your tasks and reminders</p>
                        </div>
                        <button
                            onClick={() => setShowSmartTaskModal(true)}
                            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-blue-700 transition-all duration-300"
                        >
                            <FaPlus className="w-5 h-5 mr-2" /> Add Smart Task
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { title: 'Total Tasks', value: taskStats.total, icon: FaCheckCircle, color: 'indigo' },
                            { title: 'In Progress', value: taskStats.inProgress, icon: FaClock, color: 'yellow' },
                            { title: 'Completed', value: taskStats.completed, icon: FaCheckCircle, color: 'green' },
                            { title: 'High Priority', value: taskStats.highPriority, icon: FaExclamationCircle, color: 'red' }
                        ].map(stat => (
                            <div
                                key={stat.title}
                                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="flex items-center">
                                    <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                                        <stat.icon className={`text-${stat.color}-600`} size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-sm font-medium text-gray-600">{stat.title}</h2>
                                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Task List */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <nav className="flex border-b border-gray-200">
                                    {['all', 'todo', 'inProgress', 'completed', 'highPriority'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-4 text-sm font-medium ${activeTab === tab
                                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                                : 'text-gray-500 hover:text-indigo-600'
                                                }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                                        </button>
                                    ))}
                                </nav>
                                <div className="p-6">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : filteredTasks().length === 0 ? (
                                        <div className="text-center py-12">
                                            <FaCheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            <p className="text-lg font-medium text-gray-500">No tasks found</p>
                                            <button
                                                onClick={() => setShowSmartTaskModal(true)}
                                                className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold"
                                            >
                                                Add a task
                                            </button>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200">
                                            {filteredTasks().slice(0, 5).map(task => (
                                                <li key={task._id} className="py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center mb-2">
                                                                <div
                                                                    className={`h-3 w-3 rounded-full mr-2 ${task.priority === 'High'
                                                                        ? 'bg-red-500'
                                                                        : task.priority === 'Medium'
                                                                            ? 'bg-yellow-500'
                                                                            : 'bg-green-500'
                                                                        }`}
                                                                ></div>
                                                                <h3
                                                                    className={`font-medium text-lg ${task.status === 'Completed'
                                                                        ? 'line-through text-gray-500'
                                                                        : 'text-gray-900'
                                                                        }`}
                                                                >
                                                                    {task.title}
                                                                </h3>
                                                            </div>
                                                            {task.description && (
                                                                <p className="text-sm text-gray-600">{task.description}</p>
                                                            )}
                                                            <div className="flex flex-wrap items-center mt-3 text-xs text-gray-500 gap-3">
                                                                {task.category && (
                                                                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
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
                                                                className="text-sm rounded-md border-gray-300 bg-white text-gray-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                        {/* Reminders and Stats Sidebar */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            {/* Today's Reminders */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                                <div className="bg-indigo-100 px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaCalendar className="w-6 h-6 Middle East & Africa" />
                                        <FaClock className="w-6 h-6 text-indigo-600 mr-3" />
                                        <h2 className="text-xl font-semibold text-gray-800">Today's Reminders</h2>
                                    </div>
                                    <span className="bg-indigo-200 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                                        {todayReminders.length}
                                    </span>
                                </div>
                                <div className="p-6">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-24">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : todayReminders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FaClock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            <p className="text-lg font-medium text-gray-500">No reminders for today</p>
                                            <button
                                                className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold"
                                            >
                                                Add a reminder
                                            </button>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200">
                                            {todayReminders.map(reminder => (
                                                <li key={reminder._id} className="py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start">
                                                        <div className="bg-indigo-100 p-2 rounded">
                                                            <FaClock className="text-indigo-600" size={16} />
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <h4 className="font-medium text-gray-900 text-sm">{reminder.title}</h4>
                                                            <div className="text-xs text-gray-500 mt-1">{formatDate(reminder.date)}</div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="border-t border-gray-200 p-4">
                                    <Link to="/user/dashboard/addReminder">
                                        <button className="w-full py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition">
                                            View All Reminders
                                        </button>
                                    </Link>

                                </div>
                            </div>

                            {/* Upcoming Reminders */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                                <div className="bg-purple-100 px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaCalendar className="w-6 h-6 text-purple-600 mr-3" />
                                        <h2 className="text-xl font-semibold text-gray-800">Upcoming Reminders</h2>
                                    </div>
                                    <span className="bg-purple-200 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                                        {upcomingReminders.length}
                                    </span>
                                </div>
                                <div className="p-6">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-24">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : upcomingReminders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FaCalendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            <p className="text-lg font-medium text-gray-500">No upcoming reminders</p>

                                            <button
                                                className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold"
                                            >
                                                Add a reminder
                                            </button>


                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200">
                                            {upcomingReminders.map(reminder => (
                                                <li key={reminder._id} className="py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start">
                                                        <div className="bg-purple-100 p-2 rounded">
                                                            <FaClock className="text-purple-600" size={16} />
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <h4 className="font-medium text-gray-900 text-sm">{reminder.title}</h4>
                                                            <div className="text-xs text-gray-500 mt-1">{formatDate(reminder.date)}</div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="border-t border-gray-200 p-4">
                                    <Link to="/user/dashboard/myReminders">
                                        <button className="w-full py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition">
                                            View All Reminders
                                        </button>
                                    </Link>

                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                                <div className="flex items-center mb-4">
                                    <FaChartBar className="text-indigo-600" size={24} />
                                    <h3 className="ml-3 text-xl font-semibold text-gray-800">Task Progress</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { title: 'To Do', value: taskStats.todo, color: 'indigo' },
                                        { title: 'In Progress', value: taskStats.inProgress, color: 'yellow' },
                                        { title: 'Completed', value: taskStats.completed, color: 'green' }
                                    ].map(stat => (
                                        <div key={stat.title}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">{stat.title}</span>
                                                <span className="text-gray-900 font-medium">{stat.value} tasks</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`bg-${stat.color}-500 h-3 rounded-full transition-all duration-500`}
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
                            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-in">
                                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                    <h2 className="text-2xl font-semibold text-gray-800">Add Smart Task</h2>
                                    <button
                                        onClick={() => setShowSmartTaskModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={24} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <SmartPrioritization onTaskCreated={handleAddTask} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;