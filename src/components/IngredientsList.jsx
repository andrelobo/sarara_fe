import { useEffect, useState, useCallback } from 'react';
import IngredientCard from './IngredientCard';
import EditIngredientCard from './EditIngredientCard';
import ErrorBoundary from './ErrorBoundary';
import Pagination from './Pagination';
import { FaSearch } from 'react-icons/fa';

const IngredientsList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 9;

  const fetchIngredients = useCallback(async () => {
    try {
      const response = await fetch('https://sarara-be.vercel.app/api/ingredients');
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
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleEdit = useCallback((ingredient) => {
    setEditingIngredient(ingredient);
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await fetch(`https://sarara-be.vercel.app/api/ingredients/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Erro ao deletar o ingrediente');
      }
      setIngredients(prevIngredients => prevIngredients.filter(ingredient => ingredient._id !== id));
    } catch (error) {
      setError(error.message);
    }
  }, []);

  const handleSave = useCallback(async (updatedIngredient) => {
    try {
      const response = await fetch(`https://sarara-be.vercel.app/api/ingredients/${updatedIngredient._id}`, {
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
      setIngredients(prevIngredients => prevIngredients.map(ingredient => 
        ingredient._id === updatedData._id ? updatedData : ingredient
      ));
      setEditingIngredient(null);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIngredients = filteredIngredients.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <p className="text-center text-text">Carregando...</p>;
  }

  if (error) {
    return <p className="text-center text-error">{error}</p>;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background py-10">
        <h1 className="text-4xl text-secondary mb-10">Lista de Ingredientes</h1>
        <div className="mb-4 relative w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-background-light border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
          {currentIngredients.map(ingredient => (
            <IngredientCard
              key={ingredient._id}
              ingredient={ingredient}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        {editingIngredient && (
          <EditIngredientCard
            ingredient={editingIngredient}
            onSave={handleSave}
            onCancel={() => setEditingIngredient(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default IngredientsList;

