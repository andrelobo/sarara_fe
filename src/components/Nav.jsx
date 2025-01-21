import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaGlassMartiniAlt, FaCarrot, FaSignInAlt, FaUserPlus, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/sarara-logo.png';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/boas-vindas', name: 'Home', icon: <FaHome /> },
    { path: '/beverages', name: 'Bebidas', icon: <FaGlassMartiniAlt /> },
    { path: '/ingredients', name: 'Ingredientes', icon: <FaCarrot /> },
    { path: '/beverages/history', name: 'Histórico de Bebidas', icon: <FaChartLine /> },
    { path: '/login', name: 'Login', icon: <FaSignInAlt /> },
    { path: '/cadastro', name: 'Cadastro', icon: <FaUserPlus /> },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-primary text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src={logo}
                alt="BarChef Logo"
                loading="lazy" // Otimização para 4G
              />
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-primary-dark text-secondary'
                        : 'text-text-dark hover:bg-primary-light hover:text-text'
                    }`}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-primary-dark inline-flex items-center justify-center p-2 rounded-md text-text-dark hover:text-text hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
              {isOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === item.path
                  ? 'bg-primary-dark text-secondary'
                  : 'text-text-dark hover:bg-primary-light hover:text-text'
              }`}
              onClick={toggleMenu}
            >
              <span className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
