import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) =>{

  const env = loadEnv(mode, process.cwd());

  return {
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
        '/hub': {
          target: env.VITE_API_URL, // <-- Sử dụng biến môi trường ở đây
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    }
  };
})
