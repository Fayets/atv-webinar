import { useEffect, useState } from 'react'
import { createLead, sendCapiEvent } from '../data/api.js'
import { landing, countries } from '../content/equipo.js'
import { steps, bottleneckAreas, bottleneckOptions, areaField } from '../content/quiz.js'
import { getUtmParams } from '../lib/utm.js'
import { saveLead } from '../lib/leadSession.js'
import { url } from '../lib/routes.js'
import { browserIds, newEventId, track } from '../lib/pixel.js'
import CtaButton from './CtaButton.jsx'

// Los eventos de Meta se disparan solo para quien factura $5k o más.
const REVENUE_PARA_PIXEL = ['$5k a 10k', '$10k a 30k', '$30k a 50k', '+$50k']

const EMPTY_CONTACT = { nombre: '', email: '', country: '+54', telefono: '', instagram: '' }
const EMPTY_QUIZ = {
  avatar: '',
  areas: [],
  bottleneck_marketing: [],
  bottleneck_ventas: [],
  revenue: '',
}

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function OptInModal({ open, onClose }) {
  const copy = landing.modal
  const [stepIndex, setStepIndex] = useState(0)
  const [contact, setContact] = useState(EMPTY_CONTACT)
  const [quiz, setQuiz] = useState(EMPTY_QUIZ)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) return undefined

    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const step = steps[stepIndex]
  const isLast = stepIndex === steps.length - 1
  const progress = ((stepIndex + 1) / steps.length) * 100

  const selectedAreas = bottleneckAreas.filter((area) => quiz.areas.includes(area))
  // Hay que elegir al menos un área, y cada área elegida necesita un obstáculo.
  const bottleneckReady =
    quiz.areas.length > 0 && quiz.areas.every((area) => quiz[areaField[area]].length > 0)

  let canContinue = false
  if (step.type === 'form') {
    canContinue = Boolean(
      contact.nombre.trim() &&
        contact.email.trim() &&
        contact.telefono.trim() &&
        contact.instagram.trim(),
    )
  } else if (step.type === 'options') {
    canContinue = Boolean(quiz[step.id])
  } else if (step.type === 'bottleneck') {
    canContinue = bottleneckReady
  }

  function onContactChange(event) {
    const { name, value } = event.target
    setContact((current) => ({ ...current, [name]: value }))
  }

  function pickOption(value) {
    setQuiz((current) => ({ ...current, [step.id]: value }))
  }

  function toggleArea(area) {
    setQuiz((current) => {
      const estaba = current.areas.includes(area)
      return {
        ...current,
        areas: toggle(current.areas, area),
        // Al desmarcar un área se descartan sus obstáculos para no mandar basura.
        [areaField[area]]: estaba ? [] : current[areaField[area]],
      }
    })
  }

  function toggleObstacle(area, option) {
    const field = areaField[area]
    setQuiz((current) => ({ ...current, [field]: toggle(current[field], option) }))
  }

  async function reportarAMeta(created) {
    const { fbp, fbc } = browserIds()
    const source_url = window.location.href

    // El mismo evento va por el navegador y por el servidor con el mismo id.
    await Promise.all(
      ['Lead', 'CompleteRegistration'].map(async (eventName) => {
        const eventId = newEventId(eventName, created.id)
        track(eventName, { content_name: 'webinar_equipo' }, eventId)
        try {
          await sendCapiEvent(created.id, {
            event_name: eventName,
            event_id: eventId,
            source_url,
            fbp,
            fbc,
          })
        } catch {
          // Si el server no pudo avisarle a Meta, el registro ya está hecho:
          // no se le corta el paso al lead por esto.
        }
      }),
    )
  }

  async function onContinue() {
    if (!canContinue) return

    if (!isLast) {
      setMessage('')
      setStepIndex((current) => current + 1)
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const created = await createLead({
        nombre: contact.nombre.trim(),
        email: contact.email.trim(),
        telefono: `${contact.country} ${contact.telefono.trim()}`,
        instagram: contact.instagram.trim(),
        avatar: quiz.avatar,
        revenue: quiz.revenue,
        bottleneck_areas: quiz.areas,
        bottleneck_marketing: quiz.bottleneck_marketing,
        bottleneck_ventas: quiz.bottleneck_ventas,
        ...getUtmParams(),
      })
      if (REVENUE_PARA_PIXEL.includes(quiz.revenue)) {
        await reportarAMeta(created)
      }

      // La confirmación vive en su propia URL, no en el modal.
      saveLead(created)
      window.location.assign(url('/ty-page'))
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="optin-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <span className="step-label">{step.title}</span>
        <h2 id="optin-title">{step.question ?? copy.title}</h2>
        {step.question ? null : <p>{copy.body}</p>}

        <div className="progress-wrap" aria-hidden="true">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="step-body scroll-area">
          {step.type === 'form' ? (
            <div className="optin-form">
              <label>
                Nombre
                <input
                  name="nombre"
                  placeholder="Juan"
                  value={contact.nombre}
                  onChange={onContactChange}
                  autoComplete="name"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="juan@empresa.com"
                  value={contact.email}
                  onChange={onContactChange}
                  autoComplete="email"
                  aria-describedby="email-hint"
                />
                <span className="field-note" id="email-hint">
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
                    <path d="M12 8h.01M11 12h1v4h1" />
                  </svg>
                  <span>
                    {copy.emailHint} <strong>{copy.emailHintStrong}</strong>
                  </span>
                </span>
              </label>
              <label>
                WhatsApp
                <div className="phone-row">
                  <select
                    name="country"
                    value={contact.country}
                    onChange={onContactChange}
                    aria-label="Código de país"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    name="telefono"
                    type="tel"
                    placeholder="11 5555 0000"
                    value={contact.telefono}
                    onChange={onContactChange}
                    autoComplete="tel"
                  />
                </div>
              </label>
              <label>
                Instagram
                <input
                  name="instagram"
                  placeholder="@usuario"
                  value={contact.instagram}
                  onChange={onContactChange}
                />
              </label>
            </div>
          ) : null}

          {step.type === 'options' ? (
            <div className="options">
              {step.options.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`opt ${quiz[step.id] === option ? 'opt-selected' : ''}`}
                  onClick={() => pickOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}

          {step.type === 'bottleneck' ? (
            <div className="bottleneck">
              <div className="check-group">
                {bottleneckAreas.map((area) => (
                  <button
                    type="button"
                    key={area}
                    className={`opt ${quiz.areas.includes(area) ? 'opt-selected' : ''}`}
                    onClick={() => toggleArea(area)}
                  >
                    {area}
                  </button>
                ))}
              </div>

              {selectedAreas.map((area) => (
                <div className="sub-block" key={area}>
                  <h3 className="sub-block-title">{area}</h3>
                  <div className="check-group">
                    {bottleneckOptions[area].map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`check-opt ${
                          quiz[areaField[area]].includes(option) ? 'check-selected' : ''
                        }`}
                        onClick={() => toggleObstacle(area, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {message ? <p className="form-error">{message}</p> : null}

        <div className="step-footer">
          {stepIndex > 0 ? (
            <button
              type="button"
              className="back-btn"
              onClick={() => setStepIndex((current) => current - 1)}
            >
              ← Atrás
            </button>
          ) : (
            <span />
          )}
          <CtaButton
            className="cta-block"
            onClick={onContinue}
            disabled={!canContinue}
            loading={status === 'loading'}
          >
            {status === 'loading' ? copy.submitting : isLast ? copy.submit : 'Continuar →'}
          </CtaButton>
        </div>
      </div>
    </div>
  )
}

export default OptInModal
