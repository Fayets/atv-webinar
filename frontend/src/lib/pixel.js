// Pixel de Meta. El id se inyecta en index.html; acá solo se disparan eventos.
// Cada evento lleva un eventID propio que se repite en el envío server-side
// (CAPI) para que Meta los deduplique y cuente uno solo.

export function newEventId(name, leadId) {
  return `${name}_${leadId}_${Date.now()}`
}

export function track(eventName, params = {}, eventId) {
  if (typeof window.fbq !== 'function') return
  window.fbq('track', eventName, params, eventId ? { eventID: eventId } : undefined)
}

/** Cookies que Meta deja en el navegador; mejoran el match del envío server-side. */
export function browserIds() {
  const read = (name) => {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`))
    return match ? decodeURIComponent(match[2]) : null
  }
  return { fbp: read('_fbp'), fbc: read('_fbc') }
}
