import { Link } from "react-router-dom"

const BottomNav = ({ items, currentPath }) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#101815]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-2">
        {items.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`)

          return (
            <Link
              key={item.path}
              className={[
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-ui font-semibold transition",
                isActive ? "bg-primary/14 text-primary" : "text-text-dark hover:bg-white/5 hover:text-text",
              ].join(" ")}
              to={item.path}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
