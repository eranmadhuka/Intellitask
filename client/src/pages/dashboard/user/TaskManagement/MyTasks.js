import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable separately
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";

const API_URL = process.env.REACT_APP_API_URL;

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/api/tasks/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== id));
      alert("Task deleted successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_URL}/api/tasks/update/${editingTask._id}`,
        editingTask,
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
      alert("Task updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Task Report", 20, 10);

    const tableColumn = [
      "Title",
      "Description",
      "Priority",
      "Due Date",
      "Status",
    ];
    const tableRows = tasks.map((task) => [
      task.title,
      task.description,
      task.priority,
      new Date(task.dueDate).toLocaleDateString(),
      task.status,
    ]);

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 }); // Use autoTable explicitly
    doc.save("Task_Report.pdf");
  };

  return (
    <DashboardLayout>
      <h1 className="text-customDark font-semibold text-2xl dark:text-gray-300 mt-5">
        My Tasks
      </h1>
      <button
        onClick={generatePDF}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
      >
        Generate PDF
      </button>

      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Task List</h2>

        {loading && (
          <p className="text-gray-600 text-center">Loading tasks...</p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {tasks.length === 0 && !loading && (
          <p className="text-gray-500 text-center">No tasks available.</p>
        )}

        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="p-4 border rounded-md shadow-sm bg-gray-100"
            >
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-gray-700">{task.description}</p>
              <p className="text-sm text-gray-600">
                Priority: <span className="font-medium">{task.priority}</span>
              </p>
              <p className="text-sm text-gray-600">
                Due Date:{" "}
                <span className="font-medium">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Status: <span className="font-medium">{task.status}</span>
              </p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
            <label>Title</label>
            <input
              type="text"
              className="border p-2 w-full mb-4"
              value={editingTask.title}
              onChange={(e) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
            />
            <label>Description</label>
            <textarea
              className="border p-2 w-full mb-4"
              value={editingTask.description}
              onChange={(e) =>
                setEditingTask({ ...editingTask, description: e.target.value })
              }
            />
            <label>Priority</label>
            <select
              className="border p-2 w-full mb-4"
              value={editingTask.priority}
              onChange={(e) =>
                setEditingTask({ ...editingTask, priority: e.target.value })
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <label>Due Date</label>
            <input
              type="date"
              className="border p-2 w-full mb-4"
              value={editingTask.dueDate}
              onChange={(e) =>
                setEditingTask({ ...editingTask, dueDate: e.target.value })
              }
            />
            <label>Status</label>
            <select
              className="border p-2 w-full mb-4"
              value={editingTask.status}
              onChange={(e) =>
                setEditingTask({ ...editingTask, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TaskList;
