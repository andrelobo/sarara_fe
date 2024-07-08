import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BeverageHistory = () => {
  const [history, setHistory] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('https://sarara-be.onrender.com/api/beverages/history', {
          params: { startDate, endDate },
        });
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, [startDate, endDate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Histórico de Bebidas</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Data Inicial:</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Data Final:</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <ul>
        {history.map((item, index) => (
          <li key={index} className="mb-2">
            {new Date(item.date).toLocaleDateString()} - {item.name}: {item.quantity} {item.unit}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BeverageHistory;
