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
async function initDB() {
  try {
    // Aqui estamos apenas verificando se conseguimos abrir o banco
    // Não precisamos armazenar a referência em uma variável se não a usarmos
    await openDB(DB_NAME, DB_VERSION, {
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

    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

// Funções para gerenciar bebidas
async function getAllBeverages() {
  try {
    const db = await openDB(DB_NAME)
    const data = await db.getAll(BEVERAGES_STORE)
    return { data }
  } catch (error) {
    return { error: error.message }
  }
}

async function saveBeverage(beverage) {
  try {
    const db = await openDB(DB_NAME)
    await db.put(BEVERAGES_STORE, beverage)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

async function deleteBeverage(id) {
  try {
    const db = await openDB(DB_NAME)
    await db.delete(BEVERAGES_STORE, id)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

// Funções para gerenciar ingredientes
async function getAllIngredients() {
  try {
    const db = await openDB(DB_NAME)
    const data = await db.getAll(INGREDIENTS_STORE)
    return { data }
  } catch (error) {
    return { error: error.message }
  }
}

async function saveIngredient(ingredient) {
  try {
    const db = await openDB(DB_NAME)
    await db.put(INGREDIENTS_STORE, ingredient)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

async function deleteIngredient(id) {
  try {
    const db = await openDB(DB_NAME)
    await db.delete(INGREDIENTS_STORE, id)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

// Funções para gerenciar a fila de sincronização
async function addToSyncQueue(operation) {
  try {
    const db = await openDB(DB_NAME)
    const id = await db.add(SYNC_STORE, {
      ...operation,
      createdAt: new Date().toISOString(),
      status: "pending",
    })
    return { id }
  } catch (error) {
    return { error: error.message }
  }
}

async function getSyncQueue() {
  try {
    const db = await openDB(DB_NAME)
    const data = await db.getAllFromIndex(SYNC_STORE, "status", "pending")
    return { data }
  } catch (error) {
    return { error: error.message }
  }
}

// Listener para mensagens
self.onmessage = async (e) => {
  const { action, data } = e.data
  let result

  switch (action) {
    case "initDB":
      result = await initDB()
      break
    case "getAllBeverages":
      result = await getAllBeverages()
      break
    case "saveBeverage":
      result = await saveBeverage(data)
      break
    case "deleteBeverage":
      result = await deleteBeverage(data)
      break
    case "getAllIngredients":
      result = await getAllIngredients()
      break
    case "saveIngredient":
      result = await saveIngredient(data)
      break
    case "deleteIngredient":
      result = await deleteIngredient(data)
      break
    case "addToSyncQueue":
      result = await addToSyncQueue(data)
      break
    case "getSyncQueue":
      result = await getSyncQueue()
      break
    default:
      result = { error: "Ação desconhecida" }
  }

  self.postMessage(result)
}

