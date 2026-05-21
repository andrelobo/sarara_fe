const OperationalList = ({ title, description, action = null, children, className = "" }) => {
  return (
    <section className={className}>
      {(title || description || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title ? <h2 className="font-heading text-2xl text-text">{title}</h2> : null}
            {description ? <p className="mt-2 text-sm leading-6 text-text-dark">{description}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      )}

      <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-surface/70 shadow-ambient [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-white/8">
        {children}
      </div>
    </section>
  )
}

export default OperationalList
