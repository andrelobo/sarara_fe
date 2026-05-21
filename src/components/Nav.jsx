import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  FaBan,
  FaBars,
  FaCarrot,
  FaChartLine,
  FaConciergeBell,
  FaGlassMartiniAlt,
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
  FaWifi,
} from "react-icons/fa"
import BarChefMark from "./brand/BarChefMark"
import BarChefWordmark from "./brand/BarChefWordmark"

const roleLabels = {
  admin: "Admin",
  manager: "Gerente",
  waiter: "Garcom",
}

const Nav = ({ isAuthenticated, currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const location = useLocation()
  const isAdmin = currentUser?.role === "admin"

  const isItemActive = (path) => {
    if (path === "/") {
      return location.pathname === "/"
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

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

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const navItems = isAuthenticated
    ? [
        { path: "/", name: "Home", icon: <FaHome /> },
        { path: "/salon", name: "Salon", icon: <FaConciergeBell /> },
        { path: "/beverages", name: "Bebidas", icon: <FaGlassMartiniAlt /> },
        { path: "/ingredients", name: "Ingredientes", icon: <FaCarrot /> },
        { path: "/beverages/history", name: "Historico", icon: <FaChartLine /> },
        ...(isAdmin ? [{ path: "/usuarios", name: "Usuarios", icon: <FaUsers /> }] : []),
      ]
    : []

  const authItems = isAuthenticated
    ? [{ name: "Logout", icon: <FaSignOutAlt />, onClick: onLogout }]
    : [{ path: "/login", name: "Login", icon: <FaSignInAlt /> }]

  const renderAction = (item, mobile = false) => {
    const baseClass = mobile
      ? "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-text transition hover:border-primary/40 hover:bg-white/10"
      : "inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-text transition hover:border-primary/40 hover:bg-white/10"

    if (item.path) {
      return (
        <Link key={item.path} to={item.path} className={baseClass}>
          {item.icon}
          <span>{item.name}</span>
        </Link>
      )
    }

    return (
      <button key={item.name} onClick={() => item.onClick?.()} className={baseClass} type="button">
        {item.icon}
        <span>{item.name}</span>
      </button>
    )
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-surface/80 px-3 py-2 shadow-lg shadow-black/20 transition hover:border-primary/40 hover:bg-surface"
          >
            <BarChefMark className="h-11 w-11 shrink-0" />
            <BarChefWordmark className="hidden sm:flex" size="sm" align="left" tone="inverse" showTagline={false} />
          </Link>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-ui font-semibold transition",
                    isItemActive(item.path)
                      ? "border-primary/60 bg-primary/14 text-primary shadow-[0_12px_30px_rgba(230,180,80,0.12)]"
                      : "border-white/10 bg-white/5 text-text hover:border-primary/35 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-ui font-semibold uppercase tracking-[0.24em]",
              isOnline ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300" : "border-red-400/25 bg-red-500/10 text-red-300",
            ].join(" ")}
            title={isOnline ? "Online" : "Offline"}
          >
            {isOnline ? <FaWifi /> : <FaBan />}
            {isOnline ? "Online" : "Offline"}
          </span>

          {isAuthenticated && currentUser ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-text">
              <span className="font-ui font-semibold">{currentUser.username}</span>
              <span className="text-primary/90">{roleLabels[currentUser.role] || currentUser.role}</span>
            </span>
          ) : null}

          {authItems.map((item) => renderAction(item))}
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-surface/80 p-3 text-text transition hover:border-primary/40 hover:text-primary lg:hidden"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Abrir menu principal</span>
          {isOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
        </button>
      </div>

      <div className={["border-t border-white/10 bg-background/95 lg:hidden", isOpen ? "block" : "hidden"].join(" ")} id="mobile-menu">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="font-ui text-sm font-semibold text-text">{currentUser.username}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-primary/85">
                  {roleLabels[currentUser.role] || currentUser.role}
                </p>
              </div>
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-ui font-semibold uppercase tracking-[0.24em]",
                  isOnline ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300" : "border-red-400/25 bg-red-500/10 text-red-300",
                ].join(" ")}
              >
                {isOnline ? <FaWifi /> : <FaBan />}
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <BarChefMark className="h-10 w-10" />
                <p className="font-ui text-sm text-text">Acesso seguro para estoque, usuarios e Salon.</p>
              </div>
            </div>
          )}

          {navItems.length ? (
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-ui font-semibold transition",
                    isItemActive(item.path)
                      ? "border-primary/60 bg-primary/14 text-primary"
                      : "border-white/10 bg-white/5 text-text hover:border-primary/35 hover:bg-white/10",
                  ].join(" ")}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          ) : null}

          <div className="grid gap-2">{authItems.map((item) => renderAction(item, true))}</div>
        </div>
      </div>
    </nav>
  )
}

export default Nav
