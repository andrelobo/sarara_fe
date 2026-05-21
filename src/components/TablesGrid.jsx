import { useEffect, useMemo, useState } from "react"
import TableCard from "./TableCard"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, getStoredUser, hasRole } from "../utils/auth"

const emptyForm = {
  number: "",
  name: "",
}

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
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
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

    return source.filter((table) => {
      const text = `${table.number} ${table.name || ""} ${table.status}`.toLowerCase()
      return text.includes(normalizedTerm)
    })
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
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          number: normalizedNumber,
          name: form.name.trim(),
        }),
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

  return (
    <section className="space-y-6">
      {!compact && (
        <div className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Salon</p>
              <h1 className="text-3xl font-semibold text-secondary">Mesas do salão</h1>
              <p className="mt-2 text-text-dark">
                Visualize o status de cada mesa e mantenha a operação do atendimento organizada.
              </p>
            </div>

            <div className="w-full lg:max-w-sm">
              <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="table-search">
                Buscar mesa
              </label>
              <input
                id="table-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                placeholder="Numero, nome ou status"
              />
            </div>
          </div>
        </div>
      )}

      {canManageCatalog && !compact && (
        <form
          onSubmit={handleCreateTable}
          className="grid gap-4 rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm md:grid-cols-[0.7fr,1.3fr,auto]"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="new-table-number">
              Numero da mesa
            </label>
            <input
              id="new-table-number"
              type="number"
              min="1"
              value={form.number}
              onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="new-table-name">
              Nome exibido
            </label>
            <input
              id="new-table-name"
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              placeholder="Ex.: Varanda 01"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-secondary px-5 py-2 font-medium text-background transition hover:bg-secondary-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Criando..." : "Criar mesa"}
          </button>
        </form>
      )}

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}>
          {filteredTables.map((table) => (
            <TableCard key={table._id} table={table} currentUser={currentUser} onRefresh={fetchTables} compact={compact} />
          ))}
        </div>
      )}
    </section>
  )
}

export default TablesGrid
