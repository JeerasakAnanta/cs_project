import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Admin from './Admin';
import RMUTLlogo from '../assets/Rmutl.png'; // Adjust the path based on your structure

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Show or hide the navbar based on scroll direction
    if (currentScrollY > lastScrollY) {
      setVisible(false); // Scrolling down
    } else {
      setVisible(true); // Scrolling up
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`bg-yellow-900 p-4 transition-transform duration-300 ${visible ? 'transform translate-y-0' : 'transform -translate-y-full'}`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl flex ml-20">
          <img src={RMUTLlogo} alt="RMUTL Logo" className="h-11 " />
        </Link>

        {/* Hamburger Icon */}
        <button
          className="md:hidden flex items-center text-white"
          onClick={toggleMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <ul
          className={`md:flex md:space-x-4 text-lg ${isOpen ? 'block' : 'hidden'} w-full md:w-auto`}
        >
          <li>
            <Link
              to="/"
              className="block text-white hover:text-gray-400 py-2 px-4"
            >
              แชทบอท
            </Link>
          </li>
          <li>
            <Link
              to="/pdflist"
              className="block text-white hover:text-gray-400 py-2 px-4"
            >
              มาตรการสินเชื่อ
            </Link>
          </li>
          <li>
            <Link
              to="/management"
              className="block text-white hover:text-gray-400 py-2 px-4"
            >
              จัดการ pdf
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="block text-white hover:text-gray-400 py-2 px-4"
            >
              เกี่ยวกับแชทบอท
            </Link>
          </li>
        </ul>

        <Admin />
      </div>
    </nav>
  );
};

export default Navbar;
