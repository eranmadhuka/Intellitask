import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Contact = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white dark:from-gray-800 dark:to-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
                        <p className="text-xl max-w-2xl mx-auto dark:text-gray-300">
                            We're here to help! Reach out to us for any questions, feedback, or support.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form and Details Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-xl shadow-md dark:bg-gray-800">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Send Us a Message</h2>
                            <form>
                                <div className="mb-6">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="johndoe@example.com"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="5"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="How can we help you?"
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Contact Details */}
                        <div className="bg-white p-8 rounded-xl shadow-md dark:bg-gray-800">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Contact Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-4 rounded-full mr-6 flex-shrink-0 dark:bg-blue-200">
                                        <FaMapMarkerAlt className="text-blue-600 text-2xl dark:text-blue-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Our Office</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            123 Tech Street, Suite 456<br />
                                            Innovation City, IC 78910
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-indigo-100 p-4 rounded-full mr-6 flex-shrink-0 dark:bg-indigo-200">
                                        <FaPhone className="text-indigo-600 text-2xl dark:text-indigo-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Phone</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            +1 (123) 456-7890<br />
                                            Mon - Fri, 9:00 AM - 6:00 PM
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-purple-100 p-4 rounded-full mr-6 flex-shrink-0 dark:bg-purple-200">
                                        <FaEnvelope className="text-purple-600 text-2xl dark:text-purple-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Email</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            support@intellitask.com<br />
                                            We respond within 24 hours
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-green-100 p-4 rounded-full mr-6 flex-shrink-0 dark:bg-green-200">
                                        <FaClock className="text-green-600 text-2xl dark:text-green-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Working Hours</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Mon - Fri: 9:00 AM - 6:00 PM<br />
                                            Sat - Sun: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    );
};

export default Contact;