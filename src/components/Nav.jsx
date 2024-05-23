import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-[#c69f56] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Sarará Estoque Bar</h1>
        
        <div className="md:hidden" onClick={toggleNav}>
      
        </div>
        <ul className={`md:flex md:items-center ${isOpen ? 'block' : 'hidden'} w-full md:w-auto`}>
          <li className="md:ml-4">
            <Link to="/login" onClick={closeNav} className="text-white block md:inline-block mt-4 md:mt-0">Login</Link>
          </li>
          <li className="md:ml-4">
            <Link to="/cadastro" onClick={closeNav} className="text-white block md:inline-block mt-4 md:mt-0">Cadastro</Link>
          </li>
          <li className="md:ml-4">
            <Link to="/boas-vindas" onClick={closeNav} className="text-white block md:inline-block mt-4 md:mt-0">Boas Vindas</Link>
          </li>
          <li className="md:ml-4">
            <Link to="/beverages" onClick={closeNav} className="text-white block md:inline-block mt-4 md:mt-0">Bebidas</Link>
          </li>
          <li className="md:ml-4">
            <Link to="/ingredients" onClick={closeNav} className="text-white block md:inline-block mt-4 md:mt-0">Ingredientes</Link>
          </li>
          <li className="md:ml-4">
            <Link to="/cadastro-beverage" onClick={closeNav} className="text-white block md:inline-block mt-4 md:mt-0">Cadastro Bebida</Link>
          </li>
          <li className="md:ml-4">
            <Link to="/cadastro-ingredient" onClick={closeNav} className="text-white block md:inline-block mt-4 md:mt-0">Cadastro Ingrediente</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
