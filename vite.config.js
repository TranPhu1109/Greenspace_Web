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
        target: 'http://localhost:8080', // Your backend server address
        changeOrigin: true, // Recommended to avoid potential issues with origin checking on the backend
        secure: false,      // Set to false if your backend is HTTP, true if HTTPS
        ws: true            // IMPORTANT: Enable WebSocket proxying for SignalR
      }
    }
  }
})
