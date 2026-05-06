import { useState } from "react"
import { Layout } from "@/components/layout"
import { DashboardPage } from "@/pages/dashboard"
import { TransactionsPage } from "@/pages/transactions"
import { PermitsPage } from "@/pages/permits"
import { EnforcementPage } from "@/pages/enforcement"
import { VehiclesPage } from "@/pages/vehicles"
import { TransportersPage } from "@/pages/transporters"
import { ReportsPage } from "@/pages/reports"
import { TariffsPage } from "@/pages/tariffs"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "transactions" | "permits" | "enforcement" | "vehicles" | "transporters" | "reports" | "tariffs">("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />
      case "transactions":
        return <TransactionsPage />
      case "permits":
        return <PermitsPage />
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
