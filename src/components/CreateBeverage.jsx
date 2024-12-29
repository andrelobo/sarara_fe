import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorBoundary from './ErrorBoundary';

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
    try {
      const token = localStorage.getItem('authToken');
      const newBeverage = {
        name,
        category,
        quantity: Number(quantity),
        unit,
        date: date.toISOString().split('T')[0],
      };
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

