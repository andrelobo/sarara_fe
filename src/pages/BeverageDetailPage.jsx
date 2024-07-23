import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BeverageDetailPage = () => {
  const { id } = useParams();
  const [beverage, setBeverage] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchBeverage = async () => {
      try {
        const response = await axios.get(`http://sararachefbar.eba-fttqyxx2.sa-east-1.elasticbeanstalk.com/api/beverages/${id}`);
        const data = response.data;
        setBeverage(data);
      } catch (error) {
        console.error('Error fetching beverage:', error);
      }
    };

    fetchBeverage();
  }, [id]);

  const fetchBeverageHistory = async () => {
    try {
      const response = await axios.get(`http://sararachefbar.eba-fttqyxx2.sa-east-1.elasticbeanstalk.com/api/beverages/${id}/history`, {
        params: {
          startDate,
          endDate,
        },
      });
      setBeverage(prevState => ({ ...prevState, history: response.data }));
    } catch (error) {
      console.error('Error fetching beverage history:', error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchBeverageHistory();
    }
  }, [startDate, endDate]);

  if (!beverage) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{beverage.name}</h1>
      <p>Categoria: {beverage.category}</p>
      <p>Quantidade: {beverage.quantity}</p>
      <p>Unidade: {beverage.unit}</p>
      <div>
        <label className="block text-sm font-medium text-gray-700">Data Inicial:</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Data Final:</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      {beverage.history && (
        <div>
          <h2 className="text-xl font-bold mt-4">Histórico</h2>
          {beverage.history.map(entry => (
            <div key={entry._id} className="bg-gray-100 p-2 rounded mb-2">
              <p><strong>Data:</strong> {new Date(entry.date).toLocaleDateString()}</p>
              <p><strong>Alteração:</strong> {entry.change}</p>
              <p><strong>Quantidade:</strong> {entry.quantity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BeverageDetailPage;
