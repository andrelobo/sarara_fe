"use client"

import React, { useCallback } from "react"
import PropTypes from "prop-types"
import { FaEdit, FaTrash, FaHistory, FaWifi } from "react-icons/fa" // Substituído FaCloudUpload por FaWifi
import Swal from "sweetalert2"
import "sweetalert2/src/sweetalert2.scss"

const BeverageCard = ({ beverage, onEditBeverage, onDeleteBeverage, onViewHistory, isOfflineItem }) => {
  const { name, category, quantity, unit, _id } = beverage

  const handleDelete = useCallback(() => {
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
        onDeleteBeverage(_id)
      }
    })
  }, [_id, onDeleteBeverage])

  return (
    <div
      className={`bg-background-light shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 animate-fade-in ${isOfflineItem ? "border-2 border-yellow-500" : ""}`}
    >
      <div className="bg-primary p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl text-text text-center flex-grow">{name}</h2>
          {isOfflineItem && (
            <span className="bg-yellow-500 text-xs text-black px-2 py-1 rounded-full flex items-center">
              <FaWifi className="mr-1" /> Offline
            </span>
          )}
        </div>
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
            className={`bg-primary-light hover:bg-primary text-text px-3 py-1 rounded-md text-sm transition duration-200 flex items-center ${isOfflineItem ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Ver histórico da bebida"
            disabled={isOfflineItem}
          >
            <FaHistory className="mr-1" /> Histórico
          </button>
        </div>
      </div>
    </div>
  )
}

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
  isOfflineItem: PropTypes.bool,
}

BeverageCard.defaultProps = {
  isOfflineItem: false,
}

export default React.memo(BeverageCard)

