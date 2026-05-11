import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { AuthProvider } from "react-oidc-context"
import { QueryClientProvider } from "@tanstack/react-query"
import { userManager } from "@/lib/userManager"
import { queryClient } from "@/lib/queryClient"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider userManager={userManager}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
)
