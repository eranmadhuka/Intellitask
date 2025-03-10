import React from 'react'
import { Link } from 'react-router-dom';

import Logo from '../assets/images/logo-2.png'

import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
    return (
        <>
            <footer class="bg-white dark:bg-gray-900">
                <div class="mx-auto w-full max-w-screen-xl">
                    <div class="grid grid-cols-4 md:grid-cols-4 sm:grid-cols-1 gap-8 px-4 py-6 lg:py-8">
                        <div>
                            <Link to="/" className="">
                                <span className="sr-only">Logo</span>
                                <img
                                    className="h-8 w-auto"
                                    src={Logo}
                                    alt="Logo"
                                />
                            </Link>
                            <p className='text-customGray dark:text-gray-400 mt-4'>Lorem cing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniamquis.</p>
                            <div className='flex text-gray-400 mt-3 gap-3'>
                                <FaFacebookF />
                                <FaXTwitter />
                            </div>
                        </div>
                        <div>
                            <h2 class="mb-6 text-sm font-semibold text-customDark uppercase dark:text-white">Help center</h2>
                            <ul class="text-customGray dark:text-gray-400 font-medium">
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Discord Server</a>
                                </li>
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Twitter</a>
                                </li>
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Facebook</a>
                                </li>
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Contact Us</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 class="mb-6 text-sm font-semibold text-customDark uppercase dark:text-white">Legal</h2>
                            <ul class="text-customGray dark:text-gray-400 font-medium">
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Privacy Policy</a>
                                </li>
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Licensing</a>
                                </li>
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Terms &amp; Conditions</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 class="mb-6 text-sm font-semibold text-customDark uppercase dark:text-white">Download</h2>
                            <ul class="text-customGray dark:text-gray-400 font-medium">
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">iOS</a>
                                </li>
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Android</a>
                                </li>
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">Windows</a>
                                </li>
                                <li class="mb-4">
                                    <a href="#" class="hover:underline">MacOS</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="px-4 py-6 md:flex md:items-center md:justify-between text-center">
                        <span class="text-sm text-customGray dark:text-gray-300 sm:text-center">© 2023 ProjectMID. All Rights Reserved.
                        </span>
                        <div class="flex mt-4 gap-3 sm:justify-center md:mt-0 text-customGray dark:text-gray-400">
                            <Link to="/" className='hover:underline'>
                                Terms and conditions
                            </Link>
                            <Link to="/" className='hover:underline'>
                                Privacy Policy
                            </Link>
                            <Link to="https://my-portfolio-five-ecru-46.vercel.app/" className='hover:underline'>
                                EM
                            </Link>
                        </div>
                    </div>
                </div>
            </footer >

        </>
    )
}

export default Footer
