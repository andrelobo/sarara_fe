import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import AddCommandItemModal from "./AddCommandItemModal"
import AuditTimeline from "./AuditTimeline"
import StatusPill from "./ui/StatusPill"
import { useOffline } from "../context/OfflineContext"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, getStoredUser, hasRole } from "../utils/auth"
import {
  addOfflineCommandItemRecord,
  closeOfflineTableRecord,
  finalizeOfflineCommandRecord,
  getOfflineCommand,
  getOfflineTable,
  getSalonSyncStatus,
  queueSalonOperation,
  retrySalonCommandItemOperations,
  retrySalonEntityOperations,
  saveOfflineCommand,
  saveOfflineTable,
  updateOfflineCommandItemRecord,
} from "../utils/salonOffline"

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

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "debit", label: "Debito" },
  { value: "credit", label: "Credito" },
  { value: "voucher", label: "Voucher" },
]

const PAYMENT_METHOD_LABELS = PAYMENT_METHOD_OPTIONS.reduce((accumulator, option) => {
  accumulator[option.value] = option.label
  return accumulator
}, {})

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

const roundMoneyValue = (value) => Math.round(Number(value || 0) * 100) / 100

const buildDraftId = () => `payment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const createPaymentDraft = (amount = 0) => ({
  id: buildDraftId(),
  method: "cash",
  amount: Number(amount || 0) > 0 ? roundMoneyValue(amount).toFixed(2) : "",
  machineLabel: "",
  referenceCode: "",
  notes: "",
})

const buildPaymentDraftFromRecord = (payment) => ({
  id: payment?._id || buildDraftId(),
  method: payment?.method || "cash",
  amount: Number(payment?.amount || 0) > 0 ? roundMoneyValue(payment.amount).toFixed(2) : "",
  machineLabel: payment?.machineLabel || "",
  referenceCode: payment?.referenceCode || "",
  notes: payment?.notes || "",
})

const formatSyncTimestamp = (timestamp) => {
  if (!timestamp) {
    return ""
  }

  return new Date(timestamp).toLocaleString("pt-BR")
}

const CommandView = ({ commandId: commandIdProp = null, embedded = false, onCommandChange = null }) => {
  const params = useParams()
  const commandId = commandIdProp || params.id
  const currentUser = useMemo(() => getStoredUser(), [])
  const { online, syncing, syncData } = useOffline()
  const canOperate = hasRole(currentUser, ["admin", "manager", "waiter"])

  const [command, setCommand] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [isRetryingSync, setIsRetryingSync] = useState(false)
  const [retryingItemId, setRetryingItemId] = useState(null)
  const [paymentDrafts, setPaymentDrafts] = useState([])

  const statusMeta = COMMAND_STATUS_META[command?.status] || COMMAND_STATUS_META.open
  const commandSyncStatus = getSalonSyncStatus(command)

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

      await saveOfflineCommand(data)
      setCommand(data)
      onCommandChange?.(data)
    } catch (fetchError) {
      console.error("Erro ao carregar comanda:", fetchError)
      const offlineCommand = await getOfflineCommand(commandId).catch(() => null)

      if (offlineCommand) {
        setCommand(offlineCommand)
        onCommandChange?.(offlineCommand)
        setError("Usando a versao offline desta comanda.")
      } else {
        setError(fetchError.message || "Nao foi possivel carregar a comanda.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCommand()
  }, [commandId])

  useEffect(() => {
    if (!command) {
      return
    }

    if (Array.isArray(command.payments) && command.payments.length > 0) {
      setPaymentDrafts(command.payments.map(buildPaymentDraftFromRecord))
      return
    }

    if (command.status === "open" && Number(command.total || 0) > 0) {
      setPaymentDrafts([createPaymentDraft(command.total)])
      return
    }

    setPaymentDrafts([])
  }, [command?._id, command?.status, command?.total, command?.payments])

  const activeItems = command?.items || []
  const paymentTotal = roundMoneyValue(
    paymentDrafts.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
  )
  const commandTotal = roundMoneyValue(command?.total || 0)
  const paymentDifference = roundMoneyValue(paymentTotal - commandTotal)
  const validPaymentDrafts = paymentDrafts.filter((payment) => Number(payment.amount || 0) > 0)
  const hasInvalidPaymentAmount = paymentDrafts.some((payment) => Number(payment.amount || 0) <= 0)
  const isPaymentBalanced = commandTotal === 0 ? true : paymentTotal === commandTotal

  const updatePaymentDraft = (draftId, field, value) => {
    setPaymentDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === draftId
          ? {
              ...draft,
              [field]: value,
            }
          : draft,
      ),
    )
  }

  const addPaymentDraft = () => {
    setPaymentDrafts((currentDrafts) => [...currentDrafts, createPaymentDraft(0)])
  }

  const removePaymentDraft = (draftId) => {
    setPaymentDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== draftId))
  }

  const buildPaymentsPayload = () =>
    validPaymentDrafts.map((payment) => ({
      method: payment.method,
      amount: roundMoneyValue(payment.amount),
      machineLabel: payment.machineLabel.trim(),
      referenceCode: payment.referenceCode.trim(),
      notes: payment.notes.trim(),
    }))

  const handleAddItem = async (payload) => {
    setIsSubmitting(true)

    try {
      if (!navigator.onLine) {
        const updatedCommand = addOfflineCommandItemRecord(command, payload, currentUser)
        const addedItem = updatedCommand.items?.[updatedCommand.items.length - 1]
        await saveOfflineCommand(updatedCommand)
        await queueSalonOperation("command_add_item", {
          localCommandId: commandId,
          localItemId: addedItem?._id || null,
          payload,
        })
        setCommand(updatedCommand)
        onCommandChange?.(updatedCommand)
        setIsModalOpen(false)
        toast.success("Item salvo offline na comanda.")
        return
      }

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
      if (!navigator.onLine) {
        const updatedCommand = updateOfflineCommandItemRecord(command, itemId, { status: nextStatus }, currentUser)
        await saveOfflineCommand(updatedCommand)
        await queueSalonOperation("command_update_item", {
          localCommandId: commandId,
          itemId,
          updates: { status: nextStatus },
        })
        setCommand(updatedCommand)
        onCommandChange?.(updatedCommand)
        toast.success("Status do item atualizado offline.")
        return
      }

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
      const paymentsPayload = action === "close" ? buildPaymentsPayload() : []

      if (action === "close" && commandTotal > 0) {
        if (paymentsPayload.length === 0 || hasInvalidPaymentAmount || !isPaymentBalanced) {
          throw new Error("Informe pagamentos validos que fechem exatamente o total da comanda.")
        }
      }

      if (!navigator.onLine) {
        const updatedCommand = finalizeOfflineCommandRecord(command, action, currentUser, {
          payments: paymentsPayload,
        })
        const relatedTable = await getOfflineTable(command.tableId)
        const updatedTable = relatedTable ? closeOfflineTableRecord(relatedTable, { currentUser }) : null

        await saveOfflineCommand(updatedCommand)
        if (updatedTable) {
          await saveOfflineTable(updatedTable)
        }
        await queueSalonOperation(action === "close" ? "command_close" : "command_cancel", {
          localCommandId: commandId,
          tableId: command.tableId,
          payments: paymentsPayload,
        })

        setCommand(updatedCommand)
        onCommandChange?.(updatedCommand)
        toast.success(action === "close" ? "Comanda fechada offline." : "Comanda cancelada offline.")
        return
      }

      const response = await fetch(`${API_BASE_URL}/commands/${commandId}/${action}`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: action === "close" ? JSON.stringify({ payments: paymentsPayload }) : undefined,
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

  const handleRetrySync = async () => {
    if (!command || !online) {
      setError("Conecte-se novamente para reenviar as operacoes desta comanda.")
      return
    }

    setIsRetryingSync(true)
    setError("")

    try {
      const { retried } = await retrySalonEntityOperations("command", command)

      if (retried === 0) {
        toast("Nao havia falhas desta comanda para reenviar.")
        return
      }

      const result = await syncData({ silent: true })
      await fetchCommand()

      if (result?.success) {
        toast.success("Comanda reenviada para sincronizacao.")
      } else {
        toast.error(result?.message || "A fila foi reenviada, mas ainda existem falhas.")
      }
    } catch (retryError) {
      console.error("Erro ao reenviar sincronizacao da comanda:", retryError)
      setError(retryError.message || "Nao foi possivel reenviar a comanda para sincronizacao.")
    } finally {
      setIsRetryingSync(false)
    }
  }

  const handleRetryItemSync = async (item) => {
    if (!command || !item || !online) {
      setError("Conecte-se novamente para reenviar este item da comanda.")
      return
    }

    setRetryingItemId(item._id)
    setError("")

    try {
      const { retried } = await retrySalonCommandItemOperations(command, item)

      if (retried === 0) {
        toast("Nao havia falhas deste item para reenviar.")
        return
      }

      const result = await syncData({ silent: true })
      await fetchCommand()

      if (result?.success) {
        toast.success("Item reenviado para sincronizacao.")
      } else {
        toast.error(result?.message || "O item foi reenviado, mas ainda existem falhas.")
      }
    } catch (retryError) {
      console.error("Erro ao reenviar item da comanda:", retryError)
      setError(retryError.message || "Nao foi possivel reenviar o item para sincronizacao.")
    } finally {
      setRetryingItemId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (error && !command) {
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
      {error ? (
        <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
        </div>
      ) : null}

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

          <div className="flex flex-wrap justify-end gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}>
              {statusMeta.label}
            </span>
            <StatusPill label={commandSyncStatus.label} tone={commandSyncStatus.tone} />
          </div>
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

        <div className="mt-6 rounded-2xl border border-primary/10 bg-background p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Recebimento</p>
              <h3 className="mt-2 text-lg font-semibold text-text">
                {command.status === "open" ? "Fechamento da comanda" : "Pagamentos registrados"}
              </h3>
              <p className="mt-1 text-sm text-text-dark">
                {command.status === "open"
                  ? "Registre como o garçom recebeu esta comanda antes de concluir o fechamento."
                  : "Base inicial para conferencia do gerente, caixa e comissao diaria."}
              </p>
            </div>

            <div className="rounded-xl border border-primary/10 bg-background-light px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-dark">Total informado</p>
              <p className="mt-1 text-lg font-semibold text-text">{formatCurrency(paymentTotal)}</p>
              <p className={`mt-1 text-xs ${isPaymentBalanced ? "text-emerald-300" : "text-amber-300"}`}>
                {isPaymentBalanced
                  ? "Fechamento conciliado"
                  : `Diferenca: ${formatCurrency(paymentDifference)}`}
              </p>
            </div>
          </div>

          {command.status === "open" ? (
            <>
              <div className="mt-5 space-y-3">
                {paymentDrafts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-primary/20 bg-background-light px-4 py-5 text-sm text-text-dark">
                    Esta comanda ainda nao tem pagamentos informados.
                  </div>
                ) : (
                  paymentDrafts.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="grid gap-3 rounded-2xl border border-primary/10 bg-background-light p-4 lg:grid-cols-[0.9fr,0.8fr,0.9fr,0.9fr,1.2fr,auto]"
                    >
                      <label className="space-y-2 text-sm text-text-dark">
                        <span className="block text-xs uppercase tracking-[0.16em]">Metodo</span>
                        <select
                          value={payment.method}
                          onChange={(event) => updatePaymentDraft(payment.id, "method", event.target.value)}
                          className="w-full rounded-md border border-primary/15 bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                        >
                          {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-2 text-sm text-text-dark">
                        <span className="block text-xs uppercase tracking-[0.16em]">Valor</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payment.amount}
                          onChange={(event) => updatePaymentDraft(payment.id, "amount", event.target.value)}
                          className="w-full rounded-md border border-primary/15 bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                          placeholder="0,00"
                        />
                      </label>

                      <label className="space-y-2 text-sm text-text-dark">
                        <span className="block text-xs uppercase tracking-[0.16em]">Maquina</span>
                        <input
                          type="text"
                          value={payment.machineLabel}
                          onChange={(event) => updatePaymentDraft(payment.id, "machineLabel", event.target.value)}
                          className="w-full rounded-md border border-primary/15 bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                          placeholder="Stone 1"
                        />
                      </label>

                      <label className="space-y-2 text-sm text-text-dark">
                        <span className="block text-xs uppercase tracking-[0.16em]">Referencia</span>
                        <input
                          type="text"
                          value={payment.referenceCode}
                          onChange={(event) => updatePaymentDraft(payment.id, "referenceCode", event.target.value)}
                          className="w-full rounded-md border border-primary/15 bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                          placeholder="NSU / TXID"
                        />
                      </label>

                      <label className="space-y-2 text-sm text-text-dark">
                        <span className="block text-xs uppercase tracking-[0.16em]">Observacao</span>
                        <input
                          type="text"
                          value={payment.notes}
                          onChange={(event) => updatePaymentDraft(payment.id, "notes", event.target.value)}
                          className="w-full rounded-md border border-primary/15 bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                          placeholder="Detalhe opcional"
                        />
                      </label>

                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => removePaymentDraft(payment.id)}
                          disabled={paymentDrafts.length === 1 && index === 0}
                          className="rounded-md border border-primary/15 px-3 py-2 text-sm font-medium text-text-dark transition hover:border-primary/30 hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={addPaymentDraft}
                  className="rounded-md border border-primary/20 px-4 py-2 text-sm font-medium text-text transition hover:border-primary/40 hover:bg-background-light"
                >
                  Adicionar pagamento
                </button>
                <p className={`text-sm ${isPaymentBalanced ? "text-emerald-300" : "text-amber-300"}`}>
                  {commandTotal === 0
                    ? "Comanda sem valor para receber."
                    : isPaymentBalanced
                      ? "Os pagamentos fecham o total da comanda."
                      : "Os pagamentos precisam fechar exatamente o total da comanda."}
                </p>
              </div>
            </>
          ) : (
            <div className="mt-5 space-y-3">
              {Array.isArray(command.payments) && command.payments.length > 0 ? (
                command.payments.map((payment) => (
                  <div
                    key={payment._id || `${payment.method}-${payment.paidAt}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/10 bg-background-light px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-text">
                        {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                      </p>
                      <p className="mt-1 text-xs text-text-dark">
                        {payment.referenceCode ? `Ref. ${payment.referenceCode}` : "Sem referencia"}
                        {payment.machineLabel ? ` • ${payment.machineLabel}` : ""}
                      </p>
                      {payment.notes ? <p className="mt-1 text-xs text-text-dark">{payment.notes}</p> : null}
                    </div>
                    <p className="text-lg font-semibold text-text">{formatCurrency(payment.amount)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-primary/20 bg-background-light px-4 py-5 text-sm text-text-dark">
                  Nenhum pagamento foi registrado nesta comanda.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-primary/10 bg-background p-4 text-sm text-text-dark">
          <p className="font-medium text-text">{commandSyncStatus.description}</p>
          {commandSyncStatus.timestamp ? (
            <p className="mt-1 text-xs text-text-dark/80">{formatSyncTimestamp(commandSyncStatus.timestamp)}</p>
          ) : null}
        </div>

        {commandSyncStatus.key === "failed" ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/8 p-4">
            <div>
              <p className="text-sm font-medium text-red-100">Esta comanda ficou com falha de sincronizacao.</p>
              <p className="mt-1 text-sm text-red-100/80">
                Reenvie apenas as operacoes desta comanda quando a conexao estiver disponivel.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetrySync}
              disabled={!online || syncing || isRetryingSync}
              className="rounded-md border border-red-400/40 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRetryingSync ? "Reenviando..." : "Tentar sincronizar comanda"}
            </button>
          </div>
        ) : null}

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
              disabled={isFinishing || (commandTotal > 0 && (validPaymentDrafts.length === 0 || hasInvalidPaymentAmount || !isPaymentBalanced))}
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
            activeItems.map((item) => {
              const itemSyncStatus = getSalonSyncStatus(item)

              return (
                <div
                  key={item._id}
                  className="grid gap-4 rounded-2xl border border-primary/10 bg-background p-4 lg:grid-cols-[1.2fr,0.8fr,0.6fr,0.9fr]"
                >
                  <div>
                    <p className="text-lg font-semibold text-text">{item.nameSnapshot}</p>
                    <p className="mt-1 text-sm text-text-dark">
                      Quantidade: {item.quantity} • Unitario: {formatCurrency(item.unitPrice)}
                    </p>
                    {itemSyncStatus.key !== "live" ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusPill
                          label={itemSyncStatus.label}
                          tone={itemSyncStatus.tone}
                          className="tracking-[0.18em]"
                        />
                        {itemSyncStatus.key === "failed" ? (
                          <button
                            type="button"
                            onClick={() => handleRetryItemSync(item)}
                            disabled={!online || syncing || retryingItemId === item._id}
                            className="rounded-full border border-red-400/30 px-3 py-1 text-[11px] font-ui font-semibold uppercase tracking-[0.18em] text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {retryingItemId === item._id ? "Reenviando" : "Retry item"}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
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
              )
            })
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
