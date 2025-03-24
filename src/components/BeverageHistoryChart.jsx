"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { FaSync } from "react-icons/fa"
import Swal from "sweetalert2"

const BeverageHistoryChart = () => {
  const [beverages, setBeverages] = useState([])
  const [selectedBeverage, setSelectedBeverage] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Buscar a lista de bebidas
    const fetchBeverages = async () => {
      try {
        if (!navigator.onLine) {
          setError("Você está offline. Algumas funcionalidades podem estar limitadas.")
          return
        }

        const token = localStorage.getItem("authToken")
        const response = await fetch("https://sarara-be.vercel.app/api/beverages", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar bebidas: ${response.status}`)
        }

        const data = await response.json()
        setBeverages(data)
      } catch (error) {
        console.error("Erro ao buscar bebidas:", error)
        setError("Falha ao carregar a lista de bebidas")
      }
    }

    fetchBeverages()
  }, [])

  const fetchHistoryData = async () => {
    if (!selectedBeverage) {
      Swal.fire("Atenção", "Por favor, selecione uma bebida", "warning")
      return
    }

    if (!navigator.onLine) {
      Swal.fire("Offline", "Esta funcionalidade não está disponível no modo offline", "warning")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("authToken")
      const url = new URL(`https://sarara-be.vercel.app/api/beverages/${selectedBeverage}/history`)

      if (startDate) url.searchParams.append("startDate", startDate)
      if (endDate) url.searchParams.append("endDate", endDate)

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar histórico: ${response.status}`)
      }

      const historyData = await response.json()

      // Processar os dados para o gráfico
      const chartData = processDataForChart(historyData)
      setData(chartData)
    } catch (error) {
      console.error("Erro ao buscar histórico:", error)
      setError("Falha ao carregar os dados do histórico")
    } finally {
      setLoading(false)
    }
  }

  const processDataForChart = (historyData) => {
    // Ordenar por data
    const sortedData = [...historyData].sort((a, b) => new Date(a.date) - new Date(b.date))

    // Agrupar por dia
    const groupedByDay = sortedData.reduce((acc, entry) => {
      const date = new Date(entry.date).toISOString().split("T")[0]

      if (!acc[date]) {
        acc[date] = {
          date,
          added: 0,
          removed: 0,
          net: 0,
        }
      }

      if (entry.change === "added") {
        acc[date].added += entry.quantity
        acc[date].net += entry.quantity
      } else {
        acc[date].removed += entry.quantity
        acc[date].net -= entry.quantity
      }

      return acc
    }, {})

    return Object.values(groupedByDay)
  }

  return (
    <div className="p-4 bg-background min-h-screen">
      <h1 className="text-3xl mb-6 text-center text-text">Histórico de Bebidas</h1>

      {error && (
        <div className="text-error text-center mb-4 p-4 bg-background-light rounded-lg border border-error">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-background-light p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-text-dark mb-2">Bebida</label>
            <select
              value={selectedBeverage}
              onChange={(e) => setSelectedBeverage(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Selecione uma bebida</option>
              {beverages.map((beverage) => (
                <option key={beverage._id} value={beverage._id}>
                  {beverage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-dark mb-2">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-text-dark mb-2">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        <button
          onClick={fetchHistoryData}
          disabled={loading || !navigator.onLine}
          className={`w-full py-2 px-4 rounded-md text-text ${
            loading || !navigator.onLine ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-light"
          } transition-colors flex items-center justify-center`}
        >
          {loading ? (
            <>
              <FaSync className="animate-spin mr-2" /> Carregando...
            </>
          ) : (
            "Buscar Histórico"
          )}
        </button>
      </div>

      {data.length > 0 ? (
        <div className="bg-background-light p-6 rounded-lg shadow-md">
          <h2 className="text-xl mb-4 text-text">Resultados</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="added" stroke="#82ca9d" name="Adicionado" />
                <Line type="monotone" dataKey="removed" stroke="#ff8042" name="Removido" />
                <Line type="monotone" dataKey="net" stroke="#8884d8" name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full bg-background border border-primary rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-primary text-left">Data</th>
                  <th className="py-2 px-4 border-b border-primary text-right">Adicionado</th>
                  <th className="py-2 px-4 border-b border-primary text-right">Removido</th>
                  <th className="py-2 px-4 border-b border-primary text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-background-light" : "bg-background"}>
                    <td className="py-2 px-4 border-b border-primary">{entry.date}</td>
                    <td className="py-2 px-4 border-b border-primary text-right text-green-600">{entry.added}</td>
                    <td className="py-2 px-4 border-b border-primary text-right text-red-600">{entry.removed}</td>
                    <td className="py-2 px-4 border-b border-primary text-right">{entry.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="text-text-dark text-center p-8 bg-background-light rounded-lg">
            Selecione uma bebida e um período para visualizar o histórico.
          </div>
        )
      )}
    </div>
  )
}

export default BeverageHistoryChart

