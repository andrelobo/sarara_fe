import { barchefTagline } from "../../brand/barchefTheme"

const sizeClasses = {
  sm: {
    name: "text-3xl sm:text-4xl",
    tagline: "text-[0.58rem] sm:text-[0.65rem]",
  },
  md: {
    name: "text-4xl sm:text-5xl",
    tagline: "text-[0.62rem] sm:text-[0.72rem]",
  },
  lg: {
    name: "text-5xl sm:text-6xl lg:text-7xl",
    tagline: "text-[0.72rem] sm:text-[0.8rem] lg:text-[0.92rem]",
  },
}

const alignClasses = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
}

const toneClasses = {
  default: {
    name: "text-text",
    tagline: "text-primary",
  },
  inverse: {
    name: "text-white",
    tagline: "text-primary",
  },
  muted: {
    name: "text-secondary",
    tagline: "text-secondary/85",
  },
}

const BarChefWordmark = ({
  className = "",
  size = "md",
  align = "center",
  tone = "default",
  showTagline = true,
}) => {
  const selectedSize = sizeClasses[size] || sizeClasses.md
  const selectedAlign = alignClasses[align] || alignClasses.center
  const selectedTone = toneClasses[tone] || toneClasses.default

  return (
    <div className={["flex flex-col gap-1", selectedAlign, className].filter(Boolean).join(" ")}>
      <span className={["font-logo leading-none tracking-[-0.04em]", selectedSize.name, selectedTone.name].join(" ")}>
        BarChef
      </span>
      {showTagline ? (
        <span
          className={[
            "font-ui uppercase leading-tight tracking-[0.34em]",
            selectedSize.tagline,
            selectedTone.tagline,
          ].join(" ")}
        >
          {barchefTagline}
        </span>
      ) : null}
    </div>
  )
}

export default BarChefWordmark
