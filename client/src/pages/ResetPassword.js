import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { token } = useParams(); // Get the token from the URL
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:3001/api/auth/reset-password", { token, newPassword });
            setMessage(res.data.message);
            toast.success(res.data.message); // Show success toast
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong";
            setMessage(errorMessage);
            toast.error(errorMessage); // Show error toast
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
                <p className="text-gray-600 text-center mb-8">Enter your new password below to reset your account.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className={`w-full px-4 py-3 rounded-lg text-white font-semibold transition duration-200 ${
                            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                {message && (
                    <p className="text-center mt-6 text-sm font-medium text-gray-600">{message}</p>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
