"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useOffline } from "../context/OfflineContext"
import { toast } from "react-hot-toast" // Substituindo SweetAlert2 por uma alternativa mais leve

// Criamos um worker compartilhado
const createWorker = () => {
  return new Worker(new URL("../workers/dbWorker.js", import.meta.url), { type: "module" })
}

// Singleton para o worker
let workerInstance = null

const getWorker = () => {
  if (!workerInstance) {
    workerInstance = createWorker()
  }
  return workerInstance
}

export function useOfflineData(entityType) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { online } = useOffline()
  const worker = useRef(getWorker())

  const apiEndpoint = entityType === "beverages" ? "beverages" : "ingredients"

  // Função para comunicar com o worker
  const workerRequest = useCallback((action, data = null) => {
    return new Promise((resolve) => {
      const messageHandler = (e) => {
        worker.current.removeEventListener("message", messageHandler)
        resolve(e.data)
      }

      worker.current.addEventListener("message", messageHandler)
      worker.current.postMessage({ action, data })
    })
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (online) {
        // Se estiver online, buscar do servidor
        const token = localStorage.getItem("authToken")
        const response = await fetch(`https://sarara-be.vercel.app/api/${apiEndpoint}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.status}`)
        }

        const serverData = await response.json()

        // Atualizar o IndexedDB com os dados do servidor (via worker)
        for (const item of serverData) {
          if (entityType === "beverages") {
            await workerRequest("saveBeverage", item)
          } else {
            await workerRequest("saveIngredient", item)
          }
        }

        setData(serverData)
      } else {
        // Se estiver offline, buscar do IndexedDB via worker
        const result =
          entityType === "beverages" ? await workerRequest("getAllBeverages") : await workerRequest("getAllIngredients")

        if (result.error) {
          throw new Error(result.error)
        }

        setData(result.data || [])
      }
    } catch (error) {
      console.error(`Erro ao buscar ${entityType}:`, error)
      setError(error.message)

      // Em caso de erro, tentar buscar do IndexedDB
      try {
        const result =
          entityType === "beverages" ? await workerRequest("getAllBeverages") : await workerRequest("getAllIngredients")

        if (result.error) {
          throw new Error(result.error)
        }

        const localData = result.data || []
        setData(localData)

        if (localData.length > 0) {
          toast.info("Usando dados offline. Não foi possível conectar ao servidor.")
        }
      } catch (dbError) {
        console.error("Erro ao buscar dados locais:", dbError)
      }
    } finally {
      setLoading(false)
    }
  }, [entityType, online, apiEndpoint, workerRequest])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addItem = useCallback(
    async (item) => {
      try {
        // Gerar um ID temporário para uso offline
        const tempItem = { ...item, _id: `temp_${Date.now()}` }

        if (online) {
          // Se estiver online, enviar para o servidor
          const token = localStorage.getItem("authToken")
          const response = await fetch(`https://sarara-be.vercel.app/api/${apiEndpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
          })

          if (!response.ok) {
            throw new Error(`Erro ao adicionar: ${response.status}`)
          }

          const savedItem = await response.json()

          // Salvar no IndexedDB via worker
          if (entityType === "beverages") {
            await workerRequest("saveBeverage", savedItem)
          } else {
            await workerRequest("saveIngredient", savedItem)
          }

          setData((prev) => [...prev, savedItem])
          return savedItem
        } else {
          // Se estiver offline, salvar localmente via worker
          if (entityType === "beverages") {
            await workerRequest("saveBeverage", tempItem)
          } else {
            await workerRequest("saveIngredient", tempItem)
          }

          // Adicionar à fila de sincronização via worker
          await workerRequest("addToSyncQueue", {
            type: "create",
            entity: apiEndpoint,
            data: item,
            createdAt: new Date().toISOString(),
          })

          setData((prev) => [...prev, tempItem])
          toast.success("Salvo offline. Será sincronizado quando você estiver online.")
          return tempItem
        }
      } catch (error) {
        console.error(`Erro ao adicionar ${entityType}:`, error)
        throw error
      }
    },
    [entityType, online, apiEndpoint, workerRequest],
  )

  const updateItem = useCallback(
    async (id, updates) => {
      try {
        const isTemp = id.startsWith("temp_")

        if (online && !isTemp) {
          // Se estiver online e não for um item temporário, atualizar no servidor
          const token = localStorage.getItem("authToken")
          const response = await fetch(`https://sarara-be.vercel.app/api/${apiEndpoint}/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          })

          if (!response.ok) {
            throw new Error(`Erro ao atualizar: ${response.status}`)
          }

          const updatedItem = await response.json()

          // Atualizar no IndexedDB via worker
          if (entityType === "beverages") {
            await workerRequest("saveBeverage", updatedItem)
          } else {
            await workerRequest("saveIngredient", updatedItem)
          }

          setData((prev) => prev.map((item) => (item._id === id ? updatedItem : item)))
          return updatedItem
        } else {
          // Se estiver offline ou for um item temporário
          // Buscar item atual do estado para evitar operação de IndexedDB
          const currentItem = data.find((item) => item._id === id)

          if (!currentItem) {
            throw new Error("Item não encontrado")
          }

          const updatedItem = { ...currentItem, ...updates }

          // Atualizar no IndexedDB via worker
          if (entityType === "beverages") {
            await workerRequest("saveBeverage", updatedItem)
          } else {
            await workerRequest("saveIngredient", updatedItem)
          }

          // Adicionar à fila de sincronização se não for um item temporário
          if (!isTemp) {
            await workerRequest("addToSyncQueue", {
              type: "update",
              entity: apiEndpoint,
              entityId: id,
              data: updatedItem,
              createdAt: new Date().toISOString(),
            })
          }

          setData((prev) => prev.map((item) => (item._id === id ? updatedItem : item)))

          if (!online) {
            toast.success("Atualizado offline. Será sincronizado quando você estiver online.")
          }

          return updatedItem
        }
      } catch (error) {
        console.error(`Erro ao atualizar ${entityType}:`, error)
        throw error
      }
    },
    [entityType, online, apiEndpoint, workerRequest, data],
  )

  const deleteItem = useCallback(
    async (id) => {
      try {
        const isTemp = id.startsWith("temp_")

        if (online && !isTemp) {
          // Se estiver online e não for um item temporário, deletar no servidor
          const token = localStorage.getItem("authToken")
          const response = await fetch(`https://sarara-be.vercel.app/api/${apiEndpoint}/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error(`Erro ao deletar: ${response.status}`)
          }
        } else if (!isTemp) {
          // Se estiver offline e não for um item temporário, adicionar à fila de sincronização
          await workerRequest("addToSyncQueue", {
            type: "delete",
            entity: apiEndpoint,
            entityId: id,
            createdAt: new Date().toISOString(),
          })

          if (!online) {
            toast.success("Deletado offline. Será sincronizado quando você estiver online.")
          }
        }

        // Sempre deletar do IndexedDB via worker
        if (entityType === "beverages") {
          await workerRequest("deleteBeverage", id)
        } else {
          await workerRequest("deleteIngredient", id)
        }

        setData((prev) => prev.filter((item) => item._id !== id))
        return true
      } catch (error) {
        console.error(`Erro ao deletar ${entityType}:`, error)
        throw error
      }
    },
    [entityType, online, apiEndpoint, workerRequest],
  )

  // Limpar o worker quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Não terminamos o worker aqui porque ele é compartilhado
      // Se necessário, podemos implementar um contador de referência
    }
  }, [])

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    add: addItem,
    update: updateItem,
    remove: deleteItem,
  }
}

