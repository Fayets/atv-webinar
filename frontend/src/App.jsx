import { useEffect, useState } from 'react'
import { recordVisit } from './data/api.js'
import { visitaNueva } from './lib/visita.js'
import OptInModal from './components/OptInModal.jsx'
import { url } from './lib/routes.js'
import atvMark from './assets/atv-mark.webp'
import founder from './assets/founder.webp'
import CompoundDiagram from './components/CompoundDiagram.jsx'
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
    // La visita no hace falta para pintar: se manda cuando el navegador queda
    // libre, fuera del camino crítico de la carga.
    const enviar = () => recordVisit().catch(() => {})
    if ('requestIdleCallback' in window) window.requestIdleCallback(enviar, { timeout: 3000 })
    else setTimeout(enviar, 1500)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCountdown(formatCountdown(Date.now())), 1000)
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
            <img src={atvMark} alt="Aumenta Tu Valor" width="120" height="140" />
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
            El sistema de apalancamiento que me permitió escalar mi negocio a <em>+200k/mes</em>.
          </h1>
          <p className="sub">
            Ya no basta con correr ads y subir contenido a diario. Eso lo puede hacer vos y tu
            competencia. Lo que pocos logran es que el contenido orgánico funcione por sí mismo y
            que, mes a mes, genere resultados consistentes sin que tu tiempo sea el límite.
          </p>
          <OptInModal embedded />
          <div className="cta-note">
            Lunes 28 de septiembre, 18h (ARG)
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
            Sabés vender. Sabés generar clientes. Incluso quizás ya tenés un negocio que genera
            ingresos de forma consistente.
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
                <h3>Marketing deja de accionar sin claridad</h3>
                <p>Hoy estás generando contenido y esperando a que funcione.</p>
                <p>
                  Después del cambio, vas a tener una conexión entre marketing y ventas. Ventas
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
        <div className="wide">
          <div className="part-label mono host-label">Tu anfitrión</div>
          <div className="host">
            <div className="avatar">
              <img src={founder} alt="" width="600" height="797" loading="lazy" decoding="async" />
            </div>
            <div>
              <span className="mono role">Founder · Aumenta tu valor</span>
              <h3>Juan Carrizo</h3>
              <p>
                Escaló su propio negocio de infoproductos con un equipo de solo 5 personas, sin depender de lanzamientos ni contenido diario.
              </p>
              <p>
                Durante los últimos 2 años, construyó una infraestructura de marketing, ventas,
                producto y sistemas que hoy aplica dentro de sus negocios y en los negocios de sus
                clientes.
              </p>
              <p>
                El 28 de septiembre te va a mostrar la forma en la cual vos podés copiar y pegar
                este sistema.
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
          <CompoundDiagram />
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
            <img src={atvMark} alt="Aumenta Tu Valor" width="120" height="140" />
          </a>
          <span>© 2026 Aumenta Tu Valor. Todos los derechos reservados.</span>
          <nav>
            <a href={url('/terminos')}>Términos y condiciones</a>
            <a href={url('/privacidad')}>Política de privacidad</a>
          </nav>
          <p className="disclaimer">
            Los resultados mencionados no son una promesa de lo que vas a conseguir vos: tu
            resultado depende de tu negocio, tu punto de partida y lo que hagas con la información. Este sitio no forma parte de Facebook ni de Meta
            Platforms, Inc., y no está respaldado por Meta de ninguna manera. Facebook es una marca
            registrada de Meta Platforms, Inc.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
