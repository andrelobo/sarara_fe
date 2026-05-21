"use client"

import { FaExclamationTriangle, FaSync, FaWifi } from "react-icons/fa"
import { useOffline } from "../context/OfflineContext"

const OfflineIndicator = () => {
  const { online, syncing, lastSyncTime } = useOffline()

  if (online && !syncing) {
    return null
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-[5.2rem] z-30 w-full max-w-2xl -translate-x-1/2 px-4">
      <div className={[
        "rounded-2xl border px-4 py-3 shadow-ambient backdrop-blur-xl",
        online ? "border-primary/25 bg-primary/12 text-primary" : "border-red-400/20 bg-red-500/12 text-red-100",
      ].join(" ")}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-2 font-ui font-semibold">
            {online ? (syncing ? <FaSync className="animate-spin" /> : <FaWifi />) : <FaExclamationTriangle />}
            {online && syncing ? "Sincronizando dados..." : "Modo offline ativo"}
          </span>
          <span className="text-current/85">
            {online && syncing
              ? "A fila local esta sendo processada."
              : "Suas alteracoes ficam salvas localmente e voltam ao servidor quando a conexao retornar."}
          </span>
          {lastSyncTime ? <span className="text-current/75">Ultima sincronizacao: {new Date(lastSyncTime).toLocaleString()}</span> : null}
        </div>
      </div>
    </div>
  )
}

export default OfflineIndicator
