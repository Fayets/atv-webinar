import { useEffect } from 'react'
import { recordVisit } from './data/api.js'
import { visitaNueva } from './lib/visita.js'
import OptInModal from './components/OptInModal.jsx'
import { url } from './lib/routes.js'
import './home.css'

// La landing es solo el formulario sobre negro. Los links legales quedan abajo, chicos:
// Meta pide que la política de privacidad sea accesible desde la página del anuncio.
function App() {
  useEffect(() => {
    if (!visitaNueva()) return
    recordVisit().catch(() => {})
  }, [])

  return (
    <div className="home solo-form">
      <main className="hero">
        <OptInModal embedded />
      </main>

      <nav className="legal-links">
        <a href={url('/terminos')}>Términos y condiciones</a>
        <a href={url('/privacidad')}>Política de privacidad</a>
      </nav>
    </div>
  )
}

export default App
