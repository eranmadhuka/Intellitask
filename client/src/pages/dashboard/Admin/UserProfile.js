import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';

const UserProfile = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [errors, setErrors] = useState({});

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Get JWT token from localStorage or wherever you store it
        const token = localStorage.getItem('token');
        
        axios.get(`http://localhost:3001/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}` // Add the token in the Authorization header
            }
        })
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
            console.error("Error fetching user data:", error);
            toast.error("Error fetching user data");
        });
    }, [id]);

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = { firstName, lastName, username, email, phone, gender };

        try {
            await axios.put(`http://localhost:3001/api/auth/user/update/${id}`, data);
            setPopupMessage("User updated successfully!");
            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
                navigate('/users');
            }, 2000);
        } catch (error) {
            setPopupMessage(error.response?.data?.message || "Failed to update user");
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:3001/api/auth/user/delete/${id}`);
                toast.success("User deleted successfully!");
                navigate('/users');
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Failed to delete user.");
            }
        }
    };

    return (
        <DashboardLayout>
        <div className="bg-gray-100 dark:bg-slate-900 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-slate-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6"><center>My Profile</center></h1>
                <form className="space-y-4" onSubmit={handleUpdateUser}>
                    <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <button type="submit" className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                    <button type="button" onClick={handleDeleteUser} className="w-full px-4 py-2 mt-2 text-white bg-red-600 rounded-lg">
                        Delete Profile
                    </button>
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

export default UserProfile;