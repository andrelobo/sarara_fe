"use client"

import { useEffect, useState } from "react"
import { FaTimes } from "react-icons/fa"
import PropTypes from "prop-types"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders } from "../utils/auth"
import AppButton from "./ui/AppButton"
import EmptyState from "./ui/EmptyState"

const BeverageHistory = ({ beverage, onClose }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!beverage || !beverage._id) {
        setError("Informacoes da bebida nao disponiveis")
        setLoading(false)
        return
      }

      try {
        if (!navigator.onLine) {
          throw new Error("Voce esta offline. O historico nao esta disponivel no momento.")
        }

        const response = await fetch(`${API_BASE_URL}/beverages/${beverage._id}/history`, {
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar historico: ${response.status}`)
        }

        const data = await response.json()
        setHistory(Array.isArray(data) ? data : [])
      } catch (currentError) {
        console.error("Erro ao buscar historico:", currentError)
        setError(currentError.message || "Erro ao buscar historico")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [beverage])

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("pt-BR", options)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-surface shadow-[0_35px_90px_rgba(8,26,22,0.55)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Historico</p>
            <h2 className="mt-2 font-heading text-2xl text-text">{beverage?.name}</h2>
          </div>
          <button className="rounded-full border border-white/10 bg-white/5 p-3 text-text-dark transition hover:text-text" onClick={onClose} type="button">
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          ) : error ? (
            <EmptyState description={error} title="Nao foi possivel carregar o historico" />
          ) : history.length === 0 ? (
            <EmptyState description="Nenhum registro encontrado para esta bebida." title="Historico vazio" />
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
              {history.map((entry, index) => (
                <div key={`${entry.date}-${index}`} className="border-b border-white/8 px-5 py-4 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-ui text-sm font-semibold text-text">{formatDate(entry.date)}</p>
                    <span className={[
                      "rounded-full border px-3 py-1 text-[11px] font-ui font-semibold uppercase tracking-[0.24em]",
                      entry.change === "added" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-red-400/20 bg-red-500/10 text-red-200",
                    ].join(" ")}>
                      {entry.change === "added" ? "Adicionado" : "Removido"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-dark">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Quantidade: {entry.quantity} {beverage.unit}</span>
                    {entry.user ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Usuario: {entry.user}</span> : null}
                  </div>
                  {entry.notes ? <p className="mt-3 text-sm leading-6 text-text-dark">{entry.notes}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-5">
          <AppButton fullWidth onClick={onClose} variant="secondary">Fechar</AppButton>
        </div>
      </div>
    </div>
  )
}

BeverageHistory.propTypes = {
  beverage: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
}

export default BeverageHistory
