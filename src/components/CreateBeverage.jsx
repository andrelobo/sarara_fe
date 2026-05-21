import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Swal from "sweetalert2"
import ErrorBoundary from "./ErrorBoundary"
import AppButton from "./ui/AppButton"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders } from "../utils/auth"
import { saveData, saveSyncQueue } from "../utils/db"

const fieldClassName =
  "mt-2 block h-11 w-full rounded-2xl border border-white/10 bg-surface/80 px-4 text-sm text-text shadow-sm focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20"

const CreateBeverage = () => {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("")
  const [date, setDate] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setIsSubmitting(true)
      setError("")

      const newBeverage = {
        name,
        category,
        quantity: Number(quantity),
        unit,
        date: date.toISOString().split("T")[0],
      }

      try {
        if (navigator.onLine) {
          const response = await fetch(`${API_BASE_URL}/beverages`, {
            method: "POST",
            headers: getAuthHeaders({
              "Content-Type": "application/json",
            }),
            body: JSON.stringify(newBeverage),
          })

          if (response.ok) {
            navigate("/beverages")
          } else {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || "Falha ao criar bebida")
          }
        } else {
          await saveData("beverages", newBeverage)
          await saveSyncQueue({ type: "create", data: newBeverage })

          Swal.fire({
            icon: "success",
            title: "Bebida cadastrada offline!",
            text: "A bebida sera sincronizada com o servidor quando a conexao voltar.",
          }).then(() => navigate("/beverages"))
        }
      } catch (currentError) {
        console.error("Erro ao criar bebida:", currentError)
        setError(currentError.message || "Erro ao criar bebida. Tente novamente.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [category, date, name, navigate, quantity, unit],
  )

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-surface/70 p-6 shadow-ambient sm:p-8">
        <div className="mb-6">
          <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Cadastro</p>
          <h1 className="mt-2 font-heading text-3xl text-text">Nova bebida</h1>
          <p className="mt-3 text-sm leading-6 text-text-dark">Fluxo rapido para abastecer o catalogo operacional sem mudar a logica de sync existente.</p>
        </div>

        {!navigator.onLine ? (
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            Voce esta offline. O cadastro sera sincronizado quando a conexao for restabelecida.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-text-dark">Nome</label>
            <input className={fieldClassName} onChange={(event) => setName(event.target.value)} required type="text" value={name} />
          </div>
          <div>
            <label className="block text-sm text-text-dark">Categoria</label>
            <input className={fieldClassName} onChange={(event) => setCategory(event.target.value)} required type="text" value={category} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-text-dark">Quantidade</label>
              <input className={fieldClassName} onChange={(event) => setQuantity(event.target.value)} required type="number" value={quantity} />
            </div>
            <div>
              <label className="block text-sm text-text-dark">Unidade</label>
              <input className={fieldClassName} onChange={(event) => setUnit(event.target.value)} required type="text" value={unit} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-dark">Data de cadastro</label>
            <DatePicker className={fieldClassName} dateFormat="dd/MM/yyyy" onChange={(value) => setDate(value)} required selected={date} />
          </div>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <AppButton onClick={() => navigate("/beverages")} variant="ghost">Cancelar</AppButton>
            <AppButton disabled={isSubmitting} type="submit" variant="primary">{isSubmitting ? "Cadastrando..." : "Cadastrar bebida"}</AppButton>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  )
}

export default CreateBeverage
