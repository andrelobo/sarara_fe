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
        const response = await axios.get('http://localhost:7778/api/beverages'); // Ajuste o endpoint conforme necessário
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
      const response = await axios.post(`http://localhost:7778/api/beverages/${selectedBeverage}/history`, {
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
    <div>
      <div className="mb-4">
        <label htmlFor="beverageSelect">Escolha uma bebida:</label>
        <select id="beverageSelect" value={selectedBeverage} onChange={handleBeverageChange} className="ml-2">
          <option value="">Escolha uma bebida:</option>
          {beverages.map((beverage) => (
            <option key={beverage._id} value={beverage._id}>
              {beverage.name}
            </option>
          ))}
        </select>

        <div className="mt-2">
          <label htmlFor="startDate">Data de Início:</label>
          <input type="date" id="startDate" value={startDate} onChange={handleStartDateChange} className="ml-2" />
        </div>

        <div className="mt-2">
          <label htmlFor="endDate">Data Final:</label>
          <input type="date" id="endDate" value={endDate} onChange={handleEndDateChange} className="ml-2" />
        </div>

        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-500 text-white">Buscar Dados</button>
      </div>

      {error ? (
        <p>{error}</p>
      ) : data.length === 0 ? (
        <p>Sem modificações nessa data</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalChange" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="totalChange" stroke="#82ca9d" /> {/* Segunda linha para mais contraste */}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BeverageHistoryChart;
