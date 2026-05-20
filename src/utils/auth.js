const AUTH_TOKEN_KEY = "authToken"
const AUTH_USER_KEY = "authUser"
const LEGACY_TOKEN_KEY = "token"

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredUser() {
  const storedUser = localStorage.getItem(AUTH_USER_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch (error) {
    console.error("Erro ao ler usuario autenticado:", error)
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function storeAuthUser(user) {
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY)
    return
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function setAuthSession(token, user) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }

  localStorage.removeItem(LEGACY_TOKEN_KEY)
  storeAuthUser(user)
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken()

  if (!token) {
    return { ...extraHeaders }
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  }
}

export function hasRole(user, allowedRoles = []) {
  if (!user || !user.role) {
    return false
  }

  return allowedRoles.includes(user.role)
}
