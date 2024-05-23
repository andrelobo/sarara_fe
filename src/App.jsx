import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import BoasVindas from './components/BoasVindas';
import BeveragesList from './components/BeveragesList';
import IngredientsList from './components/IngredientsList';
import CadastroBeverage from './components/CreateBeverage';
import CadastroIngredient from './components/CreateIngredient';
import Nav from './components/Nav';

const App = () => {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/boas-vindas" element={<BoasVindas />} />
        <Route path="/beverages" element={<BeveragesList />} />
        <Route path="/ingredients" element={<IngredientsList />} />
        <Route path="/cadastro-beverage" element={<CadastroBeverage />} />
        <Route path="/cadastro-ingredient" element={<CadastroIngredient />} />
        {/* Adicione outras rotas conforme necessário */}
      </Routes>
    </Router>
  );
};

export default App;
