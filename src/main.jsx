import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register the PWA service worker and self-heal stale clients.
// When a new version is deployed the new worker skips waiting and claims
// the page, then we reload once so the running tab stops using old code.
function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    const base = import.meta.env.BASE_URL
    const hadController = !!navigator.serviceWorker.controller

    let registration
    try {
      registration = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base })
    } catch {
      return
    }

    let reloading = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return
      reloading = true
      window.location.reload()
    })

    // If an updated worker is parked in "waiting", tell it to activate.
    const activateWaiting = () => {
      if (registration.waiting && navigator.serviceWorker.controller) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    }
    activateWaiting()
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing
      if (!installing) return
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed') activateWaiting()
      })
    })

    const checkForUpdate = () => {
      registration.update().catch(() => {})
    }
    window.addEventListener('focus', checkForUpdate)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    })
    setInterval(checkForUpdate, 30 * 60 * 1000)
  })
}

setupServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
