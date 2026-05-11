import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to avoid CORS issues in development
      '/api/core': {
        target: 'https://ilgars.ayinza.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/core/, '/core/api'),
        secure: false,
      },
      '/api/motorvehicle': {
        target: 'https://ilgars.ayinza.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/motorvehicle/, '/motorvehicle/api'),
        secure: false,
      },
    },
  },
})
