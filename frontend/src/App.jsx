import { useEffect, useState } from 'react'
import atvLogo from './assets/atv-logo.png'
import { getVsl, getWebinar } from './data/api.js'
import { landing } from './content/equipo.js'
import CtaButton from './components/CtaButton.jsx'
import OptInModal from './components/OptInModal.jsx'

const AR = 'America/Argentina/Buenos_Aires'

const FALLBACK_VSL = {
  vimeo_id: '1210850489',
  embed_src: 'https://player.vimeo.com/video/1210850489?title=0&byline=0&portrait=0',
}

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

function ClockIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
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

function WhatsappIcon() {
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
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

function App() {
  const [vsl, setVsl] = useState(FALLBACK_VSL)
  const [webinarDate, setWebinarDate] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getVsl()
      .then((config) => {
        const src = config.embed_src.includes('?')
          ? `${config.embed_src}&title=0&byline=0&portrait=0`
          : `${config.embed_src}?title=0&byline=0&portrait=0`
        setVsl({ ...config, embed_src: src })
      })
      .catch(() => setVsl(FALLBACK_VSL))
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
      <div className="shafts" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="topbar">
        <img className="logo" src={atvLogo} alt="Aumenta Tu Valor" />
      </header>

      <main className="hero">
        <h1>
          {landing.headline.light}
          <br />
          <strong>{landing.headline.strong}</strong>
        </h1>

        <p className="subheadline">{landing.subheadline}</p>

        <div className="vsl">
          <div className="vsl-glass">
            <div className="vsl-frame">
              <iframe
                title="VSL equipo A-players"
                src={vsl.embed_src}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        <CtaButton onClick={openModal}>
          {landing.cta}
          <ArrowIcon />
        </CtaButton>

        <div className="meta">
          <span className="meta-item">
            <ClockIcon />
            {landing.meta.quiz}
          </span>
          {webinarDate ? (
            <>
              <span className="meta-sep" aria-hidden="true" />
              <span className="meta-item">
                <CalendarIcon />
                {webinarDate}
              </span>
            </>
          ) : null}
          <span className="meta-sep" aria-hidden="true" />
          <span className="meta-item">
            <WhatsappIcon />
            {landing.meta.whatsapp}
          </span>
        </div>
      </main>

      <footer className="site-footer">
        <p>{landing.copyright}</p>
      </footer>

      <OptInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default App
