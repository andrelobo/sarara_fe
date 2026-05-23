"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { isOnline, subscribeToNetworkChanges } from "../services/networkService"
import { syncWithServer } from "../services/syncService"
import Swal from "sweetalert2"

const OfflineContext = createContext()

export function OfflineProvider({ children }) {
  const [online, setOnline] = useState(isOnline())
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)

  useEffect(() => {
    // Inscrever-se para mudanças de status de rede
    const unsubscribe = subscribeToNetworkChanges((isOnline) => {
      setOnline(isOnline)

      // Quando voltar a ficar online, tentar sincronizar
      if (isOnline) {
        Swal.fire({
          title: "Conexão restaurada",
          text: "Deseja sincronizar os dados agora?",
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
    })

    return () => unsubscribe()
  }, [])

  const handleSync = async ({ silent = false } = {}) => {
    if (!online) {
      if (!silent) {
        Swal.fire("Offline", "Não é possível sincronizar enquanto estiver offline", "warning")
      }
      return { success: false, message: "Offline, nao e possivel sincronizar" }
    }

    setSyncing(true)
    try {
      const result = await syncWithServer()
      setLastSyncTime(new Date())

      if (!silent && result.success) {
        Swal.fire("Sincronizado", result.message, "success")
      } else if (!silent) {
        Swal.fire("Erro na sincronização", result.message, "error")
      }

      return result
    } catch (error) {
      console.error("Erro ao sincronizar:", error)
      if (!silent) {
        Swal.fire("Erro", `Falha na sincronização: ${error.message}`, "error")
      }
      return { success: false, message: `Falha na sincronizacao: ${error.message}` }
    } finally {
      setSyncing(false)
    }
  }

  return (
    <OfflineContext.Provider
      value={{
        online,
        syncing,
        lastSyncTime,
        syncData: handleSync,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  return useContext(OfflineContext)
}
