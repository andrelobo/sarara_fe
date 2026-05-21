import { useId } from "react"
import { barchefColors } from "../../brand/barchefTheme"

const BarChefMark = ({ className = "", title = "BarChef" }) => {
  const gradientId = useId()
  const glowId = useId()

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#173a32" />
          <stop offset="65%" stopColor={barchefColors.brand.green} />
          <stop offset="100%" stopColor="#081A16" />
        </radialGradient>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="rgba(8, 26, 22, 0.45)" />
        </filter>
      </defs>

      <g filter={`url(#${glowId})`}>
        <circle cx="100" cy="100" r="93" fill="rgba(8, 26, 22, 0.7)" />
        <circle cx="100" cy="100" r="90" fill={`url(#${gradientId})`} stroke={barchefColors.brand.gold} strokeWidth="5" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(230, 180, 80, 0.12)" strokeWidth="1.5" />

        <text
          x="42"
          y="108"
          fill={barchefColors.brand.gold}
          fontFamily="Manrope, sans-serif"
          fontSize="16"
          fontWeight="700"
          letterSpacing="2.6"
          textAnchor="middle"
        >
          EST.
        </text>
        <text
          x="156"
          y="108"
          fill={barchefColors.brand.gold}
          fontFamily="Manrope, sans-serif"
          fontSize="16"
          fontWeight="700"
          letterSpacing="2.6"
          textAnchor="middle"
        >
          2024
        </text>

        <g stroke={barchefColors.brand.gold} strokeLinecap="round" strokeLinejoin="round">
          <path d="M78 73c0-14 10-24 22-24 8 0 15 4 20 11 4-7 11-11 19-11 14 0 24 11 24 25 0 12-9 22-20 22-6 0-11-2-15-6" fill="none" strokeWidth="6" />
          <path d="M77 73c0-14 11-24 25-24" fill="none" strokeWidth="6" />
          <path d="M84 73c0-14-10-24-24-24-14 0-24 11-24 25 0 12 9 22 20 22 7 0 13-3 17-8" fill="none" strokeWidth="6" />
          <path d="M75 97v34c0 0 13 6 34 6 21 0 32-6 32-6V97" fill="none" strokeWidth="6" />
          <path d="M105 116h16" fill="none" strokeWidth="6" />
        </g>

        <g fill={barchefColors.brand.gold}>
          <path d="M69 146c8 0 17 5 23 12l-13 9c-4 3-10 0-10-5z" />
          <path d="M131 146c-8 0-17 5-23 12l13 9c4 3 10 0 10-5z" />
          <rect x="92" y="151" width="16" height="16" rx="6" />
        </g>
      </g>
    </svg>
  )
}

export default BarChefMark
