import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './dashboard.css'
import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ThankYou from './pages/ThankYou.jsx'
import { currentPath } from './lib/routes.js'

const ROUTES = {
  '/dashboard': { component: Dashboard, title: 'Dashboard · Aumenta Tu Valor' },
  '/gracias': { component: ThankYou, title: 'Ya estás dentro · Aumenta Tu Valor' },
}

const route = ROUTES[currentPath()]
const Page = route?.component ?? App
if (route) document.title = route.title

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
