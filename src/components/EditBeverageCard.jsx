import { useState } from 'react';
import { saveSyncQueue } from '../utils/db'; // Funções do IndexedDB
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

const EditBeverageCard = ({ beverage, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...beverage });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (navigator.onLine) {
        // Se online, salva diretamente no backend
        onSave(formData);
      } else {
        // Se offline, armazena a operação na fila de sincronização
        await saveSyncQueue({ type: 'update', data: formData });

        Swal.fire({
          icon: 'success',
          title: 'Edição salva offline!',
          text: 'A edição será sincronizada com o servidor quando a conexão for restabelecida.',
        });

        onSave(formData); // Atualiza o estado local
      }
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar edição',
        text: 'Por favor, tente novamente.',
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
      <div className="bg-gray-900 text-gray-200 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4 text-[#f8b431]">Editar Bebida</h2>
        {!navigator.onLine && (
          <div className="text-warning text-center mb-4 p-4 bg-background-light rounded-lg border border-warning">
            <p>Você está offline. A edição será sincronizada quando a conexão for restabelecida.</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Categoria</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Quantidade</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Unidade</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#c69f56] text-gray-900 rounded-lg hover:bg-[#a87f44]"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBeverageCard;