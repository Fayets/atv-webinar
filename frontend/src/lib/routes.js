// La app se sirve bajo /acceso, así que las rutas internas llevan ese prefijo.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export function url(path = '/') {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}

/** Ruta actual sin el prefijo: /acceso/dashboard -> /dashboard */
export function currentPath() {
  const raw = window.location.pathname
  const stripped = BASE && raw.startsWith(BASE) ? raw.slice(BASE.length) : raw
  return stripped.replace(/\/+$/, '') || '/'
}
