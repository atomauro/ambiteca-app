'use client'

import { useEffect } from 'react'

export default function DevErrorSuppressor() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      const msg = String(event?.message || '')
      if (msg.includes('Cannot redefine property: ethereum')) {
        event.preventDefault()
        return true
      }
      return false
    }
    const rejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason
      const msg = typeof reason === 'string' ? reason : String(reason?.message || '')
      if (msg.includes('Cannot redefine property: ethereum')) {
        event.preventDefault()
        return true
      }
      return false
    }
    const origError = console.error
    console.error = (...args: any[]) => {
      try {
        const first = args?.[0]
        const text = typeof first === 'string' ? first : String(first?.message || '')
        if (text.includes('Cannot redefine property: ethereum')) return
      } catch {}
      origError(...args)
    }
    window.addEventListener('error', handler)
    window.addEventListener('unhandledrejection', rejection)
    return () => {
      window.removeEventListener('error', handler)
      window.removeEventListener('unhandledrejection', rejection)
      console.error = origError
    }
  }, [])
  return null
}


