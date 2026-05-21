import { FaPowerOff, FaWifi } from "react-icons/fa"
import BarChefMark from "../brand/BarChefMark"
import AppButton from "./AppButton"
import StatusPill from "./StatusPill"

const roleLabels = {
  admin: "Admin",
  manager: "Gerente",
  waiter: "Garcom",
}

const TopOperationalBar = ({ title, subtitle, currentUser, isOnline, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[86rem] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-surface/85 p-2 shadow-ambient">
            <BarChefMark className="h-10 w-10" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-heading text-xl text-text sm:text-2xl">{title}</p>
            {subtitle ? <p className="mt-1 truncate text-sm text-text-dark">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <StatusPill label={isOnline ? "Online" : "Offline"} tone={isOnline ? "success" : "offline"} />

          {currentUser ? (
            <div className="hidden rounded-2xl border border-white/10 bg-surface/75 px-4 py-2 text-right sm:block">
              <p className="font-ui text-sm font-semibold text-text">{currentUser.username}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-primary/80">{roleLabels[currentUser.role] || currentUser.role}</p>
            </div>
          ) : null}

          <AppButton className="hidden sm:inline-flex" icon={<FaPowerOff />} onClick={onLogout} variant="ghost">
            Sair
          </AppButton>
          <div className="sm:hidden">
            <AppButton icon={isOnline ? <FaWifi /> : <FaPowerOff />} onClick={onLogout} size="icon" variant="ghost" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopOperationalBar
