import React, { useEffect, useState } from 'react';
import IngredientCard from './IngredientCard';
import EditIngredientCard from './EditIngredientCard';

const IngredientsList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('http://localhost:7778/api/ingredients');
        if (!response.ok) {
          throw new Error('Erro ao buscar os ingredientes');
        }
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:7778/api/ingredients/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Erro ao deletar o ingrediente');
      }
      setIngredients(ingredients.filter(ingredient => ingredient._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSave = async (updatedIngredient) => {
    try {
      const response = await fetch(`http://localhost:7778/api/ingredients/${updatedIngredient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedIngredient)
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar o ingrediente');
      }
      const updatedData = await response.json();
      setIngredients(ingredients.map(ingredient => ingredient._id === updatedData._id ? updatedData : ingredient));
      setEditingIngredient(null);
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
      <h1 className="text-4xl font-bold text-[#c69f56] mb-10">Lista de Ingredientes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        {ingredients.map(ingredient => (
          <IngredientCard
            key={ingredient._id}
            ingredient={ingredient}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {editingIngredient && (
        <EditIngredientCard
          ingredient={editingIngredient}
          onSave={handleSave}
          onCancel={() => setEditingIngredient(null)}
        />
      )}
    </div>
  );
};

export default IngredientsList;
