import atvLogo from '../assets/atv-logo.webp'
import { landing } from '../content/equipo.js'
import { ACTUALIZADO, privacidad, terminos } from '../content/legal.js'
import { currentPath, url } from '../lib/routes.js'

// Sin `doc` (desde el router) elige el documento por la URL.
function Legal({ doc: elegido }) {
  const doc = elegido ?? (currentPath() === terminos.slug ? terminos : privacidad)
  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="topbar">
        <a href={url('/')}>
          <img className="logo" src={atvLogo} alt="Aumenta Tu Valor" width="400" height="128" />
        </a>
      </header>

      <main className="legal">
        <h1>{doc.titulo}</h1>
        <p className="legal-fecha">Última actualización: {ACTUALIZADO}</p>
        <p className="legal-entrada">{doc.entrada}</p>

        {doc.secciones.map((seccion) => (
          <section key={seccion.titulo}>
            <h2>{seccion.titulo}</h2>
            {(seccion.parrafos ?? []).map((texto) => (
              <p key={texto}>{texto}</p>
            ))}
            {seccion.lista ? (
              <ul>
                {seccion.lista.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {(seccion.cierre ?? []).map((texto) => (
              <p key={texto}>{texto}</p>
            ))}
          </section>
        ))}

        <a className="legal-volver" href={url('/')}>
          ← Volver
        </a>
      </main>

      <footer className="site-footer">
        <p>{landing.copyright}</p>
      </footer>
    </div>
  )
}

export default Legal
