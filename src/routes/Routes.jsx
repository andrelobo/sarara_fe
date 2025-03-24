import { Routes, Route } from 'react-router-dom';
import CadastroComponent from '../components/Cadastro';

import BeveragesList from '../components/BeveragesList';
import BeverageHistoryPage from '../pages/BeverageHistoryPage';
import IngredientsList from '../components/IngredientsList';
import IngredientHistoryPage from '../pages/IngredientHistoryPage';
import LoginComponent from '../components/Login';


const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/cadastro" element={<CadastroComponent onCadastro={handleCadastro}/>} />
      <Route path="/login" element={<LoginComponent  onLogin={(token) => token}/>} />
        <Route path="/beverages" element={<BeveragesList onLogin={(token) => token}/>} />
       
      <Route path="/ingredients" element={<IngredientsList onLogin={(token) => token}/>} />
      <Route path="/beverages/history" component={BeverageHistoryPage} />
      <Route path="/ingredients/history" component={IngredientHistoryPage} />
      <Route path="/logout" element={<LoginComponent  onLogout={(token) => token}/>} />
       
    </Routes>
  );
};

export default RoutesComponent;

