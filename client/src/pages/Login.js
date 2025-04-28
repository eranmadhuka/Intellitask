import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate(`/${currentUser.role}/dashboard`, { replace: true });
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            });
            

            const { user: userData, token, additionalData } = data;

            if (!userData?.role) {
                throw new Error('Invalid user data received');
            }

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            if (additionalData) {
                localStorage.setItem('additionalData', JSON.stringify(additionalData));
            }

            login(userData, additionalData);

            toast.success('Login successful! Redirecting...');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-slate-900 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-slate-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sign in to your account</h1>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="name@company.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Remember me
                            </label>
                        </div>
                        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            Forgot password?
                        </a>
                    </div>
                    <button
                        type="submit"
                        className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline dark:text-blue-400">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;