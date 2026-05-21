import { Link } from "react-router-dom"

const variantClasses = {
  primary: "border border-primary/60 bg-primary text-background hover:bg-primary-light hover:border-primary-light",
  secondary: "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/16 hover:border-primary/45",
  ghost: "border border-white/10 bg-white/5 text-text hover:bg-white/10 hover:border-white/20",
  quiet: "border border-transparent bg-transparent text-text-dark hover:text-text hover:bg-white/5",
  danger: "border border-red-400/25 bg-red-500/10 text-red-200 hover:bg-red-500/16 hover:border-red-400/35",
}

const sizeClasses = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
  icon: "h-11 w-11",
}

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-ui font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"

const AppButton = ({
  to,
  type = "button",
  variant = "ghost",
  size = "md",
  icon = null,
  children,
  className = "",
  disabled = false,
  onClick,
  fullWidth = false,
}) => {
  const classes = [
    baseClassName,
    variantClasses[variant] || variantClasses.ghost,
    sizeClasses[size] || sizeClasses.md,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const content = (
    <>
      {icon}
      {children}
    </>
  )

  if (to) {
    return (
      <Link aria-disabled={disabled} className={classes} onClick={disabled ? (event) => event.preventDefault() : onClick} to={to}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {content}
    </button>
  )
}

export default AppButton
