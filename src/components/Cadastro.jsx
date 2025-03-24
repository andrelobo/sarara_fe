import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ErrorBoundary from './ErrorBoundary';
import PropTypes from 'prop-types';
import { saveFormData, getFormData, clearFormData } from '../utils/db'; // Funções do IndexedDB

const Cadastro = ({ onCadastro }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Carrega dados do formulário salvos no IndexedDB (se houver)
  useEffect(() => {
    const loadFormData = async () => {
      const savedData = await getFormData('cadastro');
      if (savedData) {
        setUsername(savedData.username || '');
        setEmail(savedData.email || '');
        setPassword(savedData.password || '');
      }
    };

    loadFormData();
  }, []);

  // Validação do formulário
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Nome de usuário é obrigatório';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    if (password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, email, password]);

  // Função para enviar o formulário
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return; // Valida o formulário antes de enviar

      if (!navigator.onLine) {
        Swal.fire({
          icon: 'warning',
          title: 'Sem conexão',
          text: 'Você precisa estar online para se cadastrar.',
        });
        return;
      }

      setIsLoading(true); // Ativa o estado de loading

      try {
        // Salva os dados do formulário no IndexedDB (para preenchimento automático)
        await saveFormData('cadastro', { username, email, password });

        const response = await fetch('http://localhost:7778/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          Swal.fire({
            icon: 'error',
            title: 'Erro ao cadastrar',
            text: data.message || 'Ocorreu um erro no servidor. Tente novamente.',
          });
          return;
        }

        // Cadastro bem-sucedido
        if (typeof onCadastro === 'function') {
          onCadastro(data.token); // Atualiza o estado de autenticação
        }

        // Limpa os dados do formulário no IndexedDB após o cadastro bem-sucedido
        await clearFormData('cadastro');

        Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado com sucesso!',
          text: 'Bem-vindo! Agora você pode acessar sua conta.',
          confirmButtonText: 'Ok',
        }).then(() => navigate('/boas-vindas')); // Redireciona após o cadastro
      } catch (error) {
        console.error('Erro de rede:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro de rede',
          text: 'Por favor, tente novamente mais tarde.',
        });
      } finally {
        setIsLoading(false); // Desativa o estado de loading
      }
    },
    [username, email, password, validateForm, onCadastro, navigate]
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="max-w-md w-full p-8 bg-background-light shadow-md rounded-lg">
          <h2 className="text-center text-3xl text-secondary">Cadastro</h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Campo Nome de Usuário */}
            <div>
              <label htmlFor="username" className="sr-only">
                Nome de Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-t-md w-full px-3 py-2 border border-primary placeholder-text-dark bg-background text-text focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                placeholder="Nome de Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              {errors.username && <p className="text-error text-sm">{errors.username}</p>}
            </div>

            {/* Campo Email */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none w-full px-3 py-2 border border-primary placeholder-text-dark bg-background text-text focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {errors.email && <p className="text-error text-sm">{errors.email}</p>}
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-md w-full px-3 py-2 border border-primary placeholder-text-dark bg-background text-text focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {errors.password && <p className="text-error text-sm">{errors.password}</p>}
            </div>

            {/* Botão de Cadastro */}
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-background bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Validação das props
Cadastro.propTypes = {
  onCadastro: PropTypes.func,
};

// Valor padrão para a prop onCadastro
Cadastro.defaultProps = {
  onCadastro: () => {},
};

export default Cadastro;