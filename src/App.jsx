import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import BoasVindas from './components/BoasVindas';
import BeveragesList from './components/BeveragesList';
import IngredientsList from './components/IngredientsList';
import CreateBeverage from './components/CreateBeverage';
import CreateIngredient from './components/CreateIngredient';
import BeverageDetailPage from './pages/BeverageDetailPage';
import BeverageHistoryPage from './pages/BeverageHistoryPage';
import Nav from './components/Nav';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';

const App = () => {
  const handleLogin = (token) => {
    localStorage.setItem('authToken', token);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <div className="flex flex-col min-h-screen bg-background text-text">
          <Nav />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/boas-vindas" element={<BoasVindas />} />
              <Route path="/beverages" element={<BeveragesList />} />
              <Route path="/ingredients" element={<IngredientsList />} />
              <Route path="/cadastro-beverage" element={<CreateBeverage />} />
              <Route path="/cadastro-ingredient" element={<CreateIngredient />} />
              <Route path="/beverages/:id" element={<BeverageDetailPage />} />
              <Route path="/beverages/history" element={<BeverageHistoryPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <footer className="bg-primary-dark text-text-dark py-4 text-center">
            <p>&copy; 2024 BarChef. Todos os direitos reservados.</p>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;

