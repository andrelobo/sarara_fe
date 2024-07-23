import React, { useState } from 'react';

const CreateIngredient = () => {
  const [ingredient, setIngredient] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIngredient((prevIngredient) => ({ ...prevIngredient, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('http://sararachefbar.eba-fttqyxx2.sa-east-1.elasticbeanstalk.com/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredient),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar o ingrediente');
      }
      setSuccess('Ingrediente criado com sucesso!');
      setIngredient({ name: '', category: '', quantity: '', unit: '' });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] py-10">
      <h1 className="text-4xl font-bold text-[#c69f56] mb-10">Cadastrar Ingrediente</h1>
      <form className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg" onSubmit={handleSubmit}>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            name="name"
            value={ingredient.name}
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
            value={ingredient.category}
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
            value={ingredient.quantity}
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
            value={ingredient.unit}
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

export default CreateIngredient;
