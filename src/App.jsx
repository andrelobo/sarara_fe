"use client"

import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"
import Nav from "./components/Nav"
import OfflineIndicator from "./components/OfflineIndicator"
import SyncManager from "./components/SyncManager"
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration"
import BeveragesList from "./components/BeveragesList"
import IngredientsList from "./components/IngredientsList"
import BeverageHistory from "./components/BeverageHistory"
import CreateBeverage from "./components/CreateBeverage"
import CreateIngredient from "./components/CreateIngredient"
import Login from "./components/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import SetupAccount from "./components/SetupAccount"
import UserManagement from "./components/UserManagement"
import SalonDashboard from "./components/SalonDashboard"
import TablesGrid from "./components/TablesGrid"
import TableDetail from "./components/TableDetail"
import CommandView from "./components/CommandView"
import { OfflineProvider } from "./context/OfflineContext"
import { API_BASE_URL } from "./config/api"
import { initDB } from "./utils/db"
import { clearAuthSession, getAuthHeaders, getAuthToken, getStoredUser, setAuthSession, storeAuthUser } from "./utils/auth"

function App() {
  const [authToken, setAuthToken] = useState(() => getAuthToken())
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(getAuthToken()))

  useEffect(() => {
    initDB().catch((error) => {
      console.error("Erro ao inicializar o banco de dados:", error)
    })
  }, [])

  useEffect(() => {
    if (!authToken) {
      setCurrentUser(null)
      setIsAuthLoading(false)
      return
    }

    let isCancelled = false

    const syncCurrentUser = async () => {
      setIsAuthLoading(true)

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
        })

        if (!response.ok) {
          throw new Error(`Falha ao validar sessao: ${response.status}`)
        }

        const data = await response.json()

        if (isCancelled) {
          return
        }

        storeAuthUser(data.user)
        setCurrentUser(data.user)
      } catch (error) {
        console.error("Erro ao sincronizar sessao:", error)
        clearAuthSession()

        if (!isCancelled) {
          setAuthToken("")
          setCurrentUser(null)
        }
      } finally {
        if (!isCancelled) {
          setIsAuthLoading(false)
        }
      }
    }

    syncCurrentUser()

    return () => {
      isCancelled = true
    }
  }, [authToken])

  const handleLogin = (token, user) => {
    setAuthSession(token, user)
    setAuthToken(token)
    setCurrentUser(user || null)
    setIsAuthLoading(false)
  }

  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch(`${API_BASE_URL}/users/logout`, {
          method: "POST",
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
        })
      }
    } catch (error) {
      console.error("Erro ao encerrar sessao:", error)
    } finally {
      clearAuthSession()
      setAuthToken("")
      setCurrentUser(null)
      setIsAuthLoading(false)
    }
  }

  const isAuthenticated = Boolean(authToken)

  return (
    <OfflineProvider>
      <Router>
        <div className="app-shell min-h-screen bg-background text-text">
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute left-[-9rem] top-[-9rem] h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(230,180,80,0.09),transparent_48%)]" />
          </div>

          <div className="relative z-10">
            <Nav isAuthenticated={isAuthenticated} currentUser={currentUser} onLogout={handleLogout} />
            <OfflineIndicator />
            <SyncManager />
            <ServiceWorkerRegistration />
            <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? "/beverages" : "/login"} replace />} />
                <Route
                  path="/login"
                  element={isAuthenticated ? <Navigate to="/beverages" replace /> : <Login onLogin={handleLogin} />}
                />
                <Route
                  path="/setup-account"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/beverages" replace />
                    ) : (
                      <SetupAccount onSetupSuccess={handleLogin} />
                    )
                  }
                />
                <Route
                  path="/cadastro"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                      allowedRoles={["admin"]}
                    >
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                      allowedRoles={["admin"]}
                    >
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/beverages"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                    >
                      <BeveragesList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/beverages/new"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                      allowedRoles={["admin", "manager"]}
                    >
                      <CreateBeverage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/beverages/history"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                    >
                      <BeverageHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ingredients"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                    >
                      <IngredientsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ingredients/new"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                      allowedRoles={["admin", "manager"]}
                    >
                      <CreateIngredient />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salon"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                      allowedRoles={["admin", "manager", "waiter"]}
                    >
                      <SalonDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salon/tables"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                      allowedRoles={["admin", "manager", "waiter"]}
                    >
                      <TablesGrid />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salon/tables/:id"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                      allowedRoles={["admin", "manager", "waiter"]}
                    >
                      <TableDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salon/commands/:id"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      isLoading={isAuthLoading}
                      currentUser={currentUser}
                      allowedRoles={["admin", "manager", "waiter"]}
                    >
                      <CommandView />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </OfflineProvider>
  )
}

export default App
