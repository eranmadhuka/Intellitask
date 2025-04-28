import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';

const AddUser = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        gender: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Validate form fields
    const validateForm = () => {
        let newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
        if (!formData.username.trim()) newErrors.username = 'Username is required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';

        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Invalid phone number (10 digits required)';

        if (!formData.gender) newErrors.gender = 'Gender is required';

        if (!formData.password.trim()) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm Password is required';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        // Normalize gender value before submission
        const normalizedFormData = {
            ...formData,
            gender: formData.gender ? formData.gender.toLowerCase() : ''
        };
    
        if (!validateForm()) {
            setLoading(false);
            return;
        }
    
        try {
            await axios.post(`http://localhost:3001/api/auth/add`, normalizedFormData);
    
            setPopupMessage('User added successfully!');
            setShowPopup(true);
            setTimeout(() => {
                navigate('/admin/dashboard/users');
            }, 2000);
        } catch (error) {
            setPopupMessage(error.response?.data?.message || 'Failed to add user');
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <DashboardLayout>
        <div className="bg-gray-100 dark:bg-slate-900 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-slate-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New User</h1>
                <form className="space-y-4" onSubmit={handleAddUser}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                            <input type="text" name="firstName" className="w-full px-4 py-2 border rounded-lg" value={formData.firstName} onChange={handleChange} />
                            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                            <input type="text" name="lastName" className="w-full px-4 py-2 border rounded-lg" value={formData.lastName} onChange={handleChange} />
                            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input type="text" name="username" className="w-full px-4 py-2 border rounded-lg" value={formData.username} onChange={handleChange} />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" name="email" className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={handleChange} />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                        <input type="tel" name="phone" className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={handleChange} />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                        <select name="gender" className="w-full px-4 py-2 border rounded-lg" value={formData.gender} onChange={handleChange}>
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input type="password" name="password" className="w-full px-4 py-2 border rounded-lg" value={formData.password} onChange={handleChange} />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                        <input type="password" name="confirmPassword" className="w-full px-4 py-2 border rounded-lg" value={formData.confirmPassword} onChange={handleChange} />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>
                    <button type="submit" className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                        {loading ? 'Adding...' : 'Add User'}
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        <Link to="/admin/dashboard/users" className="text-blue-600 hover:underline dark:text-blue-400">Back to Users</Link>
                    </p>
                </form>
            </div>
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-lg text-center">
                        <p className="text-lg text-gray-900 dark:text-white">{popupMessage}</p>
                        <button onClick={() => setShowPopup(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">OK</button>
                    </div>
                </div>
            )}
        </div>
    </DashboardLayout>
    );
};

export default AddUser;
