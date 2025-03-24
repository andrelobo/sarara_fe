"use client"
import { FaWifi, FaSync, FaExclamationTriangle } from "react-icons/fa"
import { useOffline } from "../context/OfflineContext"

const OfflineIndicator = () => {
  const { online, syncing, lastSyncTime, syncData } = useOffline()

  if (online && !syncing) return null

  return (
    <div
      className={`fixed top-16 left-0 right-0 p-2 z-50 ${online ? "bg-yellow-500" : "bg-red-500"} transition-all duration-300`}
    >
      <div className="container mx-auto flex items-center justify-between text-white">
        <div className="flex items-center">
          {online ? (
            syncing ? (
              <FaSync className="animate-spin mr-2" />
            ) : (
              <FaWifi className="mr-2" />
            )
          ) : (
            <FaExclamationTriangle className="mr-2" />
          )}
          <span>
            {online && syncing
              ? "Sincronizando dados..."
              : "Você está offline. Suas alterações serão salvas localmente e sincronizadas quando a conexão for restabelecida."}
          </span>
        </div>

        {!online && (
          <button
            onClick={syncData}
            disabled={syncing || !online}
            className="bg-white text-red-500 px-3 py-1 rounded-md text-sm flex items-center"
          >
            <FaSync className={`mr-1 ${syncing ? "animate-spin" : ""}`} />
            Sincronizar quando online
          </button>
        )}

        {lastSyncTime && <div className="text-xs">Última sincronização: {new Date(lastSyncTime).toLocaleString()}</div>}
      </div>
    </div>
  )
}

export default OfflineIndicator

