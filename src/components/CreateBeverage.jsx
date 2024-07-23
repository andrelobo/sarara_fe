import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateBeverage = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newBeverage = {
        name,
        category,
        quantity,
        unit,
        date: date.toISOString().split('T')[0], // Formata a data para YYYY-MM-DD
      };
      await axios.post('http://sararachefbar.eba-fttqyxx2.sa-east-1.elasticbeanstalk.com/api/beverages', newBeverage);
      navigate('/beverages');
    } catch (error) {
      console.error('Erro ao criar bebida:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cadastrar Bebida</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoria</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantidade</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unidade</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Cadastro</label>
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
            dateFormat="dd/MM/yyyy"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBeverage;
