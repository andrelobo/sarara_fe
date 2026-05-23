import {
  getAllData,
  getSalonQueue,
  getSyncQueue,
  SALON_QUEUE_STORE,
  SYNC_STORE,
  syncWithServer as syncInventoryQueue,
} from "../utils/db"
import { syncSalonQueue } from "../utils/salonOffline"
import { isOnline } from "./networkService"

const API_BASE_URL = "https://sarara-be.vercel.app/api"

function buildAuthHeaders() {
  const token = localStorage.getItem("authToken")

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export async function getPendingOperationsSummary() {
  const [inventoryQueue, salonQueue, allInventoryQueue, allSalonQueue] = await Promise.all([
    getSyncQueue(),
    getSalonQueue(),
    getAllData(SYNC_STORE),
    getAllData(SALON_QUEUE_STORE),
  ])

  const failedInventory = allInventoryQueue.filter((operation) => operation.status === "failed").length
  const failedSalon = allSalonQueue.filter((operation) => operation.status === "failed").length

  return {
    inventory: inventoryQueue.length,
    salon: salonQueue.length,
    total: inventoryQueue.length + salonQueue.length,
    failedInventory,
    failedSalon,
    failedTotal: failedInventory + failedSalon,
  }
}

export async function syncWithServer() {
  if (!isOnline()) {
    console.log("Offline, nao e possivel sincronizar")
    return { success: false, message: "Offline, nao e possivel sincronizar" }
  }

  try {
    const headers = buildAuthHeaders()
    const [inventorySummary, salonSummary] = await Promise.all([getSyncQueue(), getSalonQueue()])

    if (inventorySummary.length === 0 && salonSummary.length === 0) {
      return { success: true, message: "Nada para sincronizar" }
    }

    const inventoryResult = await syncInventoryQueue(API_BASE_URL, headers)
    const salonResult = await syncSalonQueue(API_BASE_URL, headers)

    const successful = [inventoryResult, salonResult].filter((result) => result.success).length
    const failed = 2 - successful

    return {
      success: inventoryResult.success && salonResult.success,
      message: [
        inventorySummary.length > 0 ? inventoryResult.message : "Inventario sem pendencias",
        salonSummary.length > 0 ? salonResult.message : "Salon sem pendencias",
      ].join(" | "),
      successfulQueues: successful,
      failedQueues: failed,
      inventoryResult,
      salonResult,
    }
  } catch (error) {
    console.error("Erro na sincronizacao unificada:", error)
    return { success: false, message: `Erro na sincronizacao: ${error.message}` }
  }
}
