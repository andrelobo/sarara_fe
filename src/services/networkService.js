let online = navigator.onLine

// Atualizar o estado online quando mudar
window.addEventListener("online", () => {
  online = true
  document.dispatchEvent(new CustomEvent("network-status-change", { detail: { online: true } }))
})

window.addEventListener("offline", () => {
  online = false
  document.dispatchEvent(new CustomEvent("network-status-change", { detail: { online: false } }))
})

export function isOnline() {
  return online
}

export function subscribeToNetworkChanges(callback) {
  const handler = (event) => callback(event.detail.online)
  document.addEventListener("network-status-change", handler)

  // Retornar função para cancelar a inscrição
  return () => document.removeEventListener("network-status-change", handler)
}

