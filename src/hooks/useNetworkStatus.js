"use client"

import { useState, useEffect } from "react"

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [reconnected, setReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setReconnected(true)

      // Reset reconnected flag after 5 seconds
      setTimeout(() => {
        setReconnected(false)
      }, 5000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setReconnected(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return { isOnline, reconnected }
}

