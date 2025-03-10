import React from 'react'

import { MdEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa";

const Contact = () => {
    return (
        <>
            <div className='dark:bg-slate-800'>
                <div className='relative isolate mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20'>
                    <div className='mx-auto py-10 sm:py-20 lg:py-0 flex flex-col lg:flex-row items-center justify-center'>
                        <div className='lg:w-1/3 lg:pe-5'>
                            <div>
                                <h2>CONTACT US</h2>
                                <p>Let's talk about your problem</p>
                            </div>
                            <p className='text-customGray text-sm mt-3 dark:text-gray-400'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure, corporis! Adipisci at consequatur officiis neque earum dignissimos voluptatum ipsum repudiandae alias</p>
                            <div className='flex items-center mt-3 dark:text-gray-400'>
                                <MdEmail className='text-customGray me-3' />
                                <a href='#' className='hover:underline text-customGray dark:text-gray-400'>example@email.com</a>
                            </div>
                            <div className='flex items-center mt-3 dark:text-gray-400'>
                                <FaPhone className='text-customGray me-3' />
                                <a href='#' className='hover:underline text-customGray dark:text-gray-400'>example@email.com</a>
                            </div>
                        </div>
                        <div className='lg:w-2/3 md:w-full md:mt5 sm:w-full sm:mt-5'>
                            <div class="py-8 px-4 lg:p-12 bg-white rounded-lg shadow-md dark:border dark:bg-gray-800 dark:border-gray-700 mx-auto max-w-screen-md">
                                <form action="#" class="space-y-8">
                                    <h2 className='text-3xl font-semibold text-customDark dark:text-white'>Still need help?</h2>
                                    <div>
                                        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Your email</label>
                                        <input type="email" name="email" id="email"
                                            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-customBlue focus:border-customBlue block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                            placeholder="name@company.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label for="subject" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Subject</label>
                                        <input type="text" name="subject" id="email"
                                            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-customBlue focus:border-customBlue block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                            placeholder="Let us know how we can help you"
                                            required
                                        />
                                    </div>
                                    <div class="sm:col-span-2">
                                        <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Your message</label>
                                        <textarea id="message" rows="6" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-customBlue focus:border-customBlue0 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-customBlue dark:focus:border-customBlue" placeholder="Leave a comment..."></textarea>
                                    </div>
                                    <button type="submit" class="py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-customBlue sm:w-fit hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-customBlue">Send message</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Contact
