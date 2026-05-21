import { Button } from "@/components/ui/button"
import { useAuth } from "react-oidc-context"
import { Navigate } from "react-router-dom"
import { useState } from "react"
import { useI18n } from "@/lib/i18n"

export function LandingPage() {
  const auth = useAuth()
  const { locale, setLocale, t } = useI18n()
  const [error, setError] = useState<string | null>(null)

  // If user is already authenticated, redirect to dashboard
  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Check for authentication errors
  if (auth.error) {
    console.error("Authentication error:", auth.error)
  }

  const handleGetStarted = async () => {
    try {
      setError(null)
      await auth.signinRedirect()
    } catch (err) {
      console.error("Sign in error:", err)
      setError(err instanceof Error ? err.message : t("auth.signInFailed"))
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/Municipal_Maputo_(22096153185).jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/35 to-black/10" />
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/maputo-logo.webp"
              alt="Maputo Municipality"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-[oklch(0.30_0.06_155)]">{t("app.shortName")}</h1>
              <p className="text-xs text-muted-foreground">{t("app.fullName")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-md border bg-white p-1" aria-label={t("user.locale")}>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                locale === "en"
                  ? "bg-[#DAA22A] text-[#1C1C1C]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("pt")}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                locale === "pt"
                  ? "bg-[#DAA22A] text-[#1C1C1C]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              PT
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Takes remaining space */}
      <section className="relative z-10 flex flex-1 items-center">
        <div className="w-full px-4 py-20 sm:px-6 lg:pl-8 lg:pr-4 xl:pr-6">
          <div className="flex justify-start lg:justify-end">
            <div className="w-full max-w-2xl text-left">
              <div className="inline-block mb-4">
                <span className="bg-[#DAA22A] text-[#1C1C1C] px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {t("app.municipality")}
                </span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)] lg:text-6xl">
                {t("app.fullName")}
              </h1>
              <p className="max-w-[680px] text-xl text-white/90 mb-8 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {t("landing.description")}
              </p>

              {/* Show error if any */}
              {(error || auth.error) && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>{t("auth.errorTitle")}</strong> {error || auth.error?.message}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    {t("auth.errorHelp")}
                  </p>
                </div>
              )}

              {/* Show spinner while loading, otherwise show button */}
              {auth.isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DAA22A]"></div>
                  <span className="text-white/90">{t("auth.loading")}</span>
                </div>
              ) : (
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-[#DAA22A] hover:bg-[#DAA22A]/90 text-[#1C1C1C] text-lg h-14 px-8"
                >
                  {t("auth.getStarted")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
