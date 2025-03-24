"use client"

import { useEffect, useState } from "react"
import { FaSync, FaExclamationTriangle } from "react-icons/fa"
import Swal from "sweetalert2"
import { getSyncQueue, syncWithServer } from "../utils/db"

const API_BASE_URL = "https://sarara-be.vercel.app/api"

const SyncManager = () => {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)

  useEffect(() => {
    // Verificar operações pendentes ao carregar o componente
    checkPendingOperations()

    // Verificar operações pendentes quando o status online mudar
    const handleOnline = () => {
      if (navigator.onLine) {
        checkPendingOperations()

        // Perguntar ao usuário se deseja sincronizar
        if (pendingCount > 0) {
          Swal.fire({
            title: "Conexão restaurada",
            text: `Você tem ${pendingCount} operações pendentes. Deseja sincronizar agora?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sim, sincronizar",
            cancelButtonText: "Não",
          }).then((result) => {
            if (result.isConfirmed) {
              handleSync()
            }
          })
        }
      }
    }

    window.addEventListener("online", handleOnline)

    // Verificar periodicamente
    const interval = setInterval(checkPendingOperations, 60000) // A cada minuto

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
      console.error("Erro ao verificar operações pendentes:", error)
    }
  }

  const handleSync = async () => {
    if (!navigator.onLine) {
      Swal.fire("Offline", "Não é possível sincronizar enquanto estiver offline", "warning")
      return
    }

    setIsSyncing(true)
    try {
      const token = localStorage.getItem("authToken")
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      const result = await syncWithServer(API_BASE_URL, headers)
      setLastSyncTime(new Date())

      if (result.success) {
        Swal.fire("Sincronizado", result.message, "success")
      } else {
        Swal.fire("Erro na sincronização", result.message, "error")
      }

      // Atualizar contagem após sincronização
      checkPendingOperations()
    } catch (error) {
      console.error("Erro ao sincronizar:", error)
      Swal.fire("Erro", `Falha na sincronização: ${error.message}`, "error")
    } finally {
      setIsSyncing(false)
    }
  }

  // Se não houver operações pendentes, não renderizar nada
  if (pendingCount === 0 && !isSyncing) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleSync}
        disabled={isSyncing || !navigator.onLine}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${
          navigator.onLine ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
      >
        {isSyncing ? (
          <>
            <FaSync className="animate-spin" />
            <span>Sincronizando...</span>
          </>
        ) : navigator.onLine ? (
          <>
            <FaSync />
            <span>Sincronizar ({pendingCount})</span>
          </>
        ) : (
          <>
            <FaExclamationTriangle />
            <span>Offline ({pendingCount})</span>
          </>
        )}
      </button>

      {lastSyncTime && (
        <div className="text-xs text-center mt-1 text-gray-600">
          Última sincronização: {lastSyncTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default SyncManager

