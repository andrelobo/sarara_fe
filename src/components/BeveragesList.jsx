"use client"

import { useState, useCallback, useMemo } from "react"
import IngredientCard from "./IngredientCard"
import EditIngredientCard from "./EditIngredientCard"
import ErrorBoundary from "./ErrorBoundary"
import Pagination from "./Pagination"
import { FaSearch, FaSync } from "react-icons/fa"
import Swal from "sweetalert2"
import { useOfflineData } from "../hooks/useOfflineData"
import { useOffline } from "../context/OfflineContext"

const IngredientsList = () => {
  const {
    data: ingredients,
    loading: isLoading,
    error,
    refresh: fetchIngredients,
    update: updateIngredient,
    remove: deleteIngredient,
  } = useOfflineData("ingredients")
  const [editingIngredient, setEditingIngredient] = useState(null)
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

  const handleEditIngredient = (ingredient) => setEditingIngredient(ingredient)

  const handleDeleteIngredient = useCallback(
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
            await deleteIngredient(id)
            Swal.fire("Deletado!", "O ingrediente foi removido com sucesso.", "success")
          }
        })
      } catch (error) {
        handleError(error, "Erro ao deletar o ingrediente.")
      }
    },
    [deleteIngredient, handleError],
  )

  const handleSaveIngredient = useCallback(
    async (updatedIngredient) => {
      try {
        await updateIngredient(updatedIngredient._id, updatedIngredient)
        setEditingIngredient(null)
        Swal.fire("Salvo!", "O ingrediente foi atualizado com sucesso.", "success")
      } catch (error) {
        handleError(error, "Erro ao salvar o ingrediente.")
      }
    },
    [updateIngredient, handleError],
  )

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [ingredients, searchTerm])

  const currentIngredients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredIngredients.slice(start, start + itemsPerPage)
  }, [filteredIngredients, currentPage])

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
        <h1 className="text-3xl mb-6 text-center text-text">Lista de Ingredientes</h1>
        {error && (
          <div className="text-error text-center mb-4 p-4 bg-background-light rounded-lg border border-error">
            <p>{error}</p>
            <button
              onClick={fetchIngredients}
              className="mt-2 px-4 py-2 bg-primary text-text rounded hover:bg-primary-light transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Tentar Novamente
            </button>
          </div>
        )}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-background-light border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark" />
        </div>
        {currentIngredients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentIngredients.map((ingredient) => (
              <IngredientCard
                key={ingredient._id}
                ingredient={ingredient}
                onEditIngredient={handleEditIngredient}
                onDeleteIngredient={handleDeleteIngredient}
                isOfflineItem={ingredient._id.startsWith("temp_")}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-text-dark">Nenhum ingrediente encontrado.</p>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredIngredients.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
        {editingIngredient && (
          <EditIngredientCard
            ingredient={editingIngredient}
            onSave={handleSaveIngredient}
            onCancel={() => setEditingIngredient(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default IngredientsList

