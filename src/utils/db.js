import { openDB } from "idb"

const DB_NAME = "sarara-db"
const DB_VERSION = 1

// Stores (tabelas)
const BEVERAGES_STORE = "beverages"
const INGREDIENTS_STORE = "ingredients"
const SYNC_STORE = "sync-queue"
const FORM_DATA_STORE = "form-data"
const AUTH_STORE = "auth"

// Inicializa o banco de dados
export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Criar store para bebidas
      if (!db.objectStoreNames.contains(BEVERAGES_STORE)) {
        const beverageStore = db.createObjectStore(BEVERAGES_STORE, { keyPath: "_id" })
        beverageStore.createIndex("name", "name", { unique: false })
        beverageStore.createIndex("category", "category", { unique: false })
      }

      // Criar store para ingredientes
      if (!db.objectStoreNames.contains(INGREDIENTS_STORE)) {
        const ingredientStore = db.createObjectStore(INGREDIENTS_STORE, { keyPath: "_id" })
        ingredientStore.createIndex("name", "name", { unique: false })
        ingredientStore.createIndex("category", "category", { unique: false })
      }

      // Criar store para fila de sincronização
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        const syncStore = db.createObjectStore(SYNC_STORE, {
          keyPath: "id",
          autoIncrement: true,
        })
        syncStore.createIndex("createdAt", "createdAt", { unique: false })
        syncStore.createIndex("status", "status", { unique: false })
      }

      // Criar store para dados de formulários
      if (!db.objectStoreNames.contains(FORM_DATA_STORE)) {
        db.createObjectStore(FORM_DATA_STORE, { keyPath: "id" })
      }

      // Criar store para autenticação
      if (!db.objectStoreNames.contains(AUTH_STORE)) {
        db.createObjectStore(AUTH_STORE, { keyPath: "id" })
      }
    },
  })

  return db
}

// Funções para gerenciar dados genéricos
export async function saveData(storeName, data) {
  const db = await initDB()
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)

  if (Array.isArray(data)) {
    // Se for um array, salva cada item individualmente
    for (const item of data) {
      // Gera um ID temporário se não existir
      if (!item._id) {
        item._id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      await store.put(item)
    }
  } else {
    // Se for um único item
    if (!data._id) {
      data._id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    await store.put(data)
  }

  await tx.done
  return data
}

export async function getAllData(storeName) {
  const db = await initDB()
  return db.getAll(storeName)
}

export async function getDataById(storeName, id) {
  const db = await initDB()
  return db.get(storeName, id)
}

export async function deleteData(storeName, id) {
  const db = await initDB()
  return db.delete(storeName, id)
}

// Funções para gerenciar a fila de sincronização
export async function saveSyncQueue(operation) {
  const db = await initDB()
  return db.add(SYNC_STORE, {
    ...operation,
    createdAt: new Date().toISOString(),
    status: "pending",
  })
}

export async function getSyncQueue() {
  const db = await initDB()
  return db.getAllFromIndex(SYNC_STORE, "status", "pending")
}

export async function updateSyncQueueItem(id, updates) {
  const db = await initDB()
  const item = await db.get(SYNC_STORE, id)
  if (!item) return null

  const updatedItem = { ...item, ...updates }
  return db.put(SYNC_STORE, updatedItem)
}

export async function clearSyncQueue() {
  const db = await initDB()
  const tx = db.transaction(SYNC_STORE, "readwrite")
  await tx.objectStore(SYNC_STORE).clear()
  return tx.done
}

// Funções para gerenciar dados de formulários
export async function saveFormData(formId, data) {
  const db = await initDB()
  return db.put(FORM_DATA_STORE, { id: formId, ...data })
}

export async function getFormData(formId) {
  const db = await initDB()
  return db.get(FORM_DATA_STORE, formId)
}

export async function clearFormData(formId) {
  const db = await initDB()
  return db.delete(FORM_DATA_STORE, formId)
}

// Funções para gerenciar autenticação
export async function saveToken(token) {
  const db = await initDB()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Token válido por 7 dias

  return db.put(AUTH_STORE, {
    id: "authToken",
    token,
    expiresAt: expiresAt.toISOString(),
  })
}

export async function getToken() {
  const db = await initDB()
  const authData = await db.get(AUTH_STORE, "authToken")
  return authData ? authData.token : null
}

export function isTokenValid(tokenData) {
  if (!tokenData || !tokenData.expiresAt) return false

  const expiresAt = new Date(tokenData.expiresAt)
  const now = new Date()

  return expiresAt > now
}

// Função para sincronizar dados com o servidor
export async function syncWithServer(apiBaseUrl, headers) {
  if (!navigator.onLine) {
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
          const { type, entity, data, id } = operation

          let url = `${apiBaseUrl}/${entity || (type === "update" || type === "delete" ? (data?.category === "beverage" ? "beverages" : "ingredients") : "")}`
          let method = "POST"
          let body = data ? JSON.stringify(data) : null

          if (type === "update") {
            url = `${url}/${data._id}`
            method = "PUT"
          } else if (type === "delete") {
            url = `${url}/${id}`
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

