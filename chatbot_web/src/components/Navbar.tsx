import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Admin from './Admin';
import RMUTLlogo from '../assets/Rmutl.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      setVisible(false);
    } else {
      setVisible(true);
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
      className={`bg-yellow-900 p-1 transition-transform duration-300 ${visible ? 'transform translate-y-0' : 'transform -translate-y-full'}`}
    >
      <div className="container mx-auto flex items-center">
        {/* Logo on the left */}
        <Link to="/" className="flex items-center">
          <img src={RMUTLlogo} alt="RMUTL Logo" className="h-6 mr-4" />
        </Link>

        {/* Navigation Links aligned left */}
        <div className="flex-grow">
          <ul className={`flex space-x-4 text-lg ${isOpen ? 'block' : 'hidden'} md:flex`}>
            <li>
              <Link
                to="/"
                className="text-white hover:text-gray-400 py-2 px-4"
              >
                แชทบอท
              </Link>
            </li>
            <li>
              <Link
                to="/pdflist"
                className="text-white hover:text-gray-400 py-2 px-4"
              >
                คู่มือปฏิบัติงาน
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-white hover:text-gray-400 py-2 px-4"
              >
                เกี่ยวกับแชทบอท
              </Link>
            </li>
          </ul>
        </div>

        {/* Admin section on the right */}
        <div className="ml-auto">
          <Admin />
        </div>

        {/* Hamburger Icon for mobile */}
        <button
          className="md:hidden flex items-center text-white ml-4"
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
      </div>
    </nav>
  );
};

export default Navbar;