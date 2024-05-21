import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CadastroComponent from '../components/Cadastro';
import LoginComponent from '../components/Login';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/cadastro" element={<CadastroComponent onCadastro={handleCadastro}/>} />
      <Route path="/login" element={<LoginComponent  onLogin={(token) => token}/>} />
      <Route path="/ingredients" element={<IngredientsList onLogin={(token) => token}/>} />
    </Routes>
  );
};

export default RoutesComponent;

