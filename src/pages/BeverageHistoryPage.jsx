import React, { useState, useEffect } from 'react';
import BeverageHistory from './components/BeverageHistory';

const BeverageHistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Supondo que você tenha uma função para buscar o histórico da bebida
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://sararachefbar.eba-fttqyxx2.sa-east-1.elasticbeanstalk.com/api/beverages/663d5e59a6d7c05e36a63171/history?startDate=2024-01-01&endDate=2024-07-31');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="max-w-md w-full">
        <BeverageHistory history={history} />
      </div>
    </div>
  );
};

export default BeverageHistoryPage;
