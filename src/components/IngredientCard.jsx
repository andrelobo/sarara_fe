import React from 'react';

const IngredientCard = ({ ingredient, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="bg-[#15508c] p-6">
        <h2 className="text-2xl font-semibold text-[#c69f56] mb-2">{ingredient.name}</h2>
        <p className="text-gray-700 mb-1"><strong>Categoria:</strong> {ingredient.category}</p>
        <p className="text-gray-700 mb-1"><strong>Quantidade:</strong> {ingredient.quantity}</p>
        <p className="text-gray-700 mb-1"><strong>Unidade de medida:</strong> {ingredient.unit}</p>
        <div className="mt-4 flex justify-between">
          <button onClick={() => onEdit(ingredient)} className="bg-[#c69f56] text-white px-4 py-2 rounded">Editar</button>
          <button onClick={() => onDelete(ingredient._id)} className="bg-red-600 text-white px-4 py-2 rounded">Deletar</button>
        </div>
      </div>
    </div>
  );
};

export default IngredientCard;
