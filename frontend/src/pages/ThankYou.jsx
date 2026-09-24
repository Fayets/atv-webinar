import { useEffect, useState } from 'react'
import atvLogo from '../assets/atv-logo.png'
import { calendarUrl, getWebinar, whatsappUrl } from '../data/api.js'
import { readLead } from '../lib/leadSession.js'
import { landing } from '../content/equipo.js'
import { url } from '../lib/routes.js'

const AR = 'America/Argentina/Buenos_Aires'

function formatWhen(startsAt, endsAt) {
  if (!startsAt) return null
  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return null

  const day = start.toLocaleDateString('es-AR', {
    timeZone: AR,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const time = start.toLocaleTimeString('es-AR', {
    timeZone: AR,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const end = endsAt ? new Date(endsAt) : null
  const endTime =
    end && !Number.isNaN(end.getTime())
      ? end.toLocaleTimeString('es-AR', {
          timeZone: AR,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : null

  return {
    day: day.charAt(0).toUpperCase() + day.slice(1),
    time: endTime ? `${time} a ${endTime} hs (Argentina)` : `${time} hs (Argentina)`,
  }
}

function WhatsappIcon() {
  return (
    <svg
      width="19"
      height="19"
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

function CalendarIcon({ size = 19, withPlus = false }) {
  return (
    <svg
      width={size}
      height={size}
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
      {withPlus ? <path d="M12 15v4M10 17h4" /> : null}
    </svg>
  )
}

function ThankYou() {
  const [lead] = useState(readLead)
  const [webinar, setWebinar] = useState(null)
  const copy = landing.gracias

  useEffect(() => {
    if (!lead) window.location.replace(url('/'))
  }, [lead])

  useEffect(() => {
    getWebinar()
      .then(setWebinar)
      .catch(() => setWebinar(null))
  }, [])

  if (!lead) return null

  const when = webinar ? formatWhen(webinar.starts_at, webinar.ends_at) : null
  const firstName = lead.nombre.trim().split(/\s+/)[0]

  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <main className="thanks">
        <img className="logo" src={atvLogo} alt="Aumenta Tu Valor" />

        <span className="thanks-badge">{copy.badge}</span>
        <h1 className="thanks-title">
          {copy.title} {firstName}
        </h1>
        <p className="thanks-sub">{copy.subtitle}</p>

        <ol className="steps">
          <li className="step-row">
            <span className="step-num step-num-wa" aria-hidden="true">
              1
            </span>
            <div className="step-main">
              <span className="step-eyebrow">{copy.whatsappStep}</span>
              <h2 className="step-title">{copy.whatsappTitle}</h2>
            </div>
            <div className="step-action">
              <a className="step-btn step-btn-wa" href={whatsappUrl(lead.id)}>
                <WhatsappIcon />
                {copy.whatsappCta}
              </a>
            </div>
          </li>

          <li className="step-row">
            <span className="step-num step-num-cal" aria-hidden="true">
              2
            </span>
            <div className="step-main">
              <span className="step-eyebrow">{copy.calendarStep}</span>
              <h2 className="step-title">{copy.calendarTitle}</h2>
              {when ? (
                <p className="step-when">
                  <CalendarIcon size={16} />
                  <strong>{when.day}</strong>
                  <span className="step-dot" aria-hidden="true" />
                  <span>{when.time}</span>
                </p>
              ) : (
                <p className="step-desc">{copy.calendarFallback}</p>
              )}
            </div>
            <div className="step-action">
              <a className="step-btn step-btn-cal" href={calendarUrl(lead.id, 'google')}>
                <CalendarIcon withPlus />
                {copy.calendarCta}
              </a>
            </div>
          </li>
        </ol>

        <a className="thanks-back" href={url('/')}>
          ← Volver a la landing
        </a>
      </main>

      <footer className="site-footer">
        <p>{landing.copyright}</p>
      </footer>
    </div>
  )
}

export default ThankYou
