"use client"

import { useState, useEffect } from "react"
import { FaArrowLeft, FaTimes } from "react-icons/fa"
import PropTypes from "prop-types"

const BeverageHistory = ({ beverage, onClose }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!beverage || !beverage._id) {
        setError("Informações da bebida não disponíveis")
        setLoading(false)
        return
      }

      try {
        if (!navigator.onLine) {
          throw new Error("Você está offline. O histórico não está disponível no momento.")
        }

        const token = localStorage.getItem("authToken")
        const response = await fetch(`https://sarara-be.vercel.app/api/beverages/${beverage._id}/history`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar histórico: ${response.status}`)
        }

        const data = await response.json()
        setHistory(data)
        setLoading(false)
      } catch (error) {
        console.error("Erro ao buscar histórico:", error)
        setError(error.message || "Erro ao buscar histórico")
        setLoading(false)
      }
    }

    fetchHistory()
  }, [beverage])

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("pt-BR", options)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-light rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-primary p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-text">Histórico: {beverage?.name}</h2>
          <button onClick={onClose} className="text-text-dark hover:text-text transition-colors" aria-label="Fechar">
            <FaTimes />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-error text-center p-4">
              <p>{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-primary text-text rounded hover:bg-primary-light transition-colors flex items-center mx-auto"
              >
                <FaArrowLeft className="mr-2" /> Voltar
              </button>
            </div>
          ) : history.length === 0 ? (
            <p className="text-text-dark text-center p-4">Nenhum registro de histórico encontrado para esta bebida.</p>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={index} className="border border-primary rounded-lg p-4 bg-background">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-secondary font-semibold">{formatDate(entry.date)}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        entry.change === "added" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {entry.change === "added" ? "Adicionado" : "Removido"}
                    </span>
                  </div>
                  <p className="text-text-dark">
                    <span className="font-semibold">Quantidade:</span> {entry.quantity} {beverage.unit}
                  </p>
                  {entry.user && (
                    <p className="text-text-dark">
                      <span className="font-semibold">Usuário:</span> {entry.user}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-text-dark mt-2">
                      <span className="font-semibold">Observações:</span> {entry.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background-light p-4 border-t border-primary">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-text rounded hover:bg-primary-light transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

BeverageHistory.propTypes = {
  beverage: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
}

export default BeverageHistory

