import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface LayoutProps {
  children: ReactNode
  currentPage: "dashboard" | "transactions" | "permits" | "enforcement" | "vehicles" | "transporters" | "reports" | "tariffs"
  onNavigate: (page: "dashboard" | "transactions" | "permits" | "enforcement" | "vehicles" | "transporters" | "reports" | "tariffs") => void
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
          {children}
        </main>
      </div>
    </div>
  )
}
