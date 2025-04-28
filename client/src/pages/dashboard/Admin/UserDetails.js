import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';

const UserDetails = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/auth/users');
                if (response.data.success) {
                    setUsers(response.data.users);
                    console.log(response.data.users)
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:3001/api/auth/user/delete/${userId}`);
                alert("User deleted successfully!");
                setUsers(users.filter(user => user._id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user.");
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
        const query = searchQuery.toLowerCase();  // Normalize the search query to lowercase
        const gender = user.gender?.toLowerCase();  // Normalize gender to lowercase
    
        // Log the current search query and gender for each user
        console.log("Search Query:", query);
        console.log("User Gender:", gender);
    
        const isMatch = (
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.toLowerCase().includes(query) ||
            (gender && (
                gender.includes(query) || 
                (query === "m" && gender === "m") ||  // Check if 'm' matches 'M'
                (query === "f" && gender === "f")   // Check if 'f' matches 'F'
            ))
        );
    
        // Log whether a user matches the filter or not
        console.log("Does user match filter:", isMatch);
    
        return isMatch;
    });
    
    

    return (
        <DashboardLayout>
<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-900 p-4">
            <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-lg dark:bg-slate-800">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">All Users</h1>
                <hr className="mb-4" />

                <div className="mb-4 flex justify-between">
                    <input 
                        type="text" 
                        placeholder="Search by Username, Email, Phone, or Gender..." 
                        className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-200 dark:bg-gray-700 text-left">
                                <th className="p-3 border border-gray-300 dark:border-gray-700">First Name</th>
                                <th className="p-3 border border-gray-300 dark:border-gray-700">Last Name</th>
                                <th className="p-3 border border-gray-300 dark:border-gray-700">Username</th>
                                <th className="p-3 border border-gray-300 dark:border-gray-700">Email</th>
                                <th className="p-3 border border-gray-300 dark:border-gray-700">Phone</th>
                                <th className="p-3 border border-gray-300 dark:border-gray-700">Gender</th>
                                <th className="p-3 border border-gray-300 dark:border-gray-700 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="bg-white dark:bg-slate-800">
                                    <td className="p-3 border border-gray-300 dark:border-gray-700">{user.firstName || "N/A"}</td>
                                    <td className="p-3 border border-gray-300 dark:border-gray-700">{user.lastName || "N/A"}</td>
                                    <td className="p-3 border border-gray-300 dark:border-gray-700">{user.username || "N/A"}</td>
                                    <td className="p-3 border border-gray-300 dark:border-gray-700">{user.email || "N/A"}</td>
                                    <td className="p-3 border border-gray-300 dark:border-gray-700">{user.phone || "N/A"}</td>
                                    <td className="p-3 border border-gray-300 dark:border-gray-700">{user.gender || "N/A"}</td>
                                    <td className="p-3 border border-gray-300 dark:border-gray-700 text-center">
                                        <button
                                            className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition duration-200"
                                            onClick={() => navigate(`/admin/dashboard/edit/${user._id}`)}
                                        >
                                            <i className="fas fa-edit"></i> Edit
                                        </button>
                                        &nbsp;
                                        <button
                                            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition duration-200"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            <i className="fas fa-trash-alt"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                        onClick={() => navigate('/admin/dashboard/add')}
                    >
                        <i className="fas fa-plus"></i> Add New User
                    </button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                        onClick={handleDownloadReport}
                    >
                        <i className="fas fa-file-excel"></i> Download Report
                    </button>
                </div>
            </div>
        </div>
        </DashboardLayout>
        
    );
};

export default UserDetails;
