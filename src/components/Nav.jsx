import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaGlassMartiniAlt, FaCarrot, FaSignInAlt, FaUserPlus, FaChartLine, FaSignOutAlt, FaBars, FaTimes, FaWifi, FaBan } from 'react-icons/fa';
import logo from '../assets/sarara-logo.png';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Estado para verificar a conexão
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Verifica o status da conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', name: 'Home', icon: <FaHome /> },
    { path: '/beverages', name: 'Bebidas', icon: <FaGlassMartiniAlt /> },
    { path: '/ingredients', name: 'Ingredientes', icon: <FaCarrot /> },
    { path: '/beverages/history', name: 'Histórico de Bebidas', icon: <FaChartLine /> },
    { path: '/ingredients/history', name: 'Histórico de Ingredientes', icon: <FaChartLine /> },
  ];

  const authItems = token
    ? [{ name: 'Logout', icon: <FaSignOutAlt />, onClick: handleLogout }]
    : [
        { path: '/login', name: 'Login', icon: <FaSignInAlt /> },
        { path: '/cadastro', name: 'Cadastro', icon: <FaUserPlus /> },
      ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img className="h-8 w-auto" src={logo} alt="BarChef Logo" loading="lazy" />
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-gray-800 text-[#f8b431]'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </span>
                  </Link>
                ))}
                {authItems.map((item, index) =>
                  item.path ? (
                    <Link
                      key={index}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === item.path
                          ? 'bg-gray-800 text-[#f8b431]'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </span>
                    </Link>
                  ) : (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <span className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </span>
                    </button>
                  )
                )}
                {/* Indicador de status da conexão */}
                <div className="flex items-center">
                  {isOnline ? (
                    <FaWifi className="text-green-500" title="Online" />
                  ) : (
                    <FaBan className="text-red-500" title="Offline" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
              {isOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === item.path
                  ? 'bg-gray-800 text-[#f8b431]'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={toggleMenu}
            >
              <span className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </span>
            </Link>
          ))}
          {authItems.map((item, index) =>
            item.path ? (
              <Link
                key={index}
                to={item.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={toggleMenu}
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </span>
              </Link>
            ) : (
              <button
                key={index}
                onClick={() => {
                  toggleMenu();
                  item.onClick();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;