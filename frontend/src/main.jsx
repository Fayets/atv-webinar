import { StrictMode, Suspense, lazy } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './fonts/fonts.css'
import './index.css'
import App from './App.jsx'
import { currentPath } from './lib/routes.js'
import { cargarOps } from './lib/opsTracking.js'
import { visitaNueva } from './lib/visita.js'

// Cada vista se baja recién cuando se entra: la landing no carga el dashboard,
// la página de gracias ni los legales.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ThankYou = lazy(() => import('./pages/ThankYou.jsx'))
const Legal = lazy(() => import('./pages/Legal.jsx'))

const ROUTES = {
  '/dashboard': { component: Dashboard, title: 'Dashboard · Aumenta Tu Valor' },
  '/ty-page': { component: ThankYou, title: 'Aumenta Tu Valor' },
  '/privacidad': { component: Legal, title: 'Política de privacidad · Aumenta Tu Valor' },
  '/terminos': { component: Legal, title: 'Términos y condiciones · Aumenta Tu Valor' },
}

const path = currentPath()
const route = ROUTES[path]

// Tracking de ATV Ops solo en la landing. El dashboard es interno y la thank you
// lo carga ella misma, recién cuando confirmó que hay lead: si lo cargáramos acá
// mandaría un thank_you antes de que el guard rebote al que entró de prepo.
if (path === '/') cargarOps('landing', { contar: visitaNueva() })
const Page = route?.component ?? App
if (route) document.title = route.title

const contenedor = document.getElementById('root')
const arbol = (
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>
)

// La landing viene pintada desde el HTML (prerender): se hidrata en vez de
// rehacerse, así no parpadea. Las otras vistas llegan vacías y se montan.
if (path === '/' && contenedor.firstChild) hydrateRoot(contenedor, arbol)
else createRoot(contenedor).render(arbol)
