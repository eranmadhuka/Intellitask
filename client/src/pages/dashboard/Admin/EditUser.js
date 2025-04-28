import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditUser = () => {
    // State variables for form fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    // Validation errors
    const [errors, setErrors] = useState({});

    // Get user ID from the URL parameters
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch user details when component mounts
    useEffect(() => {
        axios.get(`http://localhost:3001/api/auth/users/${id}`)
            .then(response => {
                const { firstName, lastName, username, email, phone, gender } = response.data.user;
                setFirstName(firstName);
                setLastName(lastName);
                setUsername(username);
                setEmail(email);
                setPhone(phone);
                setGender(gender);
            })
            .catch(error => {
                toast.error("Error fetching user data");
            });
    }, [id]);

    // Validate form fields
    const validate = () => {
        let tempErrors = {};
        const nameRegex = /^[A-Za-z]{2,}$/;
        const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (!nameRegex.test(firstName)) tempErrors.firstName = "First Name must be at least 2 letters.";
        if (!nameRegex.test(lastName)) tempErrors.lastName = "Last Name must be at least 2 letters.";
        if (!usernameRegex.test(username)) tempErrors.username = "Username must be at least 3 alphanumeric characters.";
        if (!emailRegex.test(email)) tempErrors.email = "Invalid email format.";
        if (!phoneRegex.test(phone)) tempErrors.phone = "Phone number must be 10 digits.";
        if (!gender) tempErrors.gender = "Please select a gender.";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // Handle form submission for updating user details
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!validate()) return; // Stop submission if validation fails

        setLoading(true);

        const data = { firstName, lastName, username, email, phone, gender };

        try {
            await axios.put(`http://localhost:3001/api/auth/user/update/${id}`, data);
            setPopupMessage("User updated successfully!");
            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
                navigate('/admin/dashboard/users');
            }, 2000);
        } catch (error) {
            setPopupMessage(error.response?.data?.message || "Failed to update user");
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-slate-900 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-slate-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit User</h1>
                <form className="space-y-4" onSubmit={handleUpdateUser}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg" value={username} onChange={(e) => setUsername(e.target.value)} />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                        <input type="tel" className="w-full px-4 py-2 border rounded-lg" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                        <select className="w-full px-4 py-2 border rounded-lg" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                    </div>

                    <button type="submit" className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                        {loading ? 'Updating...' : 'Update User'}
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
    );
};

export default EditUser;
