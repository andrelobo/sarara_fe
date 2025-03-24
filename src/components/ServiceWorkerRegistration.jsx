"use client"

import { useEffect, useState } from "react"
import { FaDownload, FaRedo } from "react-icons/fa"
import Swal from "sweetalert2"

const ServiceWorkerRegistration = () => {
  const [waitingWorker, setWaitingWorker] = useState(null)
  const [newVersionAvailable, setNewVersionAvailable] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Registrar o service worker
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js")

          // Detectar quando uma nova versão está disponível
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            setWaitingWorker(newWorker)

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setNewVersionAvailable(true)
              }
            })
          })

          // Detectar quando o app está pronto para uso offline
          if (registration.active) {
            setOfflineReady(true)
          }

          // Lidar com atualizações controladas
          let refreshing = false
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!refreshing) {
              refreshing = true
              window.location.reload()
            }
          })
        } catch (error) {
          console.error("Erro ao registrar service worker:", error)
        }
      }

      registerServiceWorker()
    }
  }, [])

  const updateServiceWorker = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      setNewVersionAvailable(false)

      Swal.fire({
        title: "Atualizando...",
        text: "A página será recarregada para aplicar as atualizações.",
        icon: "info",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
    }
  }

  // Mostrar notificação quando o app estiver pronto para uso offline
  useEffect(() => {
    if (offlineReady) {
      Swal.fire({
        title: "Pronto para uso offline",
        text: "O aplicativo agora pode ser usado mesmo sem conexão com a internet.",
        icon: "success",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
    }
  }, [offlineReady])

  if (!newVersionAvailable) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <FaDownload />
        <span>Nova versão disponível!</span>
        <button
          onClick={updateServiceWorker}
          className="ml-2 bg-white text-blue-600 px-2 py-1 rounded text-sm flex items-center"
        >
          <FaRedo className="mr-1" /> Atualizar
        </button>
      </div>
    </div>
  )
}

export default ServiceWorkerRegistration

