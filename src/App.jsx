import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import React, { useState } from "react";
import Login from "./components/Login";
import Cadastro from "./components/Cadastro";
import BoasVindas from "./components/BoasVindas";
import BeveragesList from "./components/BeveragesList";
import IngredientsList from "./components/IngredientsList";
import CadastroBeverage from "./components/CreateBeverage";
import CadastroIngredient from "./components/CreateIngredient";
import BeverageDetailPage from "./pages/BeverageDetailPage";
import Nav from "./components/Nav";
import BeverageHistoryPage from "./pages/BeverageHistoryPage";

const App = () => {
  const [token, setToken] = useState(null);
  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem("authToken", token);
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
        <Route path="/beverages/history" element={<BeverageHistoryPage />} />
        {/* Redireciona para /login por padrão */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
