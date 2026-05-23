"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { FaBoxes, FaEdit, FaExclamationTriangle, FaGlassMartiniAlt, FaHistory, FaPlus, FaSyncAlt, FaTrash, FaWifi } from "react-icons/fa"
import { toast } from "react-hot-toast"
import BeverageHistory from "./BeverageHistory"
import EditBeverageCard from "./EditBeverageCard"
import ErrorBoundary from "./ErrorBoundary"
import Pagination from "./Pagination"
import AppButton from "./ui/AppButton"
import EmptyState from "./ui/EmptyState"
import FloatingActionButton from "./ui/FloatingActionButton"
import MetricTile from "./ui/MetricTile"
import OperationalList from "./ui/OperationalList"
import OperationalRow from "./ui/OperationalRow"
import SearchBar from "./ui/SearchBar"
import { useOffline } from "../context/OfflineContext"
import { useOfflineData } from "../hooks/useOfflineData"
import { getStoredUser, hasRole } from "../utils/auth"
import { getInventorySyncStatusSummary, retrySyncOperationsByEntity } from "../utils/db"

const ITEMS_PER_PAGE = 10

const BeveragesList = () => {
  const {
    data: beverages,
    loading: isLoading,
    error,
    refresh: fetchBeverages,
    update: updateBeverage,
    remove: deleteBeverage,
  } = useOfflineData("beverages")
  const { online, syncing, syncData } = useOffline()

  const currentUser = getStoredUser()
  const canManageInventory = hasRole(currentUser, ["admin", "manager"])

  const [editingBeverage, setEditingBeverage] = useState(null)
  const [historyTarget, setHistoryTarget] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [failedSyncCount, setFailedSyncCount] = useState(0)
  const [isRetryingFailedSync, setIsRetryingFailedSync] = useState(false)

  const handleError = useCallback((currentError, defaultMessage) => {
    console.error("Erro:", currentError)
    const message =
      currentError.message === "Failed to fetch"
        ? "Nao foi possivel conectar ao servidor. Verifique sua conexao."
        : defaultMessage || "Ocorreu um erro. Tente novamente."

    toast.error(message)
  }, [])

  const handleDeleteBeverage = useCallback(
    async (id) => {
      try {
        const confirmed = window.confirm("Tem certeza que deseja remover esta bebida?")
        if (!confirmed) {
          return
        }

        await deleteBeverage(id)
        toast.success("Bebida removida com sucesso")
      } catch (currentError) {
        handleError(currentError, "Erro ao remover a bebida.")
      }
    },
    [deleteBeverage, handleError],
  )

  const handleSaveBeverage = useCallback(
    async (updatedBeverage) => {
      try {
        await updateBeverage(updatedBeverage._id, updatedBeverage)
        setEditingBeverage(null)
        toast.success("Bebida atualizada com sucesso")
      } catch (currentError) {
        handleError(currentError, "Erro ao salvar a bebida.")
      }
    },
    [handleError, updateBeverage],
  )

  const filteredBeverages = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    return beverages.filter((beverage) => {
      if (!normalizedTerm) {
        return true
      }

      return `${beverage.name} ${beverage.category}`.toLowerCase().includes(normalizedTerm)
    })
  }, [beverages, searchTerm])

  const currentBeverages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredBeverages.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredBeverages])

  const totalPages = useMemo(() => Math.ceil(filteredBeverages.length / ITEMS_PER_PAGE), [filteredBeverages.length])
  const lowStockCount = useMemo(() => beverages.filter((item) => Number(item.quantity) <= 5).length, [beverages])
  const offlineCount = useMemo(() => beverages.filter((item) => String(item._id).startsWith("temp_")).length, [beverages])
  const categoryCount = useMemo(() => new Set(beverages.map((item) => item.category)).size, [beverages])

  const refreshSyncSummary = useCallback(async () => {
    try {
      const summary = await getInventorySyncStatusSummary("beverages")
      setPendingSyncCount(summary.pending)
      setFailedSyncCount(summary.failed)
    } catch (currentError) {
      console.error("Erro ao verificar a fila de bebidas:", currentError)
    }
  }, [])

  const handleRetryFailedSync = useCallback(async () => {
    if (!online) {
      toast.error("Conecte-se novamente para reenviar as falhas de bebidas.")
      return
    }

    setIsRetryingFailedSync(true)

    try {
      const { retried } = await retrySyncOperationsByEntity("beverages")

      if (retried === 0) {
        toast("Nao havia falhas de bebidas para reenviar.")
        return
      }

      const result = await syncData({ silent: true })
      await fetchBeverages()
      await refreshSyncSummary()

      if (result?.success) {
        toast.success("Falhas de bebidas reenviadas para sincronizacao.")
      } else {
        toast.error(result?.message || "As falhas foram reenfileiradas, mas ainda existem erros.")
      }
    } catch (currentError) {
      handleError(currentError, "Nao foi possivel reenviar as falhas de bebidas.")
    } finally {
      setIsRetryingFailedSync(false)
    }
  }, [fetchBeverages, handleError, online, refreshSyncSummary, syncData])

  useEffect(() => {
    refreshSyncSummary()
  }, [beverages, online, refreshSyncSummary])

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
          <MetricTile hint="Catalogo de bebidas disponivel para operacao e historico." icon={<FaGlassMartiniAlt />} label="Bebidas" tone="gold" value={beverages.length} />
          <MetricTile hint="Leitura de diversidade para o turno atual." icon={<FaBoxes />} label="Categorias" value={categoryCount} />
          <MetricTile hint="Itens com quantidade baixa pedem acao rapida." icon={<FaExclamationTriangle />} label="Baixo estoque" tone={lowStockCount > 0 ? "danger" : "success"} value={lowStockCount} />
          <MetricTile
            hint={failedSyncCount > 0 ? "Existem falhas de sincronizacao nesta area." : "Registros ainda dependentes de sincronizacao."}
            icon={<FaWifi />}
            label="Offline"
            tone={failedSyncCount > 0 ? "danger" : offlineCount > 0 || pendingSyncCount > 0 ? "warning" : "info"}
            value={offlineCount + pendingSyncCount}
          />
        </section>

        <OperationalList
          action={
            <div className="flex flex-wrap gap-2">
              <AppButton icon={<FaHistory />} to="/beverages/history" variant="ghost">
                Historico
              </AppButton>
              {canManageInventory ? (
                <AppButton icon={<FaPlus />} to="/beverages/new" variant="secondary">
                  Nova bebida
                </AppButton>
              ) : null}
            </div>
          }
          description="Troca de cards grandes por lista operacional compacta, pronta para celular e tablet."
          title="Estoque de bebidas"
        >
          <div className="space-y-3 border-b border-white/8 px-4 py-4 sm:px-5">
            {failedSyncCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-100">
                <div>
                  <p className="font-medium">Existem {failedSyncCount} falha(s) de sincronizacao em bebidas.</p>
                  <p className="mt-1 text-red-100/80">Reenfileire esta area e o BarChef tenta reenviar apenas as operacoes de bebidas.</p>
                </div>
                <AppButton
                  icon={<FaSyncAlt />}
                  onClick={handleRetryFailedSync}
                  variant="danger"
                  disabled={!online || syncing || isRetryingFailedSync}
                >
                  {isRetryingFailedSync ? "Reenviando..." : "Retry bebidas"}
                </AppButton>
              </div>
            ) : null}
            <SearchBar onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nome ou categoria" value={searchTerm} />
          </div>

          {error ? (
            <div className="p-4 sm:p-5">
              <EmptyState
                action={
                  <AppButton icon={<FaSyncAlt />} onClick={fetchBeverages} variant="secondary">
                    Tentar novamente
                  </AppButton>
                }
                description={error}
                icon={<FaExclamationTriangle />}
                title="Nao foi possivel carregar as bebidas"
              />
            </div>
          ) : currentBeverages.length > 0 ? (
            currentBeverages.map((beverage) => {
              const isOfflineItem = String(beverage._id).startsWith("temp_")
              const isLowStock = Number(beverage.quantity) <= 5

              return (
                <OperationalRow
                  key={beverage._id}
                  actions={
                    <>
                      <AppButton icon={<FaHistory />} onClick={() => setHistoryTarget(beverage)} size="sm" variant="ghost">
                        Historico
                      </AppButton>
                      {canManageInventory ? (
                        <AppButton icon={<FaEdit />} onClick={() => setEditingBeverage(beverage)} size="sm" variant="ghost">
                          Editar
                        </AppButton>
                      ) : null}
                      {canManageInventory ? (
                        <AppButton icon={<FaTrash />} onClick={() => handleDeleteBeverage(beverage._id)} size="sm" variant="danger">
                          Excluir
                        </AppButton>
                      ) : null}
                    </>
                  }
                  eyebrow={beverage.category}
                  leading={
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <FaGlassMartiniAlt />
                    </div>
                  }
                  meta={[
                    `${beverage.quantity} ${beverage.unit}`,
                    isOfflineItem ? "Salvo localmente" : "Sincronizado",
                    isLowStock ? "Reposicao recomendada" : "Estoque saudavel",
                  ]}
                  status={isOfflineItem ? "Offline" : isLowStock ? "Baixo" : "Disponivel"}
                  statusTone={isOfflineItem ? "offline" : isLowStock ? "warning" : "success"}
                  subtitle="Acoes rapidas ao alcance do polegar para manter o ritmo da casa."
                  title={beverage.name}
                />
              )
            })
          ) : (
            <div className="p-4 sm:p-5">
              <EmptyState
                action={
                  canManageInventory ? (
                    <AppButton icon={<FaPlus />} to="/beverages/new" variant="secondary">
                      Cadastrar bebida
                    </AppButton>
                  ) : null
                }
                description="Tente outro termo ou adicione a primeira bebida do catalogo."
                icon={<FaGlassMartiniAlt />}
                title="Nenhuma bebida encontrada"
              />
            </div>
          )}
        </OperationalList>

        <Pagination currentPage={currentPage} onPageChange={setCurrentPage} totalPages={totalPages} />

        {canManageInventory ? <FloatingActionButton icon={<FaPlus />} label="Nova bebida" to="/beverages/new" /> : null}
        {editingBeverage && canManageInventory ? <EditBeverageCard beverage={editingBeverage} onCancel={() => setEditingBeverage(null)} onSave={handleSaveBeverage} /> : null}
        {historyTarget ? <BeverageHistory beverage={historyTarget} onClose={() => setHistoryTarget(null)} /> : null}
      </div>
    </ErrorBoundary>
  )
}

export default BeveragesList
