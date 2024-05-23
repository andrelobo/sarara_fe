import React, { useState } from 'react';

const CreateBeverage = () => {
  const [beverage, setBeverage] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBeverage((prevBeverage) => ({ ...prevBeverage, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('https://sarara-be.onrender.com/api/beverages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(beverage),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar a bebida');
      }
      setSuccess('Bebida criada com sucesso!');
      setBeverage({ name: '', category: '', quantity: '', unit: '' });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] py-10">
      <h1 className="text-4xl font-bold text-[#c69f56] mb-10">Cadastrar Bebida</h1>
      <form className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg" onSubmit={handleSubmit}>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            name="name"
            value={beverage.name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Categoria</label>
          <input
            type="text"
            id="category"
            name="category"
            value={beverage.category}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">Quantidade</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={beverage.quantity}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unit">Unidade</label>
          <input
            type="text"
            id="unit"
            name="unit"
            value={beverage.unit}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="bg-[#56c65f] hover:bg-[#56c65f] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBeverage;
