import { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import Swal from "sweetalert2"
import { saveToken } from "../utils/db"
import { API_BASE_URL } from "../config/api"
import BarChefLogo from "./brand/BarChefLogo"

const SetupAccount = ({ onSetupSuccess }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const invitationToken = useMemo(() => searchParams.get("token") || "", [searchParams])

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!invitationToken) {
      Swal.fire({
        icon: "error",
        title: "Link invalido",
        text: "O link de ativacao esta incompleto ou expirado.",
      })
      return
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Senha muito curta",
        text: "Use pelo menos 6 caracteres para ativar a conta.",
      })
      return
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Senhas diferentes",
        text: "Confirme a mesma senha nos dois campos.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/setup-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: invitationToken,
          password,
          username: username.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Nao foi possivel ativar a conta")
      }

      await saveToken(data.accessToken)
      onSetupSuccess(data.accessToken, data.user)

      Swal.fire({
        icon: "success",
        title: "Conta ativada",
        text: "Sua conta foi ativada com sucesso.",
      }).then(() => navigate("/beverages"))
    } catch (error) {
      console.error("Erro ao ativar conta:", error)
      Swal.fire({
        icon: "error",
        title: "Falha na ativacao",
        text: error.message || "Nao foi possivel concluir a ativacao da conta.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-3xl items-center justify-center py-4">
      <div className="w-full rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,42,36,0.98),rgba(28,28,28,0.96))] p-6 shadow-[0_30px_90px_rgba(8,26,22,0.45)] sm:p-8">
        <div className="mb-8 space-y-5 text-center">
          <BarChefLogo size="md" tone="inverse" />
          <div className="space-y-2">
            <h1 className="font-heading text-3xl text-white">Ativar conta</h1>
            <p className="mx-auto max-w-xl text-sm leading-6 text-white/74">
              Defina sua senha para concluir o acesso ao BarChef e entrar na operacao com o perfil liberado pelo admin.
            </p>
          </div>
        </div>

        {!invitationToken ? (
          <div className="space-y-4 rounded-[1.5rem] border border-error/30 bg-error/10 p-6 text-center text-text">
            <p>O link de ativacao nao contem um token valido.</p>
            <Link className="inline-flex rounded-full bg-primary px-5 py-3 font-ui font-semibold text-background" to="/login">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form className="space-y-5 rounded-[1.5rem] border border-white/10 bg-black/15 p-6 sm:p-8" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-ui font-semibold text-text-dark" htmlFor="setup-username">
                Nome de exibicao
              </label>
              <input
                id="setup-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text placeholder:text-text-dark/80 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Como voce deseja aparecer no sistema"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-ui font-semibold text-text-dark" htmlFor="setup-password">
                Senha
              </label>
              <input
                id="setup-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text placeholder:text-text-dark/80 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Minimo de 6 caracteres"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-ui font-semibold text-text-dark" htmlFor="setup-confirm-password">
                Confirmar senha
              </label>
              <input
                id="setup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text placeholder:text-text-dark/80 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Repita a senha"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 font-ui text-sm font-bold uppercase tracking-[0.22em] text-background transition hover:bg-[#f0c56a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ativando..." : "Ativar conta"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default SetupAccount
