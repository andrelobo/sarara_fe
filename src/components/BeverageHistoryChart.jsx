import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const BeverageHistoryChart = () => {
  const [beverages, setBeverages] = useState([]);
  const [selectedBeverage, setSelectedBeverage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetching the list of beverages
    const fetchBeverages = async () => {
      try {
        const response = await axios.get('https://sarara-be.vercel.app/api/beverages'); // Ajuste o endpoint conforme necessário
        setBeverages(response.data);
      } catch (error) {
        console.error('Error fetching beverages:', error);
        setError('Failed to load beverages');
      }
    };

    fetchBeverages();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.post(`https://sarara-be.vercel.app/api/beverages/${selectedBeverage}/history`, {
        startDate,
        endDate,
      });

      const formattedData = response.data.map(item => ({
        date: new Date(item.date).toLocaleDateString(), // Formatando a data
        totalChange: item.change === 'added' ? item.quantity : -item.quantity,
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching beverage history:', error);
      setError('Failed to load data');
    }
  };

  const handleBeverageChange = (e) => {
    setSelectedBeverage(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] text-gray-300">
      <div className="max-w-md w-full p-8 bg-gray-900 shadow-md rounded-lg">
        <h2 className="text-center text-3xl text-blue-500 mb-4">Histórico de Bebidas</h2>
        
        <div className="mb-4 space-y-4">
          <div>
            <label htmlFor="beverageSelect" className="block text-gray-300">Escolha uma bebida:</label>
            <select 
              id="beverageSelect" 
              value={selectedBeverage} 
              onChange={handleBeverageChange} 
              className="w-full px-3 py-2 border border-gray-600 placeholder-gray-500 bg-gray-700 text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="">Escolha uma bebida:</option>
              {beverages.map((beverage) => (
                <option key={beverage._id} value={beverage._id}>
                  {beverage.name}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label htmlFor="startDate" className="block text-gray-300">Data de Início:</label>
            <input 
              type="date" 
              id="startDate" 
              value={startDate} 
              onChange={handleStartDateChange} 
              className="w-full px-3 py-2 border border-gray-600 placeholder-gray-500 bg-gray-700 text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            />
          </div>
  
          <div>
            <label htmlFor="endDate" className="block text-gray-300">Data Final:</label>
            <input 
              type="date" 
              id="endDate" 
              value={endDate} 
              onChange={handleEndDateChange} 
              className="w-full px-3 py-2 border border-gray-600 placeholder-gray-500 bg-gray-700 text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            />
          </div>
  
          <button 
            onClick={fetchData} 
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
          >
            Buscar Dados
          </button>
        </div>
  
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-400 mt-4">Sem modificações nessa data</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalChange" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="totalChange" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
  
};

export default BeverageHistoryChart;
