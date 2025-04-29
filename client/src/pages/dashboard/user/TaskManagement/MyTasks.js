import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";
import { FiEdit, FiTrash2, FiDownload, FiPlus, FiFilter, FiClock, FiCheck } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";

const API_URL = process.env.REACT_APP_API_URL;

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["All", "Work", "Personal", "Meeting", "Shopping", "General"];
  const statuses = ["All", "To do", "In progress", "Done"];
  const priorities = ["All", "Low", "Medium", "High"];

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Access denied. No token provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/tasks/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
        setFilteredTasks(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Apply filters, search and sort
  useEffect(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.contactPerson && task.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterCategory !== "All") {
      result = result.filter(task => task.category === filterCategory);
    }

    // Apply status filter
    if (filterStatus !== "All") {
      result = result.filter(task => task.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== "All") {
      result = result.filter(task => task.priority === filterPriority);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "priority") {
        const priorityValue = { Low: 1, Medium: 2, High: 3 };
        return sortDirection === "asc"
          ? priorityValue[a.priority] - priorityValue[b.priority]
          : priorityValue[b.priority] - priorityValue[a.priority];
      } else {
        // Sort by title
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

    setFilteredTasks(result);
  }, [tasks, searchTerm, filterCategory, filterStatus, filterPriority, sortBy, sortDirection]);

  // Handle task editing
  const handleEdit = (task) => {
    setEditingTask({ ...task });
    setIsModalOpen(true);
  };

  // Handle task deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/api/tasks/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== id));

      // Show success toast notification (replace with your toast library)
      const toast = document.createElement("div");
      toast.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg";
      toast.textContent = "Task deleted successfully";
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  // Handle task update
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      // Format date properly for server
      const formattedTask = {
        ...editingTask,
        dueDate: new Date(editingTask.dueDate).toISOString()
      };

      await axios.put(
        `${API_URL}/api/tasks/update/${editingTask._id}`,
        formattedTask,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTasks(
        tasks.map((task) => (task._id === editingTask._id ? editingTask : task))
      );
      setIsModalOpen(false);

      // Show success toast notification
      const toast = document.createElement("div");
      toast.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg";
      toast.textContent = "Task updated successfully";
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add header with logo and title
    doc.setFontSize(20);
    doc.setTextColor(41, 98, 255); // Blue color
    doc.text("Smart Task Management", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report generated on ${new Date().toLocaleDateString()}`, 20, 30);

    // Create table
    const tableColumn = [
      "Title",
      "Category",
      "Priority",
      "Due Date",
      "Status",
      "Contact"
    ];

    const tableRows = filteredTasks.map((task) => [
      task.title,
      task.category || "N/A",
      task.priority,
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date",
      task.status,
      task.contactPerson || "N/A"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 98, 255] }
    });

    doc.save("Smart_Task_Management_Report.pdf");
  };

  // Get priority badge styling
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'To do':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get category badge styling
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Work':
        return 'bg-purple-100 text-purple-800';
      case 'Personal':
        return 'bg-pink-100 text-pink-800';
      case 'Meeting':
        return 'bg-indigo-100 text-indigo-800';
      case 'Shopping':
        return 'bg-orange-100 text-orange-800';
      case 'General':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDueDate = (dateString) => {
    if (!dateString) return "No date set";

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if date is today/yesterday/tomorrow
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    // If the date is within current year, show day and month
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    // If date is in different year, show with year
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Check if a task is overdue
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    dueDate.setHours(23, 59, 59, 999); // End of the due date
    return dueDate < new Date();
  };

  // Toggle sort direction
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <DashboardLayout>
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl md:text-3xl mb-2">My Tasks</h1>
          <p className="text-blue-100">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} •
            {filteredTasks.filter(t => t.status === "Done").length} completed
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button
            onClick={generatePDF}
            className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow"
          >
            <FiDownload /> Export PDF
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow"
          >
            <FiFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks by title, description, or contact person..."
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="w-6 h-6 text-gray-400 absolute right-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex">
                <select
                  className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button
                  className="bg-gray-100 border border-gray-300 px-3 rounded-r-md hover:bg-gray-200"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tasks...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && filteredTasks.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white rounded-lg border-l-4 shadow-md hover:shadow-lg transition-shadow 
                ${task.status === 'Done' ? 'border-l-green-500' :
                  isOverdue(task.dueDate) ? 'border-l-red-500' : 'border-l-blue-500'}`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{task.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="Edit task"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Delete task"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{task.description || "No description provided"}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {task.category && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeClass(task.category)}`}>
                      {task.category}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiClock size={14} />
                    <span className={isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-red-600 font-medium' : ''}>
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>

                  {task.contactPerson && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span className="truncate max-w-[100px]">{task.contactPerson}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Task
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    value={editingTask?.title || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 min-h-[100px]"
                    value={editingTask?.description || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                      value={editingTask?.category || "General"}
                      onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                    >
                      {categories.filter(c => c !== "All").map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                      value={editingTask?.priority || "Medium"}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    >
                      {priorities.filter(p => p !== "All").map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                      value={editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                      value={editingTask?.status || "To do"}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    >
                      {statuses.filter(s => s !== "All").map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    value={editingTask?.contactPerson || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors"
                >
                  <FiCheck /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TaskList;