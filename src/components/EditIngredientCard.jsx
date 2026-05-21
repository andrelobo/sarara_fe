import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import AppButton from "./ui/AppButton"

const fieldClassName =
  "mt-2 block h-11 w-full rounded-2xl border border-white/10 bg-background-dark px-4 text-sm text-text shadow-sm focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20"

const EditIngredientCard = ({ ingredient, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...ingredient })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData({ ...ingredient })
  }, [ingredient])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: name === "quantity" ? Number.parseFloat(value) : value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Nome e obrigatorio"
    if (!formData.category.trim()) newErrors.category = "Categoria e obrigatoria"
    if (isNaN(formData.quantity) || formData.quantity <= 0) newErrors.quantity = "Quantidade deve ser maior que zero"
    if (!formData.unit.trim()) newErrors.unit = "Unidade e obrigatoria"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        await onSave(formData)
      } catch (currentError) {
        console.error("Erro ao salvar ingrediente:", currentError)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-surface p-6 shadow-[0_35px_90px_rgba(8,26,22,0.55)]">
        <h2 className="font-heading text-3xl text-text">Editar ingrediente</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-text-dark">Nome</label>
            <input className={fieldClassName} name="name" onChange={handleChange} type="text" value={formData.name} />
            {errors.name ? <p className="mt-1 text-sm text-red-300">{errors.name}</p> : null}
          </div>
          <div>
            <label className="block text-sm text-text-dark">Categoria</label>
            <input className={fieldClassName} name="category" onChange={handleChange} type="text" value={formData.category} />
            {errors.category ? <p className="mt-1 text-sm text-red-300">{errors.category}</p> : null}
          </div>
          <div>
            <label className="block text-sm text-text-dark">Quantidade</label>
            <input className={fieldClassName} min="0" name="quantity" onChange={handleChange} step="0.01" type="number" value={formData.quantity} />
            {errors.quantity ? <p className="mt-1 text-sm text-red-300">{errors.quantity}</p> : null}
          </div>
          <div>
            <label className="block text-sm text-text-dark">Unidade</label>
            <input className={fieldClassName} name="unit" onChange={handleChange} type="text" value={formData.unit} />
            {errors.unit ? <p className="mt-1 text-sm text-red-300">{errors.unit}</p> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <AppButton disabled={isSubmitting} onClick={onCancel} variant="ghost">Cancelar</AppButton>
            <AppButton disabled={isSubmitting} type="submit" variant="primary">{isSubmitting ? "Salvando..." : "Salvar"}</AppButton>
          </div>
        </form>
      </div>
    </div>
  )
}

EditIngredientCard.propTypes = {
  ingredient: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default EditIngredientCard
