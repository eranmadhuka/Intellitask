import React from 'react';
import { FaMicrophone, FaKeyboard, FaBrain, FaBell, FaMobile, FaCalendarAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import heroImg from '../assets/images/hero-illustration.svg'
import notificationImg from '../assets/images/image.png'

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white dark:from-gray-800 dark:to-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 md:py-24 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-12 md:mb-0">
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">Manage Tasks Smarter, Not Harder</h1>
                        <p className="text-lg mb-6">IntelliTask uses voice recognition and AI to revolutionize how you organize your daily life.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-white text-indigo-800 font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                                Get Started <FaArrowRight className="ml-2" />
                            </button>
                            <button className="bg-transparent border-2 border-white py-2 px-4 rounded-lg hover:bg-white hover:text-indigo-800 transition duration-300 flex items-center justify-center dark:border-gray-300 dark:hover:bg-gray-300 dark:hover:text-gray-800">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        <img src={heroImg} alt="IntelliTask App Demo" className="rounded-lg shadow-xl w-full h-auto" />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-10 md:py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">How IntelliTask Works</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Your personal assistant that simplifies task management using intelligent voice and text recognition.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700">
                            <div className="bg-blue-100 w-16 h-16 flex items-center justify-center rounded-full mb-6 dark:bg-blue-200">
                                <FaMicrophone className="text-blue-600 text-2xl dark:text-blue-700" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Voice & Text Input</h3>
                            <p className="text-gray-600 dark:text-gray-300">Speak or type your tasks for quick and effortless entry, no matter where you are.</p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700">
                            <div className="bg-indigo-100 w-16 h-16 flex items-center justify-center rounded-full mb-6 dark:bg-indigo-200">
                                <FaBrain className="text-indigo-600 text-2xl dark:text-indigo-700" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Smart Categorization</h3>
                            <p className="text-gray-600 dark:text-gray-300">Tasks are automatically labeled and organized based on priority and context.</p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700">
                            <div className="bg-purple-100 w-16 h-16 flex items-center justify-center rounded-full mb-6 dark:bg-purple-200">
                                <FaBell className="text-purple-600 text-2xl dark:text-purple-700" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Context-Aware Reminders</h3>
                            <p className="text-gray-600 dark:text-gray-300">Get smart alerts based on task urgency, location, and your personal patterns.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pain Points Section */}
            <section className="py-10 md:py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-12 md:mb-0">
                            <img src="/api/placeholder/480/360" alt="Person struggling with tasks" className="rounded-lg shadow-lg w-full h-auto" />
                        </div>
                        <div className="md:w-1/2 md:pl-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">Challenges We Solve</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Many of us struggle with managing tasks efficiently, whether we are students, professionals, or anyone balancing multiple responsibilities.</p>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300">Managing multiple tasks efficiently across different areas of life</p>
                                </div>
                                <div className="flex items-start">
                                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300">Forgetting important deadlines and appointments</p>
                                </div>
                                <div className="flex items-start">
                                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                    <p className="text-gray-700 dark:text-gray-300">Need for a quick, effortless way to enter and organize tasks</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-10 md:py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Key Features</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Built with a focus on ease of use, automation, and smart prioritization.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-100 p-3 rounded-full mr-4 dark:bg-blue-200">
                                    <FaMicrophone className="text-blue-600 dark:text-blue-700" />
                                </div>
                                <h3 className="font-semibold text-lg dark:text-white">Voice Input</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">Add tasks hands-free with natural speech recognition technology.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700">
                            <div className="flex items-center mb-4">
                                <div className="bg-indigo-100 p-3 rounded-full mr-4 dark:bg-indigo-200">
                                    <FaKeyboard className="text-indigo-600 dark:text-indigo-700" />
                                </div>
                                <h3 className="font-semibold text-lg dark:text-white">Text Input</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">Quickly type tasks with smart autocomplete and suggestions.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700">
                            <div className="flex items-center mb-4">
                                <div className="bg-purple-100 p-3 rounded-full mr-4 dark:bg-purple-200">
                                    <FaBrain className="text-purple-600 dark:text-purple-700" />
                                </div>
                                <h3 className="font-semibold text-lg dark:text-white">NLP Technology</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">Natural Language Processing for intuitive human-like interaction.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow dark:bg-gray-700">
                            <div className="flex items-center mb-4">
                                <div className="bg-green-100 p-3 rounded-full mr-4 dark:bg-green-200">
                                    <FaMobile className="text-green-600 dark:text-green-700" />
                                </div>
                                <h3 className="font-semibold text-lg dark:text-white">Cross-Device</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">Seamlessly works across all your devices for constant accessibility.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="py-10 md:py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row-reverse items-center">
                        <div className="md:w-1/2 mb-12 md:mb-0 md:pl-12">
                            <img src={notificationImg} alt="People using IntelliTask" className="rounded-lg shadow-lg w-full h-auto" />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">Who Benefits from IntelliTask?</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">IntelliTask is designed for anyone managing a busy schedule who wants to increase productivity and reduce stress.</p>

                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                                <div className="border border-gray-200 p-6 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                                    <div className="bg-yellow-100 w-12 h-12 flex items-center justify-center rounded-full mb-4 dark:bg-yellow-200">
                                        <FaCalendarAlt className="text-yellow-600 dark:text-yellow-700" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 dark:text-white">Students</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Manage assignments, exams, and extracurricular activities</p>
                                </div>

                                <div className="border border-gray-200 p-6 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                                    <div className="bg-red-100 w-12 h-12 flex items-center justify-center rounded-full mb-4 dark:bg-red-200">
                                        <FaCalendarAlt className="text-red-600 dark:text-red-700" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 dark:text-white">Professionals</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Keep track of meetings, deadlines, and work-life balance</p>
                                </div>

                                <div className="border border-gray-200 p-6 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                                    <div className="bg-green-100 w-12 h-12 flex items-center justify-center rounded-full mb-4 dark:bg-green-200">
                                        <FaCalendarAlt className="text-green-600 dark:text-green-700" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 dark:text-white">Freelancers</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Organize multiple clients, projects, and billing schedules</p>
                                </div>

                                <div className="border border-gray-200 p-6 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                                    <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4 dark:bg-blue-200">
                                        <FaCalendarAlt className="text-blue-600 dark:text-blue-700" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 dark:text-white">Busy Parents</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Track family appointments, activities, and household tasks</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-10 md:py-16 dark:from-gray-800 dark:to-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Simplify Your Task Management?</h2>
                    <p className="text-lg max-w-2xl mx-auto mb-8">Join thousands of users who have transformed how they organize their daily lives with IntelliTask.</p>
                    <button className="bg-white text-indigo-700 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                        Get Started Today
                    </button>
                </div>
            </section>

        </div>
    );
};

export default Home;