import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { saveToken, getToken, isTokenValid } from '../utils/db'; // Importe as funções do IndexedDB

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verifica se o usuário está offline e tem um token válido
  useEffect(() => {
    const checkOfflineAccess = async () => {
      if (!navigator.onLine) {
        const token = await getToken();
        if (token && isTokenValid(token)) {
          Swal.fire({
            icon: 'info',
            title: 'Modo Offline',
            text: 'Você está offline, mas pode acessar funcionalidades limitadas.',
          }).then(() => navigate('/beverages')); // Redireciona para a página de bebidas
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Sem conexão',
            text: 'Você precisa estar online para fazer login.',
          });
        }
      }
    };

    checkOfflineAccess();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      Swal.fire({
        icon: 'warning',
        title: 'Sem conexão',
        text: 'Você precisa estar online para fazer login.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://sarara-be.vercel.app/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          Swal.fire({
            icon: 'warning',
            title: 'Credenciais incorretas',
            text: 'Por favor, verifique seu email e senha.',
          });
        } else if (response.status === 404) {
          Swal.fire({
            icon: 'error',
            title: 'Usuário não encontrado',
            text: 'O usuário registrado não existe.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro ao fazer login',
            text: data.message || 'Por favor, tente novamente.',
          });
        }
        return;
      }

      const { accessToken } = data;

      if (!accessToken) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao fazer login',
          text: 'Token não recebido. Por favor, tente novamente.',
        });
        return;
      }

      // Salva o token no localStorage e no IndexedDB
      localStorage.setItem('authToken', accessToken);
      await saveToken(accessToken); // Armazena o token no IndexedDB
      onLogin(accessToken);

      Swal.fire({
        icon: 'success',
        title: 'Login realizado com sucesso!',
        text: 'Bem-vindo de volta!',
        confirmButtonText: 'Ok',
      }).then(() => navigate('/beverages'));

    } catch (error) {
      console.error('Erro de rede:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro de rede',
        text: 'Por favor, tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] text-gray-300">
      <div className="max-w-md w-full p-8 bg-gray-900 shadow-md rounded-lg">
        <h2 className="text-center text-3xl text-blue-500">Login</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">Email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              className="appearance-none rounded-t-md w-full px-3 py-2 border border-gray-600 placeholder-gray-500 bg-gray-700 text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-b-md w-full px-3 py-2 border border-gray-600 placeholder-gray-500 bg-gray-700 text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;