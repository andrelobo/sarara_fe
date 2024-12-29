import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { FaEdit, FaTrash, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

const BeverageCard = React.memo(
  ({ beverage, onEditBeverage, onDeleteBeverage, onViewHistory }) => {
    const { name, category, quantity, unit } = beverage;

    const handleDelete = useCallback(() => {
      Swal.fire({
        title: "Tem certeza?",
        text: "Você não poderá desfazer essa ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "var(--color-error)",
        cancelButtonColor: "var(--color-primary)",
        confirmButtonText: "Sim, deletar!",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          onDeleteBeverage(beverage._id);
          Swal.fire("Deletado!", "A bebida foi removida.", "success");
        }
      });
    }, [beverage._id, onDeleteBeverage]);

    return (
      <div className="bg-background-light shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 animate-fade-in">
        <div className="bg-primary p-4">
          <h2 className="text-xl text-text mb-2 text-center">{name}</h2>
          <div className="space-y-2 mb-4">
            <p className="text-text-dark text-sm">
              <span className="font-semibold text-secondary">Categoria:</span>{" "}
              {category}
            </p>
            <p className="text-text-dark text-sm">
              <span className="font-semibold text-secondary">Quantidade:</span>{" "}
              {quantity} {unit}
            </p>
          </div>

          <div className="flex justify-around space-x-2">
            <button
              onClick={() => onEditBeverage(beverage)}
              className="bg-secondary hover:bg-secondary-light text-background px-3 py-1 rounded-md text-sm transition duration-200 flex items-center"
              aria-label="Editar bebida"
            >
              <FaEdit className="mr-1" /> Editar
            </button>
            <button
              onClick={handleDelete}
              className="bg-error hover:bg-error-light text-text px-3 py-1 rounded-md text-sm transition duration-200 flex items-center"
              aria-label="Deletar bebida"
            >
              <FaTrash className="mr-1" /> Deletar
            </button>
            <button
              onClick={() => onViewHistory(beverage)}
              className="bg-primary-light hover:bg-primary text-text px-3 py-1 rounded-md text-sm transition duration-200 flex items-center"
              aria-label="Ver histórico da bebida"
            >
              <FaHistory className="mr-1" /> Histórico
            </button>
          </div>
        </div>
      </div>
    );
  }
);

BeverageCard.propTypes = {
  beverage: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
  }).isRequired,
  onEditBeverage: PropTypes.func.isRequired,
  onDeleteBeverage: PropTypes.func.isRequired,
  onViewHistory: PropTypes.func.isRequired,
};

export default BeverageCard;
