import React from 'react';

const BeverageCard = ({ beverage, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="bg-[#ffd433] p-6">
        <h2 className="text-2xl font-semibold text-[#c69f56] mb-2">{beverage.name}</h2>
        <p className="text-gray-700 mb-1"><strong>Categoria:</strong> {beverage.category}</p>
        <p className="text-gray-700 mb-1"><strong>Quantidade:</strong> {beverage.quantity}</p>
        <p className="text-gray-700 mb-1"><strong>Unidade de medida:</strong> {beverage.unit}</p>
        <div className="mt-4 flex justify-between">
          <button onClick={() => onEdit(beverage)} className="bg-[#c69f56] text-white px-4 py-2 rounded">Editar</button>
          <button onClick={() => onDelete(beverage._id)} className="bg-red-600 text-white px-4 py-2 rounded">Deletar</button>
        </div>
      </div>
    </div>
  );
};

export default BeverageCard;
