import { Bell } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-card">
      <div className="flex items-center justify-between px-6" style={{ height: "105px" }}>
        {/* Left Side - Page Title */}
        <div>
          <p className="text-sm text-muted-foreground">REVENUE · TODAY, MON 4 MAY 2026</p>
          <h2 className="text-2xl font-semibold text-foreground">Operations dashboard</h2>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative rounded-lg p-2 hover:bg-muted">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </div>
      </div>
    </header>
  )
}
