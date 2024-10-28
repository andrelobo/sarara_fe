import React from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

const BeverageCard = ({ beverage, onEditBeverage, onDeleteBeverage, onViewHistory }) => {
  if (!beverage) {
    return null;
  }

  const { name, category, quantity, unit } = beverage;

  // Função para confirmar a exclusão com SweetAlert2
  const handleDelete = () => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá desfazer essa ação!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteBeverage(beverage._id);
        Swal.fire('Deletado!', 'A bebida foi removida.', 'success');
      }
    });
  };

  return (
    <div className="bg-[#111827] shadow-md rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="bg-gray-900 p-4">
        <h2 className="text-xl text-blue-500 mb-1">{name}</h2> {/* Alterado para uma cor azul */}
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold text-blue-500">Categoria:</span> {category}
        </p>
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold text-blue-500">Quantidade:</span> {quantity}
        </p>
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold text-blue-500">Unidade de medida:</span> {unit}
        </p>

        <div className="mt-4 flex justify-around text-gray-200">
          <button onClick={() => onEditBeverage(beverage)} className="hover:text-yellow-400">
            <FaEdit size={20} />
          </button>
          <button onClick={handleDelete} className="text-red-500 hover:text-red-600">
            <FaTrash size={20} />
          </button>
          <button onClick={() => onViewHistory(beverage)} className="hover:text-blue-400">
            <FaHistory size={20} />
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
