"use client"

import React, { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { OfflineProvider } from "./context/OfflineContext"
import Nav from "./components/Nav"
import BeveragesList from "./components/BeveragesList"
import IngredientsList from "./components/IngredientsList"
import BeverageHistory from "./components/BeverageHistory"
import CreateBeverage from "./components/CreateBeverage"
import CreateIngredient from "./components/CreateIngredient"
import Login from "./components/Login"
import Cadastro from "./components/Cadastro"
import OfflineIndicator from "./components/OfflineIndicator"
import SyncManager from "./components/SyncManager"
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration"
import { initDB } from "./utils/db"

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem("authToken"))

  useEffect(() => {
    // Inicializar o banco de dados IndexedDB quando o aplicativo carregar
    initDB().catch((error) => {
      console.error("Erro ao inicializar o banco de dados:", error)
    })
  }, [])

  const handleLogin = (token) => {
    localStorage.setItem("authToken", token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
  }

  return (
    <OfflineProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Nav isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          <OfflineIndicator />
          <SyncManager />
          <ServiceWorkerRegistration />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={isAuthenticated ? <BeveragesList /> : <Login onLogin={handleLogin} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/cadastro" element={<Cadastro onCadastro={handleLogin} />} />
              <Route path="/beverages" element={<BeveragesList />} />
              <Route path="/beverages/new" element={<CreateBeverage />} />
              <Route path="/beverages/history" element={<BeverageHistory />} />
              <Route path="/ingredients" element={<IngredientsList />} />
              <Route path="/ingredients/new" element={<CreateIngredient />} />
            </Routes>
          </div>
        </div>
      </Router>
    </OfflineProvider>
  )
}

export default App

