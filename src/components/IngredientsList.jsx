import { useEffect, useState, useCallback } from 'react';
import IngredientCard from './IngredientCard';
import EditIngredientCard from './EditIngredientCard';
import ErrorBoundary from './ErrorBoundary';
import Pagination from './Pagination';
import { FaSearch } from 'react-icons/fa';

// Constantes globais
const API_BASE_URL = 'https://sarara-be.vercel.app/api/ingredients';
const ITEMS_PER_PAGE = 9;

const IngredientsList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Erro ao buscar os ingredientes');

      const data = await response.json();
      setIngredients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleEdit = (ingredient) => setEditingIngredient(ingredient);

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar o ingrediente');

      setIngredients((prev) => prev.filter((ingredient) => ingredient._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleSave = useCallback(async (updatedIngredient) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${updatedIngredient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIngredient),
      });
      if (!response.ok) throw new Error('Erro ao atualizar o ingrediente');

      const updatedData = await response.json();
      setIngredients((prev) =>
        prev.map((ingredient) =>
          ingredient._id === updatedData._id ? updatedData : ingredient
        )
      );
      setEditingIngredient(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const filteredIngredients = ingredients.filter(({ name, category }) =>
    [name, category].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE);
  const currentIngredients = filteredIngredients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <p className="text-center text-text">Carregando...</p>;
  if (error) return <p className="text-center text-error">{error}</p>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background py-10">
        <h1 className="text-4xl text-secondary mb-10">Lista de Ingredientes</h1>

        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <IngredientGrid
          ingredients={currentIngredients}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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

const SearchBar = ({ value, onChange }) => (
  <div className="mb-4 relative w-full max-w-md">
    <input
      type="text"
      placeholder="Buscar ingredientes..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 pl-10 bg-background-light border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
    />
    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark" />
  </div>
);

const IngredientGrid = ({ ingredients, onEdit, onDelete }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
    {ingredients.map((ingredient) => (
      <IngredientCard
        key={ingredient._id}
        ingredient={ingredient}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);

export default IngredientsList;
