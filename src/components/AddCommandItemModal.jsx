import { useEffect, useMemo, useState } from "react"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders } from "../utils/auth"

const INITIAL_FORM = {
  productType: "manual",
  productId: "",
  nameSnapshot: "",
  quantity: 1,
  unitPrice: "",
  notes: "",
}

const AddCommandItemModal = ({ isOpen, isSubmitting, onClose, onSubmit }) => {
  const [form, setForm] = useState(INITIAL_FORM)
  const [beverages, setBeverages] = useState([])
  const [isLoadingBeverages, setIsLoadingBeverages] = useState(false)
  const [beveragesError, setBeveragesError] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isCancelled = false

    const fetchBeverages = async () => {
      setIsLoadingBeverages(true)
      setBeveragesError("")

      try {
        const response = await fetch(`${API_BASE_URL}/beverages`, {
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || data.message || "Nao foi possivel carregar as bebidas")
        }

        if (!isCancelled) {
          setBeverages(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Erro ao carregar bebidas para a comanda:", error)

        if (!isCancelled) {
          setBeverages([])
          setBeveragesError(error.message || "Nao foi possivel carregar as bebidas.")
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingBeverages(false)
        }
      }
    }

    fetchBeverages()

    return () => {
      isCancelled = true
    }
  }, [isOpen])

  const selectedBeverage = useMemo(
    () => beverages.find((beverage) => beverage._id === form.productId) || null,
    [beverages, form.productId],
  )

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    await onSubmit?.({
      productType: form.productType.trim(),
      productId: form.productType === "beverage" ? form.productId.trim() : "",
      nameSnapshot: form.nameSnapshot.trim(),
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
      notes: form.notes.trim(),
    })
  }

  const handleProductTypeChange = (nextType) => {
    setForm((current) => ({
      ...current,
      productType: nextType,
      productId: "",
      nameSnapshot: "",
    }))
  }

  const handleBeverageChange = (beverageId) => {
    const beverage = beverages.find((item) => item._id === beverageId)

    setForm((current) => ({
      ...current,
      productType: "beverage",
      productId: beverageId,
      nameSnapshot: beverage ? beverage.name : "",
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-primary/20 bg-background-light p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Nova linha</p>
            <h2 className="text-2xl font-semibold text-text">Adicionar item na comanda</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-primary/20 px-3 py-1 text-sm text-text-dark transition hover:border-primary hover:text-text"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="command-item-source">
              Origem do item
            </label>
            <select
              id="command-item-source"
              value={form.productType}
              onChange={(event) => handleProductTypeChange(event.target.value)}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
            >
              <option value="manual">Item livre</option>
              <option value="beverage">Bebida do estoque</option>
            </select>
          </div>

          {form.productType === "beverage" ? (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="command-item-beverage">
                Bebida vinculada
              </label>
              <select
                id="command-item-beverage"
                value={form.productId}
                onChange={(event) => handleBeverageChange(event.target.value)}
                className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                required
                disabled={isLoadingBeverages}
              >
                <option value="">{isLoadingBeverages ? "Carregando bebidas..." : "Selecione uma bebida"}</option>
                {beverages.map((beverage) => (
                  <option key={beverage._id} value={beverage._id}>
                    {beverage.name} • {beverage.category} • estoque {beverage.quantity} {beverage.unit}
                  </option>
                ))}
              </select>
              {beveragesError && <p className="mt-2 text-sm text-red-300">{beveragesError}</p>}
            </div>
          ) : null}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="command-item-name">
              {form.productType === "beverage" ? "Snapshot do nome" : "Nome do item"}
            </label>
            <input
              id="command-item-name"
              type="text"
              value={form.nameSnapshot}
              onChange={(event) => setForm((current) => ({ ...current, nameSnapshot: event.target.value }))}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              placeholder={form.productType === "beverage" ? "Selecione a bebida acima" : "Ex.: Gin tonic"}
              required
              readOnly={form.productType === "beverage"}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="command-item-quantity">
              Quantidade
            </label>
            <input
              id="command-item-quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="command-item-unit-price">
              Preco unitario
            </label>
            <input
              id="command-item-unit-price"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(event) => setForm((current) => ({ ...current, unitPrice: event.target.value }))}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              placeholder="0.00"
              required
            />
          </div>

          {selectedBeverage ? (
            <div className="rounded-2xl border border-primary/15 bg-background p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-text-dark">Referencia do estoque</p>
              <p className="mt-2 text-lg font-semibold text-text">{selectedBeverage.name}</p>
              <p className="mt-1 text-sm text-text-dark">
                Categoria: {selectedBeverage.category} • Estoque atual: {selectedBeverage.quantity} {selectedBeverage.unit}
              </p>
            </div>
          ) : null}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="command-item-notes">
              Observacoes
            </label>
            <textarea
              id="command-item-notes"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="min-h-[120px] w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              placeholder="Sem gelo, mesa externa, etc."
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-primary px-5 py-2 text-sm font-medium text-text transition hover:bg-primary hover:text-background"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-secondary px-5 py-2 text-sm font-medium text-background transition hover:bg-secondary-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Adicionar item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCommandItemModal
