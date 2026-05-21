"use client"

import { useEffect, useState } from "react"
import { FaExclamationTriangle, FaSync } from "react-icons/fa"
import Swal from "sweetalert2"
import { getSyncQueue, syncWithServer } from "../utils/db"

const API_BASE_URL = "https://sarara-be.vercel.app/api"

const SyncManager = () => {
  const [pendingCount, setPendingCount] = useState(0)
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
      const queue = await getSyncQueue()
      setPendingCount(queue.length)
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
      const token = localStorage.getItem("authToken")
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      const result = await syncWithServer(API_BASE_URL, headers)
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

  if (pendingCount === 0 && !isSyncing) return null

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 z-40 lg:bottom-8 lg:right-8">
      <button
        className={[
          "flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-ui font-semibold shadow-ambient transition",
          navigator.onLine ? "border-primary/30 bg-surface text-text hover:border-primary/45" : "border-white/10 bg-surface text-text-dark",
        ].join(" ")}
        disabled={isSyncing || !navigator.onLine}
        onClick={handleSync}
        type="button"
      >
        {isSyncing ? <FaSync className="animate-spin text-primary" /> : navigator.onLine ? <FaSync className="text-primary" /> : <FaExclamationTriangle className="text-primary" />}
        <span>{isSyncing ? "Sincronizando..." : navigator.onLine ? `Sync (${pendingCount})` : `Offline (${pendingCount})`}</span>
      </button>
      {lastSyncTime ? <div className="mt-2 text-center text-[11px] text-text-dark">Ultima sincronizacao: {lastSyncTime.toLocaleTimeString()}</div> : null}
    </div>
  )
}

export default SyncManager
