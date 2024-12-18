import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import sararaLogo from '../assets/sarara-logo.png'; // Importando a imagem do logo

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBeveragesOpen, setIsBeveragesOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const closeNav = () => {
    setIsOpen(false);
    setIsBeveragesOpen(false);
    setIsIngredientsOpen(false);
  };

  const toggleSubMenu = (setSubMenu) => {
    setSubMenu(prevIsOpen => !prevIsOpen);
  };

  return (
    <nav className="bg-[#15508c] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" onClick={closeNav} className="flex items-center ml-2">
          <img src={sararaLogo} alt="Sarará Estoque Bar" width={150} />
         
          <h8 className="mt-2 ml-4 text-yellow-500 text-xs">Bar Chef</h8>        </Link>

        {!isOpen && (
          <div className="md:hidden" onClick={toggleNav}>
            <FaBars className="text-yellow-300" size={24} />
          </div>
        )}

        {isOpen && (
          <div className="md:hidden absolute top-0 right-0 p-2" onClick={closeNav}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}

        <ul className={`md:flex md:items-center ${isOpen ? 'flex flex-col items-center mt-4' : 'hidden'} w-full md:w-auto`}>
          <li className="md:ml-4 my-2 md:my-0">
            <Link to="/login" onClick={closeNav} className="text-yellow-300 block md:inline-block">Login</Link>
          </li>
          <li className="md:ml-4 my-2 md:my-0">
            <Link to="/cadastro" onClick={closeNav} className="text-yellow-300 block md:inline-block">Cadastro</Link>
          </li>
          <li className="md:ml-4 my-2 md:my-0 relative">
            <button onClick={() => toggleSubMenu(setIsBeveragesOpen)} className="text-white block md:inline-block focus:outline-none">
              Bebidas
            </button>
            {isBeveragesOpen && (
              <ul className="bg-[#15508c] mt-2 p-2 rounded-lg md:absolute md:mt-0 md:ml-4 md:shadow-lg text-sm text-gray-200">
                <li className="my-2 md:my-0">
                  <Link to="/beverages" onClick={closeNav} className="block md:inline-block">Lista de Bebidas</Link>
                </li>
                <li className="my-2 md:my-0">
                  <Link to="/cadastro-beverage" onClick={closeNav} className="block md:inline-block">Cadastro de Bebidas</Link>
                </li>
                <li className="my-2 md:my-0">
                  <Link to="/beverages/history" onClick={closeNav} className="block md:inline-block">Gráficos de Bebidas</Link>
                </li>

              </ul>
            )}
          </li>
          <li className="md:ml-4 my-2 md:my-0 relative">
            <button onClick={() => toggleSubMenu(setIsIngredientsOpen)} className="text-white block md:inline-block focus:outline-none">
              Ingredientes
            </button>
            {isIngredientsOpen && (
              <ul className="bg-[#15508c] mt-2 p-2 rounded-lg md:absolute md:mt-0 md:ml-4 md:shadow-lg text-sm text-gray-200">
                <li className="my-2 md:my-0">
                  <Link to="/ingredients" onClick={closeNav} className="block md:inline-block">Lista de Ingredientes</Link>
                </li>
                <li className="my-2 md:my-0">
                  <Link to="/cadastro-ingredient" onClick={closeNav} className="block md:inline-block">Cadastro Ingrediente</Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
    
  );
};

export default Nav;
