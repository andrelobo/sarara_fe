import React, { useState } from 'react';

const EditBeverageCard = ({ beverage, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...beverage });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
      <div className="bg-gray-900 text-gray-200 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4 text-[#f8b431]">Editar Bebida</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Categoria</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Quantidade</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Unidade</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-[#c69f56] text-gray-900 rounded-lg hover:bg-[#a87f44]">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBeverageCard;
