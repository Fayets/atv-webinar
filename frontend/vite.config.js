import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// La landing se sirve bajo atvos.io/acceso/
export default defineConfig({
  base: '/acceso/',
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store',
    },
    proxy: {
      '/acceso/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/acceso\/api/, '/api'),
      },
    },
  },
})
