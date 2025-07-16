import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Admin from './Admin';
import RMUTLlogo from '../assets/Rmutl.png';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
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
      className={`bg-rmutl-brown shadow-md p-3 transition-transform duration-300 sticky top-0 z-50 ${visible ? 'transform translate-y-0' : 'transform -translate-y-full'
        }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-6">
            <img src={RMUTLlogo} alt="RMUTL Logo" className="h-10" />
          </Link>
          {/* Navigation Links centered */}
          <div className="hidden md:flex">
            <ul className="flex space-x-2 text-lg">
              <li>
                <Link
                  to="/"
                  className="text-white hover:bg-rmutl-gold hover:text-rmutl-brown py-2 px-4 rounded-full transition-colors"
                >
                  แชทบอท
                </Link>
              </li>
              <li>
                <Link
                  to="/pdflist"
                  className="text-white hover:bg-rmutl-gold hover:text-rmutl-brown py-2 px-4 rounded-full transition-colors"
                >
                  คู่มือปฏิบัติงาน
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white hover:bg-rmutl-gold hover:text-rmutl-brown py-2 px-4 rounded-full transition-colors"
                >
                  เกี่ยวกับ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Admin section and Hamburger on the right */}
        <div className="flex items-center">
          <div className="hidden md:block">
            <Admin />
          </div>

          <button
            className="md:hidden flex items-center text-white ml-4"
            onClick={toggleMenu}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4">
          <ul className="flex flex-col space-y-2">
            <li>
              <Link
                to="/"
                className="block text-white hover:bg-rmutl-gold hover:text-rmutl-brown py-2 px-4 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                แชทบอท
              </Link>
            </li>
            <li>
              <Link
                to="/pdflist"
                className="block text-white hover:bg-rmutl-gold hover:text-rmutl-brown py-2 px-4 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                คู่มือปฏิบัติงาน
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block text-white hover:bg-rmutl-gold hover:text-rmutl-brown py-2 px-4 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                เกี่ยวกับ
              </Link>
            </li>
            <li className="pt-2 border-t border-rmutl-tan">
              <div className="flex justify-center items-center w-full">
                <Admin />
              </div>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;