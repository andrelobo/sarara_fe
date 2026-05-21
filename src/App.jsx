"use client"

import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"
import AppShell from "./components/ui/AppShell"
import OfflineIndicator from "./components/OfflineIndicator"
import SyncManager from "./components/SyncManager"
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration"
import BeveragesList from "./components/BeveragesList"
import IngredientsList from "./components/IngredientsList"
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
import HomeDashboard from "./components/HomeDashboard"
import BeverageHistoryPage from "./pages/BeverageHistoryPage"
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
            <div className="absolute left-[-10rem] top-[-10rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-11rem] right-[-8rem] h-96 w-96 rounded-full bg-secondary/8 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-[20rem] bg-[radial-gradient(circle_at_top,rgba(230,180,80,0.07),transparent_55%)]" />
          </div>

          <AppShell currentUser={currentUser} isAuthenticated={isAuthenticated} onLogout={handleLogout}>
            <OfflineIndicator />
            <SyncManager />
            <ServiceWorkerRegistration />
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <ProtectedRoute currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                      <HomeDashboard />
                    </ProtectedRoute>
                  ) : (
                    <Navigate replace to="/login" />
                  )
                }
              />
              <Route path="/login" element={isAuthenticated ? <Navigate replace to="/" /> : <Login onLogin={handleLogin} />} />
              <Route
                path="/setup-account"
                element={isAuthenticated ? <Navigate replace to="/" /> : <SetupAccount onSetupSuccess={handleLogin} />}
              />
              <Route
                path="/cadastro"
                element={
                  <ProtectedRoute allowedRoles={["admin"]} currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute allowedRoles={["admin"]} currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/beverages"
                element={
                  <ProtectedRoute currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <BeveragesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/beverages/new"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]} currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <CreateBeverage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/beverages/history"
                element={
                  <ProtectedRoute currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <BeverageHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ingredients"
                element={
                  <ProtectedRoute currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <IngredientsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ingredients/new"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]} currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <CreateIngredient />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salon"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager", "waiter"]} currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <SalonDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salon/tables"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager", "waiter"]} currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <TablesGrid />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salon/tables/:id"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager", "waiter"]} currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <TableDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salon/commands/:id"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager", "waiter"]} currentUser={currentUser} isAuthenticated={isAuthenticated} isLoading={isAuthLoading}>
                    <CommandView />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AppShell>
        </div>
      </Router>
    </OfflineProvider>
  )
}

export default App
