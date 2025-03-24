"use client"

import { useState, useEffect, useCallback } from "react"
import { useOffline } from "../context/OfflineContext"
import * as db from "../services/db"
import { addToSyncQueue } from "../services/db"
import Swal from "sweetalert2"

export function useOfflineData(entityType) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { online } = useOffline()

  const storeName = entityType === "beverages" ? "beverages" : "ingredients"
  const apiEndpoint = entityType === "beverages" ? "beverages" : "ingredients"

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

        // Atualizar o IndexedDB com os dados do servidor
        for (const item of serverData) {
          if (entityType === "beverages") {
            await db.saveBeverage(item)
          } else {
            await db.saveIngredient(item)
          }
        }

        setData(serverData)
      } else {
        // Se estiver offline, buscar do IndexedDB
        const localData = entityType === "beverages" ? await db.getAllBeverages() : await db.getAllIngredients()

        setData(localData)
      }
    } catch (error) {
      console.error(`Erro ao buscar ${entityType}:`, error)
      setError(error.message)

      // Em caso de erro, tentar buscar do IndexedDB
      try {
        const localData = entityType === "beverages" ? await db.getAllBeverages() : await db.getAllIngredients()

        setData(localData)

        if (localData.length > 0) {
          Swal.fire({
            title: "Usando dados offline",
            text: "Não foi possível conectar ao servidor. Exibindo dados salvos localmente.",
            icon: "info",
          })
        }
      } catch (dbError) {
        console.error("Erro ao buscar dados locais:", dbError)
      }
    } finally {
      setLoading(false)
    }
  }, [entityType, online, apiEndpoint])

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

          // Salvar no IndexedDB
          if (entityType === "beverages") {
            await db.saveBeverage(savedItem)
          } else {
            await db.saveIngredient(savedItem)
          }

          setData((prev) => [...prev, savedItem])
          return savedItem
        } else {
          // Se estiver offline, salvar localmente e adicionar à fila de sincronização
          if (entityType === "beverages") {
            await db.saveBeverage(tempItem)
          } else {
            await db.saveIngredient(tempItem)
          }

          // Adicionar à fila de sincronização
          await addToSyncQueue({
            type: "create",
            entity: apiEndpoint,
            data: item,
            createdAt: new Date().toISOString(),
          })

          setData((prev) => [...prev, tempItem])

          Swal.fire({
            title: "Salvo offline",
            text: "Este item será sincronizado quando você estiver online.",
            icon: "info",
          })

          return tempItem
        }
      } catch (error) {
        console.error(`Erro ao adicionar ${entityType}:`, error)
        throw error
      }
    },
    [entityType, online, apiEndpoint],
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

          // Atualizar no IndexedDB
          if (entityType === "beverages") {
            await db.saveBeverage(updatedItem)
          } else {
            await db.saveIngredient(updatedItem)
          }

          setData((prev) => prev.map((item) => (item._id === id ? updatedItem : item)))
          return updatedItem
        } else {
          // Se estiver offline ou for um item temporário
          const currentItem = entityType === "beverages" ? await db.getBeverage(id) : await db.getIngredient(id)

          if (!currentItem) {
            throw new Error("Item não encontrado")
          }

          const updatedItem = { ...currentItem, ...updates }

          // Atualizar no IndexedDB
          if (entityType === "beverages") {
            await db.saveBeverage(updatedItem)
          } else {
            await db.saveIngredient(updatedItem)
          }

          // Adicionar à fila de sincronização se não for um item temporário
          if (!isTemp) {
            await addToSyncQueue({
              type: "update",
              entity: apiEndpoint,
              entityId: id,
              data: updatedItem,
              createdAt: new Date().toISOString(),
            })
          }

          setData((prev) => prev.map((item) => (item._id === id ? updatedItem : item)))

          if (!online) {
            Swal.fire({
              title: "Atualizado offline",
              text: "Esta atualização será sincronizada quando você estiver online.",
              icon: "info",
            })
          }

          return updatedItem
        }
      } catch (error) {
        console.error(`Erro ao atualizar ${entityType}:`, error)
        throw error
      }
    },
    [entityType, online, apiEndpoint],
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
          await addToSyncQueue({
            type: "delete",
            entity: apiEndpoint,
            entityId: id,
            createdAt: new Date().toISOString(),
          })

          if (!online) {
            Swal.fire({
              title: "Deletado offline",
              text: "Esta exclusão será sincronizada quando você estiver online.",
              icon: "info",
            })
          }
        }

        // Sempre deletar do IndexedDB
        if (entityType === "beverages") {
          await db.deleteBeverage(id)
        } else {
          await db.deleteIngredient(id)
        }

        setData((prev) => prev.filter((item) => item._id !== id))
        return true
      } catch (error) {
        console.error(`Erro ao deletar ${entityType}:`, error)
        throw error
      }
    },
    [entityType, online, apiEndpoint],
  )

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

