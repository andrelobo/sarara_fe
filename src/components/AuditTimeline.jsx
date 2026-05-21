const EVENT_LABELS = {
  table_created: "Mesa criada",
  table_updated: "Mesa atualizada",
  table_deleted: "Mesa removida",
  table_opened: "Mesa aberta",
  table_closed: "Mesa fechada",
  command_created: "Comanda criada",
  command_attached_to_table: "Comanda vinculada a mesa",
  command_item_added: "Item adicionado",
  command_item_updated: "Item atualizado",
  command_closed: "Comanda fechada",
  command_cancelled: "Comanda cancelada",
  table_released_after_command_close: "Mesa liberada apos fechamento da comanda",
  table_released_after_command_cancel: "Mesa liberada apos cancelamento da comanda",
}

const DETAIL_LABELS = {
  number: "Numero",
  name: "Nome",
  status: "Status",
  waiterId: "Garcom",
  currentCommandId: "Comanda ativa",
  tableId: "Mesa",
  commandId: "Comanda",
  serviceTax: "Taxa de servico",
  itemCount: "Quantidade de itens",
  deductStock: "Baixa estoque",
  itemId: "Item",
  productType: "Tipo de produto",
  productId: "Produto",
  nameSnapshot: "Snapshot do nome",
  quantity: "Quantidade",
  unitPrice: "Preco unitario",
  notes: "Observacoes",
  actorName: "Usuario",
  previousStatus: "Status anterior",
  previous: "Antes",
  next: "Depois",
  previousState: "Estado anterior",
  nextState: "Estado atual",
  from: "De",
  to: "Para",
}

const formatDateTime = (value) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

const formatPrimitive = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Nao"
  }

  return String(value)
}

const formatDetailValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((entry) => formatPrimitive(entry)).join(", ") : "-"
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .filter(([, nestedValue]) => nestedValue !== undefined)
      .map(([nestedKey, nestedValue]) => `${DETAIL_LABELS[nestedKey] || nestedKey}: ${formatPrimitive(nestedValue)}`)

    return entries.length > 0 ? entries.join(" • ") : "-"
  }

  return formatPrimitive(value)
}

const AuditTimeline = ({ title, description, events = [], emptyMessage }) => {
  const sortedEvents = [...(events || [])]
    .filter(Boolean)
    .sort((firstEvent, secondEvent) => new Date(secondEvent.at || 0) - new Date(firstEvent.at || 0))

  return (
    <section className="rounded-2xl border border-primary/15 bg-background-light p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-dark">Auditoria</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">{title}</h2>
          {description ? <p className="mt-2 text-sm text-text-dark">{description}</p> : null}
        </div>
        <span className="rounded-full border border-primary/20 px-3 py-1 text-xs text-text-dark">
          {sortedEvents.length} evento(s)
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary/20 bg-background p-5 text-sm text-text-dark">
            {emptyMessage}
          </div>
        ) : (
          sortedEvents.map((event) => (
            <article key={event._id || `${event.event}-${event.at}`} className="rounded-2xl border border-primary/10 bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-text">{EVENT_LABELS[event.event] || event.event}</p>
                  <p className="mt-1 text-sm text-text-dark">
                    {event.actorName || "Sistema"} • {event.actorRole || "sem papel"}
                  </p>
                </div>
                <span className="rounded-full border border-primary/15 px-3 py-1 text-xs text-text-dark">
                  {formatDateTime(event.at)}
                </span>
              </div>

              {event.details ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {Object.entries(event.details).map(([detailKey, detailValue]) => (
                    <div key={detailKey} className="rounded-xl border border-primary/10 bg-background-light p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-dark">{DETAIL_LABELS[detailKey] || detailKey}</p>
                      <p className="mt-2 text-sm text-text">{formatDetailValue(detailValue)}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default AuditTimeline
