import React, { useState } from "react";
import DashboardLayout from "../../../../components/Common/Layout/DashboardLayout";

const MyTasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Task 1",
      description: "Complete project proposal",
      priority: "High",
      dueDate: "2025-03-20",
      status: "To Do",
    },
    {
      id: 2,
      title: "Task 2",
      description: "Fix UI issues on dashboard",
      priority: "Medium",
      dueDate: "2025-03-22",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Task 3",
      description: "Write test cases",
      priority: "Low",
      dueDate: "2025-03-25",
      status: "Completed",
    },
  ]);

  const [editingTask, setEditingTask] = useState(null);
  const [updatedTask, setUpdatedTask] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
    status: "",
  });

  // Handle edit button click
  const handleEditClick = (task) => {
    setEditingTask(task.id);
    setUpdatedTask(task);
  };

  // Handle update input changes
  const handleUpdateChange = (e) => {
    setUpdatedTask({ ...updatedTask, [e.target.name]: e.target.value });
  };

  // Update task function
  const updateTask = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingTask ? { ...task, ...updatedTask } : task
      )
    );
    setEditingTask(null);
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-customDark font-semibold text-2xl dark:text-gray-300 mt-5">
          Dashboard
        </h1>
        <p className="text-customGray text-sm">
          Welcome to Learning Management Dashboard.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks available.</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="p-4 border rounded-md shadow-sm bg-gray-100"
              >
                {editingTask === task.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="title"
                      value={updatedTask.title}
                      onChange={handleUpdateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Title"
                    />
                    <textarea
                      name="description"
                      value={updatedTask.description}
                      onChange={handleUpdateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Description"
                    />
                    <select
                      name="priority"
                      value={updatedTask.priority}
                      onChange={handleUpdateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <input
                      type="date"
                      name="dueDate"
                      value={updatedTask.dueDate}
                      onChange={handleUpdateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <select
                      name="status"
                      value={updatedTask.status}
                      onChange={handleUpdateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      onClick={updateTask}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTask(null)}
                      className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-gray-700">{task.description}</p>
                    <p className="text-sm text-gray-600">
                      Priority:{" "}
                      <span className="font-medium">{task.priority}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Due Date:{" "}
                      <span className="font-medium">{task.dueDate}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="font-medium">{task.status}</span>
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      {task.status !== "Completed" && (
                        <button
                          onClick={() => updateTask(task.id, "Completed")}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                          Mark as Completed
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;
