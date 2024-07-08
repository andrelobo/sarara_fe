import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState } from 'react';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import BoasVindas from './components/BoasVindas';
import BeveragesList from './components/BeveragesList';
import IngredientsList from './components/IngredientsList';
import CadastroBeverage from './components/CreateBeverage';
import CadastroIngredient from './components/CreateIngredient';
import BeverageDetailPage from './pages/BeverageDetailPage';
import BeverageHistory from './components/BeverageHistory';
import Nav from './components/Nav';

const App = () => {
  const [token, setToken] = useState(null);

  const handleLogin = (token) => {
    setToken(token);
    // Você também pode armazenar o token no localStorage se quiser persistir após um refresh
    localStorage.setItem('authToken', token);
  };

  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/boas-vindas" element={<BoasVindas />} />
        <Route path="/beverages" element={<BeveragesList />} />
        <Route path="/ingredients" element={<IngredientsList />} />
        <Route path="/cadastro-beverage" element={<CadastroBeverage />} />
        <Route path="/cadastro-ingredient" element={<CadastroIngredient />} />
        <Route path="/beverages/:id" element={<BeverageDetailPage />} />
        <Route path="/beverages/:id/history" element={<BeverageHistory />} />
        {/* Adicione outras rotas conforme necessário */}
      </Routes>
    </Router>
  );
};

export default App;
