import React, { useEffect, useState } from 'react';
import BeverageCard from './BeverageCard';
import EditBeverageCard from './EditBeverageCard';

const BeveragesList = () => {
  const [beverages, setBeverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBeverage, setEditingBeverage] = useState(null);

  useEffect(() => {
    const fetchBeverages = async () => {
      try {
        const response = await fetch('https://sarara-be.onrender.com/api/beverages');
        if (!response.ok) {
          throw new Error('Erro ao buscar as bebidas');
        }
        const data = await response.json();
        setBeverages(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBeverages();
  }, []);

  const handleEdit = (beverage) => {
    setEditingBeverage(beverage);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://sarara-be.onrender.com/api/beverages/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Erro ao deletar a bebida');
      }
      setBeverages(beverages.filter(beverage => beverage._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSave = async (updatedBeverage) => {
    try {
      const response = await fetch(`https://sarara-be.onrender.com/api/beverages/${updatedBeverage._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedBeverage)
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar a bebida');
      }
      const updatedData = await response.json();
      setBeverages(beverages.map(beverage => beverage._id === updatedData._id ? updatedData : beverage));
      setEditingBeverage(null);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-700">Carregando...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] py-10">
      <h1 className="text-4xl font-bold text-[#c69f56] mb-10">Lista de Bebidas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        {beverages.map(beverage => (
          <BeverageCard
            key={beverage._id}
            beverage={beverage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {editingBeverage && (
        <EditBeverageCard
          beverage={editingBeverage}
          onSave={handleSave}
          onCancel={() => setEditingBeverage(null)}
        />
      )}
    </div>
  );
};

export default BeveragesList;
