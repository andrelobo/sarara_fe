import BarChefMark from "./BarChefMark"
import BarChefWordmark from "./BarChefWordmark"

const markSizeClasses = {
  sm: "h-14 w-14 sm:h-16 sm:w-16",
  md: "h-20 w-20 sm:h-24 sm:w-24",
  lg: "h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36",
}

const wrapperClasses = {
  stacked: "flex-col items-center text-center",
  horizontal: "flex-row items-center text-left",
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-5",
}

const BarChefLogo = ({
  className = "",
  size = "md",
  variant = "stacked",
  tone = "default",
  showTagline = true,
}) => {
  const selectedWrapper = wrapperClasses[variant] || wrapperClasses.stacked
  const selectedGap = gapClasses[size] || gapClasses.md
  const selectedMarkSize = markSizeClasses[size] || markSizeClasses.md

  return (
    <div className={["inline-flex", selectedWrapper, selectedGap, className].filter(Boolean).join(" ")}>
      <BarChefMark className={selectedMarkSize} />
      <BarChefWordmark
        size={size}
        align={variant === "horizontal" ? "left" : "center"}
        tone={tone}
        showTagline={showTagline}
      />
    </div>
  )
}

export default BarChefLogo
