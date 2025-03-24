import { getSyncQueue, updateSyncQueueItem } from "./db"
import { isOnline } from "./networkService"

const API_BASE_URL = "https://sarara-be.vercel.app/api"

export async function syncWithServer() {
  if (!isOnline()) {
    console.log("Offline, não é possível sincronizar")
    return { success: false, message: "Offline, não é possível sincronizar" }
  }

  try {
    const pendingOperations = await getSyncQueue()

    if (pendingOperations.length === 0) {
      return { success: true, message: "Nada para sincronizar" }
    }

    console.log(`Sincronizando ${pendingOperations.length} operações pendentes`)

    const results = await Promise.allSettled(
      pendingOperations.map(async (operation) => {
        try {
          const { type, entity, data, entityId } = operation
          const token = localStorage.getItem("authToken")

          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }

          let url = `${API_BASE_URL}/${entity}`
          let method = "POST"
          let body = JSON.stringify(data)

          if (type === "update") {
            url = `${url}/${entityId}`
            method = "PUT"
          } else if (type === "delete") {
            url = `${url}/${entityId}`
            method = "DELETE"
            body = null
          }

          const response = await fetch(url, {
            method,
            headers,
            body,
          })

          if (!response.ok) {
            throw new Error(`Erro na sincronização: ${response.status}`)
          }

          // Marcar como sincronizado
          await updateSyncQueueItem(operation.id, {
            status: "completed",
            syncedAt: new Date().toISOString(),
          })

          return { success: true, operation }
        } catch (error) {
          console.error("Erro ao sincronizar operação:", error)

          // Marcar como falha
          await updateSyncQueueItem(operation.id, {
            status: "failed",
            error: error.message,
            lastAttempt: new Date().toISOString(),
          })

          return { success: false, operation, error }
        }
      }),
    )

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length
    const failed = results.length - successful

    return {
      success: failed === 0,
      message: `Sincronização concluída: ${successful} sucesso, ${failed} falhas`,
      results,
    }
  } catch (error) {
    console.error("Erro na sincronização:", error)
    return { success: false, message: `Erro na sincronização: ${error.message}` }
  }
}

