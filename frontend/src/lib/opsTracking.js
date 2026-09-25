// Tracking de ATV Ops. El SDK se sirve desde ops.atvos.io y manda los eventos del
// embudo: visita a la landing, optin, thank you, click de WhatsApp.
//
// El token es por webinar, no por cliente: si corremos otra edición hay que pedir el
// suyo en ATV Ops → Integraciones. Va hardcodeado y commiteado a propósito: `frontend/.env` está en el .gitignore, así que una
// variable VITE_ existiría en la Mac y no en el VPS, y el tracking quedaría apagado en
// producción sin que nadie se entere. Es un token de escritura de contadores, no una
// credencial: viaja igual en el bundle.
const TOKEN = 'kyUHTqIOCwpvpGxAm3YwoOJeCJmMrX8m'
const SDK = 'https://ops.atvos.io/api/track/sdk.js'

let inyectado = false

/**
 * Carga el SDK una sola vez.
 *
 * @param {'landing' | 'ty'} page  qué evento anuncia la carga.
 * @param {{ contar?: boolean }} opciones  contar:false carga el SDK sin anunciar nada
 *   (data-auto="off"): `trackOps` sigue andando, pero la carga no suma visita. Es lo
 *   que usa una recarga de la landing, que ya se contó al entrar.
 */
export function cargarOps(page, { contar = true } = {}) {
  if (inyectado) return
  inyectado = true

  const s = document.createElement('script')
  s.src = SDK
  s.async = true
  s.setAttribute('data-token', TOKEN)
  s.setAttribute('data-page', page)
  if (!contar) s.setAttribute('data-auto', 'off')
  document.head.appendChild(s)
}

/** Un evento a mano: 'optin' | 'whatsapp' | 'thank_you' | 'pageview'. */
export function trackOps(evento) {
  // Si el SDK no cargó —bloqueador, red caída— la landing sigue andando igual.
  if (window.AtvOps && typeof window.AtvOps.track === 'function') {
    window.AtvOps.track(evento)
  }
}
