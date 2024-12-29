import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ErrorBoundary from './ErrorBoundary';
import PropTypes from 'prop-types';

const Cadastro = ({ onCadastro }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Nome de usuário é obrigatório';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    if (password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, email, password]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('https://sarara-be.vercel.app/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      if (response.ok) {
        const data = await response.json();
        onCadastro(data.token);
        
        Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado com sucesso!',
          text: 'Bem-vindo! Agora você pode acessar sua conta.',
          confirmButtonText: 'Ok'
        }).then(() => navigate('/boas-vindas'));
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Erro ao cadastrar',
          text: errorData.message || 'Por favor, tente novamente.',
        });
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro de rede',
        text: 'Por favor, tente novamente mais tarde.',
      });
    }
  }, [username, email, password, validateForm, onCadastro, navigate]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="max-w-md w-full p-8 bg-background-light shadow-md rounded-lg">
          <h2 className="text-center text-3xl text-secondary">Cadastro</h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="sr-only">Nome de Usuário</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-t-md w-full px-3 py-2 border border-primary placeholder-text-dark bg-background text-text focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                placeholder="Nome de Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && <p className="text-error text-sm">{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none w-full px-3 py-2 border border-primary placeholder-text-dark bg-background text-text focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-error text-sm">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-md w-full px-3 py-2 border border-primary placeholder-text-dark bg-background text-text focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-error text-sm">{errors.password}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-background bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};
Cadastro.propTypes = {
  onCadastro: PropTypes.func.isRequired,
};

export default Cadastro;

