import { useEffect, useState } from 'react'
import { recordVisit } from './data/api.js'
import { visitaNueva } from './lib/visita.js'
import OptInModal from './components/OptInModal.jsx'
import { url } from './lib/routes.js'
import logo from './assets/v10/logo.webp'
import hero from './assets/v10/hero.webp'
import hero900 from './assets/v10/hero-900.webp'
import sistemaMarketing from './assets/v10/sistema-marketing.webp'
import sistemaVentas from './assets/v10/sistema-ventas.webp'
import escaleraUpsells from './assets/v10/escalera-upsells.webp'
import ecosistemaContenido from './assets/v10/ecosistema-contenido.webp'
import laboratorioContenido from './assets/v10/laboratorio-contenido.webp'
import funnelSetter from './assets/v10/funnel-setter.webp'
import mapaNegocio from './assets/v10/mapa-negocio.webp'
import sopsObjeciones from './assets/v10/sops-objeciones.webp'
import metricasEmbudo from './assets/v10/metricas-embudo.webp'
import ciclosCompra from './assets/v10/ciclos-compra.webp'
import segmentacion from './assets/v10/segmentacion.webp'
import ecosystemContent from './assets/v10/ecosystem-content.webp'
import procesosMiro from './assets/v10/procesos-miro.webp'
import trackingChats from './assets/v10/tracking-chats.webp'
import founder from './assets/v10/founder.webp'
import './landing-v10.css'

// Fechas en hora de Argentina.
const EVENTO = new Date('2026-09-28T18:00:00-03:00')
// A esta hora "se borra" la landing: el contador de arriba llega a cero y el
// formulario deja de aceptar registros.
const CIERRE = new Date('2026-09-28T16:47:00-03:00')

const SISTEMAS = [
  {
    img: sistemaMarketing,
    alt: 'Sistema de marketing orgánico',
    titulo: 'Marketing orgánico que genera +$200k/mes',
    texto: (
      <>
        El sistema que te dice <b>qué, cómo y cuándo subir contenido</b> para atraer, nutrir y
        convertir leads que pagan tickets altos en llamada.
      </>
    ),
  },
  {
    img: sistemaVentas,
    alt: 'Procesos de venta',
    titulo: 'Procesos de venta $200k/mes',
    texto: (
      <>
        Cómo conecté marketing y ventas para que los leads lleguen <b>9 de 10 convencidos</b> antes
        de hablar con nadie.
      </>
    ),
  },
  {
    img: escaleraUpsells,
    alt: 'Sistemas back-end',
    titulo: 'Procesos back-end y entrega $200k/mes',
    texto: (
      <>
        Todos los SOPs y sistemas de entrega para generar upsells y recompras. Aumentando un{' '}
        <b>30% extra el cash collected</b> sin ventas nuevas.
      </>
    ),
  },
]

const FILA_1 = [
  [ecosistemaContenido, 'Ecosistema de contenido'],
  [laboratorioContenido, 'Laboratorio de Contenido 3.0'],
  [funnelSetter, 'Funnel del setter'],
  [mapaNegocio, 'Mapa del negocio'],
  [sopsObjeciones, 'SOPs de objeciones y calendario'],
  [metricasEmbudo, 'Métricas del embudo'],
]

const FILA_2 = [
  [ciclosCompra, 'Ciclos de compra y flywheel'],
  [segmentacion, 'Segmentación y nutrición'],
  [ecosystemContent, 'Ecosystem Content'],
  [escaleraUpsells, 'Escalera de upsells'],
  [procesosMiro, 'Procesos en Miro'],
  [trackingChats, 'Tracking de chats'],
]

const pad = (n) => String(n).padStart(2, '0')

function textoCierre(ahora) {
  let ms = Math.max(0, CIERRE - ahora)
  if (!ms) return '0'
  const d = Math.floor(ms / 864e5)
  ms -= d * 864e5
  const h = Math.floor(ms / 36e5)
  ms -= h * 36e5
  const m = Math.floor(ms / 6e4)
  ms -= m * 6e4
  const s = Math.floor(ms / 1e3)
  return `${d ? `${d}d ` : ''}${pad(h)}:${pad(m)}:${pad(s)}`
}

/** Hora del evento en la zona de quien mira. */
function horaLocal() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const hora = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', hour12: false }).format(EVENTO)
    const esArg = tz.includes('Argentina') || tz === 'America/Buenos_Aires'
    const ciudad = (tz.split('/').pop() || '').replace(/_/g, ' ')
    return {
      larga: esArg ? `${hora} (ARG)` : `${hora} en ${ciudad}`,
      corta: `${hora}${esArg ? ' ARG' : ' (tu hora)'}`,
    }
  } catch {
    return { larga: '18:00 (ARG)', corta: '18:00' }
  }
}

function Candado({ size = 14, stroke = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 018 0v3.5" />
    </svg>
  )
}

function Fila({ items, reversa }) {
  // Se duplica para que la cinta se desplace sin cortes.
  const todos = [...items, ...items]
  return (
    <div className={reversa ? 'row rev' : 'row'}>
      {todos.map(([img, nombre], i) => (
        <button key={i} type="button" className="tile" data-goform tabIndex={-1}>
          <img src={img} alt="" loading="lazy" decoding="async" />
          <span className="tl">
            <Candado size={12} stroke={2.6} />
            {nombre}
          </span>
        </button>
      ))}
    </div>
  )
}

function App() {
  const [ahora, setAhora] = useState(null)
  const [hora, setHora] = useState({ larga: '18:00 (ARG)', corta: '18:00' })
  const [sticky, setSticky] = useState(false)
  const cerrado = ahora !== null && ahora >= CIERRE

  useEffect(() => {
    if (!visitaNueva()) return
    // La visita no hace falta para pintar: se manda cuando el navegador queda libre.
    const enviar = () => recordVisit().catch(() => {})
    if ('requestIdleCallback' in window) window.requestIdleCallback(enviar, { timeout: 3000 })
    else setTimeout(enviar, 1500)
  }, [])

  useEffect(() => {
    setHora(horaLocal())
    setAhora(Date.now())
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [])

  // Aparición de las secciones al scrollear y barra fija: solo se ve cuando ni el
  // formulario de arriba ni el cierre están en pantalla.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    document.querySelectorAll('.v10 .rv').forEach((el) => io.observe(el))

    const visibles = new Map()
    const so = new IntersectionObserver(
      (es) => {
        es.forEach((en) => visibles.set(en.target, en.isIntersecting))
        setSticky(![...visibles.values()].some(Boolean))
      },
      { threshold: 0.15 },
    )
    const inicio = document.getElementById('inicio')
    const cierre = document.getElementById('cierre')
    if (inicio) so.observe(inicio)
    if (cierre) so.observe(cierre)
    return () => {
      io.disconnect()
      so.disconnect()
    }
  }, [])

  // Cualquier imagen o botón con data-goform lleva al formulario de arriba.
  useEffect(() => {
    function irAlFormulario(e) {
      const destino = e.target.closest('[data-goform]')
      if (!destino) return
      e.preventDefault()
      const form = document.getElementById('optin')
      if (!form) return
      form.scrollIntoView({ behavior: 'smooth', block: 'center' })
      form.classList.remove('flash')
      void form.offsetWidth
      form.classList.add('flash')
      setTimeout(() => form.querySelector('input')?.focus({ preventScroll: true }), 550)
    }
    document.addEventListener('click', irAlFormulario)
    return () => document.removeEventListener('click', irAlFormulario)
  }, [])

  return (
    <div className="v10">
      <header className="vtop">
        <div className="wide">
          <a href="#inicio" className="vlogo" aria-label="Aumenta Tu Valor">
            <img src={logo} alt="" width="120" height="140" />
          </a>
          <div className="timer">
            <span className="dot" />
            <span>
              Esta landing se borra en <b>{ahora === null ? '--' : textoCierre(ahora)}</b>
            </span>
          </div>
          <span />
        </div>
      </header>

      <section id="inicio" className="vhero">
        <div className="col">
          <div className="kicker mono">Vivo gratis · Lunes 28 · 18h ARG</div>
          <h1>
            Todo lo que me hizo generar <em>+$2.5M</em> sin ads y con poco contenido
          </h1>
          <p className="sub">
            (Voy a revelar todo lo que vendí durante 2 años, ahora gratis en un vivo de 60 minutos.)
          </p>
        </div>

        <div className="wide">
          <button type="button" className="vault" data-goform aria-label="Asegurá tu lugar en el vivo">
            <img
              src={hero}
              srcSet={`${hero900} 900w, ${hero} 1600w`}
              sizes="(max-width: 1000px) 100vw, 980px"
              alt="Juan Carrizo con los sistemas de ATV alrededor"
              width="1600"
              height="900"
              fetchPriority="high"
            />
            <span className="shade" />
            <span className="scan" />
            <span className="center">
              <span className="padlock">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
                  <path d="M8 10.5V7a4 4 0 018 0v3.5" />
                  <circle cx="12" cy="15.5" r="1.2" fill="#fff" />
                </svg>
              </span>
              <span className="v-pill">
                ASEGURÁ TU LUGAR EN EL VIVO <i>→</i>
              </span>
            </span>
          </button>
        </div>

        <div className="arrow" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>

        <div className="form-wrap">
          {cerrado ? (
            <div className="closed-note">
              <h2>El registro se cerró</h2>
              <p>Esta landing se cerró antes del vivo, como avisamos.</p>
            </div>
          ) : (
            <OptInModal embedded />
          )}
          <p className="when">
            Lunes 28 de septiembre · <b>{hora.larga}</b> · Zoom
          </p>
        </div>
      </section>

      <section className="block soft">
        <div className="wide">
          <h2 className="big rv">
            Todos mis <em>sistemas.</em>
          </h2>
          <p className="lead rv">Los mismos que vendí durante 2 años.</p>
          <div className="takes">
            {SISTEMAS.map((s, i) => (
              <div key={s.titulo} className="take rv">
                <button type="button" className="take-img" data-goform aria-label="Desbloquear recurso">
                  <img src={s.img} alt={s.alt} loading="lazy" decoding="async" />
                  <span className="veil" />
                  <span className="unlock">
                    <Candado />
                    Desbloquear recurso
                  </span>
                </button>
                <div className="take-txt">
                  <div className="take-n">{pad(i + 1)}</div>
                  <h3>{s.titulo}</h3>
                  <p>{s.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wall">
        <div className="wide">
          <h2 className="big rv">
            Esto es lo que te llevás <em>después de registrarte.</em>
          </h2>
          <p className="lead rv">Cada panel, cada SOP, cada Miro.</p>
        </div>
        <div className="marquee" aria-hidden="true">
          <Fila items={FILA_1} />
          <Fila items={FILA_2} reversa />
        </div>
        <div className="wide vcta rv">
          <button type="button" className="btn white inline" data-goform>
            Desbloquear todo <span style={{ color: 'var(--red)' }}>→</span>
          </button>
          <small>Gratis. Te lleva 20 segundos.</small>
        </div>
      </section>

      <section className="block">
        <div className="col">
          <h2 className="big rv">
            Lo que no voy a hacer <em>(y lo que sí).</em>
          </h2>
          <div className="promise">
            <div className="pcol no rv">
              <ul>
                <li>
                  <span className="ic">✕</span>
                  <span>No te voy a contar mi historia personal durante 40 minutos.</span>
                </li>
                <li>
                  <span className="ic">✕</span>
                  <span>No te voy a vender teoría que no podés aplicar mañana.</span>
                </li>
                <li>
                  <span className="ic">✕</span>
                  <span>No te voy a pedir que subas contenido todos los días.</span>
                </li>
              </ul>
            </div>
            <div className="pcol yes rv">
              <ul>
                <li>
                  <span className="ic">✓</span>
                  <span>Sí te voy a mostrar el sistema completo, paso por paso.</span>
                </li>
                <li>
                  <span className="ic">✓</span>
                  <span>Sí te voy a entregar el recurso después del vivo.</span>
                </li>
                <li>
                  <span className="ic">✓</span>
                  <span>Sí voy a revelar la oferta que reemplaza todo, al final.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="block soft">
        <div className="col">
          <div className="host rv">
            <div className="avatar">
              <img src={founder} alt="Juan Carrizo" width="720" height="960" loading="lazy" decoding="async" />
            </div>
            <div>
              <span className="mono role">Founder · Aumenta Tu Valor</span>
              <h3>Juan Carrizo</h3>
              <p>
                Escalé mi negocio de infoproductos con un equipo de 5 personas, sin ads, sin
                lanzamientos y sin contenido diario. El lunes lo abro completo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="close" id="cierre">
        <div className="bgimg" style={{ backgroundImage: `url('${hero900}')` }} />
        <div className="shade2" />
        <div className="col">
          <h2 className="big">
            Desbloqueá <em>todo esto.</em>
          </h2>
          <p className="lead">Registrate ahora. El lunes a las 4:47 PM esta landing se borra.</p>
          <div className="form-wrap">
            <button type="button" className="btn" data-goform>
              RESERVAR MI LUGAR AHORA <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <footer>
        <div className="wide">
          <span>© 2026 Aumenta Tu Valor. Todos los derechos reservados.</span>
          <nav>
            <a href={url('/terminos')}>Términos y condiciones</a>
            <a href={url('/privacidad')}>Política de privacidad</a>
          </nav>
          <p className="disc">
            Los resultados mencionados no son una promesa de lo que vas a conseguir vos: tu resultado
            depende de tu negocio, tu punto de partida y lo que hagas con la información. Este sitio no
            forma parte de Facebook ni de Meta Platforms, Inc., y no está respaldado por Meta de ninguna
            manera. Facebook es una marca registrada de Meta Platforms, Inc.
          </p>
        </div>
      </footer>

      <div className={sticky ? 'sticky show' : 'sticky'} aria-hidden={!sticky}>
        <div className="in">
          <div className="txt">Vivo gratis · Lun 28 · {hora.corta}</div>
          <button type="button" className="btn" data-goform>
            Quiero mi acceso →
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
