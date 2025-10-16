'use client'

import { useEffect } from 'react'

export default function DevErrorSuppressor() {
  useEffect(() => {
    // Inyectar CSS para ocultar overlay de Next.js en desarrollo
    const styleId = 'suppress-next-overlay-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = [
        'nextjs-portal { display: none !important; }',
        '#nextjs__container { display: none !important; }',
        '[data-nextjs-dialog] { display: none !important; }',
        '#__nextjs_error_overlay { display: none !important; }',
      ].join('\n')
      document.head.appendChild(style)
    }

    const hideNextOverlayElements = () => {
      const selectors = ['nextjs-portal', '#nextjs__container', '[data-nextjs-dialog]', '#__nextjs_error_overlay']
      for (const selector of selectors) {
        document.querySelectorAll(selector).forEach((el) => {
          const element = el as HTMLElement
          element.style.setProperty('display', 'none', 'important')
          element.setAttribute('aria-hidden', 'true')
        })
      }
    }

    // Observador que oculta nuevos overlays que aparezcan
    const observer = new MutationObserver(() => hideNextOverlayElements())
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true })
    }

    // Primera pasada inmediata y algunas repetidas por si tarda en cargar
    hideNextOverlayElements()
    const interval = window.setInterval(hideNextOverlayElements, 500)
    const intervalStop = window.setTimeout(() => window.clearInterval(interval), 5000)

    const shouldSuppressEthereumRedefine = (text: string | undefined) => {
      const message = String(text || '')
      if (!message) return false
      if (message.includes('Cannot redefine property: ethereum')) return true
      if (message.includes('chrome-extension://')) return true
      return false
    }

    const handler = (event: ErrorEvent) => {
      const fromExtension = typeof event?.filename === 'string' && event.filename.startsWith('chrome-extension://')
      const msg = String(event?.message || event?.error?.message || '')
      if (fromExtension || shouldSuppressEthereumRedefine(msg)) {
        event.preventDefault()
        // Evitar que otros listeners (como el overlay de Next) lo capturen
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation()
        return true
      }
      return false
    }
    const rejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason
      const msg = typeof reason === 'string' ? reason : String(reason?.message || reason?.stack || '')
      if (shouldSuppressEthereumRedefine(msg)) {
        event.preventDefault()
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation()
        return true
      }
      return false
    }
    const origError = console.error
    console.error = (...args: any[]) => {
      try {
        const first = args?.[0]
        const text = typeof first === 'string' ? first : String(first?.message || '')
        if (shouldSuppressEthereumRedefine(text)) return
      } catch {}
      origError(...args)
    }
    window.addEventListener('error', handler, { capture: true })
    window.addEventListener('unhandledrejection', rejection, { capture: true })
    return () => {
      window.removeEventListener('error', handler, { capture: true } as any)
      window.removeEventListener('unhandledrejection', rejection, { capture: true } as any)
      try { observer.disconnect() } catch {}
      window.clearInterval(interval)
      window.clearTimeout(intervalStop)
      console.error = origError
    }
  }, [])
  return null
}


