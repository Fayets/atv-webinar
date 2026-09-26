// Entrada solo para el build de prerenderizado. Devuelve el HTML de la landing y
// de los legales para incrustarlo en los .html de dist: así el navegador pinta
// apenas llega la respuesta, sin esperar a que baje y ejecute el JavaScript.
import render from 'preact-render-to-string'
import App from './App.jsx'
import Legal from './pages/Legal.jsx'
import { privacidad, terminos } from './content/legal.js'

export function renderLanding() {
  return render(<App />)
}

export function renderLegal(slug) {
  return render(<Legal doc={slug === terminos.slug ? terminos : privacidad} />)
}
