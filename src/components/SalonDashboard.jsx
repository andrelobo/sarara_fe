import { Link } from "react-router-dom"
import TablesGrid from "./TablesGrid"
import BarChefMark from "./brand/BarChefMark"
import BarChefWordmark from "./brand/BarChefWordmark"

const SalonDashboard = () => {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,42,36,0.98),rgba(28,28,28,0.96))] p-8 shadow-[0_28px_90px_rgba(8,26,22,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,180,80,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(205,175,125,0.16),transparent_26%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <BarChefMark className="h-12 w-12" />
              <div>
                <BarChefWordmark size="sm" align="left" tone="inverse" showTagline={false} />
                <p className="mt-1 font-ui text-[0.65rem] uppercase tracking-[0.3em] text-primary/80">Salon</p>
              </div>
            </div>

            <div>
              <h1 className="font-heading text-4xl text-white sm:text-5xl">Mesas, comandas e atendimento no compasso da casa.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
                O modulo Salon organiza a operacao de sala em uma interface mais clara e continua integrada ao estoque: itens vinculados a bebidas baixam no fechamento da comanda.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/salon/tables"
              className="rounded-[1.4rem] border border-primary/30 bg-primary/10 px-5 py-4 text-sm font-ui font-semibold text-primary transition hover:bg-primary/16"
            >
              Ver todas as mesas
            </Link>
            <Link
              to="/beverages"
              className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-4 text-sm font-ui font-semibold text-white transition hover:border-primary/30 hover:bg-white/10"
            >
              Voltar ao inventario
            </Link>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/15 px-5 py-4 text-sm text-white/80">
              <p className="font-ui text-[0.65rem] uppercase tracking-[0.3em] text-primary/75">Fluxo</p>
              <p className="mt-2 font-ui font-semibold text-white">Mesa aberta, comanda ativa e auditoria em detalhe.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/15 px-5 py-4 text-sm text-white/80">
              <p className="font-ui text-[0.65rem] uppercase tracking-[0.3em] text-primary/75">Estoque</p>
              <p className="mt-2 font-ui font-semibold text-white">Baixa automatica no fechamento das comandas ligadas a bebidas.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-ui text-xs uppercase tracking-[0.35em] text-primary/80">Operacao ao vivo</p>
            <h2 className="mt-2 font-heading text-3xl text-text">Visao rapida das mesas</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-dark">
              Entre no detalhe de cada mesa para abrir comandas, acompanhar auditoria e conduzir o atendimento sem perder contexto.
            </p>
          </div>
          <Link
            to="/salon/tables"
            className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-ui font-semibold text-primary transition hover:bg-primary/16"
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
