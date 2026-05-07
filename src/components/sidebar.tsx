import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Shield, 
  Truck, 
  Users as UsersIcon, 
  BarChart3, 
  DollarSign,
  Settings,
  ChevronDown,
  ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPage: "dashboard" | "transactions" | "permits" | "authorizations" | "enforcement" | "vehicles" | "transporters" | "reports" | "tariffs" | "configs"
  onNavigate: (page: "dashboard" | "transactions" | "permits" | "authorizations" | "enforcement" | "vehicles" | "transporters" | "reports" | "tariffs" | "configs") => void
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", page: "dashboard" as const },
    { icon: Receipt, label: "Transactions", page: "transactions" as const },
    { icon: FileText, label: "Permits", page: "permits" as const, badge: 8 },
    { icon: Shield, label: "Authorizations", page: "authorizations" as const, badge: 5 },
    { icon: ShieldAlert, label: "Enforcement", page: "enforcement" as const },
    { icon: Truck, label: "Vehicles", page: "vehicles" as const },
    { icon: UsersIcon, label: "Transporters", page: "transporters" as const },
    { icon: BarChart3, label: "Reports", page: "reports" as const },
    { icon: DollarSign, label: "Tariffs", page: "tariffs" as const },
    // { icon: Settings, label: "Configs", page: "configs" as const },
  ]
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-card">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 bg-card px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg overflow-hidden">
          <img 
            src="/maputo-logo.webp" 
            alt="Maputo RUC Logo" 
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Maputo RUC</h1>
          <p className="text-sm text-muted-foreground">ADMIN CONSOLE</p>
        </div>
      </div>

      {/* Yellow Divider */}
      <div className="h-1 bg-[#DAA22A]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <div className="mb-2 px-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Operations
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = item.page === currentPage
          return (
            <button
              key={item.label}
              onClick={() => item.page && onNavigate(item.page)}
              disabled={!item.page}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                !item.page && "cursor-not-allowed opacity-50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User Profile at Bottom */}
      <div className="border-t border-sidebar-border p-4">
        <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-muted">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Joana&backgroundColor=b6e3f4" 
              alt="Joana Macavel"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-medium text-foreground">Joana Macavel</p>
            <p className="text-sm text-muted-foreground">Revenue officer</p>
          </div>
          <ChevronDown className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </aside>
  )
}
