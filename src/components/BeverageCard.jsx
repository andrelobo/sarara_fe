import React from 'react';

const BeverageCard = ({ beverage, onEditBeverage, onDeleteBeverage, onViewHistory }) => {
  if (!beverage) {
    return null;
  }

  const { name, category, quantity, unit } = beverage;

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="bg-gray-900 p-6">
        <h2 className="text-2xl text-[#f8b431] mb-2">{name}</h2>
        <p className="text-gray-300 mb-1">
          <span className="text-[#f8b431]">Categoria:</span> {category}
        </p>

        <p className="text-gray-300 mb-1">
          <span className="text-[#f8b431]">Quantidade:</span> {quantity}
        </p>
        <p className="text-gray-300 mb-1">
          <span className=" text-[#f8b431]">Unidade de medida:</span> {unit}
        </p>
        <div className="mt-4 flex justify-between">
          <button onClick={() => onEditBeverage(beverage)} className="bg-[#c69f56] text-gray-900 px-4 py-2 rounded">
            Editar
          </button>
          <button onClick={() => onDeleteBeverage(beverage._id)} className="bg-red-500 text-gray-900 px-4 py-2 rounded">
            Deletar
          </button>
          <button onClick={() => {console.log('View history clicked for:', beverage._id); onViewHistory(beverage)}} className="bg-blue-500 text-gray-900 px-4 py-2 rounded">
            Histórico
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeverageCard;
