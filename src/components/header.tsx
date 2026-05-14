import { Bell } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function Header() {
  const { locale, t } = useI18n()
  const today = new Intl.DateTimeFormat(locale === "pt" ? "pt-MZ" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())

  return (
    <header className="sticky top-0 z-10 bg-card">
      <div className="flex items-center justify-between px-6" style={{ height: "105px" }}>
        {/* Left Side - Page Title */}
        <div>
          <p className="text-sm text-muted-foreground">
            {t("header.section")} · {t("header.today")}, {today.toUpperCase()}
          </p>
          <h2 className="text-2xl font-semibold text-foreground">{t("header.title")}</h2>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative rounded-lg p-2 hover:bg-muted" aria-label={t("header.notifications")}>
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </div>
      </div>
    </header>
  )
}
