import React from "react";
import PropTypes from "prop-types";
import { FaEdit, FaTrash, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

const BeverageCard = ({
  beverage,
  onEditBeverage,
  onDeleteBeverage,
  onViewHistory,
}) => {
  if (!beverage) {
    return null;
  }

  const { name, category, quantity, unit } = beverage;

  // Função para confirmar a exclusão com SweetAlert2
  const handleDelete = () => {
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
        onDeleteBeverage(beverage._id);
        Swal.fire("Deletado!", "A bebida foi removida.", "success");
      }
    });
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="bg-gray-700 p-4">
      <h2 className="text-xl text-white-400 mb-1 text-center">{name}</h2>
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold text-blue-400">Categoria:</span>{" "}
          {category}
        </p>
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold text-blue-400">Quantidade:</span>{" "}
          {quantity}
        </p>
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold text-blue-400">
            Unidade de medida:
          </span>{" "}
          {unit}
        </p>

        <div className="mt-4 flex justify-around text-gray-200 space-x-2">
          <button
            onClick={() => onEditBeverage(beverage)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded-md text-sm transition duration-200"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md text-sm transition duration-200"
          >
            Deletar
          </button>
          <button
            onClick={() => onViewHistory(beverage)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-md text-sm transition duration-200"
          >
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
