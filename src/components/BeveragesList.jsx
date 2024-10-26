import { useEffect, useState } from 'react';
import BeverageCard from './BeverageCard';
import EditBeverageCard from './EditBeverageCard';
import BeverageHistory from './BeverageHistory';

const BeveragesList = () => {
  const [beverages, setBeverages] = useState([]);
  const [error, setError] = useState('');
  const [editingBeverage, setEditingBeverage] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);

  useEffect(() => {
    const fetchBeverages = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch('https://sarara-be.vercel.app/api/beverages', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBeverages(data);
        } else if (response.status === 403) {
          setError('Você não tem permissão para acessar este recurso.');
        } else {
          setError('Erro ao buscar bebidas. Por favor, tente novamente.');
        }
      } catch (error) {
        console.error('Erro de rede:', error);
        setError('Erro de rede. Por favor, tente novamente mais tarde.');
      }
    };
    fetchBeverages();
  }, []);

  const handleEditBeverage = (beverage) => {
    setEditingBeverage(beverage);
  };

  const handleDeleteBeverage = async (beverageId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://sarara-be.vercel.app/api/beverages/${beverageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setBeverages(beverages.filter(beverage => beverage._id !== beverageId));
      } else {
        setError('Erro ao deletar a bebida. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      setError('Erro de rede. Por favor, tente novamente mais tarde.');
    }
  };

  const handleSaveBeverage = async (updatedBeverage) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://sarara-be.vercel.app/api/beverages/${updatedBeverage._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBeverage),
      });
      if (response.ok) {
        const updatedBeverages = beverages.map(beverage =>
          beverage._id === updatedBeverage._id ? updatedBeverage : beverage
        );
        setBeverages(updatedBeverages);
        setEditingBeverage(null);
      } else {
        setError('Erro ao salvar a bebida. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      setError('Erro de rede. Por favor, tente novamente mais tarde.');
    }
  };

  const handleViewHistory = (beverage) => {
    console.log('Setting viewingHistory to:', beverage._id);
    setViewingHistory(beverage);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4 text-center text-blue-500">Lista de Bebidas</h1>
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
