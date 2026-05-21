const EmptyState = ({ icon = null, title, description, action = null, compact = false }) => {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/12 bg-surface/60 text-center",
        compact ? "px-5 py-8" : "px-6 py-12",
      ].join(" ")}
    >
      {icon ? <div className="mb-4 text-2xl text-primary">{icon}</div> : null}
      <h3 className="font-ui text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-text-dark">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export default EmptyState
