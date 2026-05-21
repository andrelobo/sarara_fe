import { Link } from "react-router-dom"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, hasRole } from "../utils/auth"
import AppButton from "./ui/AppButton"
import StatusPill from "./ui/StatusPill"

const STATUS_META = {
  free: { label: "Livre", tone: "success" },
  occupied: { label: "Ocupada", tone: "warning" },
  closing: { label: "Fechando", tone: "info" },
  reserved: { label: "Reservada", tone: "offline" },
}

const TableCard = ({ table, currentUser, onRefresh, compact = false }) => {
  const statusMeta = STATUS_META[table.status] || STATUS_META.free
  const canManageCatalog = hasRole(currentUser, ["admin", "manager"])
  const canOperate = hasRole(currentUser, ["admin", "manager", "waiter"])

  const waiterLabel = table.waiterId?.username || table.waiterId || "Nao atribuido"
  const commandLabel = table.currentCommandId?.code || table.currentCommandId || "Nenhuma"

  const handleAction = async (action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${table._id}/${action}`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel atualizar a mesa")
      }

      await onRefresh?.()
    } catch (error) {
      console.error(`Erro ao executar ${action} na mesa:`, error)
      window.alert(error.message || "Nao foi possivel atualizar a mesa.")
    }
  }

  return (
    <article className="rounded-[1.8rem] border border-white/10 bg-surface/75 p-5 shadow-ambient">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-text-dark">Mesa</p>
          <h3 className="mt-2 font-heading text-3xl text-text">#{table.number}</h3>
          <p className="mt-1 text-sm text-text-dark">{table.name || `Mesa ${table.number}`}</p>
        </div>
        <StatusPill label={statusMeta.label} tone={statusMeta.tone} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-text-dark">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Garcom: {waiterLabel}</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Comanda: {commandLabel}</span>
      </div>

      <div className={`mt-5 grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
        <AppButton to={`/salon/tables/${table._id}`} variant="ghost">Ver mesa</AppButton>

        {canOperate && table.status === "free" ? (
          <AppButton onClick={() => handleAction("open")} variant="secondary">Abrir mesa</AppButton>
        ) : null}

        {canOperate && table.status !== "free" && !table.currentCommandId ? (
          <AppButton onClick={() => handleAction("close")} variant="primary">Fechar mesa</AppButton>
        ) : null}

        {canManageCatalog ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/10 px-4 py-3 text-center text-xs text-text-dark">
            Catalogo e ajustes avancados continuam no detalhe da mesa.
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default TableCard
