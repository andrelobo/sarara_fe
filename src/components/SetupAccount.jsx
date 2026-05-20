import { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import Swal from "sweetalert2"
import { saveToken } from "../utils/db"
import { API_BASE_URL } from "../config/api"

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
        title: "Link inválido",
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
        title: "Falha na ativação",
        text: error.message || "Nao foi possivel concluir a ativacao da conta.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-primary/20 bg-background-light p-8 shadow-lg">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-secondary">Ativar conta</h1>
        <p className="text-text-dark">
          Defina sua senha para concluir o acesso ao Sarara BarChef.
        </p>
      </div>

      {!invitationToken ? (
        <div className="space-y-4 rounded-xl border border-error/30 bg-error/10 p-6 text-center text-text">
          <p>O link de ativação não contém um token válido.</p>
          <Link className="inline-flex rounded-md bg-secondary px-4 py-2 text-background" to="/login">
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="setup-username">
              Nome de exibição
            </label>
            <input
              id="setup-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              placeholder="Como você deseja aparecer no sistema"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="setup-password">
              Senha
            </label>
            <input
              id="setup-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              placeholder="Minimo de 6 caracteres"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-dark" htmlFor="setup-confirm-password">
              Confirmar senha
            </label>
            <input
              id="setup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-md border border-primary bg-background px-3 py-2 text-text focus:border-secondary focus:outline-none"
              placeholder="Repita a senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-secondary px-4 py-2 font-medium text-background transition hover:bg-secondary-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Ativando..." : "Ativar conta"}
          </button>
        </form>
      )}
    </div>
  )
}

export default SetupAccount
