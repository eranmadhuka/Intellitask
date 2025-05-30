import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../../components/Common/Layout/DashboardLayout';
import { useAuth } from "../../../context/AuthContext";

const EditUser = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        gender: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = currentUser.token || localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }
                const response = await axios.get(`http://localhost:3001/api/auth/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const { firstName, lastName, username, email, phone, gender } = response.data.user;
                setFormData({ firstName, lastName, username, email, phone, gender });
            } catch (error) {
                toast.error("Failed to fetch user data");
                console.error("Fetch error:", error);
            }
        };

        fetchUserData();
    }, [id]);

    // Validation function
    const validate = (values) => {
        const newErrors = {};

        if (!values.firstName) newErrors.firstName = "First name is required";
        else if (!/^[A-Za-z]{2,}$/.test(values.firstName)) newErrors.firstName = "First name must be at least 2 letters";

        if (!values.lastName) newErrors.lastName = "Last name is required";
        else if (!/^[A-Za-z]{2,}$/.test(values.lastName)) newErrors.lastName = "Last name must be at least 2 letters";

        if (!values.username) newErrors.username = "Username is required";
        else if (!/^[a-zA-Z0-9]{3,}$/.test(values.username)) newErrors.username = "Username must be at least 3 alphanumeric characters";

        if (!values.email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) newErrors.email = "Invalid email format";

        if (!values.phone) newErrors.phone = "Phone number is required";
        else if (!/^[0-9]{10}$/.test(values.phone)) newErrors.phone = "Phone number must be 10 digits";

        if (!values.gender) newErrors.gender = "Gender is required";

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Format phone number input
        if (name === "phone") {
            const formattedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Validate on change if the field has been touched
        if (touched[name]) {
            setErrors(validate({ ...formData, [name]: value }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(validate(formData));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Mark all fields as touched to show all errors
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setLoading(false);
            toast.error("Please fix the errors in the form");
            return;
        }

        try {
            const token = currentUser.token || localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }
            await axios.put(`http://localhost:3001/api/auth/user/update/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("User updated successfully!");
            setTimeout(() => {
                navigate('/admin/dashboard/users');
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update user";
            toast.error(errorMessage);
            console.error("Update error:", error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return Object.keys(validate(formData)).length === 0;
    };

    return (
        <DashboardLayout>
            <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                Edit User
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Update the user details below
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* First Name */}
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="John"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${errors.firstName && touched.firstName
                                            ? "border-red-500 focus:ring-red-200 dark:border-red-500"
                                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600"
                                            } dark:bg-slate-700 dark:text-white`}
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.firstName && touched.firstName && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.firstName}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Doe"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${errors.lastName && touched.lastName
                                            ? "border-red-500 focus:ring-red-200 dark:border-red-500"
                                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600"
                                            } dark:bg-slate-700 dark:text-white`}
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.lastName && touched.lastName && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="johndoe123"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${errors.username && touched.username
                                        ? "border-red-500 focus:ring-red-200 dark:border-red-500"
                                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600"
                                        } dark:bg-slate-700 dark:text-white`}
                                    value={formData.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {errors.username && touched.username && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="john.doe@example.com"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${errors.email && touched.email
                                        ? "border-red-500 focus:ring-red-200 dark:border-red-500"
                                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600"
                                        } dark:bg-slate-700 dark:text-white`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {errors.email && touched.email && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="1234567890"
                                    maxLength="10"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${errors.phone && touched.phone
                                        ? "border-red-500 focus:ring-red-200 dark:border-red-500"
                                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600"
                                        } dark:bg-slate-700 dark:text-white`}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {errors.phone && touched.phone && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.phone}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label
                                    htmlFor="gender"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${errors.gender && touched.gender
                                        ? "border-red-500 focus:ring-red-200 dark:border-red-500"
                                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600"
                                        } dark:bg-slate-700 dark:text-white`}
                                    value={formData.gender}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                                {errors.gender && touched.gender && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.gender}</p>
                                )}
                            </div>

                            <div className="pt-4 flex justify-between items-center">
                                <Link
                                    to="/admin/dashboard/users"
                                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:text-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                                >
                                    Back to Users
                                </Link>
                                <button
                                    type="submit"
                                    className={`px-6 py-2 text-white rounded-lg focus:ring-2 focus:outline-none focus:ring-offset-2 ${loading || !isFormValid()
                                        ? "bg-blue-400 dark:bg-blue-500 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                        } font-medium`}
                                    disabled={loading || !isFormValid()}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        "Update User"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EditUser;