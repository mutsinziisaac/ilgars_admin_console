import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "react-oidc-context"
import { Navigate } from "react-router-dom"
import { useState } from "react"

export function LandingPage() {
  const auth = useAuth()
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
      setError(err instanceof Error ? err.message : "Failed to initiate sign in")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7EE] to-white flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/maputo-logo.webp" 
              alt="Maputo Municipality" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-[oklch(0.30_0.06_155)]">ILGARS</h1>
              <p className="text-xs text-muted-foreground">Integrated Local Government Administration & Revenue System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Takes remaining space */}
      <section className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4">
                <span className="bg-[#DAA22A]/20 text-[#DAA22A] px-4 py-2 rounded-full text-sm font-medium">
                  Maputo Municipality
                </span>
              </div>
              <h1 className="text-5xl font-bold text-[oklch(0.30_0.06_155)] mb-6 leading-tight">
                Integrated Local Government Administration & Revenue System
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Streamline road user charges, manage permits, track enforcement, and optimize revenue collection for Maputo Municipality.
              </p>
              
              {/* Show error if any */}
              {(error || auth.error) && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Authentication Error:</strong> {error || auth.error?.message}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Please contact your system administrator to verify the Keycloak client configuration.
                  </p>
                </div>
              )}
              
              {/* Show spinner while loading, otherwise show button */}
              {auth.isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DAA22A]"></div>
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <Button 
                  onClick={handleGetStarted} 
                  size="lg" 
                  className="bg-[#DAA22A] hover:bg-[#DAA22A]/90 text-[#1C1C1C] text-lg h-14 px-8"
                >
                  Get Started
                </Button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#DAA22A]/20 to-[oklch(0.30_0.06_155)]/20 rounded-3xl blur-3xl"></div>
              <Card className="relative border-2 border-[#DAA22A]/20">
                <CardContent className="p-8">
                  <img 
                    src="/maputo-logo.webp" 
                    alt="Maputo Municipality" 
                    className="w-full h-auto opacity-90"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/maputo-logo.webp" 
                alt="Maputo Municipality" 
                className="h-10 w-auto"
              />
              <div>
                <p className="text-sm font-semibold text-[oklch(0.30_0.06_155)]">Maputo Municipality</p>
                <p className="text-xs text-muted-foreground">ILGARS Admin Console</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Maputo Municipality. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
