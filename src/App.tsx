import { useState } from "react"
import { Layout } from "@/components/layout"
import { DashboardPage } from "@/pages/dashboard"
import { TransactionsPage } from "@/pages/transactions"
import { PermitsPage } from "@/pages/permits"
import { AuthorizationsPage } from "@/pages/authorizations"
import { EnforcementPage } from "@/pages/enforcement"
import { VehiclesPage } from "@/pages/vehicles"
import { TransportersPage } from "@/pages/transporters"
import { ReportsPage } from "@/pages/reports"
import { TariffsPage } from "@/pages/tariffs"
// import { ConfigsPage } from "@/pages/configs"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "transactions" | "permits" | "authorizations" | "enforcement" | "vehicles" | "transporters" | "reports" | "tariffs" | "configs">("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />
      case "transactions":
        return <TransactionsPage />
      case "permits":
        return <PermitsPage />
      case "authorizations":
        return <AuthorizationsPage />
      case "enforcement":
        return <EnforcementPage />
      case "vehicles":
        return <VehiclesPage />
      case "transporters":
        return <TransportersPage />
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
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  )
}

export default App
