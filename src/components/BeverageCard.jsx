import React from 'react';
import PropTypes from 'prop-types';

const BeverageCard = ({ beverage, onEditBeverage, onDeleteBeverage, onViewHistory }) => {
  if (!beverage) {
    return null;
  }
  const { name, category, quantity, unit } = beverage;
  return (
    <div className="bg-[#111827] shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="bg-gray-900 p-6">
        <h2 className="text-2xl text-yellow-500 mb-2">{name}</h2>
        <p className="text-gray-300 mb-1">
          <span className="text-yellow-500">Categoria:</span> {category}
        </p>
        <p className="text-gray-300 mb-1">
          <span className="text-yellow-500">Quantidade:</span> {quantity}
        </p>
        <p className="text-gray-300 mb-1">
          <span className="text-yellow-500">Unidade de medida:</span> {unit}
        </p>
        <div className="mt-4 flex justify-between">
          <button onClick={() => onEditBeverage(beverage)} className="bg-yellow-600 text-gray-200 px-4 py-2 rounded hover:bg-yellow-700">
            Editar
          </button>
          <button onClick={() => onDeleteBeverage(beverage._id)} className="bg-red-600 text-gray-200 px-4 py-2 rounded hover:bg-red-700">
            Deletar
          </button>
          <button onClick={() => onViewHistory(beverage)} className="bg-blue-600 text-gray-200 px-4 py-2 rounded hover:bg-blue-700">
            Histórico
          </button>
        </div>
      </div>
    </div>
  );
};

BeverageCard.propTypes = {
  beverage: PropTypes.object.isRequired,
  onEditBeverage: PropTypes.func.isRequired,
  onDeleteBeverage: PropTypes.func.isRequired,
  onViewHistory: PropTypes.func.isRequired,
};

export default BeverageCard;
