import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

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
    <nav className="bg-[#ffd433] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Sarará Estoque Bar</h1>

        {!isOpen && (
          <div className="md:hidden" onClick={toggleNav}>
            <FaBars className="text-white" size={24} />
          </div>
        )}

        <ul className={`md:flex md:items-center ${isOpen ? 'flex flex-col items-center mt-4' : 'hidden'} w-full md:w-auto`}>
          <li className="md:ml-4 my-2 md:my-0">
            <Link to="/login" onClick={closeNav} className="text-white block md:inline-block">Login</Link>
          </li>
          <li className="md:ml-4 my-2 md:my-0">
            <Link to="/cadastro" onClick={closeNav} className="text-white block md:inline-block">Cadastro</Link>
          </li>
          <li className="md:ml-4 my-2 md:my-0 relative">
            <button onClick={() => toggleSubMenu(setIsBeveragesOpen)} className="text-white block md:inline-block focus:outline-none">
              Bebidas
            </button>
            {isBeveragesOpen && (
              <ul className="bg-[#d4b77a] mt-2 p-2 rounded-lg md:absolute md:mt-0 md:ml-4 md:shadow-lg text-sm text-gray-200">
                <li className="my-2 md:my-0">
                  <Link to="/beverages" onClick={closeNav} className="block md:inline-block">Lista de Bebidas</Link>
                </li>
                <li className="my-2 md:my-0">
                  <Link to="/cadastro-beverage" onClick={closeNav} className="block md:inline-block">Cadastro Bebida</Link>
                </li>
              </ul>
            )}
          </li>
          <li className="md:ml-4 my-2 md:my-0 relative">
            <button onClick={() => toggleSubMenu(setIsIngredientsOpen)} className="text-white block md:inline-block focus:outline-none">
              Ingredientes
            </button>
            {isIngredientsOpen && (
              <ul className="bg-[#d4b77a] mt-2 p-2 rounded-lg md:absolute md:mt-0 md:ml-4 md:shadow-lg text-sm text-gray-200">
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
