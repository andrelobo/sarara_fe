import { useEffect, useMemo, useState } from "react"
import { FaCopy, FaPowerOff, FaRedoAlt, FaTrash, FaUsers, FaUserShield, FaUserTie, FaUser } from "react-icons/fa"
import Swal from "sweetalert2"
import { API_BASE_URL } from "../config/api"
import { getAuthHeaders, getStoredUser } from "../utils/auth"
import AppButton from "./ui/AppButton"
import EmptyState from "./ui/EmptyState"
import MetricTile from "./ui/MetricTile"
import OperationalList from "./ui/OperationalList"
import OperationalRow from "./ui/OperationalRow"
import SearchBar from "./ui/SearchBar"

const ROLE_OPTIONS = [
  { value: "waiter", label: "Garcom", description: "Consulta bebidas, ingredientes e historicos." },
  { value: "manager", label: "Gerente", description: "Gerencia estoque, historicos e operacao do bar." },
  { value: "admin", label: "Admin", description: "Controla usuarios, permissoes e todo o inventario." },
]

const SETUP_OPTIONS = [
  { value: "invite", label: "Gerar link", description: "Cria conta pendente e gera um link de ativacao para o admin compartilhar." },
  { value: "password", label: "Definir senha", description: "Admin cria a senha inicial e ativa o usuario na hora." },
]

const STATUS_LABELS = {
  pending: "Pendente",
  active: "Ativo",
  disabled: "Desativado",
}

const STATUS_TONES = {
  pending: "warning",
  active: "success",
  disabled: "danger",
}

const ROLE_LABELS = ROLE_OPTIONS.reduce((accumulator, option) => {
  accumulator[option.value] = option.label
  return accumulator
}, {})

const ROLE_ICONS = {
  waiter: <FaUser />,
  manager: <FaUserTie />,
  admin: <FaUserShield />,
}

const emptyForm = {
  username: "",
  email: "",
  role: "waiter",
  setupMode: "invite",
  password: "",
}

const fieldClassName =
  "h-11 w-full rounded-2xl border border-white/10 bg-surface/80 px-4 text-sm text-text placeholder:text-text-dark/75 focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [latestInvitationLink, setLatestInvitationLink] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
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
      setFeedback({ type: "error", text: error.message || "Nao foi possivel carregar os usuarios." })
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

  const copyLink = async (link, successMessage = "Link copiado para a area de transferencia.") => {
    if (!link) {
      return false
    }

    try {
      await navigator.clipboard.writeText(link)
      Swal.fire("Link copiado", successMessage, "success")
      return true
    } catch (error) {
      console.error("Erro ao copiar convite:", error)
      Swal.fire("Falha ao copiar", "Nao foi possivel copiar o link automaticamente.", "error")
      return false
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.username.trim() || !form.email.trim()) {
      setFeedback({ type: "error", text: "Nome e email sao obrigatorios." })
      return
    }

    if (form.setupMode === "password" && form.password.trim().length < 6) {
      setFeedback({ type: "error", text: "Ao definir senha manualmente, use pelo menos 6 caracteres." })
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

      if (data.invitationLink) {
        await copyLink(data.invitationLink, "O link foi copiado e tambem ficou salvo no painel ao lado.")
      }

      setFeedback({
        type: "success",
        text:
          form.setupMode === "password"
            ? "Usuario criado com senha inicial definida pelo admin."
            : "Usuario criado com link de ativacao pronto para compartilhar.",
      })
    } catch (error) {
      console.error("Erro ao criar usuario:", error)
      setFeedback({ type: "error", text: error.message || "Nao foi possivel criar o usuario." })
    } finally {
      setIsSubmitting(false)
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
      if (data.invitationLink) {
        await copyLink(data.invitationLink, "Novo link copiado e exibido no painel de onboarding.")
      }
      setFeedback({ type: "success", text: "Link de ativacao regenerado com sucesso." })
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

  const filteredUsers = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()
    return users.filter((user) => {
      if (!normalizedTerm) {
        return true
      }

      return `${user.username} ${user.email} ${user.role} ${user.status}`.toLowerCase().includes(normalizedTerm)
    })
  }, [searchTerm, users])

  const pendingCount = users.filter((user) => user.status === "pending").length
  const activeCount = users.filter((user) => user.status === "active").length
  const disabledCount = users.filter((user) => user.status === "disabled").length
  const adminCount = users.filter((user) => user.role === "admin").length

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile hint="Equipe registrada no BarChef." icon={<FaUsers />} label="Usuarios" tone="gold" value={users.length} />
        <MetricTile hint="Acessos ativos e prontos para operacao." icon={<FaUserShield />} label="Ativos" tone="success" value={activeCount} />
        <MetricTile hint="Contas aguardando definicao de senha." icon={<FaRedoAlt />} label="Pendentes" tone={pendingCount > 0 ? "warning" : "info"} value={pendingCount} />
        <MetricTile hint="Quantidade de administradores no sistema." icon={<FaUserTie />} label="Admins" value={adminCount} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.88fr,1.12fr]">
        <div className="space-y-6">
          <div className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-5 shadow-ambient">
            <div className="mb-5">
              <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Onboarding</p>
              <h2 className="mt-2 font-heading text-3xl text-text">Criar novo usuario</h2>
              <p className="mt-3 text-sm leading-6 text-text-dark">
                O admin escolhe se quer ativar por link compartilhavel ou por senha definida no ato da criacao.
              </p>
            </div>

            {feedback ? (
              <div
                className={[
                  "mb-4 rounded-2xl border px-4 py-3 text-sm",
                  feedback.type === "success"
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                    : "border-red-400/25 bg-red-500/10 text-red-200",
                ].join(" ")}
              >
                {feedback.text}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm text-text-dark" htmlFor="new-user-name">Nome</label>
                <input className={fieldClassName} id="new-user-name" name="username" onChange={handleChange} placeholder="Nome do colaborador" required type="text" value={form.username} />
              </div>

              <div>
                <label className="mb-2 block text-sm text-text-dark" htmlFor="new-user-email">Email</label>
                <input className={fieldClassName} id="new-user-email" name="email" onChange={handleChange} placeholder="colaborador@barchef.com" required type="email" value={form.email} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-text-dark" htmlFor="new-user-role">Perfil</label>
                  <select className={fieldClassName} id="new-user-role" name="role" onChange={handleChange} value={form.role}>
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-dark" htmlFor="new-user-mode">Forma de acesso</label>
                  <select className={fieldClassName} id="new-user-mode" name="setupMode" onChange={handleChange} value={form.setupMode}>
                    {SETUP_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-text-dark">
                {SETUP_OPTIONS.find((option) => option.value === form.setupMode)?.description}
              </div>

              {form.setupMode === "password" ? (
                <div>
                  <label className="mb-2 block text-sm text-text-dark" htmlFor="new-user-password">Senha inicial</label>
                  <input className={fieldClassName} id="new-user-password" minLength={6} name="password" onChange={handleChange} placeholder="Definida pelo admin" required type="password" value={form.password} />
                </div>
              ) : null}

              <AppButton disabled={isSubmitting} fullWidth icon={<FaUsers />} type="submit" variant="primary">
                {isSubmitting ? "Criando usuario..." : "Criar usuario"}
              </AppButton>
            </form>
          </div>

          <div className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-5 shadow-ambient">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Link mais recente</p>
                <h2 className="mt-2 font-heading text-2xl text-text">Painel de ativacao</h2>
              </div>
              {latestInvitationLink ? (
                <AppButton icon={<FaCopy />} onClick={() => copyLink(latestInvitationLink)} size="sm" variant="secondary">
                  Copiar
                </AppButton>
              ) : null}
            </div>

            {latestInvitationLink ? (
              <div className="mt-4 break-all rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-sm leading-6 text-text">
                {latestInvitationLink}
              </div>
            ) : (
              <EmptyState compact description="Quando um usuario for criado por link ou receber um novo convite, a URL aparecera aqui pronta para copiar." icon={<FaCopy />} title="Nenhum link gerado nesta sessao" />
            )}
          </div>
        </div>

        <OperationalList
          action={<AppButton icon={<FaRedoAlt />} onClick={fetchUsers} variant="ghost">Atualizar</AppButton>}
          description="Lista operacional de equipe com ativacao, bloqueio e exclusao no mesmo fluxo."
          title="Equipe cadastrada"
        >
          <div className="border-b border-white/8 px-4 py-4 sm:px-5">
            <SearchBar onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nome, email, perfil ou status" value={searchTerm} />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 sm:p-5">
              <EmptyState description="Ajuste a busca ou crie o primeiro usuario por convite ou senha direta." icon={<FaUsers />} title="Nenhum usuario encontrado" />
            </div>
          ) : (
            filteredUsers.map((user) => (
              <OperationalRow
                key={user._id}
                actions={
                  <>
                    {user.status === "pending" ? (
                      <AppButton icon={<FaRedoAlt />} onClick={() => handleResendInvitation(user._id)} size="sm" variant="ghost">
                        Novo link
                      </AppButton>
                    ) : null}
                    {currentUser?._id !== user._id && user.role !== "admin" ? (
                      <AppButton icon={<FaPowerOff />} onClick={() => handleToggleStatus(user)} size="sm" variant="ghost">
                        {user.status === "disabled" ? "Reativar" : "Desativar"}
                      </AppButton>
                    ) : null}
                    {currentUser?._id !== user._id ? (
                      <AppButton icon={<FaTrash />} onClick={() => handleDeleteUser(user)} size="sm" variant="danger">
                        Excluir
                      </AppButton>
                    ) : null}
                  </>
                }
                eyebrow={ROLE_LABELS[user.role] || user.role}
                leading={
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    {ROLE_ICONS[user.role] || <FaUser />}
                  </div>
                }
                meta={[user.email, STATUS_LABELS[user.status] || user.status, user.permissions?.length ? `${user.permissions.length} permissoes` : "Perfil herdado"]}
                status={STATUS_LABELS[user.status] || user.status}
                statusTone={STATUS_TONES[user.status] || "neutral"}
                subtitle="Fluxo de acesso sem email: link para copiar ou senha inicial definida pelo admin."
                title={user.username}
              />
            ))
          )}
        </OperationalList>
      </section>
    </div>
  )
}

export default UserManagement
