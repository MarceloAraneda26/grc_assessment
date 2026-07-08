import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/grc_assessment/',
  plugins: [react(), tailwindcss()],
  server: {
    // Nombre local "cosmético" (ver hosts file) en vez de localhost — no
    // expone nada a la red, sigue siendo 127.0.0.1. Vite rechaza por
    // defecto cualquier Host header no reconocido (protección anti DNS
    // rebinding), así que hay que declararlo explícitamente.
    allowedHosts: ['grc.tibox.local'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
