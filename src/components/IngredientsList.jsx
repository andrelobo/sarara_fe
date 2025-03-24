import { useEffect, useState, useCallback, useMemo } from "react";
import IngredientCard from "./IngredientCard";
import EditIngredientCard from "./EditIngredientCard";
import ErrorBoundary from "./ErrorBoundary";
import Pagination from "./Pagination";
import { FaSearch, FaSync } from "react-icons/fa";
import Swal from "sweetalert2";
import { saveData, saveSyncQueue, getSyncQueue, clearSyncQueue } from "../utils/db"; // Funções do IndexedDB

const API_BASE_URL = "https://sarara-be.vercel.app/api";

const IngredientsList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [error, setError] = useState("");
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 9;

  const token = localStorage.getItem("authToken");
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  const handleError = useCallback((error, defaultMessage) => {
    console.error("Erro:", error);
    const message =
      error.message === "Failed to fetch"
        ? "Não foi possível conectar ao servidor. Verifique sua conexão de internet."
        : defaultMessage || "Ocorreu um erro. Por favor, tente novamente.";
    setError(message);
  }, []);

  const fetchIngredients = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      if (navigator.onLine) {
        const response = await fetch(`${API_BASE_URL}/ingredients`, { headers });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setIngredients(data);
        await saveData('ingredients', data); // Armazena no IndexedDB
      } else {
        const offlineIngredients = await getAllData('ingredients');
        setIngredients(offlineIngredients || []);
      }
    } catch (error) {
      handleError(error, "Erro ao buscar ingredientes. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [headers, handleError]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleEditIngredient = (ingredient) => setEditingIngredient(ingredient);

  const handleDeleteIngredient = useCallback(
    async (id) => {
      try {
        if (navigator.onLine) {
          const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, { method: "DELETE", headers });
          if (!response.ok) {
            throw new Error("Erro ao deletar o ingrediente.");
          }
          setIngredients((prev) => prev.filter((ingredient) => ingredient._id !== id));
          Swal.fire("Deletado!", "O ingrediente foi removido com sucesso.", "success");
        } else {
          await saveSyncQueue({ type: 'delete', id });
          setIngredients((prev) => prev.filter((ingredient) => ingredient._id !== id));
          Swal.fire("Deletado offline!", "O ingrediente será removido quando a conexão for restabelecida.", "success");
        }
      } catch (error) {
        handleError(error, "Erro ao deletar o ingrediente.");
      }
    },
    [headers, handleError],
  );

  const handleSaveIngredient = useCallback(
    async (updatedIngredient) => {
      try {
        if (navigator.onLine) {
          const response = await fetch(`${API_BASE_URL}/ingredients/${updatedIngredient._id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(updatedIngredient),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error: ${response.status} - ${response.statusText}`);
          }

          const updatedData = await response.json();
          setIngredients((prev) =>
            prev.map((ingredient) => (ingredient._id === updatedData._id ? updatedData : ingredient)),
          );
          setEditingIngredient(null);
          Swal.fire("Salvo!", "O ingrediente foi atualizado com sucesso.", "success");
        } else {
          await saveSyncQueue({ type: 'update', data: updatedIngredient });
          setIngredients((prev) =>
            prev.map((ingredient) => (ingredient._id === updatedIngredient._id ? updatedIngredient : ingredient)),
          );
          setEditingIngredient(null);
          Swal.fire("Salvo offline!", "A edição será sincronizada quando a conexão for restabelecida.", "success");
        }
      } catch (error) {
        console.error("Error updating ingredient:", error);
        handleError(error, "Erro ao salvar o ingrediente.");
      }
    },
    [headers, handleError],
  );

  // Sincroniza as alterações quando a conexão é restabelecida
  useEffect(() => {
    const syncChanges = async () => {
      const queue = await getSyncQueue();
      if (queue.length > 0 && navigator.onLine) {
        try {
          for (const operation of queue) {
            if (operation.type === 'update') {
              await fetch(`${API_BASE_URL}/ingredients/${operation.data._id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(operation.data),
              });
            } else if (operation.type === 'delete') {
              await fetch(`${API_BASE_URL}/ingredients/${operation.id}`, {
                method: "DELETE",
                headers,
              });
            }
          }
          await clearSyncQueue(); // Limpa a fila após a sincronização
          await fetchIngredients(); // Atualiza a lista de ingredientes
        } catch (error) {
          handleError(error, 'Erro ao sincronizar alterações.');
        }
      }
    };

    syncChanges();
  }, [headers, fetchIngredients, handleError]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [ingredients, searchTerm]);

  const currentIngredients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIngredients.slice(start, start + itemsPerPage);
  }, [filteredIngredients, currentPage]);

  if (isLoading && !error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 bg-background min-h-screen">
        <h1 className="text-3xl mb-6 text-center text-text">Lista de Ingredientes</h1>
        {error && (
          <div className="text-error text-center mb-4 p-4 bg-background-light rounded-lg border border-error">
            <p>{error}</p>
            <button
              onClick={fetchIngredients}
              className="mt-2 px-4 py-2 bg-primary text-text rounded hover:bg-primary-light transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Tentar Novamente
            </button>
          </div>
        )}
        {!navigator.onLine && (
          <div className="text-warning text-center mb-4 p-4 bg-background-light rounded-lg border border-warning">
            <p>Você está offline. As alterações serão sincronizadas quando a conexão for restabelecida.</p>
          </div>
        )}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-background-light border border-primary rounded-md text-text focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark" />
        </div>
        {currentIngredients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentIngredients.map((ingredient) => (
              <IngredientCard
                key={ingredient._id}
                ingredient={ingredient}
                onEditIngredient={handleEditIngredient}
                onDeleteIngredient={handleDeleteIngredient}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-text-dark">Nenhum ingrediente encontrado.</p>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredIngredients.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
        {editingIngredient && (
          <EditIngredientCard
            ingredient={editingIngredient}
            onSave={handleSaveIngredient}
            onCancel={() => setEditingIngredient(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default IngredientsList;