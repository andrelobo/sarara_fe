import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import CommandView from "./CommandView"
import AuditTimeline from "./AuditTimeline"
import StatusPill from "./ui/StatusPill"
import { useOffline } from "../context/OfflineContext"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, getStoredUser, hasRole } from "../utils/auth"
import { getReferenceId, getReferenceLabel, requiresAssignedWaiter } from "../utils/salonAssignment"
import {
  attachCommandToOfflineTable,
  closeOfflineTableRecord,
  createOfflineCommandRecord,
  getOfflineTable,
  getSalonSyncStatus,
  openOfflineTableRecord,
  queueSalonOperation,
  retrySalonEntityOperations,
  saveOfflineCommand,
  saveOfflineTable,
} from "../utils/salonOffline"

const TABLE_STATUS_OPTIONS = [
  { value: "free", label: "Livre" },
  { value: "occupied", label: "Ocupada" },
  { value: "closing", label: "Fechando" },
  { value: "reserved", label: "Reservada" },
]

const TABLE_STATUS_META = {
  free: { label: "Livre", tone: "success" },
  occupied: { label: "Ocupada", tone: "warning" },
  closing: { label: "Fechando", tone: "info" },
  reserved: { label: "Reservada", tone: "offline" },
}

const formatSyncTimestamp = (timestamp) => {
  if (!timestamp) {
    return ""
  }

  return new Date(timestamp).toLocaleString("pt-BR")
}

const emptyCommandForm = {
  serviceTax: "",
}

const TableDetail = () => {
  const { id } = useParams()
  const currentUser = useMemo(() => getStoredUser(), [])
  const { online, syncing, syncData } = useOffline()
  const canManageCatalog = hasRole(currentUser, ["admin", "manager"])
  const canOperate = hasRole(currentUser, ["admin", "manager", "waiter"])
  const canAssignWaiter = currentUser?.role === "admin"

  const [table, setTable] = useState(null)
  const [form, setForm] = useState({
    number: "",
    name: "",
    status: "free",
  })
  const [commandForm, setCommandForm] = useState(emptyCommandForm)
  const [waiters, setWaiters] = useState([])
  const [assignedWaiterId, setAssignedWaiterId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOperating, setIsOperating] = useState(false)
  const [isCreatingCommand, setIsCreatingCommand] = useState(false)
  const [isRetryingSync, setIsRetryingSync] = useState(false)
  const [error, setError] = useState("")
  const tableStatusMeta = TABLE_STATUS_META[table?.status] || TABLE_STATUS_META.free
  const tableSyncStatus = getSalonSyncStatus(table)

  const fetchTable = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel carregar a mesa")
      }

      await saveOfflineTable(data)
      setTable(data)
      setForm({
        number: data.number,
        name: data.name || "",
        status: data.status || "free",
      })
      setAssignedWaiterId(getReferenceId(data.waiterId))
    } catch (fetchError) {
      console.error("Erro ao carregar mesa:", fetchError)
      const offlineTable = await getOfflineTable(id).catch(() => null)

      if (offlineTable) {
        setTable(offlineTable)
        setForm({
          number: offlineTable.number,
          name: offlineTable.name || "",
          status: offlineTable.status || "free",
        })
        setAssignedWaiterId(getReferenceId(offlineTable.waiterId))
        setError("Usando a versao offline desta mesa.")
      } else {
        setError(fetchError.message || "Nao foi possivel carregar a mesa.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTable()
  }, [id])

  useEffect(() => {
    if (!canAssignWaiter) {
      setWaiters([])
      return
    }

    let isCancelled = false

    const fetchWaiters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || data.message || "Nao foi possivel carregar os garcons")
        }

        if (isCancelled) {
          return
        }

        const activeWaiters = (Array.isArray(data.users) ? data.users : []).filter(
          (user) => user.role === "waiter" && user.status === "active",
        )

        setWaiters(activeWaiters)
      } catch (fetchError) {
        console.error("Erro ao carregar garcons:", fetchError)

        if (!isCancelled) {
          setWaiters([])
        }
      }
    }

    fetchWaiters()

    return () => {
      isCancelled = true
    }
  }, [canAssignWaiter])

  const handleSaveTable = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          number: Number(form.number),
          name: form.name,
          status: form.status,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel atualizar a mesa")
      }

      setTable(data)
    } catch (saveError) {
      console.error("Erro ao salvar mesa:", saveError)
      setError(saveError.message || "Nao foi possivel atualizar a mesa.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTableAction = async (action) => {
    if (
      action === "open" &&
      requiresAssignedWaiter({
        canAssignWaiter,
        waiterCount: waiters.length,
        assignedWaiterId,
      })
    ) {
      setError("Selecione o garcom responsavel antes de abrir a mesa.")
      return
    }

    setIsOperating(true)
    setError("")

    try {
      if (!navigator.onLine) {
        const updatedTable =
          action === "open"
            ? openOfflineTableRecord(table, {
                currentUser,
                assignedWaiterId,
              })
            : closeOfflineTableRecord(table, { currentUser })

        await saveOfflineTable(updatedTable)
        await queueSalonOperation(action === "open" ? "table_open" : "table_close", {
          localTableId: table._id,
          status: updatedTable.status,
          waiterId: updatedTable.waiterId || null,
        })

        setTable(updatedTable)
        setForm({
          number: updatedTable.number,
          name: updatedTable.name || "",
          status: updatedTable.status || "free",
        })
        toast.success(action === "open" ? "Mesa aberta offline." : "Mesa fechada offline.")
        return
      }

      const response = await fetch(`${API_BASE_URL}/tables/${id}/${action}`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body:
          action === "open"
            ? JSON.stringify({
                waiterId: assignedWaiterId || undefined,
              })
            : undefined,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel atualizar a mesa")
      }

      setTable(data)
      setForm({
        number: data.number,
        name: data.name || "",
        status: data.status || "free",
      })
    } catch (actionError) {
      console.error(`Erro ao executar ${action} na mesa:`, actionError)
      setError(actionError.message || "Nao foi possivel atualizar a mesa.")
    } finally {
      setIsOperating(false)
    }
  }

  const handleCreateCommand = async (event) => {
    event.preventDefault()

    if (
      requiresAssignedWaiter({
        canAssignWaiter,
        waiterCount: waiters.length,
        assignedWaiterId,
      })
    ) {
      setError("Selecione o garcom responsavel antes de criar a comanda.")
      return
    }

    setIsCreatingCommand(true)
    setError("")

    try {
      const serviceTax = commandForm.serviceTax === "" ? 0 : Number(commandForm.serviceTax)

      if (!navigator.onLine) {
        const offlineCommand = createOfflineCommandRecord({
          tableId: id,
          serviceTax,
          currentUser,
          assignedWaiterId,
        })
        const updatedTable = attachCommandToOfflineTable(table, offlineCommand)

        await saveOfflineCommand(offlineCommand)
        await saveOfflineTable(updatedTable)
        await queueSalonOperation("command_create", {
          localCommandId: offlineCommand._id,
          tableId: id,
          waiterId: offlineCommand.waiterId,
          serviceTax,
        })

        setCommandForm(emptyCommandForm)
        setTable(updatedTable)
        toast.success("Comanda criada offline e adicionada na fila operacional.")
        return
      }

      const response = await fetch(`${API_BASE_URL}/commands`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          tableId: id,
          waiterId: assignedWaiterId || undefined,
          serviceTax,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel criar a comanda")
      }

      setCommandForm(emptyCommandForm)
      await fetchTable()
      setTable((current) => (current ? { ...current, currentCommandId: data._id } : current))
    } catch (createError) {
      console.error("Erro ao criar comanda:", createError)
      setError(createError.message || "Nao foi possivel criar a comanda.")
    } finally {
      setIsCreatingCommand(false)
    }
  }

  const handleDeleteTable = async () => {
    const confirmed = window.confirm("Tem certeza que deseja remover esta mesa?")
    if (!confirmed) {
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel remover a mesa")
      }

      window.location.assign("/salon/tables")
    } catch (deleteError) {
      console.error("Erro ao remover mesa:", deleteError)
      setError(deleteError.message || "Nao foi possivel remover a mesa.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetrySync = async () => {
    if (!table || !online) {
      setError("Conecte-se novamente para reenviar as operacoes desta mesa.")
      return
    }

    setIsRetryingSync(true)
    setError("")

    try {
      const { retried } = await retrySalonEntityOperations("table", table)

      if (retried === 0) {
        toast("Nao havia falhas desta mesa para reenviar.")
        return
      }

      const result = await syncData({ silent: true })
      await fetchTable()

      if (result?.success) {
        toast.success("Mesa reenviada para sincronizacao.")
      } else {
        toast.error(result?.message || "A fila foi reenviada, mas ainda existem falhas.")
      }
    } catch (retryError) {
      console.error("Erro ao reenviar sincronizacao da mesa:", retryError)
      setError(retryError.message || "Nao foi possivel reenviar a mesa para sincronizacao.")
    } finally {
      setIsRetryingSync(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (error && !table) {
    return <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
  }

  if (!table) {
    return (
      <div className="rounded-2xl border border-primary/15 bg-background-light p-6 text-text-dark">
        Mesa nao encontrada.
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Salon / Mesa</p>
          <h1 className="text-3xl font-semibold text-secondary">{table.name || `Mesa ${table.number}`}</h1>
          <p className="mt-2 text-sm text-text-dark">
            Mesa #{table.number} • Status atual: {table.status}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill label={tableStatusMeta.label} tone={tableStatusMeta.tone} />
            <StatusPill label={tableSyncStatus.label} tone={tableSyncStatus.tone} />
          </div>
        </div>
        <Link
          to="/salon/tables"
          className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-text transition hover:bg-primary hover:text-background"
        >
          Voltar para mesas
        </Link>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Operacao</p>
              <h2 className="mt-2 text-2xl font-semibold text-text">Atendimento da mesa</h2>
            </div>

            {table.currentCommandId ? (
              <Link
                to={`/salon/commands/${table.currentCommandId}`}
                className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-text transition hover:bg-primary hover:text-background"
              >
                Abrir comanda
              </Link>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-primary/10 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Status</p>
              <p className="mt-2 text-lg font-semibold text-text">{table.status}</p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Garcom</p>
              <p className="mt-2 text-lg font-semibold text-text">{getReferenceLabel(table.waiterId)}</p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Comanda ativa</p>
              <p className="mt-2 text-lg font-semibold text-text">{getReferenceLabel(table.currentCommandId)}</p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Sync operacional</p>
              <p className="mt-2 text-lg font-semibold text-text">{tableSyncStatus.label}</p>
              <p className="mt-2 text-sm text-text-dark">{tableSyncStatus.description}</p>
              {tableSyncStatus.timestamp ? (
                <p className="mt-2 text-xs text-text-dark/80">{formatSyncTimestamp(tableSyncStatus.timestamp)}</p>
              ) : null}
            </div>
          </div>

          {tableSyncStatus.key === "failed" ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/8 p-4">
              <div>
                <p className="text-sm font-medium text-red-100">Esta mesa ficou com falha de sincronizacao.</p>
                <p className="mt-1 text-sm text-red-100/80">
                  Reenvie apenas as operacoes desta mesa quando a conexao estiver disponivel.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetrySync}
                disabled={!online || syncing || isRetryingSync}
                className="rounded-md border border-red-400/40 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRetryingSync ? "Reenviando..." : "Tentar sincronizar mesa"}
              </button>
            </div>
          ) : null}

          {canAssignWaiter ? (
            <div className="mt-6 rounded-2xl border border-primary/10 bg-background p-5">
              <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="table-waiter">
                Garcom responsavel
              </label>
              <select
                id="table-waiter"
                value={assignedWaiterId}
                onChange={(event) => setAssignedWaiterId(event.target.value)}
                className="w-full rounded-md border border-primary bg-background-light px-3 py-2 text-text focus:border-secondary focus:outline-none"
              >
                <option value="">Selecione um garcom ativo</option>
                {waiters.map((waiter) => (
                  <option key={waiter._id} value={waiter._id}>
                    {waiter.username} • {waiter.email}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-text-dark">
                A mesa aberta e a comanda criada por admin agora podem ser associadas explicitamente ao garcom certo.
              </p>
            </div>
          ) : null}

          {canOperate && (
            <div className="mt-6 flex flex-wrap gap-3">
              {table.status === "free" || table.status === "reserved" ? (
                <button
                  type="button"
                  onClick={() => handleTableAction("open")}
                  disabled={isOperating}
                  className="rounded-md bg-secondary px-5 py-2 text-sm font-medium text-background transition hover:bg-secondary-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isOperating ? "Processando..." : "Abrir mesa"}
                </button>
              ) : null}

              {table.status !== "free" && !table.currentCommandId ? (
                <button
                  type="button"
                  onClick={() => handleTableAction("close")}
                  disabled={isOperating}
                  className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-background transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isOperating ? "Processando..." : "Fechar mesa"}
                </button>
              ) : null}
            </div>
          )}

          {!table.currentCommandId && canOperate && table.status !== "closing" && (
            <form onSubmit={handleCreateCommand} className="mt-8 rounded-2xl border border-primary/10 bg-background p-5">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="command-service-tax">
                    Taxa de servico
                  </label>
                  <input
                    id="command-service-tax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={commandForm.serviceTax}
                    onChange={(event) => setCommandForm({ serviceTax: event.target.value })}
                    className="w-full rounded-md border border-primary bg-background-light px-3 py-2 text-text focus:border-secondary focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingCommand}
                  className="rounded-md bg-secondary px-5 py-2 text-sm font-medium text-background transition hover:bg-secondary-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingCommand ? "Criando..." : "Criar comanda"}
                </button>
              </div>
            </form>
          )}
        </div>

        {canManageCatalog && (
          <form onSubmit={handleSaveTable} className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Catalogo</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Editar mesa</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="table-number">
                  Numero
                </label>
                <input
                  id="table-number"
                  type="number"
                  min="1"
                  value={form.number}
                  onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))}
                  className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="table-name">
                  Nome
                </label>
                <input
                  id="table-name"
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                  placeholder="Ex.: Sacada 04"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="table-status">
                  Status
                </label>
                <select
                  id="table-status"
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                >
                  {TABLE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-secondary px-5 py-2 text-sm font-medium text-background transition hover:bg-secondary-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Salvando..." : "Salvar mesa"}
              </button>

              <button
                type="button"
                onClick={handleDeleteTable}
                disabled={isSaving || table.status !== "free"}
                className="rounded-md border border-rose-500/40 px-5 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remover mesa
              </button>
            </div>
          </form>
        )}
      </div>

      {table.currentCommandId ? (
        <CommandView
          embedded
          commandId={table.currentCommandId}
          onCommandChange={() => {
            fetchTable()
          }}
        />
      ) : null}

      <AuditTimeline
        title="Historico da mesa"
        description="Rastro de operacao salvo pelo backend para esta mesa."
        events={table.auditTrail}
        emptyMessage="Ainda nao existem eventos registrados para esta mesa."
      />
    </section>
  )
}

export default TableDetail
