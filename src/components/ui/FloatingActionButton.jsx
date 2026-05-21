import AppButton from "./AppButton"

const FloatingActionButton = ({ to, icon, label, onClick }) => {
  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 z-40 lg:bottom-8 lg:right-8">
      <AppButton className="rounded-full px-5 shadow-[0_20px_40px_rgba(8,26,22,0.45)]" icon={icon} onClick={onClick} to={to} variant="primary">
        {label}
      </AppButton>
    </div>
  )
}

export default FloatingActionButton
