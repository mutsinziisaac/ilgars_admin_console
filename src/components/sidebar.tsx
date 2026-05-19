import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Truck, 
  BarChart3, 
  ChevronDown,
  ShieldAlert,
  LogOut,
  Languages,
  Smartphone,
  Settings,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "react-oidc-context"
import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
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
  currentPage: "dashboard" | "transactions" | "road-closure-permits" | "heavy-truck-permits" | "gps-tracking" | "cameras" | "alerts" | "enforcement" | "vehicles" | "reports" | "municipality" | "tariff-plans" | "ruc-policy" | "routes" | "road-closure-rates" | "fines-configuration" | "geofencing-zones" | "vehicle-classification" | "weight-categories" | "time-windows"
  onNavigate: (page: "dashboard" | "transactions" | "road-closure-permits" | "heavy-truck-permits" | "gps-tracking" | "cameras" | "alerts" | "enforcement" | "vehicles" | "reports" | "municipality" | "tariff-plans" | "ruc-policy" | "routes" | "road-closure-rates" | "fines-configuration" | "geofencing-zones" | "vehicle-classification" | "weight-categories" | "time-windows") => void
}

type Page = SidebarProps["currentPage"]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const auth = useAuth()
  const { locale, setLocale, t } = useI18n()
  const [permitsOpen, setPermitsOpen] = useState(false)
  const [devicesOpen, setDevicesOpen] = useState(false)
  const [violationsOpen, setViolationsOpen] = useState(false)
  const [configurationsOpen, setConfigurationsOpen] = useState(false)
  
  const handleLogout = () => {
    auth.signoutRedirect()
  }

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  const collapseDropdowns = () => {
    setPermitsOpen(false)
    setDevicesOpen(false)
    setViolationsOpen(false)
    setConfigurationsOpen(false)
  }

  const handleNavigate = (page: Page) => {
    collapseDropdowns()
    onNavigate(page)
  }

  // Get user name from Keycloak profile or use default
  const userName = auth.user?.profile?.name || auth.user?.profile?.preferred_username || t("user.fallbackName")
  
  const menuItems = [
    { icon: LayoutDashboard, label: t("nav.overview"), page: "dashboard" as const, badge: undefined },
    { icon: Receipt, label: t("nav.transactions"), page: "transactions" as const, badge: undefined },
    { icon: Truck, label: t("nav.vehicles"), page: "vehicles" as const, badge: undefined },
    { icon: BarChart3, label: t("nav.reports"), page: "reports" as const, badge: undefined },
  ]

  const permitsSubItems = [
    { label: t("nav.roadClosurePermits"), page: "road-closure-permits" as const, badge: 8 },
    { label: t("nav.heavyTruckPermits"), page: "heavy-truck-permits" as const, badge: 5 },
  ]

  const devicesSubItems = [
    { label: t("nav.gpsTracking"), page: "gps-tracking" as const, badge: undefined },
    { label: t("nav.cameras"), page: "cameras" as const, badge: undefined },
  ]

  const violationsSubItems = [
    { label: t("nav.alerts"), page: "alerts" as const, badge: 7 },
    { label: t("nav.enforcement"), page: "enforcement" as const, badge: 12 },
  ]

  const configurationsSubItems = [
    { label: t("nav.municipality"), page: "municipality" as const },
    { label: t("nav.routes"), page: "routes" as const },
    { label: t("nav.rucPolicy"), page: "ruc-policy" as const },
    { label: t("nav.tariffPlans"), page: "tariff-plans" as const },
    { label: t("nav.roadClosureRates"), page: "road-closure-rates" as const },
    { label: t("nav.finesConfiguration"), page: "fines-configuration" as const },
    { label: t("nav.geofencingZones"), page: "geofencing-zones" as const },
  ]

  const isPermitsActive = currentPage === "road-closure-permits" || currentPage === "heavy-truck-permits"
  const isDevicesActive = currentPage === "gps-tracking" || currentPage === "cameras"
  const isViolationsActive = currentPage === "alerts" || currentPage === "enforcement"
  const isConfigurationsActive = currentPage === "municipality" || currentPage === "tariff-plans" || currentPage === "ruc-policy" || currentPage === "routes" || currentPage === "road-closure-rates" || currentPage === "fines-configuration" || currentPage === "geofencing-zones" || currentPage === "vehicle-classification" || currentPage === "weight-categories" || currentPage === "time-windows"
  const showPermits = permitsOpen || isPermitsActive
  const showDevices = devicesOpen || isDevicesActive
  const showViolations = violationsOpen || isViolationsActive
  const showConfigurations = configurationsOpen || isConfigurationsActive

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
          <h1 className="text-lg font-semibold text-foreground">{t("app.name")}</h1>
          <p className="text-sm text-muted-foreground">{t("app.subtitle")}</p>
        </div>
      </div>

      {/* Yellow Divider */}
      <div className="h-1 bg-[#DAA22A]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <div className="mb-2 px-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("nav.operations")}
        </div>
        
        {/* Main Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = item.page === currentPage
          return (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.page)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
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
            <span className="flex-1 text-left">{t("nav.permits")}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
              13
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showPermits && "rotate-180")} />
          </button>
          
          {showPermits && (
            <div className="mt-1 space-y-1 pl-8">
              {permitsSubItems.map((subItem) => {
                const isActive = subItem.page === currentPage
                return (
                  <button
                    key={subItem.label}
                    onClick={() => handleNavigate(subItem.page)}
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
            <span className="flex-1 text-left">{t("nav.violations")}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
              19
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showViolations && "rotate-180")} />
          </button>
          
          {showViolations && (
            <div className="mt-1 space-y-1 pl-8">
              {violationsSubItems.map((subItem) => {
                const isActive = subItem.page === currentPage
                return (
                  <button
                    key={subItem.label}
                    onClick={() => handleNavigate(subItem.page)}
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

        {/* Devices Dropdown */}
        <div>
          <button
            onClick={() => setDevicesOpen(!devicesOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
              isDevicesActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <Smartphone className="h-5 w-5" />
            <span className="flex-1 text-left">{t("nav.devices")}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showDevices && "rotate-180")} />
          </button>
          
          {showDevices && (
            <div className="mt-1 space-y-1 pl-8">
              {devicesSubItems.map((subItem) => {
                const isActive = subItem.page === currentPage
                return (
                  <button
                    key={subItem.label}
                    onClick={() => handleNavigate(subItem.page)}
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

        {/* Rest of menu items (Reports) */}
        {/* Reports is now handled in the main menu items loop above */}

        {/* Configurations Dropdown */}
        <div>
          <button
            onClick={() => setConfigurationsOpen(!configurationsOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
              isConfigurationsActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="flex-1 text-left">{t("nav.configurations")}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showConfigurations && "rotate-180")} />
          </button>
          
          {showConfigurations && (
            <div className="mt-1 space-y-1 pl-8">
              {configurationsSubItems.map((subItem) => {
                const isActive = subItem.page === currentPage
                return (
                  <button
                    key={subItem.label}
                    onClick={() => handleNavigate(subItem.page)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <span className="flex-1 text-left">{subItem.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
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
                <p className="text-sm text-muted-foreground">{t("user.role")}</p>
              </div>
              <ChevronDown className="h-5 w-5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side="top">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>{t("user.locale")}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
                  <span className="flex items-center justify-between w-full">
                    {t("user.english")}
                    {locale === "en" && <Check className="ml-2 h-4 w-4" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocaleChange("pt")}>
                  <span className="flex items-center justify-between w-full">
                    {t("user.portuguese")}
                    {locale === "pt" && <Check className="ml-2 h-4 w-4" />}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("user.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
