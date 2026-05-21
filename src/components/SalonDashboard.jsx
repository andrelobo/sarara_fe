import { Link } from "react-router-dom"
import TablesGrid from "./TablesGrid"

const SalonDashboard = () => {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(248,180,49,0.18),_transparent_40%),linear-gradient(135deg,_rgba(17,24,39,0.96),_rgba(31,41,55,0.96))] p-8 shadow-xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">BarChef OS Salon</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Operação de salão com foco em continuidade</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200/80">
              Este painel é o ponto de partida para mesas, comandas e fluxo mobile do garçom. A base já conversa com o
              backend de mesas e comandas sem tocar ainda no estoque.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/salon/tables"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Ver todas as mesas
            </Link>
            <Link
              to="/beverages"
              className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
            >
              Voltar ao inventário
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text">Visão rápida das mesas</h2>
            <p className="text-sm text-text-dark">Use as mesas abaixo para entrar no detalhe do atendimento.</p>
          </div>
          <Link
            to="/salon/tables"
            className="rounded-md border border-primary px-4 py-2 text-sm text-text transition hover:bg-primary hover:text-background"
          >
            Abrir painel completo
          </Link>
        </div>

        <TablesGrid compact limit={6} />
      </section>
    </div>
  )
}

export default SalonDashboard
