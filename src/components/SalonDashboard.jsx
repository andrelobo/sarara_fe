import { Link } from "react-router-dom"
import { FaConciergeBell, FaGlassMartiniAlt, FaReceipt, FaTable } from "react-icons/fa"
import TablesGrid from "./TablesGrid"
import AppButton from "./ui/AppButton"
import MetricTile from "./ui/MetricTile"

const SalonDashboard = () => {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[1.9rem] border border-white/10 bg-surface/70 p-6 shadow-ambient">
          <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-primary/80">Salon</p>
          <h1 className="mt-2 font-heading text-4xl text-text">Operacao de sala com leitura rapida e acoes curtas.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-text-dark">
            O modulo Salon segue a mesma direcao do novo frontend: interface leve, operacional e pensada para garcom e gerente em fluxo real.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <AppButton icon={<FaTable />} to="/salon/tables" variant="secondary">Ver mesas</AppButton>
            <AppButton icon={<FaGlassMartiniAlt />} to="/beverages" variant="ghost">Voltar ao inventario</AppButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <MetricTile hint="Abertura, detalhe e fechamento com foco em continuidade." icon={<FaTable />} label="Mesas" tone="info" value="Live" />
          <MetricTile hint="Itens de comanda podem acionar baixa de bebida no fechamento." icon={<FaReceipt />} label="Comandas" tone="gold" value="Stock-aware" />
          <MetricTile hint="Experiencia pronta para celular, com shell operacional consistente." icon={<FaConciergeBell />} label="Experiencia" value="Mobile-first" />
        </div>
      </section>

      <TablesGrid compact limit={6} />

      <div className="flex justify-end">
        <Link className="text-sm text-text-dark transition hover:text-primary" to="/salon/tables">
          Abrir painel completo de mesas
        </Link>
      </div>
    </div>
  )
}

export default SalonDashboard
