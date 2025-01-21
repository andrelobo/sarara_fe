import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';

// Lazy Loading de Rotas
const Login = lazy(() => import('./components/Login'));
const Cadastro = lazy(() => import('./components/Cadastro'));
const BoasVindas = lazy(() => import('./components/BoasVindas'));
const BeveragesList = lazy(() => import('./components/BeveragesList'));
const IngredientsList = lazy(() => import('./components/IngredientsList'));
const CreateBeverage = lazy(() => import('./components/CreateBeverage'));
const CreateIngredient = lazy(() => import('./components/CreateIngredient'));
const BeverageDetailPage = lazy(() => import('./pages/BeverageDetailPage'));
const BeverageHistoryPage = lazy(() => import('./pages/BeverageHistoryPage'));

const App = () => {
  const handleLogin = (token) => {
    localStorage.setItem('authToken', token);
  };

  const isAuthenticated = !!localStorage.getItem('authToken');

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <div className="flex flex-col min-h-screen bg-background text-text">
          <Nav />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route
                  path="/login"
                  element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/boas-vindas" replace />}
                />
                <Route
                  path="/cadastro"
                  element={!isAuthenticated ? <Cadastro /> : <Navigate to="/boas-vindas" replace />}
                />
                <Route path="/boas-vindas" element={isAuthenticated ? <BoasVindas /> : <Navigate to="/login" replace />} />
                <Route path="/beverages" element={isAuthenticated ? <BeveragesList /> : <Navigate to="/login" replace />} />
                <Route path="/ingredients" element={isAuthenticated ? <IngredientsList /> : <Navigate to="/login" replace />} />
                <Route path="/cadastro-beverage" element={isAuthenticated ? <CreateBeverage /> : <Navigate to="/login" replace />} />
                <Route path="/cadastro-ingredient" element={isAuthenticated ? <CreateIngredient /> : <Navigate to="/login" replace />} />
                <Route path="/beverages/:id" element={isAuthenticated ? <BeverageDetailPage /> : <Navigate to="/login" replace />} />
                <Route path="/beverages/history" element={isAuthenticated ? <BeverageHistoryPage /> : <Navigate to="/login" replace />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
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
