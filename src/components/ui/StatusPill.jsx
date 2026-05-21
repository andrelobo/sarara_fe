const toneClasses = {
  neutral: "border-white/10 bg-white/5 text-text-dark",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  warning: "border-primary/30 bg-primary/12 text-primary",
  danger: "border-red-400/20 bg-red-500/10 text-red-200",
  info: "border-sky-400/20 bg-sky-500/10 text-sky-200",
  offline: "border-violet-400/20 bg-violet-500/10 text-violet-200",
}

const StatusPill = ({ label, tone = "neutral", className = "" }) => {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-ui font-semibold uppercase tracking-[0.24em]",
        toneClasses[tone] || toneClasses.neutral,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  )
}

export default StatusPill
