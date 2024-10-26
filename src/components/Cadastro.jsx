import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Cadastro = ({ onCadastro }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        const token = data.token;
        onCadastro(token);
        
        Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado com sucesso!',
          text: 'Bem-vindo! Agora você pode acessar sua conta.',
          confirmButtonText: 'Ok'
        }).then(() => navigate('/boas-vindas'));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao cadastrar',
          text: 'Por favor, tente novamente.',
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] text-gray-300">
      <div className="max-w-md w-full p-8 bg-gray-900 shadow-md rounded-lg">
        <h2 className="text-center text-3xl text-yellow-500">Cadastro</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">Nome de Usuário</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none rounded-t-md w-full px-3 py-2 border border-gray-600 placeholder-gray-500 bg-gray-700 text-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email-address" className="sr-only">Email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              className="appearance-none w-full px-3 py-2 border border-gray-600 placeholder-gray-500 bg-gray-700 text-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-b-md w-full px-3 py-2 border border-gray-600 placeholder-gray-500 bg-gray-700 text-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
