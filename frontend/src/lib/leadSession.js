// El lead recién creado viaja del modal a /ty-page por sessionStorage: así la
// vista de gracias es una URL propia y sobrevive a un refresh.
const KEY = 'atv_lead'

export function saveLead(lead) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(lead))
  } catch {
    /* modo privado: la vista de gracias va a rebotar al inicio */
  }
}

export function readLead() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.id && parsed?.nombre ? parsed : null
  } catch {
    return null
  }
}

export function clearLead() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
