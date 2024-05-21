import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Nav = ({ token, handleLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[#ffd433] p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-[#c69f56] font-bold text-2xl">Sarará Estoque</div>
        <div className="md:hidden" onClick={toggleMenu}>
          {isOpen ? <FaTimes className="text-white" /> : <FaBars className="text-white" />}
        </div>
        <div className={`flex-col md:flex-row md:flex md:space-x-4 ${isOpen ? 'flex' : 'hidden'} md:items-center w-full md:w-auto`}>
          <Link to="/boas-vindas" className="text-white hover:text-[#c69f56] py-2 md:py-0">
            Boas Vindas
          </Link>
          {token ? (
            <>
              <Link to="/beverages" className="text-white hover:text-[#c69f56] py-2 md:py-0">
                Bebidas
              </Link>
              <Link to="/ingredients" className="text-white hover:text-[#c69f56] py-2 md:py-0">
                Ingredientes
              </Link>
              <Link to="/cadastro-beverage" className="text-white hover:text-[#c69f56] py-2 md:py-0">
                Cadastro de Bebidas
              </Link>
              <Link to="/cadastro-ingredient" className="text-white hover:text-[#c69f56] py-2 md:py-0">
                Cadastro de Ingredientes
              </Link>
              <button onClick={handleLogoutClick} className="text-white hover:text-[#c69f56] py-2 md:py-0">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-[#c69f56] py-2 md:py-0">
                Login
              </Link>
              <Link to="/cadastro" className="text-white hover:text-[#c69f56] py-2 md:py-0">
                Cadastro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
