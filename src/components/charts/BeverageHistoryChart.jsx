import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const BeverageHistoryChart = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get('https://sarara-be.vercel.app/api/beverages/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedData = response.data.map(item => ({
          date: item._id.date,   // Certifique-se de que esses dados estão no formato esperado
          totalChange: item.totalChange
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching beverage history:', error);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : data.length === 0 ? (
        <p>Nenhum dado disponível</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalChange" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BeverageHistoryChart;
