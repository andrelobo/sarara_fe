const toneClasses = {
  default: "from-white/8 to-white/4",
  gold: "from-primary/18 to-primary/5",
  success: "from-emerald-500/16 to-emerald-500/5",
  danger: "from-red-500/16 to-red-500/5",
  info: "from-sky-500/16 to-sky-500/5",
}

const MetricTile = ({ label, value, hint, icon = null, tone = "default" }) => {
  return (
    <article
      className={[
        "rounded-[1.6rem] border border-white/10 bg-gradient-to-br p-5 shadow-ambient",
        toneClasses[tone] || toneClasses.default,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-ui text-[0.68rem] uppercase tracking-[0.28em] text-text-dark">{label}</p>
          <p className="mt-3 font-heading text-3xl leading-none text-text">{value}</p>
        </div>
        {icon ? <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-primary">{icon}</div> : null}
      </div>
      {hint ? <p className="mt-4 text-sm leading-6 text-text-dark">{hint}</p> : null}
    </article>
  )
}

export default MetricTile
