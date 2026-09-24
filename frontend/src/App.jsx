import { useEffect, useState } from 'react'
import { recordVisit } from './data/api.js'
import { visitaNueva } from './lib/visita.js'
import OptInModal from './components/OptInModal.jsx'
import atvMark from './assets/atv-mark.jpg'
import igSeba from './assets/ig-seba.png'
import igJuano from './assets/ig-juano.jpg'
import igFacu from './assets/ig-facu.png'
import igVirola from './assets/ig-virola.png'
import igJorge from './assets/ig-jorge.png'
import igValentino from './assets/ig-valentino.jpg'
import igCris from './assets/ig-cris.jpg'
import igSanti from './assets/ig-santi.jpg'
import igNico from './assets/ig-nico.jpg'
import igPatric from './assets/ig-patric.png'
import efectoCompuesto from './assets/efecto-compuesto.jpg'
import founder from './assets/founder.jpg'
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

const CASOS = [
  {
    src: igSeba,
    name: 'Sebas Nájera',
    alt: 'Instagram de Sebas Nájera',
    role: 'Infoproductor · Nicho Automatizaciones de YouTube',
    result: 'Ingreso haciendo 20k/mes y en 60 días escaló a 70k/mes',
  },
  {
    src: igCris,
    name: 'Cris Gonzalez',
    alt: 'Instagram de Cris Gonzalez',
    role: (
      <>
        Experto en infoproducto de <strong>Sebas Nájera</strong> (@soysebasnajera)
      </>
    ),
    result: 'De 20k/mes a 70k/mes en 60 días',
  },
  {
    src: igJuano,
    name: 'Juano Baquero',
    alt: 'Instagram de Juano Baquero',
    role: 'Infoproductor · Nicho Automatizaciones de YouTube',
    result: 'Ingreso haciendo 30k/mes y en 60 días escaló a 230k/mes',
  },
  {
    src: igJorge,
    name: 'Jorge Quesada',
    alt: 'Instagram de Jorge Quesada',
    role: (
      <>
        Experto en infoproducto de <strong>Juano Baquero</strong> (@juano.yt)
      </>
    ),
    result:
      'Escaló el negocio a +$200K/mes y hoy se lleva +$60K USD netos mensuales para su bolsillo.',
  },
  {
    src: igSanti,
    name: 'Santiago Molina',
    alt: 'Instagram de Santiago Molina',
    role: (
      <>
        Experto en infoproducto de <strong>Juano Baquero</strong> (@juano.yt)
      </>
    ),
    result:
      'Escaló el negocio a +$200K/mes y hoy se lleva +$17K USD netos mensuales para su bolsillo.',
  },
  {
    src: igFacu,
    name: 'Facundo Martínez',
    alt: 'Instagram de Facundo Martínez',
    role: 'Experto en infoproductos',
    result: 'Ingreso haciendo 1k/mes y en 30 días escaló a 30k/mes',
  },
  {
    src: igVirola,
    name: 'Juan Antonio Virola',
    alt: 'Instagram de Juan Antonio Virola',
    role: 'Dueño de agencia',
    result: 'Ingreso haciendo 10k/mes y logró escalar a 100k/mes',
  },
  {
    src: igValentino,
    name: 'Valentino Babino',
    alt: 'Instagram de Valentino Babino',
    role: 'Experto en infoproductos',
    result: 'Pasó de estar estancado en 5k/mes y escaló a 30k/mes',
  },
  {
    src: igNico,
    name: 'Nicolas Martin',
    alt: 'Instagram de Nicolas Martin',
    role: 'Experto en infoproductos',
    result: 'Pasó de estar en 18k/mes y escaló a 31k/mes en 60 días',
  },
  {
    src: igPatric,
    name: 'Patric Hlosta',
    alt: 'Instagram de Patric Hlosta',
    role: 'Experto en infoproductos',
    result: 'Logró escalar su cliente a +500k/mes',
  },
]

function desplazamiento(index, activo, total) {
  let diff = index - activo
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  return diff
}

function App() {
  const [countdown, setCountdown] = useState(() => formatCountdown(Date.now()))
  const [caso, setCaso] = useState(0)

  useEffect(() => {
    if (!visitaNueva()) return
    recordVisit().catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCountdown(formatCountdown(Date.now())), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCaso((actual) => (actual + 1) % CASOS.length), 4000)
    return () => clearInterval(timer)
  }, [])

  function irAlOptin() {
    document.getElementById('optin')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

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
            El sistema de apalancamiento que me permitió escalar mi negocio a <em>+$200K/mes</em> con
            solo 4 reels y 1 video de YouTube al mes.
          </h1>
          <p className="sub">
            Ya no basta con correr ads y subir contenido a diario. Eso lo puede hacer vos y tu
            competencia. Lo que pocos logran es lograr que el contenido órganico funcione y que por
            si mismo logré generarte +6 cifras todos los meses.
          </p>
          <OptInModal embedded />
          <div className="cta-note">
            Lunes 28 de septiembre, 18h (ARG)
            <span>(No se te pedirá tarjeta)</span>
          </div>
          <div className="details">
            <div>
              <span className="mono">Hora</span>
              <b>18h ARG</b>
            </div>
            <div>
              <span className="mono">Formato</span>
              <b>En vivo por Zoom</b>
            </div>
            <div>
              <span className="mono">Duración</span>
              <b>90 minutos</b>
            </div>
          </div>
        </div>
      </section>

      <section className="part">
        <div className="wrap body">
          <div className="part-label mono">Parte I · El problema</div>
          <h2>
            Tu negocio crece, pero cada vez <span className="serif">depende más de vos.</span>
          </h2>
          <p>
            Sabés vender. Sabés generar clientes. Incluso quizás ya lograste hacer $10K, $20K, $50K o
            más al mes.
          </p>
          <p>
            Marketing trabaja por un lado. Ventas por otro. Producto por otro. Y nadie conecta toda
            esa información para que el negocio produzca más con el mismo esfuerzo.
          </p>
          <div className="pull">
            No necesitás hacer más. Necesitás que lo que ya hacés genere mucho más.
          </div>
          <p>
            Y mientras cada resultado dependa de que vos estés detrás, tu tiempo va a seguir siendo
            el límite de cuánto puede crecer tu negocio.
          </p>
        </div>
      </section>

      <section className="part">
        <div className="wrap body">
          <div className="part-label mono">Parte II · Lo que está en juego</div>
          <h2>
            Hay dos formas de intentar escalar.{' '}
            <span className="serif">Una te exige cada vez más. La otra genera apalancamiento.</span>
          </h2>
          <div className="paths">
            <div className="path">
              <span className="mono">Camino 01</span>
              <h3>Hacer más</h3>
              <ul>
                <li>Más contenido.</li>
                <li>Más lanzamientos.</li>
                <li>Más anuncios.</li>
                <li>Más personas.</li>
                <li>Más horas tuyas.</li>
              </ul>
              <p>
                El negocio puede crecer, pero cada nuevo resultado exige más esfuerzo y más
                dependencia de vos.
              </p>
            </div>
            <div className="path">
              <span className="mono">Camino 02</span>
              <h3>Construir apalancamiento</h3>
              <ul>
                <li>Marketing alimenta a Ventas.</li>
                <li>Ventas genera información para Marketing.</li>
                <li>Producto mejora la experiencia y genera nuevas oportunidades.</li>
                <li>Sistemas conecta y mide todo.</li>
              </ul>
              <p>
                El negocio empieza a producir más resultados sin que todo dependa de hacer más.
              </p>
            </div>
          </div>
          <div className="pull">
            La diferencia no está en cuánto hacés. Está en cuánto resultado puede generar cada acción
            que hacés.
          </div>
        </div>
      </section>

      <section className="part">
        <div className="wrap body">
          <div className="part-label mono">Parte III · El cambio</div>
          <h2>
            ¿Cómo se ve el apalancamiento <span className="serif">dentro de tu negocio?</span>
          </h2>
          <p>
            Dejar de hacer que cada área trabaje por separado y construir un sistema donde cada
            acción alimente a todo tu sistema.
          </p>
          <div className="examples">
            <div className="ex">
              <div className="n">01</div>
              <div>
                <h3>Marketing deja de accionar sin claridad.</h3>
                <p>Hoy estás generando contenido y esperando a que funcione.</p>
                <p>
                  Después del cambio, vas a tener una conexión en marketing y ventas. Ventas
                  devuelve información a Marketing sobre qué leads compran, qué objeciones tienen y
                  qué los hace confiar.
                </p>
                <div className="out">Cada lead ayuda a mejorar tu próximo contenido.</div>
              </div>
            </div>
            <div className="ex">
              <div className="n">02</div>
              <div>
                <h3>Tu equipo deja de depender de vos</h3>
                <p>Hoy muchas decisiones y procesos siguen pasando por vos.</p>
                <p>
                  Después del cambio, los roles, procesos y sistemas permiten que tu equipo ejecute
                  sin necesitarte para cada decisión.
                </p>
                <div className="out">Tu tiempo deja de ser el límite de tu crecimiento.</div>
              </div>
            </div>
            <div className="ex">
              <div className="n">03</div>
              <div>
                <h3>Cada resultado se vuelve más fácil de repetir</h3>
                <p>Hoy cuando algo funciona, muchas veces no sabés exactamente por qué.</p>
                <p>
                  Después del cambio, tenés sistemas para medir qué genera resultados, identificar
                  qué funciona y replicarlo.
                </p>
                <div className="out">Dejás de depender de la intuición para escalar.</div>
              </div>
            </div>
          </div>
          <div className="pull">
            Eso es apalancamiento: hacer que una acción no termine en un solo resultado, sino que
            genere información, mejore otras áreas y produzca más resultados en cadena para tu
            negocio.
          </div>
        </div>
      </section>

      <section className="part">
        <div className="wide body">
          <div className="part-label mono">Parte IV · A quiénes ayudamos</div>
          <h2>
            Casos de éxito <span className="serif">(últimos 30 días)</span>
          </h2>
          <div className="cases">
            <div className="case-arc">
              {CASOS.map((item, index) => {
                const offset = desplazamiento(index, caso, CASOS.length)
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={offset === 0 ? 'case-card on' : 'case-card'}
                    style={{ '--offset': offset }}
                    aria-label={item.name}
                    onClick={() => setCaso(index)}
                  >
                    <img src={item.src} alt="" />
                  </button>
                )
              })}
            </div>
            <div key={caso} className="case-copy">
              <p className="case-name">{CASOS[caso].name}</p>
              {CASOS[caso].role && <p className="case-role">{CASOS[caso].role}</p>}
              {CASOS[caso].result && <p className="case-result">{CASOS[caso].result}</p>}
            </div>
            <div className="case-dots">
              {CASOS.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  className={index === caso ? 'on' : ''}
                  aria-label={item.name}
                  onClick={() => setCaso(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="part">
        <div className="wide">
          <div className="part-label mono host-label">Tu anfitrión</div>
          <div className="host">
            <div className="avatar">
              <img src={founder} alt="" />
            </div>
            <div>
              <span className="mono role">Fundador · Tu marca</span>
              <h3>Nombre del host</h3>
              <p>Bio breve: experiencia, el techo que encontró, cómo lo resolvió y el resultado.</p>
              <p>
                Prueba social: cantidad de clientes, rubros en los que se aplicó y resultados
                concretos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="part">
        <div className="wrap body">
          <div className="part-label mono">El efecto compuesto</div>
          <h2>
            Cuando las áreas de tu negocio se conectan,{' '}
            <span className="serif">cada acción genera más resultados.</span>
          </h2>
          <img
            className="compound"
            src={efectoCompuesto}
            alt="Marketing, ventas, producto y sistemas conectados"
          />
          <p>
            Marketing atrae oportunidades. Ventas convierte y devuelve información. Producto entrega
            resultados que fortalecen tu marketing. Y Sistemas mide todo para que cada área pueda
            mejorar.
          </p>
          <p>Cuanto mejor funciona una parte del negocio, más ayuda a crecer a las demás.</p>
        </div>
      </section>

      <section className="close">
        <div className="wide">
          <div className="part-label mono">El cierre</div>
          <h2>
            Tu negocio no necesita más de vos.{' '}
            <span className="serif">Necesita más apalancamiento.</span>
          </h2>
          <p>
            Ya sabés lo que pasa cuando marketing, ventas, producto y sistemas funcionan por
            separado.
          </p>
          <p>
            Ahora descubrí cómo construir una infraestructura donde cada área alimente a las demás
            y pocas acciones generen muchos más resultados.
          </p>
          <button type="button" className="cta" onClick={irAlOptin}>
            Reservar mi lugar <span>→</span>
          </button>
          <div className="cta-note">Lunes 28 de septiembre · 18h ARG</div>
        </div>
      </section>

      <footer>
        <div className="wide">
          <a href="#inicio" className="logo">
            <img src={atvMark} alt="Aumenta Tu Valor" />
          </a>
          <span>© 2026 Tu marca. Todos los derechos reservados.</span>
          <nav>
            <a href="#inicio">Términos</a>
            <a href="#inicio">Privacidad</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default App
