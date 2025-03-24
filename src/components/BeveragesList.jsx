"use client"

import { useState, useCallback, useMemo } from "react"
import BeverageCard from "./BeverageCard"
import EditBeverageCard from "./EditBeverageCard"
import ErrorBoundary from "./ErrorBoundary"
import Pagination from "./Pagination"
import { FaSearch, FaSync } from "react-icons/fa"
import Swal from "sweetalert2"
import { useOfflineData } from "../hooks/useOfflineData"
import { useOffline } from "../context/OfflineContext"

const BeveragesList = () => {
  const {
    data: beverages,
    loading: isLoading,
    error,
    refresh: fetchBeverages,
    update: updateBeverage,
    remove: deleteBeverage,
  } = useOfflineData("beverages")
  
  const [editingBeverage, setEditingBeverage] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const { online } = useOffline()
  const itemsPerPage = 9

  const handleError = useCallback((error, defaultMessage) => {
    console.error("Erro:", error)
    const message =
      error.message === "Failed to fetch"
        ? "Não foi possível conectar ao servidor. Verifique sua conexão de internet."
        : defaultMessage || "Ocorreu um erro. Por favor, tente novamente."

    Swal.fire("Erro", message, "error")
  }, [])

  const handleEditBeverage = (beverage) => setEditingBeverage(beverage)

  const handleDeleteBeverage = useCallback(
    async (id) => {
      try {
        Swal.fire({
          title: "Tem certeza?",
          text: "Você não poderá desfazer essa ação!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Sim, deletar!",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await deleteBeverage(id)
            Swal.fire("Deletado!", "A bebida foi removida com sucesso.", "success")
          }
        })
      } catch (error) {
        handleError(error, "Erro ao deletar a bebida.")
      }
    },
    [deleteBeverage, handleError],
  )

  const handleSaveBeverage = useCallback(
    async (updatedBeverage) => {
      try {
        await updateBeverage(updatedBeverage._id, updatedBeverage)
        setEditingBeverage(null)
        Swal.fire("Salvo!", "A bebida foi atualizada com sucesso.", "success")
      } catch (error) {
        handleError(error, "Erro ao salvar a bebida.")
      }
    },
    [updateBeverage, handleError],
  )

  const filteredBeverages = useMemo(() => {
    return beverages.filter(
      (b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [beverages, searchTerm])

  const currentBeverages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredBeverages.slice(start, start + itemsPerPage)
  }, [filteredBeverages, currentPage])

  if (isLoading && !error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="p-4 bg-background min-h-screen">
        <h1 className="text-3xl mb-6 text-center text-text">Lista de Bebidas</h1>
        {error && (
          <div className="text-error text-center mb-4 p-4 bg-background-light rounded-lg border border-error">
            <p>{error}</p>
            <button
              onClick={fetchBeverages}
              className="mt-2 px-4 py-2 bg-primary text-text rounded hover:bg-primary-light transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Tentar Novamente
            </button>
          </div>
        )}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar bebidas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-background-light border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark" />
        </div>
        {currentBeverages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBeverages.map((beverage) => (
              <BeverageCard
                key={beverage._id}
                beverage={beverage}
                onEditBeverage={handleEditBeverage}
                onDeleteBeverage={handleDeleteBeverage}
                isOfflineItem={beverage._id.startsWith("temp_")}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-text-dark">Nenhuma bebida encontrada.</p>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredBeverages.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
        {editingBeverage && (
          <EditBeverageCard
            beverage={editingBeverage}
            onSave={handleSaveBeverage}
            onCancel={() => setEditingBeverage(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default BeveragesList 
