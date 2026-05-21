import StatusPill from "./StatusPill"

const OperationalRow = ({ leading, eyebrow, title, subtitle, meta = [], status, statusTone = "neutral", actions = null }) => {
  return (
    <article className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {leading ? <div className="mt-0.5 shrink-0">{leading}</div> : null}
        <div className="min-w-0">
          {eyebrow ? <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-text-dark">{eyebrow}</p> : null}
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h3 className="truncate font-ui text-base font-semibold text-text sm:text-lg">{title}</h3>
            {status ? <StatusPill label={status} tone={statusTone} /> : null}
          </div>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-text-dark">{subtitle}</p> : null}
          {meta.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-dark">
              {meta.map((item, index) => (
                <span key={`${title}-${index}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
    </article>
  )
}

export default OperationalRow
