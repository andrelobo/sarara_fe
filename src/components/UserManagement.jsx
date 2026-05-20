import { useEffect, useMemo, useState } from "react"
import Swal from "sweetalert2"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, getStoredUser } from "../utils/auth"

const ROLE_OPTIONS = [
  {
    value: "waiter",
    label: "Garcom",
    description: "Consulta bebidas, ingredientes e historicos.",
  },
  {
    value: "manager",
    label: "Gerente",
    description: "Gerencia estoque, historicos e operacao do bar.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Controla usuarios, permissoes e todo o inventario.",
  },
]

const SETUP_OPTIONS = [
  {
    value: "invite",
    label: "Gerar link",
    description: "Cria conta pendente e gera um link de ativacao para o admin compartilhar.",
  },
  {
    value: "password",
    label: "Definir senha",
    description: "Admin cria a senha inicial e ativa o usuario na hora.",
  },
]

const STATUS_LABELS = {
  pending: "Pendente",
  active: "Ativo",
  disabled: "Desativado",
}

const ROLE_LABELS = ROLE_OPTIONS.reduce((accumulator, option) => {
  accumulator[option.value] = option.label
  return accumulator
}, {})

const emptyForm = {
  username: "",
  email: "",
  role: "waiter",
  setupMode: "invite",
  password: "",
}

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [latestInvitationLink, setLatestInvitationLink] = useState("")
  const currentUser = useMemo(() => getStoredUser(), [])

  const fetchUsers = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel carregar os usuarios")
      }

      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch (error) {
      console.error("Erro ao carregar usuarios:", error)
      setFeedback({
        type: "error",
        text: error.message || "Nao foi possivel carregar os usuarios.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.username.trim() || !form.email.trim()) {
      setFeedback({
        type: "error",
        text: "Nome e email sao obrigatorios.",
      })
      return
    }

    if (form.setupMode === "password" && form.password.trim().length < 6) {
      setFeedback({
        type: "error",
        text: "Ao definir senha manualmente, use pelo menos 6 caracteres.",
      })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        setupMode: form.setupMode,
      }

      if (form.setupMode === "password") {
        payload.password = form.password
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel criar o usuario")
      }

      setUsers((currentUsers) => [data.user, ...currentUsers])
      setLatestInvitationLink(data.invitationLink || "")
      setForm(emptyForm)
      setFeedback({
        type: "success",
        text:
          form.setupMode === "password"
            ? "Usuario criado com senha inicial definida pelo admin."
            : "Usuario criado com link de ativacao pronto para compartilhamento.",
      })
    } catch (error) {
      console.error("Erro ao criar usuario:", error)
      setFeedback({
        type: "error",
        text: error.message || "Nao foi possivel criar o usuario.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyInvitation = async () => {
    if (!latestInvitationLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(latestInvitationLink)
      Swal.fire("Link copiado", "O convite foi copiado para a area de transferencia.", "success")
    } catch (error) {
      console.error("Erro ao copiar convite:", error)
      Swal.fire("Falha ao copiar", "Nao foi possivel copiar o link automaticamente.", "error")
    }
  }

  const handleResendInvitation = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/resend-invite`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel reenviar o convite")
      }

      setUsers((currentUsers) => currentUsers.map((user) => (user._id === userId ? data.user : user)))
      setLatestInvitationLink(data.invitationLink || "")
      setFeedback({
        type: "success",
        text: "Link de ativacao regenerado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao reenviar convite:", error)
      Swal.fire("Erro", error.message || "Nao foi possivel reenviar o convite.", "error")
    }
  }

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === "disabled" ? "active" : "disabled"

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user._id}`, {
        method: "PUT",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ status: nextStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel atualizar o usuario")
      }

      setUsers((currentUsers) => currentUsers.map((item) => (item._id === user._id ? data.user : item)))
    } catch (error) {
      console.error("Erro ao alternar status:", error)
      Swal.fire("Erro", error.message || "Nao foi possivel atualizar o status.", "error")
    }
  }

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Excluir usuario?",
      text: `Essa acao removera ${user.username} do sistema.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user._id}`, {
        method: "DELETE",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel excluir o usuario")
      }

      setUsers((currentUsers) => currentUsers.filter((item) => item._id !== user._id))
      Swal.fire("Excluido", "Usuario removido com sucesso.", "success")
    } catch (error) {
      console.error("Erro ao excluir usuario:", error)
      Swal.fire("Erro", error.message || "Nao foi possivel excluir o usuario.", "error")
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-secondary">Administracao de usuarios</h1>
          <p className="mt-2 text-text-dark">
            O admin cria os acessos do time e escolhe se o novo usuario recebera um link de ativacao para compartilhar ou uma senha inicial.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ROLE_OPTIONS.map((role) => (
            <div key={role.value} className="rounded-xl border border-primary/20 bg-background p-4">
              <p className="text-lg font-semibold text-text">{role.label}</p>
              <p className="mt-2 text-sm text-text-dark">{role.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-text">Criar novo usuario</h2>
            <p className="mt-1 text-sm text-text-dark">
              Link de ativacao deixa a conta pendente. Senha definida pelo admin ativa a conta imediatamente.
            </p>
          </div>

          {feedback && (
            <div
              className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-200"
                  : feedback.type === "warning"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-100"
                    : "border-red-500/30 bg-red-500/10 text-red-200"
              }`}
            >
              {feedback.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="new-user-name">
                Nome
              </label>
              <input
                id="new-user-name"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                placeholder="Nome do colaborador"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="new-user-email">
                Email
              </label>
              <input
                id="new-user-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                placeholder="colaborador@barchef.com"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="new-user-role">
                  Perfil
                </label>
                <select
                  id="new-user-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="new-user-mode">
                  Forma de acesso
                </label>
                <select
                  id="new-user-mode"
                  name="setupMode"
                  value={form.setupMode}
                  onChange={handleChange}
                  className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                >
                  {SETUP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-sm text-text-dark">
              {SETUP_OPTIONS.find((option) => option.value === form.setupMode)?.description}
            </p>

            {form.setupMode === "password" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="new-user-password">
                  Senha inicial
                </label>
                <input
                  id="new-user-password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
                  placeholder="Definida pelo admin"
                  minLength={6}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-secondary px-4 py-2 font-medium text-background transition hover:bg-secondary-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Criando usuario..." : "Criar usuario"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-text">Ultimo link de ativacao</h2>
            {latestInvitationLink ? (
              <div className="mt-4 space-y-4">
                <p className="break-all rounded-lg border border-primary/20 bg-background px-4 py-3 text-sm text-text">
                  {latestInvitationLink}
                </p>
                <button
                  type="button"
                  onClick={handleCopyInvitation}
                  className="rounded-md border border-secondary px-4 py-2 text-sm font-medium text-secondary transition hover:bg-secondary hover:text-background"
                >
                  Copiar link
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-text-dark">
                O link mais recente aparecera aqui quando um usuario for criado ou quando um novo link for gerado.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text">Usuarios cadastrados</h2>
              <button
                type="button"
                onClick={fetchUsers}
                className="rounded-md border border-primary px-3 py-2 text-sm text-text transition hover:bg-primary hover:text-background"
              >
                Atualizar
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-text-dark">Nenhum usuario cadastrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user._id} className="rounded-xl border border-primary/20 bg-background p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-text">{user.username}</p>
                        <p className="text-sm text-text-dark">{user.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-primary/20 px-3 py-1 text-text">
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                          <span className="rounded-full bg-secondary/20 px-3 py-1 text-text">
                            {STATUS_LABELS[user.status] || user.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {user.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleResendInvitation(user._id)}
                            className="rounded-md border border-secondary px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary hover:text-background"
                          >
                            Gerar novo link
                          </button>
                        )}

                        {currentUser?._id !== user._id && user.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className="rounded-md border border-primary px-3 py-2 text-xs font-medium text-text transition hover:bg-primary hover:text-background"
                          >
                            {user.status === "disabled" ? "Reativar" : "Desativar"}
                          </button>
                        )}

                        {currentUser?._id !== user._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="rounded-md border border-red-500 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500 hover:text-white"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default UserManagement
