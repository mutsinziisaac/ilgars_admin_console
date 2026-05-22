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
import { EnforcementPage } from "@/pages/enforcement"
import { VehiclesPage } from "@/pages/vehicles"
import { GPSTrackingPage } from "@/pages/gps-tracking"
import { CamerasPage } from "@/pages/cameras"
import { ReportsPage } from "@/pages/reports"
import { MunicipalityPage } from "@/pages/municipality"
import { TariffPlansPage } from "@/pages/tariff-plans"
import { RUCPolicyPage } from "@/pages/ruc-policy"
import { RoutesPage } from "@/pages/routes"
import { RoadClosureRatesPage } from "@/pages/road-closure-rates"
import { FinesConfigurationPage } from "@/pages/fines-configuration"
import { GeofencingZonesPage } from "@/pages/geofencing-zones"
import { VehicleClassificationPage } from "@/pages/vehicle-classification"
import { WeightCategoriesPage } from "@/pages/weight-categories"
import { TimeWindowsPage } from "@/pages/time-windows"
import { RolesManagementPage } from "@/pages/roles-management"
import { Toaster } from "@/components/ui/sonner"
import { useI18n } from "@/lib/i18n"

type AppPage = "dashboard" | "transactions" | "road-closure-permits" | "heavy-truck-permits" | "manage-staff" | "manage-roles" | "create-role" | "roles-management" | "alerts" | "enforcement" | "vehicles" | "gps-tracking" | "cameras" | "reports" | "municipality" | "tariff-plans" | "ruc-policy" | "routes" | "road-closure-rates" | "fines-configuration" | "geofencing-zones" | "vehicle-classification" | "weight-categories" | "time-windows"

// Callback handler component for Keycloak redirect
function AuthCallback() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()

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
        <p className="text-muted-foreground">{t("auth.callbackTitle")}</p>
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
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard")

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
      case "manage-staff":
      case "roles-management":
        return <RolesManagementPage view="staff" onManageRoles={() => setCurrentPage("manage-roles")} />
      case "manage-roles":
        return <RolesManagementPage view="roles" onCreateRole={() => setCurrentPage("create-role")} />
      case "create-role":
        return <RolesManagementPage view="create-role" onManageRoles={() => setCurrentPage("manage-roles")} />
      case "alerts":
        return <AlertsPage />
      case "enforcement":
        return <EnforcementPage />
      case "vehicles":
        return <VehiclesPage />
      case "gps-tracking":
        return <GPSTrackingPage />
      case "cameras":
        return <CamerasPage />
      case "reports":
        return <ReportsPage />
      case "municipality":
        return <MunicipalityPage />
      case "tariff-plans":
        return <TariffPlansPage />
      case "ruc-policy":
        return <RUCPolicyPage />
      case "routes":
        return <RoutesPage />
      case "road-closure-rates":
        return <RoadClosureRatesPage />
      case "fines-configuration":
        return <FinesConfigurationPage />
      case "geofencing-zones":
        return <GeofencingZonesPage />
      case "vehicle-classification":
        return <VehicleClassificationPage />
      case "weight-categories":
        return <WeightCategoriesPage />
      case "time-windows":
        return <TimeWindowsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={(page) => setCurrentPage(page)}>
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
