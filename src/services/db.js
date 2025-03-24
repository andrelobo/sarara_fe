import { openDB } from "idb"

const DB_NAME = "sarara-db"
const DB_VERSION = 1

// Stores (tabelas)
const BEVERAGES_STORE = "beverages"
const INGREDIENTS_STORE = "ingredients"
const SYNC_STORE = "sync-queue"

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
    },
  })

  return db
}

// Funções para gerenciar bebidas
export async function getAllBeverages() {
  const db = await initDB()
  return db.getAll(BEVERAGES_STORE)
}

export async function getBeverage(id) {
  const db = await initDB()
  return db.get(BEVERAGES_STORE, id)
}

export async function saveBeverage(beverage) {
  const db = await initDB()
  return db.put(BEVERAGES_STORE, beverage)
}

export async function deleteBeverage(id) {
  const db = await initDB()
  return db.delete(BEVERAGES_STORE, id)
}

// Funções para gerenciar ingredientes
export async function getAllIngredients() {
  const db = await initDB()
  return db.getAll(INGREDIENTS_STORE)
}

export async function getIngredient(id) {
  const db = await initDB()
  return db.get(INGREDIENTS_STORE, id)
}

export async function saveIngredient(ingredient) {
  const db = await initDB()
  return db.put(INGREDIENTS_STORE, ingredient)
}

export async function deleteIngredient(id) {
  const db = await initDB()
  return db.delete(INGREDIENTS_STORE, id)
}

// Funções para gerenciar a fila de sincronização
export async function addToSyncQueue(operation) {
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

