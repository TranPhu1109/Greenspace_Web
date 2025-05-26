import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    },
    hmr: {
      clientPort: 5173,
      protocol: 'ws',
      host: 'localhost'
    },
    proxy: {
      // Proxy requests starting with /hub (you can choose another path prefix if needed)
      '/hub': {
        target: 'http://localhost:8080',
        changeOrigin: true, 
        secure: false,      
        ws: true          
      }
    }
  }
})
