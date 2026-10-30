import { useState, useEffect } from 'react'
import { getHealth } from '../api/client.js'
import './ApiStatus.css'

export default function ApiStatus() {
  const isMock = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true'
  const [status, setStatus] = useState(() => (isMock ? 'mock' : 'checking'))

  useEffect(() => {
    if (isMock) return

    let isMounted = true
    getHealth()
      .then((res) => {
        if (!isMounted) return
        if (res && (res.status === 'ok' || res.status === 200)) {
          setStatus('connected')
        } else {
          setStatus('unreachable')
        }
      })
      .catch(() => {
        if (isMounted) setStatus('unreachable')
      })

    return () => {
      isMounted = false
    }
  }, [isMock])

  return (
    <div className="api-status" aria-live="polite">
      {status === 'checking' && (
        <span className="api-status__pill api-status__pill--checking">
          <span className="api-status__dot" aria-hidden="true" />
          <span>Checking API...</span>
        </span>
      )}
      {status === 'mock' && (
        <span className="api-status__pill api-status__pill--mock">
          <span className="api-status__dot" aria-hidden="true" />
          <span>Mock data (no backend)</span>
        </span>
      )}
      {status === 'connected' && (
        <span className="api-status__pill api-status__pill--connected">
          <span className="api-status__dot" aria-hidden="true" />
          <span>API connected</span>
        </span>
      )}
      {status === 'unreachable' && (
        <span className="api-status__pill api-status__pill--unreachable">
          <span className="api-status__dot" aria-hidden="true" />
          <span>API unreachable</span>
        </span>
      )}
    </div>
  )
}
