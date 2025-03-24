import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";

const EditIngredientCard = ({ ingredient, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...ingredient });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({ ...ingredient });
  }, [ingredient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "quantity" ? Number.parseFloat(value) : value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.category.trim()) newErrors.category = "Categoria é obrigatória";
    if (isNaN(formData.quantity) || formData.quantity <= 0)
      newErrors.quantity = "Quantidade deve ser um número maior que zero";
    if (!formData.unit.trim()) newErrors.unit = "Unidade é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
      } catch (error) {
        console.error("Error in handleSubmit:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
      <div className="bg-gray-900 text-gray-200 p-8 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-[#f8b431]">Editar Ingrediente</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-200 transition ease-in-out duration-150"
            aria-label="Fechar"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 text-gray-200 border ${
                errors.name ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:border-[#c69f56]`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-gray-300">Categoria</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 text-gray-200 border ${
                errors.category ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:border-[#c69f56]`}
            />
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-gray-300">Quantidade</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 bg-gray-700 text-gray-200 border ${
                errors.quantity ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:border-[#c69f56]`}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
          </div>
          <div>
            <label className="block text-gray-300">Unidade</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 text-gray-200 border ${
                errors.unit ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:border-[#c69f56]`}
            />
            {errors.unit && <p className="mt-1 text-sm text-red-500">{errors.unit}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition ease-in-out duration-150"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#c69f56] text-gray-900 rounded-lg hover:bg-[#a87f44] transition ease-in-out duration-150"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
};

export default EditIngredientCard;