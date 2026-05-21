import { FaSearch } from "react-icons/fa"

const SearchBar = ({ value, onChange, placeholder = "Buscar...", className = "", inputClassName = "" }) => {
  return (
    <label className={["relative block", className].filter(Boolean).join(" ")}>
      <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-dark" />
      <input
        className={[
          "h-11 w-full rounded-2xl border border-white/10 bg-surface/80 pl-11 pr-4 text-sm text-text placeholder:text-text-dark/75 focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20",
          inputClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  )
}

export default SearchBar
