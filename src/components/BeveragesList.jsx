import { useEffect, useState } from 'react';

const BeveragesList = () => {
  const [beverages, setBeverages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBeverages = async () => {
      const token = localStorage.getItem('authToken'); // Obtenha o token do localStorage

      try {
        const response = await fetch('https://sarara-be.onrender.com/api/beverages', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBeverages(data);
        } else if (response.status === 403) {
          setError('Você não tem permissão para acessar este recurso.');
        } else {
          setError('Erro ao buscar bebidas. Por favor, tente novamente.');
        }
      } catch (error) {
        console.error('Erro de rede:', error);
        setError('Erro de rede. Por favor, tente novamente mais tarde.');
      }
    };

    fetchBeverages();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Lista de Bebidas</h1>
      <ul>
        {beverages.map(beverage => (
          <li key={beverage.id}>{beverage.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default BeveragesList;
