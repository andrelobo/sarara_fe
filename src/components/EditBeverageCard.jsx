import { useState } from "react"
import Swal from "sweetalert2"
import AppButton from "./ui/AppButton"
import { saveSyncQueue } from "../utils/db"

const fieldClassName =
  "mt-2 block h-11 w-full rounded-2xl border border-white/10 bg-background-dark px-4 text-sm text-text shadow-sm focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20"

const EditBeverageCard = ({ beverage, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...beverage })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      if (navigator.onLine) {
        onSave(formData)
      } else {
        await saveSyncQueue({ type: "update", data: formData })
        Swal.fire({ icon: "success", title: "Edicao salva offline!", text: "A edicao sera sincronizada quando a conexao voltar." })
        onSave(formData)
      }
    } catch (currentError) {
      console.error("Erro ao salvar edicao:", currentError)
      Swal.fire({ icon: "error", title: "Erro ao salvar edicao", text: "Por favor, tente novamente." })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-surface p-6 shadow-[0_35px_90px_rgba(8,26,22,0.55)]">
        <h2 className="font-heading text-3xl text-text">Editar bebida</h2>
        {!navigator.onLine ? <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">Voce esta offline. A edicao sera sincronizada quando a conexao voltar.</div> : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-text-dark">Nome</label>
            <input className={fieldClassName} name="name" onChange={handleChange} type="text" value={formData.name} />
          </div>
          <div>
            <label className="block text-sm text-text-dark">Categoria</label>
            <input className={fieldClassName} name="category" onChange={handleChange} type="text" value={formData.category} />
          </div>
          <div>
            <label className="block text-sm text-text-dark">Quantidade</label>
            <input className={fieldClassName} name="quantity" onChange={handleChange} type="number" value={formData.quantity} />
          </div>
          <div>
            <label className="block text-sm text-text-dark">Unidade</label>
            <input className={fieldClassName} name="unit" onChange={handleChange} type="text" value={formData.unit} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <AppButton onClick={onCancel} variant="ghost">Cancelar</AppButton>
            <AppButton type="submit" variant="primary">Salvar</AppButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBeverageCard
