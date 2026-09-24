import { useEffect, useState } from 'react'
import atvLogo from './assets/atv-logo.png'
import sistema from './assets/sistema.jpg'
import { getWebinar, recordVisit } from './data/api.js'
import { landing } from './content/equipo.js'
import CtaButton from './components/CtaButton.jsx'
import OptInModal from './components/OptInModal.jsx'

const AR = 'America/Argentina/Buenos_Aires'

function formatWebinarDate(startsAt) {
  if (!startsAt) return null
  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return null

  const day = start.toLocaleDateString('es-AR', {
    timeZone: AR,
    day: 'numeric',
    month: 'long',
  })
  const time = start.toLocaleTimeString('es-AR', {
    timeZone: AR,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${day} · ${time} hs`
}

function CalendarIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  )
}

function App() {
  const [webinarDate, setWebinarDate] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const key = 'atv_visit_counted'
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      /* sin storage igual intentamos contar */
    }
    recordVisit().catch(() => {})
  }, [])

  useEffect(() => {
    // Si no hay fecha cargada en el backend, el dato simplemente no se muestra.
    getWebinar()
      .then((config) => setWebinarDate(formatWebinarDate(config.starts_at)))
      .catch(() => setWebinarDate(null))
  }, [])

  function openModal() {
    setModalOpen(true)
  }

  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="topbar">
        <img className="logo" src={atvLogo} alt="Aumenta Tu Valor" />
      </header>

      <main className="hero">
        <h1>
          {landing.headline.light}
          <br />
          <strong>
            {landing.headline.strong}
            <br />
            {landing.headline.tail}
          </strong>
        </h1>

        <p className="subheadline">{landing.subheadline}</p>

        <div className="vsl">
          <div className="vsl-glass">
            <button type="button" className="vsl-shot" onClick={openModal}>
              <img src={sistema} alt="Mapa del sistema de equipo A-players" />
            </button>
          </div>
        </div>

        <CtaButton onClick={openModal}>{landing.cta}</CtaButton>

        {webinarDate ? (
          <div className="meta">
            <span className="meta-item">
              <CalendarIcon />
              {webinarDate}
            </span>
          </div>
        ) : null}
      </main>

      <footer className="site-footer">
        <p>{landing.copyright}</p>
      </footer>

      <OptInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default App
