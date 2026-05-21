import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import AddCommandItemModal from "./AddCommandItemModal"
import AuditTimeline from "./AuditTimeline"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, getStoredUser, hasRole } from "../utils/auth"

const ITEM_STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "preparing", label: "Preparando" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
]

const COMMAND_STATUS_META = {
  open: { label: "Aberta", badge: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30" },
  closed: { label: "Fechada", badge: "bg-slate-500/20 text-slate-200 border-slate-500/30" },
  cancelled: { label: "Cancelada", badge: "bg-rose-500/20 text-rose-200 border-rose-500/30" },
}

const PRODUCT_TYPE_LABELS = {
  beverage: "Bebida do estoque",
  manual: "Item livre",
}

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

const CommandView = ({ commandId: commandIdProp = null, embedded = false, onCommandChange = null }) => {
  const params = useParams()
  const commandId = commandIdProp || params.id
  const currentUser = useMemo(() => getStoredUser(), [])
  const canOperate = hasRole(currentUser, ["admin", "manager", "waiter"])

  const [command, setCommand] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const statusMeta = COMMAND_STATUS_META[command?.status] || COMMAND_STATUS_META.open

  const fetchCommand = async () => {
    if (!commandId) {
      setCommand(null)
      setIsLoading(false)
      setError("Comanda nao informada.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/commands/${commandId}`, {
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel carregar a comanda")
      }

      setCommand(data)
      onCommandChange?.(data)
    } catch (fetchError) {
      console.error("Erro ao carregar comanda:", fetchError)
      setError(fetchError.message || "Nao foi possivel carregar a comanda.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCommand()
  }, [commandId])

  const activeItems = command?.items || []

  const handleAddItem = async (payload) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/commands/${commandId}/items`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel adicionar o item")
      }

      setCommand(data)
      onCommandChange?.(data)
      setIsModalOpen(false)
    } catch (submitError) {
      console.error("Erro ao adicionar item:", submitError)
      window.alert(submitError.message || "Nao foi possivel adicionar o item.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleItemStatusChange = async (itemId, nextStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/commands/${commandId}/items/${itemId}`, {
        method: "PATCH",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          status: nextStatus,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel atualizar o item")
      }

      setCommand(data)
      onCommandChange?.(data)
    } catch (updateError) {
      console.error("Erro ao atualizar item da comanda:", updateError)
      window.alert(updateError.message || "Nao foi possivel atualizar o item.")
    }
  }

  const handleCommandAction = async (action) => {
    setIsFinishing(true)

    try {
      const response = await fetch(`${API_BASE_URL}/commands/${commandId}/${action}`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel encerrar a comanda")
      }

      setCommand(data)
      onCommandChange?.(data)
    } catch (actionError) {
      console.error(`Erro ao executar ${action} na comanda:`, actionError)
      window.alert(actionError.message || "Nao foi possivel concluir a acao.")
    } finally {
      setIsFinishing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
  }

  if (!command) {
    return (
      <div className="rounded-2xl border border-primary/15 bg-background-light p-6 text-text-dark">
        Nenhuma comanda ativa encontrada para esta mesa.
      </div>
    )
  }

  return (
    <section className={`space-y-6 ${embedded ? "" : "mx-auto max-w-5xl"}`}>
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Salon / Comanda</p>
            <h1 className="text-3xl font-semibold text-secondary">Comanda da mesa</h1>
          </div>
          <Link
            to={`/salon/tables/${command.tableId}`}
            className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-text transition hover:bg-primary hover:text-background"
          >
            Voltar para a mesa
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Resumo</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Mesa vinculada: {command.tableId}</h2>
            <p className="mt-2 text-sm text-text-dark">Garçom responsável: {command.waiterId || "Nao informado"}</p>
          </div>

          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}>
            {statusMeta.label}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-primary/10 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Subtotal</p>
            <p className="mt-2 text-2xl font-semibold text-text">{formatCurrency(command.subtotal)}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Taxa de servico</p>
            <p className="mt-2 text-2xl font-semibold text-text">{formatCurrency(command.serviceTax)}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Total</p>
            <p className="mt-2 text-2xl font-semibold text-text">{formatCurrency(command.total)}</p>
          </div>
        </div>

        {canOperate && command.status === "open" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-md bg-secondary px-5 py-2 text-sm font-medium text-background transition hover:bg-secondary-light"
            >
              Adicionar item
            </button>
            <button
              type="button"
              onClick={() => handleCommandAction("close")}
              disabled={isFinishing}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-background transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFinishing ? "Processando..." : "Fechar comanda"}
            </button>
            <button
              type="button"
              onClick={() => handleCommandAction("cancel")}
              disabled={isFinishing}
              className="rounded-md border border-rose-500/40 px-5 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar comanda
            </button>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-primary/10 bg-background p-4 text-sm text-text-dark">
          Itens vinculados a bebidas do estoque fazem a baixa automaticamente no fechamento da comanda.
        </div>
      </div>

      <div className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-text">Itens da comanda</h2>
            <p className="text-sm text-text-dark">Atualize o status do preparo e acompanhe o que ja foi entregue.</p>
          </div>
          <span className="rounded-full border border-primary/20 px-3 py-1 text-xs text-text-dark">
            {activeItems.length} item(ns)
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {activeItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-primary/20 bg-background p-6 text-sm text-text-dark">
              Esta comanda ainda nao possui itens.
            </div>
          ) : (
            activeItems.map((item) => (
              <div
                key={item._id}
                className="grid gap-4 rounded-2xl border border-primary/10 bg-background p-4 lg:grid-cols-[1.2fr,0.8fr,0.6fr,0.9fr]"
              >
                <div>
                  <p className="text-lg font-semibold text-text">{item.nameSnapshot}</p>
                  <p className="mt-1 text-sm text-text-dark">
                    Quantidade: {item.quantity} • Unitario: {formatCurrency(item.unitPrice)}
                  </p>
                  {item.notes && <p className="mt-2 text-sm text-text-dark">Obs.: {item.notes}</p>}
                </div>

                <div className="text-sm text-text-dark">
                  <p>Tipo: {PRODUCT_TYPE_LABELS[item.productType] || "Item livre"}</p>
                  <p>Referencia: {item.productId || "Nao vinculada"}</p>
                </div>

                <div>
                  <p className="text-sm text-text-dark">Total linha</p>
                  <p className="mt-1 text-lg font-semibold text-text">{formatCurrency(item.quantity * item.unitPrice)}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor={`item-status-${item._id}`}>
                    Status
                  </label>
                  <select
                    id={`item-status-${item._id}`}
                    value={item.status}
                    disabled={!canOperate || command.status !== "open"}
                    onChange={(event) => handleItemStatusChange(item._id, event.target.value)}
                    className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ITEM_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AuditTimeline
        title="Historico da comanda"
        description="Eventos de criacao, itens e encerramento registrados pelo backend."
        events={command.auditTrail}
        emptyMessage="Ainda nao existem eventos registrados para esta comanda."
      />

      <AddCommandItemModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddItem}
      />
    </section>
  )
}

export default CommandView
