import React, { useState } from 'react';
import { saveData, saveSyncQueue } from '../utils/db'; // Funções do IndexedDB
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

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

    const newIngredient = {
      ...ingredient,
      quantity: Number(ingredient.quantity), // Garante que a quantidade seja um número
    };

    try {
      if (navigator.onLine) {
        // Se online, envia diretamente para o backend
        const response = await fetch('https://sarara-be.vercel.app/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newIngredient),
        });

        if (!response.ok) {
          throw new Error('Erro ao criar o ingrediente');
        }

        setSuccess('Ingrediente criado com sucesso!');
        setIngredient({ name: '', category: '', quantity: '', unit: '' });
      } else {
        // Se offline, armazena no IndexedDB e na fila de sincronização
        await saveData('ingredients', newIngredient); // Armazena o ingrediente no IndexedDB
        await saveSyncQueue({ type: 'create', data: newIngredient }); // Adiciona à fila de sincronização

        Swal.fire({
          icon: 'success',
          title: 'Ingrediente cadastrado offline!',
          text: 'O ingrediente será sincronizado com o servidor quando a conexão for restabelecida.',
        });

        setSuccess('Ingrediente cadastrado offline!');
        setIngredient({ name: '', category: '', quantity: '', unit: '' });
      }
    } catch (error) {
      console.error('Erro ao criar ingrediente:', error);
      setError(error.message || 'Erro ao criar ingrediente. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] py-10">
      <h1 className="text-4xl text-[#c69f56] mb-10">Cadastrar Ingrediente</h1>
      {!navigator.onLine && (
        <div className="text-warning text-center mb-4 p-4 bg-background-light rounded-lg border border-warning">
          <p>Você está offline. O ingrediente será sincronizado quando a conexão for restabelecida.</p>
        </div>
      )}
      <form className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg" onSubmit={handleSubmit}>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2" htmlFor="name">Nome</label>
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
          <label className="block text-gray-700 text-sm mb-2" htmlFor="category">Categoria</label>
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
          <label className="block text-gray-700 text-sm mb-2" htmlFor="quantity">Quantidade</label>
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
          <label className="block text-gray-700 text-sm mb-2" htmlFor="unit">Unidade</label>
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
          <button
            type="submit"
            className="bg-[#56c65f] hover:bg-[#56c65f] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIngredient;