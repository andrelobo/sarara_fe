import { Navigate, useLocation } from "react-router-dom"

const ProtectedRoute = ({ children, isAuthenticated, isLoading, currentUser, allowedRoles = [] }) => {
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles.length > 0 && (!currentUser || !allowedRoles.includes(currentUser.role))) {
    return <Navigate to="/beverages" replace />
  }

  return children
}

export default ProtectedRoute
