import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Truck, 
  BarChart3, 
  DollarSign,
  ChevronDown,
  ShieldAlert,
  LogOut,
  Languages,
  Smartphone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "react-oidc-context"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  currentPage: "dashboard" | "transactions" | "road-closure-permits" | "heavy-truck-permits" | "alerts" | "enforcement" | "vehicles" | "devices" | "reports" | "tariffs" | "configs"
  onNavigate: (page: "dashboard" | "transactions" | "road-closure-permits" | "heavy-truck-permits" | "alerts" | "enforcement" | "vehicles" | "devices" | "reports" | "tariffs" | "configs") => void
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const auth = useAuth()
  const [locale, setLocale] = useState<"en" | "pt">("en")
  const [permitsOpen, setPermitsOpen] = useState(false)
  const [violationsOpen, setViolationsOpen] = useState(false)
  
  const handleLogout = () => {
    auth.signoutRedirect()
  }

  const handleLocaleChange = (newLocale: "en" | "pt") => {
    setLocale(newLocale)
    // TODO: Implement actual locale change logic
    console.log("Locale changed to:", newLocale)
  }

  // Get user name from Keycloak profile or use default
  const userName = auth.user?.profile?.name || auth.user?.profile?.preferred_username || "Joana Macavel"
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", page: "dashboard" as const, badge: undefined },
    { icon: Receipt, label: "Transactions", page: "transactions" as const, badge: undefined },
    { icon: Truck, label: "Vehicles", page: "vehicles" as const, badge: undefined },
    { icon: Smartphone, label: "Devices", page: "devices" as const, badge: undefined },
    { icon: BarChart3, label: "Reports", page: "reports" as const, badge: undefined },
    { icon: DollarSign, label: "Tariffs", page: "tariffs" as const, badge: undefined },
    // { icon: Settings, label: "Configs", page: "configs" as const, badge: undefined },
  ]

  const permitsSubItems = [
    { label: "Road Closure Permits", page: "road-closure-permits" as const, badge: 8 },
    { label: "Heavy Truck Permits", page: "heavy-truck-permits" as const, badge: 5 },
  ]

  const violationsSubItems = [
    { label: "Alerts", page: "alerts" as const, badge: 7 },
    { label: "Enforcement", page: "enforcement" as const, badge: 12 },
  ]

  const isPermitsActive = currentPage === "road-closure-permits" || currentPage === "heavy-truck-permits"
  const isViolationsActive = currentPage === "alerts" || currentPage === "enforcement"
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
        
        {/* Overview */}
        {menuItems.slice(0, 1).map((item) => {
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

        {/* Transactions */}
        {menuItems.slice(1, 2).map((item) => {
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

        {/* Permits Dropdown */}
        <div>
          <button
            onClick={() => setPermitsOpen(!permitsOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
              isPermitsActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <FileText className="h-5 w-5" />
            <span className="flex-1 text-left">Permits</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
              13
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", permitsOpen && "rotate-180")} />
          </button>
          
          {permitsOpen && (
            <div className="mt-1 space-y-1 pl-8">
              {permitsSubItems.map((subItem) => {
                const isActive = subItem.page === currentPage
                return (
                  <button
                    key={subItem.label}
                    onClick={() => onNavigate(subItem.page)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <span className="flex-1 text-left">{subItem.label}</span>
                    {subItem.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DAA22A] text-xs text-[#1C1C1C] font-semibold">
                        {subItem.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Violations Dropdown */}
        <div>
          <button
            onClick={() => setViolationsOpen(!violationsOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
              isViolationsActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <ShieldAlert className="h-5 w-5" />
            <span className="flex-1 text-left">Violations</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
              19
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", violationsOpen && "rotate-180")} />
          </button>
          
          {violationsOpen && (
            <div className="mt-1 space-y-1 pl-8">
              {violationsSubItems.map((subItem) => {
                const isActive = subItem.page === currentPage
                return (
                  <button
                    key={subItem.label}
                    onClick={() => onNavigate(subItem.page)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <span className="flex-1 text-left">{subItem.label}</span>
                    {subItem.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DAA22A] text-xs text-[#1C1C1C] font-semibold">
                        {subItem.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Rest of menu items (Vehicles, Devices, Reports, Tariffs) */}
        {menuItems.slice(2).map((item) => {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-muted">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Joana&backgroundColor=b6e3f4" 
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-base font-medium text-foreground">{userName}</p>
                <p className="text-sm text-muted-foreground">Revenue officer</p>
              </div>
              <ChevronDown className="h-5 w-5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side="top">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>Locale</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
                  <span className="flex items-center justify-between w-full">
                    English
                    {locale === "en" && <span className="ml-2">✓</span>}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocaleChange("pt")}>
                  <span className="flex items-center justify-between w-full">
                    Portuguese
                    {locale === "pt" && <span className="ml-2">✓</span>}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
