import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

// La landing se sirve en la raíz de join.atvos.io
export default defineConfig({
  base: '/',
  // Preact en vez de React: misma API, ~10 KB en lugar de ~140.
  plugins: [preact()],
  // Navegadores con soporte de módulos nativo: sin polyfills de más.
  build: { target: 'es2022' },
  ssr: { noExternal: true },
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
