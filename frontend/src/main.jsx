import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ThankYou from './pages/ThankYou.jsx'
import Legal from './pages/Legal.jsx'
import { privacidad, terminos } from './content/legal.js'
import { currentPath } from './lib/routes.js'
import { cargarOps } from './lib/opsTracking.js'
import { visitaNueva } from './lib/visita.js'

// El dashboard es interno y vive solo en join.atvos.io: va en su propio chunk para
// que el código y los textos del panel no viajen con la landing pública.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))

const ROUTES = {
  '/dashboard': { component: Dashboard, title: 'Dashboard · Aumenta Tu Valor' },
  '/ty-page': { component: ThankYou, title: 'Aumenta Tu Valor' },
  '/privacidad': {
    component: () => <Legal doc={privacidad} />,
    title: 'Política de privacidad · Aumenta Tu Valor',
  },
  '/terminos': {
    component: () => <Legal doc={terminos} />,
    title: 'Términos y condiciones · Aumenta Tu Valor',
  },
}

const path = currentPath()
const route = ROUTES[path]

// Tracking de ATV Ops solo en la landing. El dashboard es interno y la thank you
// lo carga ella misma, recién cuando confirmó que hay lead: si lo cargáramos acá
// mandaría un thank_you antes de que el guard rebote al que entró de prepo.
if (path === '/') cargarOps('landing', { contar: visitaNueva() })
const Page = route?.component ?? App
if (route) document.title = route.title

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
)
