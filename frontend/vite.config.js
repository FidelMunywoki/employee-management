import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['employee-management-system-2rbb.onrender.com'],
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],
      usePolling: false,
    }
  }
})