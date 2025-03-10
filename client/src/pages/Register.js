import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
// import authImg from '../assets/images/illustration.svg'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = process.env.REACT_APP_API_URL;

const Register = () => {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const { firstName, lastName, email, password } = formData;
    const navigate = useNavigate();

    const [role, setRole] = useState('student');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleTypeChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                firstName,
                lastName,
                email,
                password,
                role,
            });
            console.log(response.data.message);
            toast.success('Registration successful! Redirecting to Login...', { autoClose: 3000 });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            if (error.response) {
                console.error(error.response.data.message);
                toast.error(error.response.data.message);
            } else {
                console.error('Error:', error.message);
                toast.error('An error occurred. Please try again.');
            }
        }
    };

    return (
        <>
            <ToastContainer />
            <div className='bg-gray-100 dark:bg-slate-800'>
                <div className='relative isolate mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20'>
                    <div className='mx-auto py-10 sm:py-20 lg:py-0 flex flex-col lg:flex-row items-center justify-center'>
                        <div className='relative lg:w-2/3 hidden lg:block sm:hidden'>
                            {/* <img src={authImg} alt="auth-img" /> */}
                        </div>
                        <div className='lg:w-1/2 bg-white rounded-lg shadow-md dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
                            <div className='p-10 space-y-6'>
                                <h1 className='text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
                                    Create your Account</h1>
                                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
                                            <input type="text" name="firstName" id="firstName"
                                                value={firstName}
                                                onChange={handleChange}
                                                className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-customBlue focus:border-customBlue block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                                placeholder="e.g: Ben"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
                                            <input type="text" name="lastName" id="lastName"
                                                value={lastName}
                                                onChange={handleChange}
                                                className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-customBlue focus:border-customBlue block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                                placeholder="e.g: Tennison"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email address</label>
                                        <input type="email" name="email" id="email"
                                            value={email}
                                            onChange={handleChange}
                                            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-customBlue focus:border-customBlue block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                            placeholder="name@company.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                        <input type="password" name="password" id="password"
                                            value={password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-customBlue focus:border-customBlue block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role</label>
                                        <select
                                            name="role"
                                            value={role}
                                            onChange={handleRoleTypeChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-customBlue focus:border-customBlue block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        >
                                            <option value="student">I'm a Student</option>
                                            <option value="instructor">I'm an Instructor</option>
                                        </select>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="flex items-center h-5">
                                            <input
                                                id="remember"
                                                aria-describedby="remember"
                                                type="checkbox"
                                                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-customBlue dark:bg-gray-700 dark:border-customBlue dark:focus:ring-customBlue dark:ring-offset-gray-800"
                                                required
                                            />
                                        </div>
                                        <div class="ml-3 text-sm">
                                            <label for="remember" class="text-customGray dark:text-gray-300">
                                                By signing up, you are creating a Flowbite account, and you agree to Flowbite’s <a href="#" className='text-customBlue'>Terms of Use</a> and <a href="#" className='text-customBlue'>Privacy Policy.</a>
                                            </label>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full text-white bg-customBlue hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-semibold rounded-lg text-sm px-5 py-2.5 text-center dark:bg-customBlue dark:hover:bg-blue-900 dark:focus:ring-blue-900">Create an account</button>
                                    <p class="text-sm font-light text-customGray dark:text-gray-400">
                                        Already have an account? <Link to="/login" class="font-medium text-customBlue hover:underline dark:text-primary-500">Login here</Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register
