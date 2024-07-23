import React, { useState, useEffect } from 'react';

const BeverageHistory = ({ beverage, onClose }) => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    console.log("Beverage ID:", beverage._id); // Log Beverage ID
  }, [beverage]);

  const fetchHistory = async () => {
    const token = localStorage.getItem('authToken');
    console.log("Fetching history with dates:", startDate, endDate); // Log dates

    try {
      const response = await fetch(`http://sararachefbar.eba-fttqyxx2.sa-east-1.elasticbeanstalk.com/api/beverages/${beverage._id}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ startDate, endDate }),
      });

      console.log("Response status:", response.status); // Log response status

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data:", data); // Log fetched data
        setHistory(data);
      } else if (response.status === 403) {
        setError('Você não tem permissão para acessar este recurso.');
      } else {
        setError('Erro ao buscar o histórico. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      setError('Erro de rede. Por favor, tente novamente mais tarde.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchHistory();
    }
  }, [startDate, endDate]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Histórico da Bebida: <span className="text-blue-500">{beverage.name}</span></h2>
        <button onClick={onClose} className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg">
          Fechar
        </button>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700">Data de Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Data de Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Buscar Histórico
          </button>
        </form>
        {history.length === 0 ? (
          <p className="text-gray-700">Nenhum histórico disponível para as datas selecionadas.</p>
        ) : (
          <ul>
            {history.map((entry) => (
              <li key={entry._id} className="mb-2">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p>
                    <span className="font-bold">Data:</span> {new Date(entry.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-bold">Mudança:</span> {entry.change}
                  </p>
                  <p>
                    <span className="font-bold">Quantidade:</span> {entry.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BeverageHistory;
