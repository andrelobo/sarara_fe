import { useEffect, useState, useCallback, useMemo } from "react"
import { FaCarrot, FaEdit, FaExclamationTriangle, FaLeaf, FaPlus, FaSyncAlt, FaTrash, FaWifi } from "react-icons/fa"
import Swal from "sweetalert2"
import EditIngredientCard from "./EditIngredientCard"
import ErrorBoundary from "./ErrorBoundary"
import Pagination from "./Pagination"
import AppButton from "./ui/AppButton"
import EmptyState from "./ui/EmptyState"
import FloatingActionButton from "./ui/FloatingActionButton"
import MetricTile from "./ui/MetricTile"
import OperationalList from "./ui/OperationalList"
import OperationalRow from "./ui/OperationalRow"
import SearchBar from "./ui/SearchBar"
import { saveData, saveSyncQueue, getSyncQueue, clearSyncQueue, getAllData } from "../utils/db"
import { API_BASE_URL } from "../config/api"
import { getStoredUser, hasRole } from "../utils/auth"

const ITEMS_PER_PAGE = 10

const IngredientsList = () => {
  const [ingredients, setIngredients] = useState([])
  const [error, setError] = useState("")
  const [editingIngredient, setEditingIngredient] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const currentUser = getStoredUser()
  const canManageInventory = hasRole(currentUser, ["admin", "manager"])

  const token = localStorage.getItem("authToken")
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token],
  )

  const handleError = useCallback((currentError, defaultMessage) => {
    console.error("Erro:", currentError)
    const message =
      currentError.message === "Failed to fetch"
        ? "Nao foi possivel conectar ao servidor. Verifique sua conexao."
        : defaultMessage || "Ocorreu um erro. Tente novamente."
    setError(message)
  }, [])

  const fetchIngredients = useCallback(async () => {
    setIsLoading(true)
    setError("")

    try {
      if (navigator.onLine) {
        const response = await fetch(`${API_BASE_URL}/ingredients`, { headers })
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Erro: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        setIngredients(data)
        await saveData("ingredients", data)
      } else {
        const offlineIngredients = await getAllData("ingredients")
        setIngredients(offlineIngredients || [])
      }
    } catch (currentError) {
      handleError(currentError, "Erro ao buscar ingredientes. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [handleError, headers])

  useEffect(() => {
    fetchIngredients()
  }, [fetchIngredients])

  const handleDeleteIngredient = useCallback(
    async (id) => {
      try {
        const confirmed = window.confirm("Tem certeza que deseja remover este ingrediente?")
        if (!confirmed) {
          return
        }

        if (navigator.onLine) {
          const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, { method: "DELETE", headers })
          if (!response.ok) {
            throw new Error("Erro ao deletar o ingrediente.")
          }

          setIngredients((prev) => prev.filter((ingredient) => ingredient._id !== id))
          Swal.fire("Removido", "O ingrediente foi removido com sucesso.", "success")
        } else {
          await saveSyncQueue({ type: "delete", id })
          setIngredients((prev) => prev.filter((ingredient) => ingredient._id !== id))
          Swal.fire("Removido offline", "O ingrediente sera removido quando a conexao voltar.", "success")
        }
      } catch (currentError) {
        handleError(currentError, "Erro ao remover o ingrediente.")
      }
    },
    [handleError, headers],
  )

  const handleSaveIngredient = useCallback(
    async (updatedIngredient) => {
      try {
        if (navigator.onLine) {
          const response = await fetch(`${API_BASE_URL}/ingredients/${updatedIngredient._id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(updatedIngredient),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `Erro: ${response.status} - ${response.statusText}`)
          }

          const updatedData = await response.json()
          setIngredients((prev) => prev.map((ingredient) => (ingredient._id === updatedData._id ? updatedData : ingredient)))
          setEditingIngredient(null)
          Swal.fire("Atualizado", "O ingrediente foi atualizado com sucesso.", "success")
        } else {
          await saveSyncQueue({ type: "update", data: updatedIngredient })
          setIngredients((prev) => prev.map((ingredient) => (ingredient._id === updatedIngredient._id ? updatedIngredient : ingredient)))
          setEditingIngredient(null)
          Swal.fire("Atualizado offline", "A edicao sera sincronizada quando a conexao voltar.", "success")
        }
      } catch (currentError) {
        console.error("Erro ao salvar ingrediente:", currentError)
        handleError(currentError, "Erro ao salvar o ingrediente.")
      }
    },
    [handleError, headers],
  )

  useEffect(() => {
    const syncChanges = async () => {
      const queue = await getSyncQueue()
      if (queue.length > 0 && navigator.onLine) {
        try {
          for (const operation of queue) {
            if (operation.type === "update") {
              await fetch(`${API_BASE_URL}/ingredients/${operation.data._id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(operation.data),
              })
            } else if (operation.type === "delete") {
              await fetch(`${API_BASE_URL}/ingredients/${operation.id}`, {
                method: "DELETE",
                headers,
              })
            }
          }
          await clearSyncQueue()
          await fetchIngredients()
        } catch (currentError) {
          handleError(currentError, "Erro ao sincronizar alteracoes.")
        }
      }
    }

    syncChanges()
  }, [fetchIngredients, handleError, headers])

  const filteredIngredients = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    return ingredients.filter((ingredient) => {
      if (!normalizedTerm) {
        return true
      }

      return `${ingredient.name} ${ingredient.category}`.toLowerCase().includes(normalizedTerm)
    })
  }, [ingredients, searchTerm])

  const currentIngredients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredIngredients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredIngredients])

  const lowStockCount = useMemo(() => ingredients.filter((item) => Number(item.quantity) <= 5).length, [ingredients])
  const categoryCount = useMemo(() => new Set(ingredients.map((item) => item.category)).size, [ingredients])
  const offlineMode = !navigator.onLine

  if (isLoading && !error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile hint="Ingredientes de base e apoio para bar e cozinha." icon={<FaCarrot />} label="Ingredientes" tone="gold" value={ingredients.length} />
          <MetricTile hint="Variedade de grupos em operacao." icon={<FaLeaf />} label="Categorias" value={categoryCount} />
          <MetricTile hint="Itens abaixo da zona confortavel de estoque." icon={<FaExclamationTriangle />} label="Baixo estoque" tone={lowStockCount > 0 ? "danger" : "success"} value={lowStockCount} />
          <MetricTile hint={offlineMode ? "As alteracoes ficam na fila de sincronizacao." : "Sincronizacao pronta para operacao online."} icon={<FaWifi />} label="Modo" tone={offlineMode ? "warning" : "info"} value={offlineMode ? "Offline" : "Online"} />
        </section>

        <OperationalList
          action={canManageInventory ? <AppButton icon={<FaPlus />} to="/ingredients/new" variant="secondary">Novo ingrediente</AppButton> : null}
          description="Lista compacta para consulta e movimentacao operacional, sem a cara de CRUD antigo."
          title="Base de ingredientes"
        >
          <div className="space-y-3 border-b border-white/8 px-4 py-4 sm:px-5">
            {offlineMode ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                Voce esta offline. As alteracoes ficam salvas localmente e entram na sincronizacao quando a conexao voltar.
              </div>
            ) : null}
            <SearchBar onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nome ou categoria" value={searchTerm} />
          </div>

          {error ? (
            <div className="p-4 sm:p-5">
              <EmptyState
                action={<AppButton icon={<FaSyncAlt />} onClick={fetchIngredients} variant="secondary">Tentar novamente</AppButton>}
                description={error}
                icon={<FaExclamationTriangle />}
                title="Nao foi possivel carregar os ingredientes"
              />
            </div>
          ) : currentIngredients.length > 0 ? (
            currentIngredients.map((ingredient) => {
              const isLowStock = Number(ingredient.quantity) <= 5

              return (
                <OperationalRow
                  key={ingredient._id}
                  actions={
                    canManageInventory ? (
                      <>
                        <AppButton icon={<FaEdit />} onClick={() => setEditingIngredient(ingredient)} size="sm" variant="ghost">Editar</AppButton>
                        <AppButton icon={<FaTrash />} onClick={() => handleDeleteIngredient(ingredient._id)} size="sm" variant="danger">Excluir</AppButton>
                      </>
                    ) : null
                  }
                  eyebrow={ingredient.category}
                  leading={
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <FaCarrot />
                    </div>
                  }
                  meta={[`${ingredient.quantity} ${ingredient.unit}`, offlineMode ? "Fila offline habilitada" : "Sincronizado", isLowStock ? "Reposicao recomendada" : "Disponivel"]}
                  status={isLowStock ? "Baixo" : "Disponivel"}
                  statusTone={isLowStock ? "warning" : "success"}
                  subtitle="Leitura de quantidade e acao rapida para manter preparo e bar abastecidos."
                  title={ingredient.name}
                />
              )
            })
          ) : (
            <div className="p-4 sm:p-5">
              <EmptyState
                action={canManageInventory ? <AppButton icon={<FaPlus />} to="/ingredients/new" variant="secondary">Cadastrar ingrediente</AppButton> : null}
                description="Tente outro termo ou inclua o primeiro ingrediente da base."
                icon={<FaCarrot />}
                title="Nenhum ingrediente encontrado"
              />
            </div>
          )}
        </OperationalList>

        <Pagination currentPage={currentPage} onPageChange={setCurrentPage} totalPages={Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE)} />
        {canManageInventory ? <FloatingActionButton icon={<FaPlus />} label="Novo ingrediente" to="/ingredients/new" /> : null}
        {editingIngredient && canManageInventory ? <EditIngredientCard ingredient={editingIngredient} onCancel={() => setEditingIngredient(null)} onSave={handleSaveIngredient} /> : null}
      </div>
    </ErrorBoundary>
  )
}

export default IngredientsList
