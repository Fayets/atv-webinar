import { useEffect, useState } from 'react'
import { calendarUrl, getWebinar, whatsappUrl } from '../data/api.js'
import { readLead } from '../lib/leadSession.js'
import { landing } from '../content/equipo.js'
import { url } from '../lib/routes.js'
import { cargarOps, trackOps } from '../lib/opsTracking.js'

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
    hora: time,
    time: endTime ? `${time} a ${endTime} hs (Argentina)` : `${time} hs (Argentina)`,
  }
}

/** Días, horas y minutos que faltan. null si ya pasó o no hay fecha. */
function faltan(startsAt, ahora) {
  if (!startsAt) return null
  const inicio = new Date(startsAt)
  if (Number.isNaN(inicio.getTime())) return null
  const ms = inicio.getTime() - ahora
  if (ms <= 0) return null
  const minutos = Math.floor(ms / 60000)
  return {
    dias: Math.floor(minutos / 1440),
    horas: Math.floor((minutos % 1440) / 60),
    minutos: minutos % 60,
  }
}

function ThankYou() {
  const [lead] = useState(readLead)
  const [webinar, setWebinar] = useState(null)
  const [hechos, setHechos] = useState({ grupo: false, agenda: false })
  const [ahora, setAhora] = useState(() => Date.now())
  const copy = landing.gracias

  useEffect(() => {
    if (!lead) window.location.replace(url('/'))
  }, [lead])

  useEffect(() => {
    // Después del guard de arriba a propósito: al que entra sin lead lo rebotamos, y
    // un thank_you suyo sería un paso del embudo que nadie dio. No se deduplica por
    // sesión como la visita — recargar la página de gracias es raro, y si pasa el que
    // la recarga sí llegó hasta acá.
    if (lead) cargarOps('ty')
  }, [lead])

  useEffect(() => {
    getWebinar()
      .then(setWebinar)
      .catch(() => setWebinar(null))
  }, [])

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [])

  if (!lead) return null

  const when = webinar ? formatWhen(webinar.starts_at, webinar.ends_at) : null
  const restante = faltan(webinar?.starts_at, ahora)
  const [headline, ...restoTitulo] = copy.title.split('. ')
  const bajadaTitulo = restoTitulo.join('. ')

  const cuandoFalta =
    hechos.grupo && !hechos.agenda
      ? 'Te falta agendar el webinar'
      : !hechos.grupo && hechos.agenda
        ? 'Te falta entrar al grupo de WhatsApp'
        : null

  return (
    <div className="shell ty-page">
      <header className={cuandoFalta ? 'ty-bar pending' : 'ty-bar'}>
        <span>
          <i className="ty-dot" aria-hidden="true" />
          {cuandoFalta || copy.badge}
        </span>
        <span>
          {restante
            ? `Faltan ${restante.dias}d ${String(restante.horas).padStart(2, '0')}h ${String(restante.minutos).padStart(2, '0')}m`
            : when?.day || 'Lunes 28 de septiembre'}
        </span>
      </header>

      <main className="ty">
        <div className="ty-hero">
          <div className="ty-check" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1>{headline}.</h1>
          {bajadaTitulo ? <p className="ty-lead">{bajadaTitulo}</p> : null}
          <p className="ty-sub">
            {restante
              ? `${restante.dias >= 1 ? `${copy.subtitleAntes} ${restante.dias} días` : 'Hoy'} `
              : ''}
            {copy.subtitleDespues}
          </p>
        </div>

        <dl className="ty-facts">
          <div>
            <dt>Fecha</dt>
            <dd>{when?.day || 'Lunes 28 de septiembre'}</dd>
          </div>
          <div>
            <dt>Hora</dt>
            <dd>{when ? `${when.hora} ARG` : '18h ARG'}</dd>
          </div>
          <div>
            <dt>Formato</dt>
            <dd>En vivo por Zoom</dd>
          </div>
          <div>
            <dt>Duración</dt>
            <dd>90 minutos</dd>
          </div>
        </dl>

        <section className="ty-next">
          <p className="ty-kicker">Dos pasos. Un minuto</p>
          <h2>
            Hacé esto <em>antes de cerrar</em> la pestaña.
          </h2>
          <p className="ty-next-sub">{copy.aviso}</p>

          <ol className="ty-cards">
            <li className={hechos.grupo ? 'ty-card done' : 'ty-card'}>
              <div className="ty-card-row">
                <span className="ty-num">01</span>
                <div>
                  <h3>{copy.whatsappTitle}</h3>
                </div>
                <a
                  className="ty-btn"
                  href={whatsappUrl(lead.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setHechos((actual) => ({ ...actual, grupo: true }))
                    trackOps('whatsapp')
                  }}
                >
                  {copy.whatsappCta}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </li>

            <li className={hechos.agenda ? 'ty-card done' : 'ty-card'}>
              <div className="ty-card-row">
                <span className="ty-num">02</span>
                <div>
                  <h3>{copy.calendarTitle}</h3>
                  <p>
                    {when
                      ? `${when.day} · ${when.time}`
                      : copy.calendarFallback}
                  </p>
                </div>
                <a
                  className="ty-btn ty-btn-ghost"
                  href={calendarUrl(lead.id, 'google')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setHechos((actual) => ({ ...actual, agenda: true }))
                    trackOps('calendario')
                  }}
                >
                  {copy.calendarCta}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </li>
          </ol>
        </section>
      </main>

      <footer className="site-footer">
        <p>{landing.copyright}</p>
      </footer>
    </div>
  )
}

export default ThankYou
