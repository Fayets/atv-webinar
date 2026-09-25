const API_BASE = import.meta.env.VITE_API_URL || '/api'

const PIN_KEY = 'atv_dashboard_pin'

export function getPin() {
  try {
    return localStorage.getItem(PIN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setPin(pin) {
  try {
    localStorage.setItem(PIN_KEY, pin)
  } catch {
    /* modo privado: seguimos sin persistir */
  }
}

export function clearPin() {
  try {
    localStorage.removeItem(PIN_KEY)
  } catch {
    /* ignore */
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    let detail = 'No se pudo completar la solicitud'
    try {
      const body = await response.json()
      if (typeof body?.detail === 'string') detail = body.detail
    } catch {
      /* ignore parse errors */
    }
    const error = new Error(detail)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

function withSession(options = {}) {
  return {
    ...options,
    credentials: 'include',
    headers: { ...(options.headers ?? {}), 'X-Dashboard-Pin': getPin() },
  }
}

export async function createLead(payload) {
  return request('/leads/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function whatsappUrl(leadId) {
  return `${API_BASE}/leads/${leadId}/whatsapp`
}

export function calendarUrl(leadId, provider = 'google') {
  return `${API_BASE}/leads/${leadId}/calendar?provider=${provider}`
}

export async function getWebinar() {
  return request('/webinar/')
}

export async function sendCapiEvent(leadId, payload) {
  return request(`/leads/${leadId}/capi`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getAuthMode() {
  return request('/auth/mode')
}

export async function getSession() {
  return request('/auth/session', { credentials: 'include' })
}

export async function checkPin(pin) {
  return request('/auth/pin', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })
}

export async function listLeads() {
  return request('/leads/', withSession())
}

export async function updateLead(leadId, payload) {
  return request(`/leads/${leadId}`, withSession({
    method: 'PATCH',
    body: JSON.stringify(payload),
  }))
}

export async function deleteLead(leadId) {
  return request(`/leads/${leadId}`, withSession({ method: 'DELETE' }))
}

export async function getMetrics() {
  return request('/metrics/', withSession())
}

export async function recordVisit() {
  return request('/visits/', { method: 'POST' })
}

export async function clearVisits() {
  return request('/visits/', withSession({ method: 'DELETE' }))
}
