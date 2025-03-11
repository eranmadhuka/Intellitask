import React from 'react';
import { FaLightbulb, FaUsers, FaHeadset, FaRocket, FaMedal, FaHeart } from 'react-icons/fa';

const About = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white dark:from-gray-800 dark:to-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">About IntelliTask</h1>
                        <p className="text-xl max-w-2xl mx-auto dark:text-gray-300">
                            We're on a mission to revolutionize how people manage their tasks and time through intelligent voice technology.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-12 md:mb-0">
                            <img src="/api/placeholder/500/400" alt="IntelliTask Team" className="rounded-lg shadow-lg" />
                        </div>
                        <div className="md:w-1/2 md:pl-12">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Our Story</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                IntelliTask began with a simple observation: despite all the advances in technology, people still struggle with managing their daily tasks effectively. Our founder, frustrated with existing solutions that required too much manual input, envisioned a smarter way to manage tasks.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                Founded in 2023, our team of productivity enthusiasts and AI specialists came together with a shared goal: to create an intelligent personal assistant that truly understands how people work and think.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                After months of development and testing with real users, IntelliTask was born – combining voice recognition, natural language processing, and smart prioritization to create the most intuitive task management experience available today.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Mission Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Our Mission</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            We believe that everyone deserves to focus on what truly matters, without getting lost in the organizational chaos of daily life.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center dark:bg-gray-700">
                            <div className="inline-block bg-blue-100 p-4 rounded-full mb-6 dark:bg-blue-200">
                                <FaLightbulb className="text-blue-600 text-3xl dark:text-blue-700" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Simplify the Complex</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                We transform complicated task management into intuitive, conversational experiences that feel natural and effortless.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center dark:bg-gray-700">
                            <div className="inline-block bg-indigo-100 p-4 rounded-full mb-6 dark:bg-indigo-200">
                                <FaUsers className="text-indigo-600 text-3xl dark:text-indigo-700" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Empower Everyone</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                We create technology that adapts to different working styles, making productivity accessible to all, regardless of technical skill.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center dark:bg-gray-700">
                            <div className="inline-block bg-purple-100 p-4 rounded-full mb-6 dark:bg-purple-200">
                                <FaRocket className="text-purple-600 text-3xl dark:text-purple-700" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Unlock Potential</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                By reducing mental load and administrative overhead, we help people reclaim time for creativity, innovation, and well-being.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Our Values</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            These core principles guide everything we do, from product development to customer support.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="flex items-start">
                            <div className="bg-blue-100 p-4 rounded-full mr-6 flex-shrink-0 dark:bg-blue-200">
                                <FaHeadset className="text-blue-600 text-2xl dark:text-blue-700" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">User-Centered Design</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We obsess over the user experience, constantly gathering feedback and refining our product to serve real needs better. Every feature must pass a simple test: does it make users' lives easier?
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-indigo-100 p-4 rounded-full mr-6 flex-shrink-0 dark:bg-indigo-200">
                                <FaMedal className="text-indigo-600 text-2xl dark:text-indigo-700" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Excellence in Innovation</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We push the boundaries of what's possible with AI and voice technology, never settling for "good enough" when we can create something remarkable that truly enhances productivity.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-purple-100 p-4 rounded-full mr-6 flex-shrink-0 dark:bg-purple-200">
                                <FaHeart className="text-purple-600 text-2xl dark:text-purple-700" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Human Connection</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Technology should feel personal and warm. We build our AI to understand context, preferences, and patterns in a way that creates a genuine connection with our users.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-green-100 p-4 rounded-full mr-6 flex-shrink-0 dark:bg-green-200">
                                <FaRocket className="text-green-600 text-2xl dark:text-green-700" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Continuous Growth</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We're committed to learning and evolving. Our product gets smarter with every interaction, and our team embraces challenges as opportunities to develop better solutions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Meet Our Team</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            The passionate people behind IntelliTask who work tirelessly to make your life more organized.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-10">
                        {/* Team Member 1 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-700">
                            <img src="/api/placeholder/400/300" alt="Team Member" className="w-full h-64 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Eran Madhuka</h3>
                                <p className="text-indigo-600 font-medium mb-3">Founder & CEO</p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Former productivity app developer with a passion for AI and making technology more human-centered.
                                </p>
                            </div>
                        </div>

                        {/* Team Member 2 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-700">
                            <img src="/api/placeholder/400/300" alt="Team Member" className="w-full h-64 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Vikum Bhashitha</h3>
                                <p className="text-indigo-600 font-medium mb-3">CTO</p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    AI specialist with expertise in natural language processing and voice recognition technology.
                                </p>
                            </div>
                        </div>

                        {/* Team Member 3 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-700">
                            <img src="/api/placeholder/400/300" alt="Team Member" className="w-full h-64 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Eshani Devindi</h3>
                                <p className="text-indigo-600 font-medium mb-3">Head of Design</p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    UX/UI expert committed to creating intuitive and accessible user experiences for everyone.
                                </p>
                            </div>
                        </div>

                        {/* Team Member 4 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-700">
                            <img src="/api/placeholder/400/300" alt="Team Member" className="w-full h-64 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Thisal</h3>
                                <p className="text-indigo-600 font-medium mb-3">Product Manager</p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Former productivity coach who understands the challenges of task management across different industries.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join Us CTA */}
            <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white dark:from-gray-800 dark:to-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
                    <p className="text-xl max-w-2xl mx-auto mb-8 dark:text-gray-300">
                        We're always looking for talented individuals who share our passion for creating technology that makes life better.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                            View Careers
                        </button>
                        <button className="bg-transparent border-2 border-white py-3 px-8 rounded-lg hover:bg-white hover:text-indigo-800 transition duration-300 dark:hover:bg-gray-300 dark:hover:text-gray-800">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default About;