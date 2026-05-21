import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { FaBoxes, FaCarrot, FaChartLine, FaConciergeBell, FaExclamationTriangle, FaGlassMartiniAlt, FaUsers } from "react-icons/fa"
import { API_BASE_URL } from "../config/api"
import { useOffline } from "../context/OfflineContext"
import { useOfflineData } from "../hooks/useOfflineData"
import { getAuthHeaders, getStoredUser, hasRole } from "../utils/auth"
import AppButton from "./ui/AppButton"
import MetricTile from "./ui/MetricTile"
import OperationalList from "./ui/OperationalList"
import OperationalRow from "./ui/OperationalRow"
import StatusPill from "./ui/StatusPill"

const HomeDashboard = () => {
  const currentUser = useMemo(() => getStoredUser(), [])
  const { online, syncing } = useOffline()
  const { data: beverages } = useOfflineData("beverages")
  const { data: ingredients } = useOfflineData("ingredients")
  const [tables, setTables] = useState([])

  const canManageInventory = hasRole(currentUser, ["admin", "manager"])
  const canAccessSalon = hasRole(currentUser, ["admin", "manager", "waiter"])
  const isAdmin = hasRole(currentUser, ["admin"])

  useEffect(() => {
    const fetchTables = async () => {
      if (!canAccessSalon || !navigator.onLine) {
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/tables`, {
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
        })

        const data = await response.json().catch(() => [])
        if (response.ok) {
          setTables(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Erro ao carregar mesas para a home:", error)
      }
    }

    fetchTables()
  }, [canAccessSalon])

  const lowStockBeverages = beverages.filter((item) => Number(item.quantity) <= 5)
  const lowStockIngredients = ingredients.filter((item) => Number(item.quantity) <= 5)
  const activeTables = tables.filter((table) => table.status && table.status !== "free")
  const criticalCount = lowStockBeverages.length + lowStockIngredients.length

  const quickActions = [
    { label: canAccessSalon ? "Abrir Salon" : "Ver bebidas", to: canAccessSalon ? "/salon" : "/beverages", icon: canAccessSalon ? <FaConciergeBell /> : <FaGlassMartiniAlt /> },
    { label: "Bebidas", to: "/beverages", icon: <FaGlassMartiniAlt /> },
    { label: "Ingredientes", to: "/ingredients", icon: <FaCarrot /> },
    { label: "Historico", to: "/beverages/history", icon: <FaChartLine /> },
  ]

  if (isAdmin) {
    quickActions.push({ label: "Usuarios", to: "/usuarios", icon: <FaUsers /> })
  }

  if (canManageInventory) {
    quickActions.push({ label: "Nova bebida", to: "/beverages/new", icon: <FaBoxes /> })
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile hint="Catalogo operacional disponivel no app e offline." icon={<FaGlassMartiniAlt />} label="Bebidas" tone="gold" value={beverages.length} />
        <MetricTile hint="Base de apoio para bar e cozinha." icon={<FaCarrot />} label="Ingredientes" value={ingredients.length} />
        <MetricTile
          hint={criticalCount > 0 ? "Itens com quantidade baixa pedem atencao." : "Sem gargalos criticos detectados agora."}
          icon={<FaExclamationTriangle />}
          label="Estoque critico"
          tone={criticalCount > 0 ? "danger" : "success"}
          value={criticalCount}
        />
        <MetricTile
          hint={canAccessSalon ? "Mesas em uso ou em fechamento neste turno." : "Perfil sem acesso operacional ao Salon."}
          icon={<FaConciergeBell />}
          label="Mesas em operacao"
          tone="info"
          value={canAccessSalon ? activeTables.length : "-"}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-5 shadow-ambient">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-ui text-[0.7rem] uppercase tracking-[0.3em] text-primary/80">Turno</p>
              <h2 className="mt-2 font-heading text-3xl text-text">Controle elegante de uma operacao real</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-dark">
                O BarChef agora se comporta como um app operacional: acoes curtas, leitura instantanea e foco em ritmo de atendimento.
              </p>
            </div>
            <StatusPill label={online ? (syncing ? "Sincronizando" : "Online") : "Offline"} tone={online ? (syncing ? "warning" : "success") : "offline"} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <AppButton key={action.to} icon={action.icon} to={action.to} variant="ghost">
                {action.label}
              </AppButton>
            ))}
          </div>
        </div>

        <OperationalList
          description="Leitura rapida do momento sem sair da home."
          title="Resumo operacional"
        >
          <OperationalRow
            eyebrow="Rede"
            meta={[online ? "Conexao estavel" : "Modo offline ativo"]}
            status={online ? (syncing ? "Sincronizando" : "Online") : "Offline"}
            statusTone={online ? (syncing ? "warning" : "success") : "offline"}
            subtitle="A camada offline continua cobrindo o inventario enquanto o Salon permanece online-only."
            title="Estado da operacao"
          />
          <OperationalRow
            eyebrow="Estoque"
            meta={[`${lowStockBeverages.length} bebidas criticas`, `${lowStockIngredients.length} ingredientes criticos`]}
            status={criticalCount > 0 ? "Atencao" : "Estavel"}
            statusTone={criticalCount > 0 ? "warning" : "success"}
            subtitle="Use as listas operacionais para agir rapido sobre quantidades baixas."
            title="Pulso do inventario"
          />
          <OperationalRow
            eyebrow="Equipe"
            meta={[isAdmin ? "Gestao completa" : "Acesso operacional", canAccessSalon ? "Salon habilitado" : "Sem Salon"]}
            status={currentUser?.role || "user"}
            statusTone="info"
            subtitle="Perfis continuam separados por admin, gerente e garcom, sem alterar contratos de autenticacao."
            title="Modelo de acesso"
          />
        </OperationalList>
      </section>
    </div>
  )
}

export default HomeDashboard
