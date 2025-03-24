import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

const IngredientCard = ({ ingredient, onEditIngredient, onDeleteIngredient }) => {
  const { name, category, quantity, unit, _id } = ingredient;

  const handleDelete = useCallback(() => {
    if (!navigator.onLine) {
      Swal.fire({
        icon: 'warning',
        title: 'Modo Offline',
        text: 'Você está offline. O ingrediente será removido quando a conexão for restabelecida.',
      });
    }

    Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá desfazer essa ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteIngredient(_id);
      }
    });
  }, [_id, onDeleteIngredient]);

  return (
    <div className="bg-background-light shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 animate-fade-in">
      <div className="bg-primary p-4">
        <h2 className="text-xl text-text mb-2 text-center">{name}</h2>
        <div className="space-y-2 mb-4">
          <p className="text-text-dark text-sm">
            <span className="font-semibold text-secondary">Categoria:</span> {category}
          </p>
          <p className="text-text-dark text-sm">
            <span className="font-semibold text-secondary">Quantidade:</span> {quantity} {unit}
          </p>
        </div>

        <div className="flex justify-around space-x-2">
          <button
            onClick={() => onEditIngredient(ingredient)}
            className="bg-secondary hover:bg-secondary-light text-background px-3 py-1 rounded-md text-sm transition duration-200 flex items-center"
            aria-label="Editar ingrediente"
          >
            <FaEdit className="mr-1" /> Editar
          </button>
          <button
            onClick={handleDelete}
            className="bg-error hover:bg-error-light text-text px-3 py-1 rounded-md text-sm transition duration-200 flex items-center"
            aria-label="Deletar ingrediente"
          >
            <FaTrash className="mr-1" /> Deletar
          </button>
        </div>
      </div>
    </div>
  );
};

IngredientCard.propTypes = {
  ingredient: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
  }).isRequired,
  onEditIngredient: PropTypes.func.isRequired,
  onDeleteIngredient: PropTypes.func.isRequired,
};

export default React.memo(IngredientCard);