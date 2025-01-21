import React, { useEffect, useState, useCallback, useMemo } from 'react';
import BeverageCard from './BeverageCard';
import EditBeverageCard from './EditBeverageCard';
import BeverageHistory from './BeverageHistory';
import ErrorBoundary from './ErrorBoundary';
import Pagination from './Pagination';
import { FaSearch, FaSync } from 'react-icons/fa';

const API_BASE_URL = 'https://sarara-be.vercel.app/api';

const BEVERAGE_ORDER = [
  'Cachaça Pirassununga 51',
  'Cachaça Cravinho',
  'Gin Rock',
  'Gin Gordon',
  'Gin Tanqueray',
  'Gin Hilary',
  'Vodka Smirnoff',
  'Vodka Absolut',
  'Tequila Prata',
  'Tequila Ouro',
  'Whisky Old Parr',
  'Whisky Red Label',
  'Aperol',
  'Espumante para venda',
  'Espumante para drinks',
  'Vinho Tinto',
  'Vinho Rosé',
  'Monin Morango',
  'Água Tônica',
  'Red Bull Tropical',
  'Bali Tropical'
];

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
    setError(
      error.message === 'Failed to fetch'
        ? 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.'
        : defaultMessage || 'Ocorreu um erro. Por favor, tente novamente.'
    );
  }, []);

  const fetchBeverages = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/beverages`, { headers });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBeverages(data);
      setRetryCount(0);
    } catch (error) {
      handleError(error, 'Erro ao buscar bebidas. Por favor, tente novamente.');
      if (retryCount < 3) setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [headers, handleError, retryCount]);

  useEffect(() => {
    fetchBeverages();
  }, [fetchBeverages]);

  const handleEditBeverage = beverage => setEditingBeverage(beverage);
  const handleViewHistory = beverage => setViewingHistory(beverage);

  const handleDeleteBeverage = useCallback(async (beverageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/beverages/${beverageId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) throw new Error('Falha ao deletar a bebida');
      setBeverages(prev => prev.filter(b => b._id !== beverageId));
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
      if (!response.ok) throw new Error('Falha ao salvar a bebida');
      setBeverages(prev => prev.map(b => b._id === updatedBeverage._id ? updatedBeverage : b));
      setEditingBeverage(null);
    } catch (error) {
      handleError(error, 'Erro ao salvar a bebida. Por favor, tente novamente.');
    }
  }, [headers, handleError]);

  const sortBeverages = useCallback(beveragesToSort => {
    return beveragesToSort.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      const indexA = BEVERAGE_ORDER.findIndex(item =>
        nameA.includes(item.toLowerCase()) || item.toLowerCase().includes(nameA)
      );
      const indexB = BEVERAGE_ORDER.findIndex(item =>
        nameB.includes(item.toLowerCase()) || item.toLowerCase().includes(nameB)
      );

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, []);

  const filteredBeverages = useMemo(() => {
    const filtered = beverages.filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortBeverages(filtered);
  }, [beverages, searchTerm, sortBeverages]);

  const totalPages = Math.ceil(filteredBeverages.length / itemsPerPage);
  const currentBeverages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBeverages.slice(start, start + itemsPerPage);
  }, [filteredBeverages, currentPage, itemsPerPage]);

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
        {filteredBeverages.length > 0 ? (
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
