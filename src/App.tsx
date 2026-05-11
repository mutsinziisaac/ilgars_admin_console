import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "react-oidc-context"
import { Layout } from "@/components/layout"
import { LandingPage } from "@/pages/landing"
import { DashboardPage } from "@/pages/dashboard"
import { TransactionsPage } from "@/pages/transactions"
import { RoadClosurePermitsContent } from "@/pages/road-closure-permits"
import { AuthorizationsPage } from "@/pages/authorizations"
import { AlertsPage } from "@/pages/alerts"
import { StatisticsPage } from "@/pages/statistics"
import { VehiclesPage } from "@/pages/vehicles"
import { DevicesPage } from "@/pages/devices"
import { ReportsPage } from "@/pages/reports"
import { TariffsPage } from "@/pages/tariffs"
// import { ConfigsPage } from "@/pages/configs"
import { Toaster } from "@/components/ui/sonner"

// Callback handler component for Keycloak redirect
function AuthCallback() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If authentication is complete, redirect to dashboard
    if (auth.isAuthenticated) {
      navigate("/dashboard", { replace: true })
    }
  }, [auth.isAuthenticated, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Main App Component
function AppContent() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "transactions" | "road-closure-permits" | "heavy-truck-permits" | "alerts" | "enforcement" | "vehicles" | "devices" | "reports" | "tariffs" | "configs">("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />
      case "transactions":
        return <TransactionsPage />
      case "road-closure-permits":
        return <RoadClosurePermitsContent />
      case "heavy-truck-permits":
        return <AuthorizationsPage />
      case "alerts":
        return <AlertsPage />
      case "enforcement":
        return <StatisticsPage />
      case "vehicles":
        return <VehiclesPage />
      case "devices":
        return <DevicesPage />
      case "reports":
        return <ReportsPage />
      case "tariffs":
        return <TariffsPage />
      // case "configs":
      //   return <ConfigsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
