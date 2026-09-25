import { useEffect, useState } from 'react'
import { recordVisit } from './data/api.js'
import { visitaNueva } from './lib/visita.js'
import OptInModal from './components/OptInModal.jsx'
import { url } from './lib/routes.js'
import { landing } from './content/equipo.js'
import atvMark from './assets/atv-mark.jpg'
import './home.css'

const CUENTA_HASTA = new Date('2026-09-28T18:00:00-03:00').getTime()

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatCountdown(now) {
  const remaining = Math.max(0, CUENTA_HASTA - now)
  const seconds = Math.floor(remaining / 1000)
  return {
    d: pad(Math.floor(seconds / 86400)),
    h: pad(Math.floor((seconds % 86400) / 3600)),
    m: pad(Math.floor((seconds % 3600) / 60)),
    s: pad(seconds % 60),
  }
}

function App() {
  const [countdown, setCountdown] = useState(() => formatCountdown(Date.now()))

  useEffect(() => {
    if (!visitaNueva()) return
    recordVisit().catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCountdown(formatCountdown(Date.now())), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="home">
      <header className="topbar">
        <div className="wide">
          <a href="#inicio" className="logo">
            <img src={atvMark} alt="Aumenta Tu Valor" />
          </a>
          <div className="live">
            <span className="dot" />
            <span className="mono label">En vivo · Lun 28 Sep · 18H ARG</span>
            <span className="countdown">
              <span>{countdown.d}d</span>
              <span className="countdown-sep">:</span>
              <span>{countdown.h}h</span>
              <span className="countdown-sep">:</span>
              <span>{countdown.m}m</span>
              <span className="countdown-sep">:</span>
              <span>{countdown.s}s</span>
            </span>
          </div>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="wide">
          <h1>
            El sistema de apalancamiento que me permitió escalar mi negocio con <em>poco contenido</em> y <em>sin ads</em>
          </h1>
          <p className="sub">
            Ya no basta con correr ads y subir contenido a diario. Eso lo puede hacer vos y tu
            competencia. Lo que pocos logran es que el contenido orgánico funcione por sí mismo y
            que, mes a mes, genere resultados consistentes sin que tu tiempo sea el límite.
          </p>
          <OptInModal embedded />
        </div>
      </section>

      <footer>
        <div className="wide">
          <a href="#inicio" className="logo">
            <img src={atvMark} alt="Aumenta Tu Valor" />
          </a>
          <span>{landing.copyright}</span>
          <nav>
            <a href={url('/terminos')}>Términos y condiciones</a>
            <a href={url('/privacidad')}>Política de privacidad</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default App
