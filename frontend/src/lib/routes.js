// Prefijo de las rutas internas. Hoy la app vive en la raíz de join.atvos.io, así que
// BASE queda vacío; si vuelve a colgar de un subpath alcanza con cambiar `base` en Vite.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export function url(path = '/') {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}

/** Ruta actual sin el prefijo: /sub/dashboard -> /dashboard */
export function currentPath() {
  const raw = window.location.pathname
  const stripped = BASE && raw.startsWith(BASE) ? raw.slice(BASE.length) : raw
  return stripped.replace(/\/+$/, '') || '/'
}
