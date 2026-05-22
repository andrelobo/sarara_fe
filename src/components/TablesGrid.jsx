import { useEffect, useMemo, useState } from "react"
import { FaPlus, FaTable } from "react-icons/fa"
import TableCard from "./TableCard"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, getStoredUser, hasRole } from "../utils/auth"
import AppButton from "./ui/AppButton"
import EmptyState from "./ui/EmptyState"
import MetricTile from "./ui/MetricTile"
import SearchBar from "./ui/SearchBar"

const emptyForm = { number: "", name: "" }
const fieldClassName =
  "h-11 w-full rounded-2xl border border-white/10 bg-surface/80 px-4 text-sm text-text placeholder:text-text-dark/75 focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20"

const TablesGrid = ({ compact = false, limit = null }) => {
  const [tables, setTables] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUser = useMemo(() => getStoredUser(), [])
  const canManageCatalog = hasRole(currentUser, ["admin", "manager"])

  const fetchTables = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/tables`, {
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel carregar as mesas")
      }

      setTables(Array.isArray(data) ? data : [])
    } catch (fetchError) {
      console.error("Erro ao carregar mesas:", fetchError)
      setError(fetchError.message || "Nao foi possivel carregar as mesas.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const filteredTables = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()
    const source = limit ? tables.slice(0, limit) : tables

    if (!normalizedTerm) {
      return source
    }

    return source.filter((table) => `${table.number} ${table.name || ""} ${table.status}`.toLowerCase().includes(normalizedTerm))
  }, [limit, searchTerm, tables])

  const handleCreateTable = async (event) => {
    event.preventDefault()
    const normalizedNumber = Number(form.number)

    if (!Number.isInteger(normalizedNumber) || normalizedNumber < 1) {
      setError("Informe um numero de mesa valido.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/tables`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ number: normalizedNumber, name: form.name.trim() }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel criar a mesa")
      }

      setForm(emptyForm)
      await fetchTables()
    } catch (submitError) {
      console.error("Erro ao criar mesa:", submitError)
      setError(submitError.message || "Nao foi possivel criar a mesa.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const freeCount = tables.filter((table) => table.status === "free").length
  const occupiedCount = tables.filter((table) => table.status === "occupied").length
  const closingCount = tables.filter((table) => table.status === "closing").length

  return (
    <section className="space-y-5">
      {!compact ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile hint="Catalogo total de mesas registradas." icon={<FaTable />} label="Mesas" tone="gold" value={tables.length} />
            <MetricTile hint="Disponiveis para abertura imediata." label="Livres" tone="success" value={freeCount} />
            <MetricTile hint="Com atendimento em andamento." label="Ocupadas" tone="warning" value={occupiedCount} />
            <MetricTile hint="Fluxos em processo de fechamento." label="Fechando" tone="info" value={closingCount} />
          </section>

          <div className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-5 shadow-ambient">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Grade operacional</p>
                <h1 className="mt-2 font-heading text-3xl text-text">Mesas do salao</h1>
                <p className="mt-3 text-sm leading-6 text-text-dark">Visualize status, abra mesas e mantenha o atendimento organizado em um layout mais tatico.</p>
              </div>
              <div className="w-full lg:max-w-sm">
                <SearchBar onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por numero, nome ou status" value={searchTerm} />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {canManageCatalog && !compact ? (
        <form className="grid gap-4 rounded-[1.9rem] border border-white/10 bg-surface/70 p-5 shadow-ambient md:grid-cols-[0.7fr,1.3fr,auto]" onSubmit={handleCreateTable}>
          <div>
            <label className="mb-2 block text-sm text-text-dark" htmlFor="new-table-number">Numero da mesa</label>
            <input className={fieldClassName} id="new-table-number" min="1" onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))} required type="number" value={form.number} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-text-dark" htmlFor="new-table-name">Nome exibido</label>
            <input className={fieldClassName} id="new-table-name" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Varanda 01" type="text" value={form.name} />
          </div>
          <div className="flex items-end">
            <AppButton disabled={isSubmitting} fullWidth icon={<FaPlus />} type="submit" variant="secondary">
              {isSubmitting ? "Criando..." : "Criar mesa"}
            </AppButton>
          </div>
        </form>
      ) : null}

      {error ? <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      ) : filteredTables.length > 0 ? (
        <div className={`grid gap-4 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"}`}>
          {filteredTables.map((table) => (
            <TableCard compact={compact} currentUser={currentUser} key={table._id} onRefresh={fetchTables} table={table} />
          ))}
        </div>
      ) : (
        <EmptyState description="Crie a primeira mesa ou ajuste a busca para encontrar um registro existente." icon={<FaTable />} title="Nenhuma mesa encontrada" />
      )}
    </section>
  )
}

export default TablesGrid
