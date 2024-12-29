import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';

const IngredientCard = React.memo(function IngredientCard({ ingredient, onEdit, onDelete }) {
  return (
    <div className="bg-background-light shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="bg-primary p-6">
        <h2 className="text-2xl font-semibold text-secondary mb-2">{ingredient.name}</h2>
        <p className="text-text mb-1"><strong>Categoria:</strong> {ingredient.category}</p>
        <p className="text-text mb-1"><strong>Quantidade:</strong> {ingredient.quantity}</p>
        <p className="text-text mb-1"><strong>Unidade de medida:</strong> {ingredient.unit}</p>
        <div className="mt-4 flex justify-between">
          <button 
            onClick={() => onEdit(ingredient)} 
            className="bg-secondary text-background px-4 py-2 rounded flex items-center"
          >
            <FaEdit className="mr-2" /> Editar
          </button>
          <button 
            onClick={() => onDelete(ingredient._id)} 
            className="bg-error text-text px-4 py-2 rounded flex items-center"
          >
            <FaTrash className="mr-2" /> Deletar
          </button>
        </div>
      </div>
    </div>
  );
});

IngredientCard.propTypes = {
  ingredient: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

IngredientCard.displayName = 'IngredientCard';

export default IngredientCard;

