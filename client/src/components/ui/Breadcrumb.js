import React from 'react'

import { Link } from 'react-router-dom'

import { IoMdHome } from "react-icons/io";

const Breadcrumb = ({ links }) => {
    return (
        <>
            <nav className="flex mt-5" aria-label="breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <IoMdHome className="w-4 h-4 text-customGray" />
                    {links.map((link, index) => (
                        <li key={index} className="inline-flex items-center">
                            <div className="flex items-center">
                                <Link
                                    to={link.url}
                                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                                >
                                    {link.text}
                                </Link>
                                {index !== links.length - 1 && (
                                    <svg
                                        className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 6 10"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 9 4-4-4-4"
                                        />
                                    </svg>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    )
}

export default Breadcrumb
