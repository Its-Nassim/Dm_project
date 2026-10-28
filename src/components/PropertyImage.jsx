import { useState } from 'react'
import './PropertyImage.css'

/**
 * PropertyImage: Resilient, zero-CLS image component tailored for the Dusk theme.
 * Features:
 * - Strict aspect-ratio containers preventing layout shifts
 * - Dusk-calibrated gradient shimmer skeleton while loading
 * - Elegant fallback state on image error or missing source
 * - Vignette scrim overlay preventing high-contrast glare on dark surfaces
 */
export default function PropertyImage({
  src,
  alt = 'Property view',
  aspectRatio = '4/3',
  className = '',
  fetchPriority = 'auto',
  loading = 'lazy',
  width,
  height,
  fallbackLabel = 'Architectural Parcel',
  showVignette = true,
  onClick,
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <div
      className={`prop-img-container ${isLoaded ? 'is-loaded' : 'is-loading'} ${hasError ? 'has-error' : ''} ${className}`}
      style={{ aspectRatio }}
      onClick={onClick}
    >
      {/* Background Skeleton Shimmer */}
      {!isLoaded && <div className="prop-img-skeleton" aria-hidden="true" />}

      {/* Main Image or Error Fallback */}
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          className={`prop-img ${isLoaded ? 'is-visible' : 'is-hidden'}`}
          loading={loading}
          fetchPriority={fetchPriority}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="prop-img-fallback" role="img" aria-label={alt}>
          <svg
            className="prop-img-fallback-icon"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="prop-img-fallback-text">{fallbackLabel}</span>
        </div>
      )}

      {/* Dusk Scrim Overlay */}
      {showVignette && <div className="prop-img-scrim" aria-hidden="true" />}
    </div>
  )
}
