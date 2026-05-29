import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { PageLocalizer } from "./page-localizer"

type AppPage = "dashboard" | "transactions" | "road-closure-permits" | "special-permits" | "manage-staff" | "manage-roles" | "create-role" | "roles-management" | "alerts" | "enforcement" | "vehicles" | "gps-tracking" | "cameras" | "reports" | "municipality" | "tariff-plans" | "ruc-policy" | "routes" | "road-closure-rates" | "fines-configuration" | "geofencing-zones" | "vehicle-classification" | "weight-categories" | "time-windows"

interface LayoutProps {
  children: ReactNode
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Show on all pages */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <PageLocalizer>{children}</PageLocalizer>
        </main>
      </div>
    </div>
  )
}
