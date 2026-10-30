import { useEffect, useRef } from 'react'
import './ErrorBanner.css'

export default function ErrorBanner({
  title = 'Please correct the following errors',
  message,
  fields,
  details,
  onAction,
  actionLabel = 'Try again',
}) {
  const bannerRef = useRef(null)

  useEffect(() => {
    if (bannerRef.current) {
      bannerRef.current.focus()
    }
  }, [message, fields])

  const handleFieldClick = (e, fieldName) => {
    e.preventDefault()
    const target = document.getElementById(`field-${fieldName}`)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div
      ref={bannerRef}
      className="error-banner"
      role="alert"
      tabIndex={-1}
      aria-live="assertive"
    >
      <div className="error-banner__header">
        <svg
          className="error-banner__icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="8" />
          <line x1="10" y1="6" x2="10" y2="10" />
          <circle cx="10" cy="14" r="0.5" fill="currentColor" />
        </svg>
        <div className="error-banner__content">
          <strong className="error-banner__title">{title}</strong>
          {message && <p className="error-banner__message">{message}</p>}
        </div>
        {onAction && (
          <button
            type="button"
            className="error-banner__action"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}
      </div>

      {fields && Object.keys(fields).length > 0 && (
        <ul className="error-banner__list">
          {Object.entries(fields).map(([fieldName, msg]) => (
            <li key={fieldName} className="error-banner__item">
              <a
                href={`#field-${fieldName}`}
                className="error-banner__link"
                onClick={(e) => handleFieldClick(e, fieldName)}
              >
                {msg}
              </a>
            </li>
          ))}
        </ul>
      )}

      {details && (
        <details className="error-banner__details">
          <summary className="error-banner__summary">Technical details</summary>
          <pre className="error-banner__pre">{details}</pre>
        </details>
      )}
    </div>
  )
}
