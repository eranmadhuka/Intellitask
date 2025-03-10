import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoIosMenu, IoMdClose } from 'react-icons/io';

import Logo from '../assets/images/logo.png';

import Switcher from './ui/Switcher';

const navigation = [
    { name: 'Home', href: '/', current: true },
    { name: 'Services', href: '/services', current: true },
    { name: 'About', href: '/about', current: true },
    { name: 'Contact', href: '/contact', current: true },
];

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="bg-white mx-auto px-4 sm:px-6 lg:px-8 lg:py-10 dark:bg-slate-800">
            <header
                className={`${isScrolled ? 'fixed top-0 left-0 w-full z-50 bg-white shadow-lg dark:bg-slate-800' : 'absolute inset-x-0 top-0 z-50'
                    } transition-all duration-300 ease-in-out`}
            >
                <nav className="flex items-center justify-between p-3 mx-auto max-w-7xl lg:px-8" aria-label="Global">
                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <Link to="/" className="-m-1.5 p-1.5">
                            <span className="sr-only">Logo</span>
                            <img
                                className="h-8 w-auto"
                                src={Logo}
                                alt="Logo"
                            />
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="flex lg:hidden">
                        <Switcher />
                        <button
                            type="button"
                            className="-m-2.5 ms-1 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <IoIosMenu className="h-6 w-6 dark:text-white" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Login Button */}
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <div className="flex items-center pr-3">
                            <Switcher />
                        </div>
                        <button link="/login">
                            Login
                        </button>
                        <button link="/register">
                            Register
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation Panel */}
                <div className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    {/* Overlay */}
                    <div
                        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>

                    {/* Mobile Menu */}
                    <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <Link to="/" className="-m-1.5 p-1.5">
                                <span className="sr-only">Logo</span>
                                <img
                                    className="h-8 w-auto"
                                    src={Logo}
                                    alt="Logo"
                                />
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <IoMdClose className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root px-5">
                            <div className="-my-6 divide-y divide-gray-500/10">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-600"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6">
                                    <Link
                                        to="/login"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-600"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;