import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import BoasVindas from './components/BoasVindas';
import BeveragesList from './components/BeveragesList';
import IngredientsList from './components/IngredientsList';
import CreateBeverage from './components/CreateBeverage';
import CreateIngredient from './components/CreateIngredient';
import Nav from './components/Nav';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Nav token={token} handleLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/cadastro" element={<Cadastro onCadastro={handleLogin} />} />
        <Route path="/boas-vindas" element={token ? <BoasVindas /> : <Navigate to="/login" />} />
        <Route path="/beverages" element={token ? <BeveragesList /> : <Navigate to="/login" />} />
        <Route path="/ingredients" element={token ? <IngredientsList /> : <Navigate to="/login" />} />
        <Route path="/cadastro-beverage" element={token ? <CreateBeverage /> : <Navigate to="/login" />} />
        <Route path="/cadastro-ingredient" element={token ? <CreateIngredient /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
