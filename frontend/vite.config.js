import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// La landing se sirve en la raíz de join.atvos.io
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
