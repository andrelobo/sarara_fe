export function getReferenceId(value) {
  if (!value) {
    return ""
  }

  if (typeof value === "string") {
    return value
  }

  if (typeof value === "object" && value._id) {
    return value._id
  }

  return ""
}

export function getReferenceLabel(value) {
  if (!value) {
    return "Nao atribuido"
  }

  if (typeof value === "string") {
    return value
  }

  if (typeof value === "object") {
    return value.username || value.name || value.number || value._id || "Nao atribuido"
  }

  return "Nao atribuido"
}

export function requiresAssignedWaiter({ canAssignWaiter, waiterCount, assignedWaiterId }) {
  return Boolean(canAssignWaiter && waiterCount > 0 && !getReferenceId(assignedWaiterId))
}
