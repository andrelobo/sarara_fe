import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import {
  FaCashRegister,
  FaClock,
  FaMoneyBillWave,
  FaRedoAlt,
  FaReceipt,
  FaSignal,
  FaUserTie,
} from "react-icons/fa"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, getStoredUser, hasRole } from "../utils/auth"
import AppButton from "./ui/AppButton"
import EmptyState from "./ui/EmptyState"
import MetricTile from "./ui/MetricTile"
import OperationalList from "./ui/OperationalList"
import OperationalRow from "./ui/OperationalRow"
import StatusPill from "./ui/StatusPill"

const SHIFT_STATUS_META = {
  open: { label: "Aberto", tone: "success" },
  closed: { label: "Fechado", tone: "neutral" },
  cancelled: { label: "Cancelado", tone: "danger" },
}

const fieldClassName =
  "h-11 w-full rounded-2xl border border-white/10 bg-surface/80 px-4 text-sm text-text placeholder:text-text-dark/75 focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20"

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

const formatDateTime = (value) => {
  if (!value) {
    return "Agora"
  }

  return new Date(value).toLocaleString("pt-BR")
}

const buildWaiterMap = (waiters = [], currentUser = null) => {
  const map = new Map()

  waiters.forEach((waiter) => {
    map.set(String(waiter._id), waiter.username)
  })

  if (currentUser?._id && currentUser?.username) {
    map.set(String(currentUser._id), currentUser.username)
  }

  return map
}

const sumDigitalPayments = (payments = {}) =>
  Number(payments.pix || 0) +
  Number(payments.debit || 0) +
  Number(payments.credit || 0) +
  Number(payments.voucher || 0)

const ShiftPanel = () => {
  const currentUser = useMemo(() => getStoredUser(), [])
  const canManageTeamShifts = hasRole(currentUser, ["admin", "manager"])

  const [shifts, setShifts] = useState([])
  const [waiters, setWaiters] = useState([])
  const [selectedWaiterId, setSelectedWaiterId] = useState("")
  const [selectedShiftId, setSelectedShiftId] = useState("")
  const [selectedShift, setSelectedShift] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const waiterMap = useMemo(() => buildWaiterMap(waiters, currentUser), [waiters, currentUser])

  const getWaiterName = (waiterId) => {
    if (!waiterId) {
      return "Garcom nao identificado"
    }

    return waiterMap.get(String(waiterId)) || `Garcom ${String(waiterId).slice(-4)}`
  }

  const targetWaiterId = canManageTeamShifts ? selectedWaiterId : currentUser?._id || ""

  const filteredShifts = useMemo(() => {
    if (!canManageTeamShifts || !targetWaiterId) {
      return shifts
    }

    return shifts.filter((shift) => String(shift.waiterId) === String(targetWaiterId))
  }, [canManageTeamShifts, shifts, targetWaiterId])

  const activeShift = useMemo(
    () => filteredShifts.find((shift) => shift.status === "open") || null,
    [filteredShifts],
  )

  const recentShifts = useMemo(() => filteredShifts.slice(0, 5), [filteredShifts])

  const fetchWaiters = async () => {
    if (!canManageTeamShifts) {
      return
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || data.message || "Nao foi possivel carregar os garcons")
    }

    const nextWaiters = (Array.isArray(data.users) ? data.users : []).filter(
      (user) => user.role === "waiter" && user.status === "active",
    )
    setWaiters(nextWaiters)
    setSelectedWaiterId((currentValue) => currentValue || nextWaiters[0]?._id || "")
  }

  const fetchShifts = async () => {
    const response = await fetch(`${API_BASE_URL}/shifts`, {
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || data.message || "Nao foi possivel carregar os turnos")
    }

    const nextShifts = Array.isArray(data) ? data : []
    setShifts(nextShifts)

    setSelectedShiftId((currentValue) => {
      if (currentValue && nextShifts.some((shift) => shift._id === currentValue)) {
        return currentValue
      }

      const scopedShifts = canManageTeamShifts && targetWaiterId
        ? nextShifts.filter((shift) => String(shift.waiterId) === String(targetWaiterId))
        : nextShifts

      return scopedShifts[0]?._id || ""
    })
  }

  const fetchShiftDetail = async (shiftId) => {
    if (!shiftId) {
      setSelectedShift(null)
      return
    }

    setIsLoadingDetail(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}`, {
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel carregar o detalhe do turno")
      }

      setSelectedShift(data)
    } catch (detailError) {
      console.error("Erro ao carregar detalhe do turno:", detailError)
      setError(detailError.message || "Nao foi possivel carregar o detalhe do turno.")
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (canManageTeamShifts) {
        await fetchWaiters()
      }

      await fetchShifts()
    } catch (loadError) {
      console.error("Erro ao carregar painel de turnos:", loadError)
      setError(loadError.message || "Nao foi possivel carregar o painel de turnos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  useEffect(() => {
    if (!selectedShiftId) {
      setSelectedShift(null)
      return
    }

    fetchShiftDetail(selectedShiftId)
  }, [selectedShiftId])

  useEffect(() => {
    if (!canManageTeamShifts || !targetWaiterId) {
      return
    }

    const scopedOpenShift = shifts.find(
      (shift) => String(shift.waiterId) === String(targetWaiterId) && shift.status === "open",
    )
    const scopedLatestShift = shifts.find((shift) => String(shift.waiterId) === String(targetWaiterId))
    const nextSelectedShiftId = scopedOpenShift?._id || scopedLatestShift?._id || ""

    if (nextSelectedShiftId && nextSelectedShiftId !== selectedShiftId) {
      setSelectedShiftId(nextSelectedShiftId)
    }

    if (!nextSelectedShiftId) {
      setSelectedShift(null)
    }
  }, [canManageTeamShifts, targetWaiterId, shifts, selectedShiftId])

  const handleOpenShift = async () => {
    if (canManageTeamShifts && !selectedWaiterId) {
      setError("Selecione um garcom antes de abrir o turno.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const payload = canManageTeamShifts ? { waiterId: selectedWaiterId } : {}
      const response = await fetch(`${API_BASE_URL}/shifts`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel abrir o turno")
      }

      toast.success("Turno aberto com sucesso.")
      await fetchShifts()
      setSelectedShiftId(data._id)
    } catch (submitError) {
      console.error("Erro ao abrir turno:", submitError)
      setError(submitError.message || "Nao foi possivel abrir o turno.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseShift = async () => {
    if (!activeShift?._id) {
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/shifts/${activeShift._id}/close`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({}),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel fechar o turno")
      }

      toast.success("Turno fechado com snapshot salvo.")
      await fetchShifts()
      setSelectedShiftId(data._id)
      setSelectedShift(data)
    } catch (submitError) {
      console.error("Erro ao fechar turno:", submitError)
      setError(submitError.message || "Nao foi possivel fechar o turno.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusMeta = SHIFT_STATUS_META[selectedShift?.status] || SHIFT_STATUS_META.closed
  const shiftTotals = selectedShift?.computedTotals || selectedShift?.totalsSnapshot || null

  return (
    <div className="space-y-6">
      <section className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-6 shadow-ambient">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Shift Control</p>
            <h2 className="mt-2 font-heading text-3xl text-text">Turno operacional do garcom</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-dark">
              Abra o turno, acompanhe vendas por metodo e feche o snapshot que depois vai alimentar a conferencia com o gerente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={activeShift ? "Turno aberto" : "Sem turno aberto"} tone={activeShift ? "success" : "warning"} />
            <AppButton icon={<FaRedoAlt />} onClick={refreshData} size="sm" variant="ghost">
              Atualizar
            </AppButton>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[1.7rem] border border-white/10 bg-background/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Abertura</p>
                <h3 className="mt-2 text-xl font-semibold text-text">
                  {canManageTeamShifts ? "Abrir turno por garcom" : "Meu turno"}
                </h3>
              </div>
              {activeShift ? (
                <StatusPill label={`Ativo: ${getWaiterName(activeShift.waiterId)}`} tone="success" />
              ) : null}
            </div>

            {canManageTeamShifts ? (
              <label className="mt-5 block">
                <span className="mb-2 block text-sm text-text-dark">Garcom alvo</span>
                <select
                  value={selectedWaiterId}
                  onChange={(event) => setSelectedWaiterId(event.target.value)}
                  className={fieldClassName}
                >
                  {waiters.length === 0 ? <option value="">Nenhum garcom ativo</option> : null}
                  {waiters.map((waiter) => (
                    <option key={waiter._id} value={waiter._id}>
                      {waiter.username}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-sm text-text-dark">Garcom responsavel</p>
                <p className="mt-1 text-lg font-semibold text-text">{currentUser?.username || "Usuario atual"}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <AppButton
                icon={<FaClock />}
                onClick={handleOpenShift}
                disabled={isSubmitting || Boolean(activeShift) || (canManageTeamShifts && !selectedWaiterId)}
                variant="secondary"
              >
                {isSubmitting ? "Processando..." : "Abrir turno"}
              </AppButton>
              <AppButton
                icon={<FaCashRegister />}
                onClick={handleCloseShift}
                disabled={isSubmitting || !activeShift}
                variant="primary"
              >
                {isSubmitting ? "Processando..." : "Fechar turno"}
              </AppButton>
            </div>

            <p className="mt-4 text-sm leading-6 text-text-dark">
              Regra atual: um turno aberto por garcom. O fechamento salva um snapshot dos pagamentos das comandas fechadas nesse intervalo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricTile
              hint="Comandas fechadas dentro da janela do turno selecionado."
              icon={<FaReceipt />}
              label="Comandas"
              tone="gold"
              value={shiftTotals ? shiftTotals.commandsCount : "--"}
            />
            <MetricTile
              hint="Valor total vendido pelas comandas conciliadas nesse turno."
              icon={<FaSignal />}
              label="Faturamento"
              tone="info"
              value={shiftTotals ? formatCurrency(shiftTotals.salesTotal) : "--"}
            />
            <MetricTile
              hint="Total esperado em dinheiro para bater com o gerente/caixa."
              icon={<FaMoneyBillWave />}
              label="Dinheiro"
              tone="success"
              value={shiftTotals ? formatCurrency(shiftTotals.payments.cash) : "--"}
            />
            <MetricTile
              hint="Pix + debito + credito + voucher do turno selecionado."
              icon={<FaUserTie />}
              label="Digital"
              value={shiftTotals ? formatCurrency(sumDigitalPayments(shiftTotals.payments)) : "--"}
            />
          </div>
        </div>
      </section>

      <OperationalList
        title="Turnos recentes"
        description="Leitura rapida do turno atual e do historico mais proximo da operacao."
      >
        {isLoading ? (
          <div className="px-5 py-8 text-sm text-text-dark">Carregando turnos...</div>
        ) : recentShifts.length === 0 ? (
          <div className="p-5">
            <EmptyState
              compact
              icon={<FaClock />}
              title="Nenhum turno encontrado"
              description="Abra o primeiro turno para comecar a acumular totais por garcom."
            />
          </div>
        ) : (
          recentShifts.map((shift) => {
            const shiftMeta = SHIFT_STATUS_META[shift.status] || SHIFT_STATUS_META.closed
            const isSelected = selectedShiftId === shift._id

            return (
              <OperationalRow
                key={shift._id}
                leading={
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-primary">
                    <FaClock />
                  </div>
                }
                eyebrow={shift.status === "open" ? "Turno em andamento" : "Snapshot salvo"}
                title={getWaiterName(shift.waiterId)}
                subtitle={`Aberto em ${formatDateTime(shift.openedAt)}${shift.closedAt ? ` • fechado em ${formatDateTime(shift.closedAt)}` : ""}`}
                meta={[
                  shift.notes ? `Obs.: ${shift.notes}` : "Sem observacao",
                  shift.totalsSnapshot ? `Vendas ${formatCurrency(shift.totalsSnapshot.salesTotal)}` : "Totais ao vivo",
                ]}
                status={shiftMeta.label}
                statusTone={shiftMeta.tone}
                actions={
                  <AppButton
                    onClick={() => setSelectedShiftId(shift._id)}
                    size="sm"
                    variant={isSelected ? "secondary" : "ghost"}
                  >
                    {isSelected ? "Selecionado" : "Ver totais"}
                  </AppButton>
                }
              />
            )
          })
        )}
      </OperationalList>

      <section className="rounded-[1.8rem] border border-white/10 bg-surface/70 p-6 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Detalhe do turno</p>
            <h3 className="mt-2 text-2xl font-semibold text-text">
              {selectedShift ? getWaiterName(selectedShift.waiterId) : "Selecione um turno"}
            </h3>
          </div>
          {selectedShift ? <StatusPill label={statusMeta.label} tone={statusMeta.tone} /> : null}
        </div>

        {!selectedShift ? (
          <div className="mt-6">
            <EmptyState
              compact
              icon={<FaClock />}
              title="Sem turno selecionado"
              description="Escolha um turno recente para ver totais e preparar a futura conferencia com o gerente."
            />
          </div>
        ) : isLoadingDetail ? (
          <div className="mt-6 text-sm text-text-dark">Carregando detalhe do turno...</div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-background/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Janela operacional</p>
              <div className="mt-4 space-y-2 text-sm text-text-dark">
                <p><span className="text-text">Aberto:</span> {formatDateTime(selectedShift.openedAt)}</p>
                <p><span className="text-text">Fechado:</span> {selectedShift.closedAt ? formatDateTime(selectedShift.closedAt) : "Ainda em aberto"}</p>
                <p><span className="text-text">Aberto por:</span> {selectedShift.openedBy || "Nao informado"}</p>
                <p><span className="text-text">Fechado por:</span> {selectedShift.closedBy || "Ainda nao fechado"}</p>
                <p><span className="text-text">Observacao:</span> {selectedShift.notes || "Sem observacao"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-background/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Pagamentos por metodo</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Dinheiro", shiftTotals?.payments?.cash],
                  ["Pix", shiftTotals?.payments?.pix],
                  ["Debito", shiftTotals?.payments?.debit],
                  ["Credito", shiftTotals?.payments?.credit],
                  ["Voucher", shiftTotals?.payments?.voucher],
                  ["Total", shiftTotals?.payments?.total],
                ].map(([label, amount]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-text-dark">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-text">{formatCurrency(amount || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default ShiftPanel
