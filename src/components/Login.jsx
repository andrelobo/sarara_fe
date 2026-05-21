import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaConciergeBell, FaShieldAlt, FaWifi } from "react-icons/fa"
import Swal from "sweetalert2"
import { API_BASE_URL } from "../config/api"
import BarChefLogo from "./brand/BarChefLogo"
import { saveToken, getToken } from "../utils/db"

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkOfflineAccess = async () => {
      if (!navigator.onLine) {
        const token = await getToken()
        if (token) {
          Swal.fire({
            icon: "info",
            title: "Modo Offline",
            text: "Voce esta offline, mas pode acessar funcionalidades limitadas.",
          }).then(() => navigate("/beverages"))
        } else {
          Swal.fire({
            icon: "warning",
            title: "Sem conexao",
            text: "Voce precisa estar online para fazer login.",
          })
        }
      }
    }

    checkOfflineAccess()
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!navigator.onLine) {
      Swal.fire({ icon: "warning", title: "Sem conexao", text: "Voce precisa estar online para fazer login." })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          Swal.fire({ icon: "warning", title: "Credenciais incorretas", text: "Por favor, verifique seu email e senha." })
        } else if (response.status === 403) {
          Swal.fire({ icon: "warning", title: "Acesso bloqueado", text: data.error || data.message || "Sua conta ainda nao esta liberada para uso." })
        } else {
          Swal.fire({ icon: "error", title: "Erro ao fazer login", text: data.error || data.message || "Por favor, tente novamente." })
        }
        return
      }

      const { accessToken, user } = data
      if (!accessToken) {
        Swal.fire({ icon: "error", title: "Erro ao fazer login", text: "Token nao recebido. Por favor, tente novamente." })
        return
      }

      await saveToken(accessToken)
      onLogin(accessToken, user)

      Swal.fire({ icon: "success", title: "Login realizado com sucesso!", text: "Bem-vindo de volta!", confirmButtonText: "Ok" }).then(() => navigate("/"))
    } catch (error) {
      console.error("Erro de rede:", error)
      Swal.fire({ icon: "error", title: "Erro de rede", text: "Por favor, tente novamente mais tarde." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center py-4">
      <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,42,36,0.98),rgba(28,28,28,0.98))] shadow-[0_35px_120px_rgba(8,26,22,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,180,80,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(205,175,125,0.16),transparent_30%)]" />
        <div className="relative grid lg:grid-cols-[1.08fr,0.92fr]">
          <div className="hidden flex-col justify-between p-10 lg:flex">
            <div className="space-y-8">
              <BarChefLogo size="lg" tone="inverse" />
              <div className="max-w-xl space-y-4">
                <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary/80">Hospitality intelligence</p>
                <h1 className="font-heading text-5xl leading-tight text-white">Operacao de bar e restaurante com cara de produto premium.</h1>
                <p className="max-w-lg text-base leading-7 text-white/72">Acesso rapido para estoque, equipe e Salon em uma interface pensada para uso real em celular e tablet.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><FaShieldAlt className="text-lg text-primary" /><h2 className="mt-3 font-ui text-sm font-semibold text-white">Perfis protegidos</h2><p className="mt-2 text-sm leading-6 text-white/70">Admin, gerente e garcom com acessos separados.</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><FaConciergeBell className="text-lg text-primary" /><h2 className="mt-3 font-ui text-sm font-semibold text-white">Salon ativo</h2><p className="mt-2 text-sm leading-6 text-white/70">Mesas, comandas e atendimento com foco em continuidade.</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><FaWifi className="text-lg text-primary" /><h2 className="mt-3 font-ui text-sm font-semibold text-white">Camada offline</h2><p className="mt-2 text-sm leading-6 text-white/70">Inventario local e fila de sincronizacao sem mudar a regra atual.</p></div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex justify-center lg:hidden"><BarChefLogo size="md" tone="inverse" /></div>
            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 backdrop-blur sm:p-8">
              <div className="mb-8 space-y-3"><p className="font-ui text-xs uppercase tracking-[0.4em] text-primary/85">Acesso seguro</p><h2 className="font-heading text-3xl text-text">Entrar na operacao</h2><p className="text-sm leading-6 text-text-dark">Use seu email e senha para acessar o painel operacional do BarChef.</p></div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-ui font-semibold text-text-dark" htmlFor="email-address">Email</label>
                  <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text placeholder:text-text-dark/80 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" disabled={isLoading} id="email-address" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="colaborador@barchef.com" required type="email" value={email} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-ui font-semibold text-text-dark" htmlFor="password">Senha</label>
                  <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text placeholder:text-text-dark/80 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" disabled={isLoading} id="password" name="password" onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" required type="password" value={password} />
                </div>
                <button className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 font-ui text-sm font-bold uppercase tracking-[0.22em] text-background transition hover:bg-[#f0c56a] disabled:cursor-not-allowed disabled:opacity-70" disabled={isLoading} type="submit">
                  {isLoading ? "Carregando..." : "Entrar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
