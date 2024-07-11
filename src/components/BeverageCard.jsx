import React from 'react';

const BeverageCard = ({ beverage, onEditBeverage, onDeleteBeverage, onViewHistory }) => {
  if (!beverage) {
    return null;
  }

  const { name, category, quantity, unit } = beverage;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="bg-[#f8b431] p-6">
        <h2 className="text-2xl font-semibold text-[#ffffff] mb-2">{name}</h2>
        <p className="text-white -700 mb-1">
          <span className="font-bold">Categoria:</span> {category}
        </p>


        <p className="text-white -700 mb-1">
          <span className="font-bold">Quantidade:</span> {quantity}
        </p>
        <p className="text-white -700 mb-1">
          <span className="font-bold">Unidade de medida:</span> {unit}
        </p>
        <div className="mt-4 flex justify-between">
          <button onClick={() => onEditBeverage(beverage)} className="bg-[#c69f56] text-white px-4 py-2 rounded">
            Editar
          </button>
          <button onClick={() => onDeleteBeverage(beverage._id)} className="bg-red-600 text-white px-4 py-2 rounded">
            Deletar
          </button>
          <button onClick={() => {console.log('View history clicked for:', beverage._id); onViewHistory(beverage)}} className="bg-blue-600 text-white px-4 py-2 rounded">
            Histórico
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeverageCard;
