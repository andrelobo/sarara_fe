import { useEffect, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  FaCarrot,
  FaChartLine,
  FaConciergeBell,
  FaGlassMartiniAlt,
  FaHome,
  FaUsers,
} from "react-icons/fa"
import BarChefMark from "../brand/BarChefMark"
import AppButton from "./AppButton"
import BottomNav from "./BottomNav"
import MobileShell from "./MobileShell"
import StatusPill from "./StatusPill"
import TopOperationalBar from "./TopOperationalBar"

const routeMeta = [
  { match: (path) => path === "/", title: "Central Operacional", subtitle: "Visao do turno, atalhos e ritmo da casa." },
  { match: (path) => path.startsWith("/salon/commands/"), title: "Comanda", subtitle: "Acompanhe itens, status e fechamento com precisao." },
  { match: (path) => path.startsWith("/salon/tables/"), title: "Mesa", subtitle: "Operacao detalhada de atendimento e comanda." },
  { match: (path) => path === "/salon/tables", title: "Mesas", subtitle: "Visao operacional do salao e distribuicao do atendimento." },
  { match: (path) => path === "/salon", title: "Salon", subtitle: "Hospitality Intelligence Platform para operacao de sala." },
  { match: (path) => path === "/beverages/new", title: "Nova bebida", subtitle: "Cadastro rapido com foco em operacao e continuidade." },
  { match: (path) => path === "/beverages/history", title: "Historico", subtitle: "Entradas, saidas e leitura de comportamento do estoque." },
  { match: (path) => path === "/beverages", title: "Bebidas", subtitle: "Lista operacional com acoes rapidas e leitura instantanea de estoque." },
  { match: (path) => path === "/ingredients/new", title: "Novo ingrediente", subtitle: "Cadastro de item de apoio para a operacao do bar e da cozinha." },
  { match: (path) => path === "/ingredients", title: "Ingredientes", subtitle: "Controle de base, apoio e componentes de producao." },
  { match: (path) => path === "/usuarios" || path === "/cadastro", title: "Usuarios", subtitle: "Criacao, acesso e ativacao de equipe sem sair do app." },
]

const AppShell = ({ children, currentUser, isAuthenticated, onLogout }) => {
  const location = useLocation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const navItems = useMemo(() => {
    if (!isAuthenticated) {
      return []
    }

    const baseItems = [
      { path: "/", name: "Home", icon: <FaHome /> },
      { path: "/salon", name: "Salon", icon: <FaConciergeBell /> },
      { path: "/beverages", name: "Bebidas", icon: <FaGlassMartiniAlt /> },
      { path: "/ingredients", name: "Ingredientes", icon: <FaCarrot /> },
      { path: "/beverages/history", name: "Historico", icon: <FaChartLine /> },
    ]

    if (currentUser?.role === "admin") {
      baseItems.push({ path: "/usuarios", name: "Usuarios", icon: <FaUsers /> })
    }

    return baseItems
  }, [currentUser?.role, isAuthenticated])

  if (!isAuthenticated) {
    return <div className="relative z-10">{children}</div>
  }

  const mobileNavItems = currentUser?.role === "admin" ? navItems.filter((item) => item.path !== "/beverages/history") : navItems
  const meta = routeMeta.find((item) => item.match(location.pathname)) || routeMeta[0]

  return (
    <div className="relative z-10 min-h-screen">
      <TopOperationalBar currentUser={currentUser} isOnline={isOnline} onLogout={onLogout} subtitle={meta.subtitle} title={meta.title} />

      <div className="mx-auto grid w-full max-w-[86rem] gap-8 lg:grid-cols-[240px,1fr] lg:px-8 lg:pt-8">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[2rem] border border-white/10 bg-surface/75 p-4 shadow-ambient">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <BarChefMark className="h-10 w-10" />
              <div>
                <p className="font-ui text-sm font-semibold text-text">BarChef OS</p>
                <p className="text-xs uppercase tracking-[0.22em] text-primary/80">Hospitality</p>
              </div>
            </div>

            <nav className="mt-5 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                return (
                  <Link
                    key={item.path}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-ui font-semibold transition",
                      isActive
                        ? "border-primary/40 bg-primary/12 text-primary"
                        : "border-transparent text-text-dark hover:border-white/10 hover:bg-white/5 hover:text-text",
                    ].join(" ")}
                    to={item.path}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/15 p-4">
              <StatusPill label={isOnline ? "Online" : "Offline"} tone={isOnline ? "success" : "offline"} />
              <p className="text-sm leading-6 text-text-dark">
                Operacao mobile-first com acoes curtas, leitura rapida e deploy automatico via GitHub quando o codigo sobe.
              </p>
              <AppButton fullWidth onClick={onLogout} variant="ghost">
                Encerrar sessao
              </AppButton>
            </div>
          </div>
        </aside>

        <MobileShell>{children}</MobileShell>
      </div>

      <BottomNav currentPath={location.pathname} items={mobileNavItems.slice(0, 5)} />
    </div>
  )
}

export default AppShell
