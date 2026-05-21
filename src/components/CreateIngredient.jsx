import React, { useState } from "react"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"
import AppButton from "./ui/AppButton"
import { saveData, saveSyncQueue } from "../utils/db"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders } from "../utils/auth"

const fieldClassName =
  "mt-2 block h-11 w-full rounded-2xl border border-white/10 bg-surface/80 px-4 text-sm text-text shadow-sm focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20"

const CreateIngredient = () => {
  const [ingredient, setIngredient] = useState({ name: "", category: "", quantity: "", unit: "" })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setIngredient((prevIngredient) => ({ ...prevIngredient, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const newIngredient = { ...ingredient, quantity: Number(ingredient.quantity) }

    try {
      if (navigator.onLine) {
        const response = await fetch(`${API_BASE_URL}/ingredients`, {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(newIngredient),
        })

        if (!response.ok) {
          throw new Error("Erro ao criar o ingrediente")
        }

        setSuccess("Ingrediente criado com sucesso!")
        setIngredient({ name: "", category: "", quantity: "", unit: "" })
        navigate("/ingredients")
      } else {
        await saveData("ingredients", newIngredient)
        await saveSyncQueue({ type: "create", data: newIngredient })

        Swal.fire({
          icon: "success",
          title: "Ingrediente cadastrado offline!",
          text: "O ingrediente sera sincronizado com o servidor quando a conexao voltar.",
        })

        setSuccess("Ingrediente cadastrado offline!")
        setIngredient({ name: "", category: "", quantity: "", unit: "" })
        navigate("/ingredients")
      }
    } catch (currentError) {
      console.error("Erro ao criar ingrediente:", currentError)
      setError(currentError.message || "Erro ao criar ingrediente. Tente novamente.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-surface/70 p-6 shadow-ambient sm:p-8">
      <div className="mb-6">
        <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Cadastro</p>
        <h1 className="mt-2 font-heading text-3xl text-text">Novo ingrediente</h1>
        <p className="mt-3 text-sm leading-6 text-text-dark">Cadastro rapido da base de apoio da operacao, sem mexer na estrategia offline atual.</p>
      </div>

      {!navigator.onLine ? (
        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Voce esta offline. O ingrediente sera sincronizado quando a conexao for restabelecida.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

        <div>
          <label className="block text-sm text-text-dark" htmlFor="ingredient-name">Nome</label>
          <input className={fieldClassName} id="ingredient-name" name="name" onChange={handleInputChange} required type="text" value={ingredient.name} />
        </div>
        <div>
          <label className="block text-sm text-text-dark" htmlFor="ingredient-category">Categoria</label>
          <input className={fieldClassName} id="ingredient-category" name="category" onChange={handleInputChange} required type="text" value={ingredient.category} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-text-dark" htmlFor="ingredient-quantity">Quantidade</label>
            <input className={fieldClassName} id="ingredient-quantity" name="quantity" onChange={handleInputChange} required type="number" value={ingredient.quantity} />
          </div>
          <div>
            <label className="block text-sm text-text-dark" htmlFor="ingredient-unit">Unidade</label>
            <input className={fieldClassName} id="ingredient-unit" name="unit" onChange={handleInputChange} required type="text" value={ingredient.unit} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton onClick={() => navigate("/ingredients")} variant="ghost">Cancelar</AppButton>
          <AppButton type="submit" variant="primary">Cadastrar ingrediente</AppButton>
        </div>
      </form>
    </div>
  )
}

export default CreateIngredient
