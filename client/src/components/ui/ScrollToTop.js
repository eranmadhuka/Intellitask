import React, { useEffect, useState } from 'react';
import { BiArrowFromBottom } from 'react-icons/bi';
import { classNames } from '../../utils/classNames';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className="fixed bottom-3 right-3">
            <button
                type="button"
                onClick={scrollToTop}
                className={classNames(
                    isVisible ? 'opacity-100' : 'opacity-0',
                    'bg-customBlue hover:bg-indigo-800 inline-flex items-center rounded-full p-3 text-white shadow-sm transition-opacity'
                )}
            >
                <BiArrowFromBottom className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
};

export default ScrollToTop;
