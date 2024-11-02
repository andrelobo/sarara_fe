import { useEffect, useState } from 'react';
import BeverageCard from './BeverageCard';
import EditBeverageCard from './EditBeverageCard';
import BeverageHistory from './BeverageHistory';

const BeveragesList = () => {
  const [beverages, setBeverages] = useState([]);
  const [error, setError] = useState('');
  const [editingBeverage, setEditingBeverage] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);

  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const handleError = (response, defaultMessage) => {
    if (response.status === 403) {
      setError('Você não tem permissão para acessar este recurso.');
    } else {
      setError(defaultMessage);
    }
  };

  useEffect(() => {
    const fetchBeverages = async () => {
      try {
        const response = await fetch('https://sarara-be.vercel.app/api/beverages', { headers });
        if (response.ok) {
          const data = await response.json();
          setBeverages(data);
        } else {
          handleError(response, 'Erro ao buscar bebidas. Por favor, tente novamente.');
        }
      } catch (error) {
        console.error('Erro de rede:', error);
        setError('Erro de rede. Por favor, tente novamente mais tarde.');
      }
    };
    fetchBeverages();
  }, []);

  const handleEditBeverage = (beverage) => setEditingBeverage(beverage);

  const handleDeleteBeverage = async (beverageId) => {
    try {
      const response = await fetch(`https://sarara-be.vercel.app/api/beverages/${beverageId}`, {
        method: 'DELETE',
        headers,
      });
      if (response.ok) {
        setBeverages(beverages.filter(beverage => beverage._id !== beverageId));
      } else {
        handleError(response, 'Erro ao deletar a bebida. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      setError('Erro de rede. Por favor, tente novamente mais tarde.');
    }
  };

  const handleSaveBeverage = async (updatedBeverage) => {
    try {
      const response = await fetch(`https://sarara-be.vercel.app/api/beverages/${updatedBeverage._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedBeverage),
      });
      if (response.ok) {
        setBeverages(beverages.map(beverage => 
          beverage._id === updatedBeverage._id ? updatedBeverage : beverage
        ));
        setEditingBeverage(null);
      } else {
        handleError(response, 'Erro ao salvar a bebida. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      setError('Erro de rede. Por favor, tente novamente mais tarde.');
    }
  };

  const handleViewHistory = (beverage) => setViewingHistory(beverage);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4 text-center text-white-500">Lista de Bebidas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beverages.map(beverage => (
          <BeverageCard
            key={beverage._id}
            beverage={beverage}
            onEditBeverage={handleEditBeverage}
            onDeleteBeverage={handleDeleteBeverage}
            onViewHistory={handleViewHistory}
          />
        ))}
      </div>
      {editingBeverage && (
        <EditBeverageCard
          beverage={editingBeverage}
          onSave={handleSaveBeverage}
          onCancel={() => setEditingBeverage(null)}
        />
      )}
      {viewingHistory && (
        <BeverageHistory
          beverage={viewingHistory}
          onClose={() => setViewingHistory(null)}
        />
      )}
    </div>
  );
};

export default BeveragesList;
