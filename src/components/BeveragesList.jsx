import { useEffect, useState, useCallback, useMemo } from 'react';
import BeverageCard from './BeverageCard';
import EditBeverageCard from './EditBeverageCard';
import BeverageHistory from './BeverageHistory';
import ErrorBoundary from './ErrorBoundary';
import Pagination from './Pagination';
import { FaSearch, FaSync } from 'react-icons/fa';

const API_BASE_URL = 'https://sarara-be.vercel.app/api'; // Ajuste esta URL para a URL correta do seu backend

const BeveragesList = () => {
  const [beverages, setBeverages] = useState([]);
  const [error, setError] = useState('');
  const [editingBeverage, setEditingBeverage] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const itemsPerPage = 9;

  const token = localStorage.getItem('authToken');
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  const handleError = useCallback((error, defaultMessage) => {
    console.error('Erro:', error);
    if (error.message === 'Failed to fetch') {
      setError('Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
    } else {
      setError(defaultMessage || 'Ocorreu um erro. Por favor, tente novamente.');
    }
  }, []);

  const fetchBeverages = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/beverages`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBeverages(data);
      setRetryCount(0);
    } catch (error) {
      handleError(error, 'Erro ao buscar bebidas. Por favor, tente novamente.');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 5000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [headers, handleError, retryCount]);

  useEffect(() => {
    fetchBeverages();
  }, [fetchBeverages, retryCount]);

  const handleEditBeverage = useCallback((beverage) => setEditingBeverage(beverage), []);

  const handleDeleteBeverage = useCallback(async (beverageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/beverages/${beverageId}`, {
        method: 'DELETE',
        headers,
      });
      if (response.ok) {
        setBeverages(prevBeverages => prevBeverages.filter(beverage => beverage._id !== beverageId));
      } else {
        throw new Error('Falha ao deletar a bebida');
      }
    } catch (error) {
      handleError(error, 'Erro ao deletar a bebida. Por favor, tente novamente.');
    }
  }, [headers, handleError]);

  const handleSaveBeverage = useCallback(async (updatedBeverage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/beverages/${updatedBeverage._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedBeverage),
      });
      if (response.ok) {
        setBeverages(prevBeverages => prevBeverages.map(beverage =>
          beverage._id === updatedBeverage._id ? updatedBeverage : beverage
        ));
        setEditingBeverage(null);
      } else {
        throw new Error('Falha ao salvar a bebida');
      }
    } catch (error) {
      handleError(error, 'Erro ao salvar a bebida. Por favor, tente novamente.');
    }
  }, [headers, handleError]);

  const handleViewHistory = useCallback((beverage) => setViewingHistory(beverage), []);

  const sortBeverages = useCallback((beverages) => {
    const categoriesOrder = ['Destilado', 'Fermentado', 'Não Alcoólico'];
    return beverages.sort((a, b) => {
      const categoryAIndex = categoriesOrder.indexOf(a.category);
      const categoryBIndex = categoriesOrder.indexOf(b.category);
      return categoryAIndex - categoryBIndex;
    });
  }, []);

  const filteredBeverages = useMemo(() => {
    const sortedBeverages = sortBeverages(beverages);
    return sortedBeverages.filter(beverage =>
      beverage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beverage.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [beverages, searchTerm, sortBeverages]);

  const totalPages = Math.ceil(filteredBeverages.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBeverages = filteredBeverages.slice(indexOfFirstItem, indexOfLastItem);

  if (isLoading && !error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 bg-background min-h-screen">
        <h1 className="text-3xl mb-6 text-center text-text">Lista de Bebidas</h1>
        {error && (
          <div className="text-error text-center mb-4 p-4 bg-background-light rounded-lg border border-error">
            <p>{error}</p>
            <button 
              onClick={fetchBeverages} 
              className="mt-2 px-4 py-2 bg-primary text-text rounded hover:bg-primary-light transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Tentar Novamente
            </button>
          </div>
        )}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar bebidas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-background-light border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark" />
        </div>
        {beverages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBeverages.map(beverage => (
                <BeverageCard
                  key={beverage._id}
                  beverage={beverage}
                  onEditBeverage={handleEditBeverage}
                  onDeleteBeverage={handleDeleteBeverage}
                  onViewHistory={handleViewHistory}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <p className="text-center text-text-dark">Nenhuma bebida encontrada.</p>
        )}
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
    </ErrorBoundary>
  );
};

export default BeveragesList;
