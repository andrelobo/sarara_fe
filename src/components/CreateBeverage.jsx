import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorBoundary from './ErrorBoundary';
import { saveData, saveSyncQueue } from '../utils/db'; // Funções do IndexedDB
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

const CreateBeverage = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const newBeverage = {
      name,
      category,
      quantity: Number(quantity),
      unit,
      date: date.toISOString().split('T')[0],
    };

    try {
      if (navigator.onLine) {
        // Se online, envia diretamente para o backend
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://sarara-be.vercel.app/api/beverages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newBeverage),
        });

        if (response.ok) {
          navigate('/beverages');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao criar bebida');
        }
      } else {
        // Se offline, armazena no IndexedDB e na fila de sincronização
        await saveData('beverages', newBeverage); // Armazena a bebida no IndexedDB
        await saveSyncQueue({ type: 'create', data: newBeverage }); // Adiciona à fila de sincronização

        Swal.fire({
          icon: 'success',
          title: 'Bebida cadastrada offline!',
          text: 'A bebida será sincronizada com o servidor quando a conexão for restabelecida.',
        }).then(() => navigate('/beverages'));
      }
    } catch (error) {
      console.error('Erro ao criar bebida:', error);
      setError(error.message || 'Erro ao criar bebida. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, category, quantity, unit, date, navigate]);

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4 bg-background text-text">
        <h1 className="text-2xl mb-4 text-secondary">Cadastrar Bebida</h1>
        {!navigator.onLine && (
          <div className="text-warning text-center mb-4 p-4 bg-background-light rounded-lg border border-warning">
            <p>Você está offline. A bebida será sincronizada quando a conexão for restabelecida.</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background-light border border-primary rounded-md text-text shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background-light border border-primary rounded-md text-text shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark">Quantidade</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background-light border border-primary rounded-md text-text shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark">Unidade</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background-light border border-primary rounded-md text-text shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark">Data de Cadastro</label>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              dateFormat="dd/MM/yyyy"
              className="mt-1 block w-full px-3 py-2 bg-background-light border border-primary rounded-md text-text shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              required
            />
          </div>
          {error && <p className="text-error">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 border border-transparent rounded-md text-background bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default CreateBeverage;