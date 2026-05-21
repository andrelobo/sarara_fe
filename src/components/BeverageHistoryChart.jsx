"use client"

import { useEffect, useMemo, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { FaChartLine, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders } from "../utils/auth"
import AppButton from "./ui/AppButton"
import EmptyState from "./ui/EmptyState"
import MetricTile from "./ui/MetricTile"

const BeverageHistoryChart = () => {
  const [beverages, setBeverages] = useState([])
  const [selectedBeverage, setSelectedBeverage] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBeverages = async () => {
      try {
        if (!navigator.onLine) {
          setError("Voce esta offline. O historico detalhado depende da API.")
          return
        }

        const response = await fetch(`${API_BASE_URL}/beverages`, {
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar bebidas: ${response.status}`)
        }

        const responseData = await response.json()
        setBeverages(Array.isArray(responseData) ? responseData : [])
      } catch (currentError) {
        console.error("Erro ao buscar bebidas:", currentError)
        setError("Falha ao carregar a lista de bebidas")
      }
    }

    fetchBeverages()
  }, [])

  const fetchHistoryData = async () => {
    if (!selectedBeverage) {
      setError("Selecione uma bebida para analisar o historico.")
      return
    }

    if (!navigator.onLine) {
      setError("Esta funcionalidade nao esta disponivel no modo offline.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const url = new URL(`${API_BASE_URL}/beverages/${selectedBeverage}/history`)
      if (startDate) url.searchParams.append("startDate", startDate)
      if (endDate) url.searchParams.append("endDate", endDate)

      const response = await fetch(url, {
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar historico: ${response.status}`)
      }

      const historyData = await response.json()
      setData(processDataForChart(historyData))
    } catch (currentError) {
      console.error("Erro ao buscar historico:", currentError)
      setError("Falha ao carregar os dados do historico")
    } finally {
      setLoading(false)
    }
  }

  const processDataForChart = (historyData) => {
    const sortedData = [...historyData].sort((a, b) => new Date(a.date) - new Date(b.date))

    const groupedByDay = sortedData.reduce((accumulator, entry) => {
      const date = new Date(entry.date).toISOString().split("T")[0]

      if (!accumulator[date]) {
        accumulator[date] = { date, added: 0, removed: 0, net: 0 }
      }

      if (entry.change === "added") {
        accumulator[date].added += entry.quantity
        accumulator[date].net += entry.quantity
      } else {
        accumulator[date].removed += entry.quantity
        accumulator[date].net -= entry.quantity
      }

      return accumulator
    }, {})

    return Object.values(groupedByDay)
  }

  const selectedLabel = useMemo(() => beverages.find((item) => item._id === selectedBeverage)?.name || "Nenhuma", [beverages, selectedBeverage])
  const totalAdded = useMemo(() => data.reduce((accumulator, item) => accumulator + item.added, 0), [data])
  const totalRemoved = useMemo(() => data.reduce((accumulator, item) => accumulator + item.removed, 0), [data])
  const totalNet = useMemo(() => data.reduce((accumulator, item) => accumulator + item.net, 0), [data])

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile hint="Bebida atualmente selecionada para leitura." icon={<FaChartLine />} label="Analise" tone="gold" value={selectedLabel} />
        <MetricTile hint="Volume de entradas no periodo filtrado." label="Adicionado" tone="success" value={totalAdded} />
        <MetricTile hint="Volume de saidas no periodo filtrado." label="Removido" tone="danger" value={totalRemoved} />
        <MetricTile hint="Saldo agregado das movimentacoes." label="Saldo" tone="info" value={totalNet} />
      </section>

      <section className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-5 shadow-ambient">
        <div className="mb-5">
          <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Historico</p>
          <h1 className="mt-2 font-heading text-3xl text-text">Fluxo de movimentacao de bebidas</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-dark">
            Leia entradas, saidas e saldo sem sair do app operacional. A tela continua usando o mesmo contrato do backend.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr,0.8fr,auto]">
          <div>
            <label className="mb-2 block text-sm text-text-dark" htmlFor="history-beverage">Bebida</label>
            <select
              className="h-11 w-full rounded-2xl border border-white/10 bg-background-dark px-4 text-sm text-text focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20"
              id="history-beverage"
              onChange={(event) => setSelectedBeverage(event.target.value)}
              value={selectedBeverage}
            >
              <option value="">Selecione uma bebida</option>
              {beverages.map((beverage) => (
                <option key={beverage._id} value={beverage._id}>{beverage.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-text-dark" htmlFor="history-start">Data inicial</label>
            <input className="h-11 w-full rounded-2xl border border-white/10 bg-background-dark px-4 text-sm text-text focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20" id="history-start" onChange={(event) => setStartDate(event.target.value)} type="date" value={startDate} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-text-dark" htmlFor="history-end">Data final</label>
            <input className="h-11 w-full rounded-2xl border border-white/10 bg-background-dark px-4 text-sm text-text focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20" id="history-end" onChange={(event) => setEndDate(event.target.value)} type="date" value={endDate} />
          </div>

          <div className="flex items-end">
            <AppButton disabled={loading || !navigator.onLine} fullWidth icon={<FaSyncAlt className={loading ? "animate-spin" : ""} />} onClick={fetchHistoryData} variant="primary">
              {loading ? "Buscando" : "Buscar"}
            </AppButton>
          </div>
        </div>
      </section>

      {data.length > 0 ? (
        <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-5 shadow-ambient">
            <h2 className="font-heading text-2xl text-text">Curva operacional</h2>
            <div className="mt-5 h-80">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                  <XAxis axisLine={false} dataKey="date" stroke="#CDAF7D" tickLine={false} />
                  <YAxis axisLine={false} stroke="#CDAF7D" tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1C1C1C", border: "1px solid rgba(230,180,80,0.2)", borderRadius: 16, color: "#F2F2F2" }} />
                  <Line dataKey="added" dot={false} stroke="#2E8B57" strokeWidth={3} type="monotone" />
                  <Line dataKey="removed" dot={false} stroke="#B94132" strokeWidth={3} type="monotone" />
                  <Line dataKey="net" dot={false} stroke="#E6B450" strokeWidth={3} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-5 shadow-ambient">
            <h2 className="font-heading text-2xl text-text">Leitura por dia</h2>
            <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-white/10">
              <div className="grid grid-cols-4 border-b border-white/8 bg-black/15 px-4 py-3 text-xs uppercase tracking-[0.24em] text-text-dark">
                <span>Data</span>
                <span className="text-right">Add</span>
                <span className="text-right">Sai</span>
                <span className="text-right">Saldo</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {data.map((entry) => (
                  <div key={entry.date} className="grid grid-cols-4 border-b border-white/8 px-4 py-3 text-sm text-text last:border-b-0">
                    <span>{entry.date}</span>
                    <span className="text-right text-emerald-300">{entry.added}</span>
                    <span className="text-right text-red-300">{entry.removed}</span>
                    <span className="text-right text-primary">{entry.net}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : !loading ? (
        <EmptyState description="Selecione uma bebida e um periodo para visualizar a evolucao do estoque." icon={<FaChartLine />} title="Nenhuma leitura carregada" />
      ) : null}
    </div>
  )
}

export default BeverageHistoryChart
