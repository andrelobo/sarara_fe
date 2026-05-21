import { Link } from "react-router-dom"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, hasRole } from "../utils/auth"

const STATUS_META = {
  free: { label: "Livre", badge: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30" },
  occupied: { label: "Ocupada", badge: "bg-amber-500/20 text-amber-100 border-amber-500/30" },
  closing: { label: "Fechando", badge: "bg-orange-500/20 text-orange-100 border-orange-500/30" },
  reserved: { label: "Reservada", badge: "bg-sky-500/20 text-sky-100 border-sky-500/30" },
}

const TableCard = ({ table, currentUser, onRefresh, compact = false }) => {
  const statusMeta = STATUS_META[table.status] || STATUS_META.free
  const canManageCatalog = hasRole(currentUser, ["admin", "manager"])
  const canOperate = hasRole(currentUser, ["admin", "manager", "waiter"])

  const handleAction = async (action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${table._id}/${action}`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
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
    <article className="rounded-2xl border border-primary/15 bg-background-light p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Mesa</p>
          <h3 className="text-2xl font-semibold text-text">#{table.number}</h3>
          <p className="mt-1 text-sm text-text-dark">{table.name || `Mesa ${table.number}`}</p>
        </div>

        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}>
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-5 space-y-2 text-sm text-text-dark">
        <p>Garçom atual: {table.waiterId || "Nao atribuido"}</p>
        <p>Comanda ativa: {table.currentCommandId || "Nenhuma"}</p>
      </div>

      <div className={`mt-5 grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
        <Link
          to={`/salon/tables/${table._id}`}
          className="rounded-md border border-primary px-4 py-2 text-center text-sm font-medium text-text transition hover:bg-primary hover:text-background"
        >
          Ver mesa
        </Link>

        {canOperate && table.status === "free" && (
          <button
            type="button"
            onClick={() => handleAction("open")}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-background transition hover:bg-secondary-light"
          >
            Abrir mesa
          </button>
        )}

        {canOperate && table.status !== "free" && !table.currentCommandId && (
          <button
            type="button"
            onClick={() => handleAction("close")}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-background transition hover:bg-primary-light"
          >
            Fechar mesa
          </button>
        )}

        {canManageCatalog && (
          <span className="rounded-md border border-dashed border-primary/30 px-4 py-2 text-center text-xs text-text-dark">
            Catalogo editavel no detalhe da mesa
          </span>
        )}
      </div>
    </article>
  )
}

export default TableCard
