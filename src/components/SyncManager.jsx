"use client"

import { useEffect, useState } from "react"
import { FaExclamationTriangle, FaSync } from "react-icons/fa"
import Swal from "sweetalert2"
import { getPendingOperationsSummary, syncWithServer } from "../services/syncService"

const SyncManager = () => {
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingInventoryCount, setPendingInventoryCount] = useState(0)
  const [pendingSalonCount, setPendingSalonCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [failedInventoryCount, setFailedInventoryCount] = useState(0)
  const [failedSalonCount, setFailedSalonCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)

  useEffect(() => {
    checkPendingOperations()

    const handleOnline = () => {
      if (navigator.onLine) {
        checkPendingOperations()

        if (pendingCount > 0) {
          Swal.fire({
            title: "Conexao restaurada",
            text: `Voce tem ${pendingCount} operacoes pendentes. Deseja sincronizar agora?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sim, sincronizar",
            cancelButtonText: "Nao",
          }).then((result) => {
            if (result.isConfirmed) {
              handleSync()
            }
          })
        }
      }
    }

    window.addEventListener("online", handleOnline)
    const interval = setInterval(checkPendingOperations, 60000)

    return () => {
      window.removeEventListener("online", handleOnline)
      clearInterval(interval)
    }
  }, [pendingCount])

  const checkPendingOperations = async () => {
    try {
      const summary = await getPendingOperationsSummary()
      setPendingInventoryCount(summary.inventory)
      setPendingSalonCount(summary.salon)
      setPendingCount(summary.total)
      setFailedInventoryCount(summary.failedInventory)
      setFailedSalonCount(summary.failedSalon)
      setFailedCount(summary.failedTotal)
    } catch (error) {
      console.error("Erro ao verificar operacoes pendentes:", error)
    }
  }

  const handleSync = async () => {
    if (!navigator.onLine) {
      Swal.fire("Offline", "Nao e possivel sincronizar enquanto estiver offline", "warning")
      return
    }

    setIsSyncing(true)
    try {
      const result = await syncWithServer()
      setLastSyncTime(new Date())

      if (result.success) {
        Swal.fire("Sincronizado", result.message, "success")
      } else {
        Swal.fire("Erro na sincronizacao", result.message, "error")
      }

      checkPendingOperations()
    } catch (error) {
      console.error("Erro ao sincronizar:", error)
      Swal.fire("Erro", `Falha na sincronizacao: ${error.message}`, "error")
    } finally {
      setIsSyncing(false)
    }
  }

  const hasPending = pendingCount > 0
  const hasFailed = failedCount > 0

  if (!hasPending && !hasFailed && !isSyncing) return null

  const buttonLabel = isSyncing
    ? "Sincronizando..."
    : navigator.onLine
      ? hasPending
        ? `Sync (${pendingCount})`
        : `Falhas (${failedCount})`
      : `Offline (${pendingCount || failedCount})`

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 z-40 lg:bottom-8 lg:right-8">
      <button
        className={[
          "flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-ui font-semibold shadow-ambient transition",
          navigator.onLine && hasPending
            ? "border-primary/30 bg-surface text-text hover:border-primary/45"
            : navigator.onLine
              ? "border-red-400/25 bg-surface text-red-100"
              : "border-white/10 bg-surface text-text-dark",
        ].join(" ")}
        disabled={isSyncing || !navigator.onLine || !hasPending}
        onClick={handleSync}
        type="button"
      >
        {isSyncing ? (
          <FaSync className="animate-spin text-primary" />
        ) : navigator.onLine && hasPending ? (
          <FaSync className="text-primary" />
        ) : (
          <FaExclamationTriangle className="text-primary" />
        )}
        <span>{buttonLabel}</span>
      </button>
      {hasPending ? (
        <div className="mt-2 text-center text-[11px] text-text-dark">
          Inventario: {pendingInventoryCount} • Salon: {pendingSalonCount}
        </div>
      ) : null}
      {hasFailed ? (
        <div className="mt-2 text-center text-[11px] text-red-200/90">
          Falhas - Inventario: {failedInventoryCount} • Salon: {failedSalonCount}
        </div>
      ) : null}
      {hasFailed ? (
        <div className="mt-1 text-center text-[11px] text-text-dark">
          Abra a mesa, comanda ou fluxo afetado para reenviar as operacoes com falha.
        </div>
      ) : null}
      {lastSyncTime ? <div className="mt-2 text-center text-[11px] text-text-dark">Ultima sincronizacao: {lastSyncTime.toLocaleTimeString()}</div> : null}
    </div>
  )
}

export default SyncManager
