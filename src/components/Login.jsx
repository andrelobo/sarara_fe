import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Adicionado estado de loading
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Ativa o estado de loading

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
        // Tratamento de erros específicos
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

      // Salva o token no localStorage e atualiza o estado de autenticação
      localStorage.setItem('authToken', accessToken);
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
      setIsLoading(false); // Desativa o estado de loading
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
              disabled={isLoading} // Desabilita o campo durante o loading
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
              disabled={isLoading} // Desabilita o campo durante o loading
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading} // Desabilita o botão durante o loading
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;