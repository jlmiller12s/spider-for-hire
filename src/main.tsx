import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import './styles.css'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const EventAgreement = lazy(() => import('./EventAgreement'))
const rootPage = normalizedPath === '/event-agreement'
  ? <Suspense fallback={<div className="site-shell" aria-busy="true" />}><EventAgreement /></Suspense>
  : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {rootPage}
    <Analytics />
  </StrictMode>,
)
